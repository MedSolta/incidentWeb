import express from 'express';
import { Admin, Discussion, Message, Operateur, Technicien } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /admin/profile
 * @description Récupère le profil de l'admin connecté
 * @access Private
 */
// GET /admins/profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin non trouvé" });
    }

    res.json({ success: true, data: admin });

  } catch (error) {
    console.error("Erreur profil admin:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});


/**
 * @route PUT /admin/profile
 * @description Met à jour le profil admin
 * @access Private
 */
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { nom, prenom, email, tel, currentPassword, newPassword } = req.body;
    const admin = await Admin.findByPk(req.user.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin non trouvé"
      });
    }

    // Mise à jour des champs de base
    admin.nom = nom || admin.nom;
    admin.prenom = prenom || admin.prenom;
    admin.email = email || admin.email;
    admin.tel = tel || admin.tel;

    // Gestion du mot de passe si fourni
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe actuel requis'
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe actuel incorrect'
        });
      }

      if (newPassword.length < 5) {
        return res.status(402).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 5 caractères',
          field: 'newPassword'
        });
      }

      admin.password = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();

    // Ne pas renvoyer le mot de passe
    const adminData = admin.get({ plain: true });
    delete adminData.password;

    res.status(200).json({
      success: true,
      message: "Profil mis à jour",
      data: adminData
    });

  } catch (error) {
    console.error("Erreur update admin:", error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: "Email déjà utilisé"
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});


router.post('/send-message', verifyToken, async (req, res) => {
  try {
    // 1. Validation des données
    const { content, recipient_id } = req.body;
    const sender_id = req.user.id;
    const sender_role = req.user.role

    if (!content || !recipient_id || !sender_role) {
      return res.status(400).json({
        success: false,
        message: 'Content, recipient_id and sender_role are required'
      });
    }

    // 2. Déterminer les IDs selon le rôle de l'expéditeur
    let id_admin, id_technicien;

    if (sender_role === 'admin') {
      id_admin = sender_id;
      id_technicien = recipient_id;

      // Vérifier si le technicien existe
      const technicien = await Technicien.findByPk(recipient_id);
      if (!technicien) {
        return res.status(404).json({
          success: false,
          message: 'Technicien not found'
        });
      }
    } else if (sender_role === 'technicien') {
      id_technicien = sender_id;
      id_admin = recipient_id;

      // Vérifier si l'admin existe
      const admin = await Admin.findByPk(recipient_id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid sender_role'
      });
    }

    // 3. Chercher ou créer la discussion
    let discussion = await Discussion.findOne({
      where: {
        id_technicien,
        id_admin
      }
    });

    if (!discussion) {
      discussion = await Discussion.create({
        id_technicien,
        id_admin,
        status: 'active',
        last_message_at: new Date()
      });
    }

    // 4. Créer le message
    const message = await Message.create({
      content,
      sender_type: sender_role,
      sender_id,
      discussion_id: discussion.id,
      status: 'sent'
    });

    // 5. Mettre à jour la discussion
    await Discussion.update(
      { last_message_at: new Date() },
      { where: { id: discussion.id } }
    );

    // 6. Réponse
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message,
        discussion_id: discussion.id
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


router.get('/discussions/:id/messages', verifyToken, async (req, res) => {
  try {
    const discussionId = req.params.id;
    const userId = req.user.id;

    // 1. Vérifier que la discussion existe et que l'utilisateur y a accès
    const discussion = await Discussion.findOne({
      where: { id: discussionId },
      include: [
        { model: Technicien, as: 'Technicien', attributes: ['id', 'nom', 'prenom'] },
        { model: Admin, as: 'Admin', attributes: ['id', 'nom', 'prenom'] }
      ]
    });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }

    // Vérification de participation
    if (userId !== discussion.id_admin && userId !== discussion.id_technicien) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette discussion'
      });
    }

    // 2. Récupérer tous les messages de la discussion
    const messages = await Message.findAll({
      where: { discussion_id: discussionId },
      order: [['created_at', 'ASC']],
      include: [
        {
          model: Admin,
          as: 'AdminSender',
          attributes: ['id', 'nom', 'prenom'],
          required: false
        },
        {
          model: Technicien,
          as: 'TechnicienSender',
          attributes: ['id', 'nom', 'prenom'],
          required: false
        }
      ]
    });

    // 3. Formater la réponse
    const response = {
      success: true,
      data: {
        discussion: {
          id: discussion.id,
          status: discussion.status,
          technicien: discussion.Technicien,
          admin: discussion.Admin
        },
        messages: messages.map(msg => {
          const sender = msg.sender_type === 'admin'
            ? msg.AdminSender
            : msg.TechnicienSender;

          return {
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            sender: sender ? {
              id: sender.id,
              nom: sender.nom,
              prenom: sender.prenom,
              role: msg.sender_type
            } : null,
            status: msg.status
          };
        })
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


router.get('/discussions', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role; // 'admin' ou 'technicien'

    // 1. Déterminer le champ de jointure selon le rôle
    const associationField = userRole === 'admin' ? 'id_admin' : 'id_technicien';

    // 2. Récupérer les discussions avec les dernières informations
    const discussions = await Discussion.findAll({
      where: {
        [associationField]: userId,
        id_operateur: null
      },
      order: [['last_message_at', 'DESC']], // Changé en ASC pour ordre ascendant
      include: [
        {
          model: Admin,
          as: 'Admin',
          attributes: ['id', 'nom', 'prenom', 'email']
        },
        {
          model: Technicien,
          as: 'Technicien',
          attributes: ['id', 'nom', 'prenom', 'email', 'disponibilite', 'file']
        },
        {
          model: Message,
          as: 'Messages',
          attributes: ['id', 'content', 'created_at', 'sender_type'],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    // 3. Formater la réponse
    const formattedDiscussions = discussions.map(discussion => {
      const counterpart = userRole === 'admin'
        ? discussion.Technicien
        : discussion.Admin;


      return {
        id: discussion.id,
        status: discussion.status,
        last_message_at: discussion.last_message_at,
        counterpart: {
          id: counterpart.id,
          nom: counterpart.nom,
          prenom: counterpart.prenom,
          role: userRole === 'admin' ? 'technicien' : 'admin',
          file: counterpart.file
        },
        messages: discussion.Messages ? discussion.Messages.map(msg => ({
          content: msg.content,
          created_at: msg.created_at,
          sender_type: msg.sender_type
        })) : []
      };
    });

    res.json({
      success: true,
      data: formattedDiscussions
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


router.get('/discussions/:id', verifyToken, async (req, res) => {
  try {
    const discussionId = req.params.id;
    const userId = req.user.id;

    // 1. Récupérer la discussion avec les participants
    const discussion = await Discussion.findOne({
      where: { id: discussionId },
      include: [
        {
          model: Admin,
          as: 'Admin',
          attributes: ['id', 'nom', 'prenom', 'email']
        },
        {
          model: Technicien,
          as: 'Technicien',
          attributes: ['id', 'nom', 'prenom', 'email', 'disponibilite', 'file']
        }
      ]
    });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }

    // 2. Vérifier les permissions
    if (userId !== discussion.id_admin && userId !== discussion.id_technicien) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette discussion'
      });
    }

    // 3. Formater la réponse
    const userRole = req.user.role;
    const counterpart = userRole === 'admin'
      ? discussion.Technicien
      : discussion.Admin;

    res.json({
      success: true,
      data: {
        id: discussion.id,
        status: discussion.status,
        created_at: discussion.created_at,
        counterpart: {
          id: counterpart.id,
          nom: counterpart.nom,
          prenom: counterpart.prenom,
          email: counterpart.email,
          role: userRole === 'admin' ? 'technicien' : 'admin',
          ...(userRole === 'admin' && { disponibilite: discussion.Technicien.disponibilite }),
          file: counterpart.file
        },
        unread_count: await Message.count({
          where: {
            discussion_id: discussionId,
            sender_type: userRole === 'admin' ? 'technicien' : 'admin',
            status: 'delivered'
          }
        })
      }
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

////////////////////////////////////////// Partie Operauter ////////////////////////////////////////////////////////////


router.post('/send-message/operateur', verifyToken, async (req, res) => {
  try {
    // 1. Validation des données
    const { content, recipient_id } = req.body;
    const sender_id = req.user.id;
    const sender_role = req.user.role

    if (!content || !recipient_id || !sender_role) {
      return res.status(400).json({
        success: false,
        message: 'Content, recipient_id and sender_role are required'
      });
    }

    // 2. Déterminer les IDs selon le rôle de l'expéditeur
    let id_admin, id_operateur;

    if (sender_role === 'admin') {
      id_admin = sender_id;
      id_operateur = recipient_id;

      // Vérifier si le technicien existe
      const operateur = await Operateur.findByPk(recipient_id);
      if (!operateur) {
        return res.status(404).json({
          success: false,
          message: 'operateur not found'
        });
      }
    } else if (sender_role === 'operateur') {
      id_operateur = sender_id;
      id_admin = recipient_id;

      // Vérifier si l'admin existe
      const admin = await Admin.findByPk(recipient_id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid sender_role'
      });
    }

    // 3. Chercher ou créer la discussion
    let discussion = await Discussion.findOne({
      where: {
        id_operateur,
        id_admin
      }
    });

    if (!discussion) {
      discussion = await Discussion.create({
        id_operateur,
        id_admin,
        status: 'active',
        last_message_at: new Date()
      });
    }

    // 4. Créer le message
    const message = await Message.create({
      content,
      sender_type: sender_role,
      sender_id,
      discussion_id: discussion.id,
      status: 'sent'
    });

    // 5. Mettre à jour la discussion
    await Discussion.update(
      { last_message_at: new Date() },
      { where: { id: discussion.id } }
    );

    // 6. Réponse
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message,
        discussion_id: discussion.id
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/discussions/:id/messages/operateur', verifyToken, async (req, res) => {
  try {
    const discussionId = req.params.id;
    const userId = req.user.id;

    // 1. Vérifier que la discussion existe et que l'utilisateur y a accès
    const discussion = await Discussion.findOne({
      where: { id: discussionId },
      include: [
        { model: Operateur, as: 'Operateur', attributes: ['id', 'name'] },
        { model: Admin, as: 'Admin', attributes: ['id', 'nom', 'prenom'] }
      ]
    });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }

    // Vérification de participation
    if (userId !== discussion.id_admin && userId !== discussion.id_operateur) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette discussion'
      });
    }

    // 2. Récupérer tous les messages de la discussion
    const messages = await Message.findAll({
      where: { discussion_id: discussionId },
      order: [['created_at', 'ASC']],
      include: [
        {
          model: Admin,
          as: 'AdminSender',
          attributes: ['id', 'nom', 'prenom'],
          required: false
        },
        {
          model: Operateur,  // Changé de Technicien à Operateur
          as: 'OperateurSender',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    // 3. Formater la réponse
    const response = {
      success: true,
      data: {
        discussion: {
          id: discussion.id,
          status: discussion.status,
          operateur: discussion.Operateur,
          admin: discussion.Admin
        },
        messages: messages.map(msg => {
          const sender = msg.sender_type === 'admin'
            ? msg.AdminSender
            : msg.OperateurSender;

          return {
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            sender: sender ? {
              id: sender.id,
              nom: sender.nom || sender.name,
              role: msg.sender_type
            } : null,
            status: msg.status
          };
        })
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/discussions-operateur', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role; // 'admin' ou 'technicien'

    // 1. Déterminer le champ de jointure selon le rôle
    const associationField = userRole === 'admin' ? 'id_admin' : 'id_operateur';

    // 2. Récupérer les discussions avec les dernières informations
    const discussions = await Discussion.findAll({
      where: {
        [associationField]: userId,
        id_technicien: null
      },
      order: [['last_message_at', 'DESC']], // Changé en ASC pour ordre ascendant
      include: [
        {
          model: Admin,
          as: 'Admin',
          attributes: ['id', 'nom', 'prenom', 'email']
        },
        {
          model: Operateur,
          as: 'Operateur',
          attributes: ['id', 'name', 'email', 'disabled', 'telephone']
        },
        {
          model: Message,
          as: 'Messages',
          attributes: ['id', 'content', 'created_at', 'sender_type'],
          order: [['created_at', 'DESC']]
        }
      ]
    });
    if (!discussions) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }
    console.log(discussions);

    // 3. Formater la réponse
    const formattedDiscussions = discussions.map(discussion => {
      const counterpart = userRole === 'admin'
        ? discussion.Operateur
        : discussion.Admin;


      return {
        id: discussion.id,
        status: discussion.status,
        last_message_at: discussion.last_message_at,
        counterpart: {
          id: counterpart.id,
          nom: counterpart.nom || counterpart.name,
          prenom: counterpart.prenom,
          role: userRole === 'admin' ? 'technicien' : 'admin',
        },
        messages: discussion.Messages ? discussion.Messages.map(msg => ({
          content: msg.content,
          created_at: msg.created_at,
          sender_type: msg.sender_type
        })) : []
      };
    });

    res.json({
      success: true,
      data: formattedDiscussions
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


router.get('/discussions/:id/operateur', verifyToken, async (req, res) => {
  try {
    const discussionId = req.params.id;
    const userId = req.user.id;

    // 1. Récupérer la discussion avec les participants
    const discussion = await Discussion.findOne({
      where: { id: discussionId },
      include: [
        {
          model: Admin,
          as: 'Admin',
          attributes: ['id', 'nom', 'prenom', 'email']
        },
        {
          model: Operateur,
          as: 'Operateur',
          attributes: ['id', 'name', 'email', 'disabled']
        }
      ]
    });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }

    // 2. Vérifier les permissions
    if (userId !== discussion.id_admin && userId !== discussion.id_operateur) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette discussion'
      });
    }

    // 3. Formater la réponse
    const userRole = req.user.role;
    const counterpart = userRole === 'admin'
      ? discussion.Operateur
      : discussion.Admin;

    res.json({
      success: true,
      data: {
        id: discussion.id,
        status: discussion.status,
        created_at: discussion.created_at,
        counterpart: {
          id: counterpart.id,
          nom: counterpart.nom || counterpart.name,
          prenom: counterpart.prenom || "",
          email: counterpart.email,
          role: userRole === 'admin' ? 'operateur' : 'admin'
        },
        unread_count: await Message.count({
          where: {
            discussion_id: discussionId,
            sender_type: userRole === 'admin' ? 'operateur' : 'admin',
            status: 'delivered'
          }
        })
      }
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;