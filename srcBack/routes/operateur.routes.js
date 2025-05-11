import express from 'express';
import { Incident, Operateur, Technicien, Discussion, Message, Admin } from '../models/index.js';
import { verifyToken, isAdmin, isOperateur, isTechnicien } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();




// Get all operateurs
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log("Tentative de récupération des opérateurs...");
    const operateurs = await Operateur.findAll({
      where: {
        archived: 0
      }
    });
    console.log(`Found ${operateurs.length} operateurs`);
    res.json(operateurs);
  } catch (error) {
    console.error("Erreur complète:", error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get operateur by ID
router.get('/:id', async (req, res) => {
  try {
    const operateur = await Operateur.findByPk(req.params.id);
    if (!operateur) {
      return res.status(404).json({ message: 'Operateur not found' });
    }
    res.json(operateur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create operateur
router.post('/', async (req, res) => {
  try {
    const operateur = await Operateur.create(req.body);
    res.status(201).json(operateur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update operateur
router.put('/:id', async (req, res) => {
  try {
    const operateur = await Operateur.findByPk(req.params.id);
    if (!operateur) {
      return res.status(404).json({ message: 'Operateur not found' });
    }
    await operateur.update(req.body);
    res.json(operateur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.put('/archiver/:id', async (req, res) => {
  try {
    const operateur = await Operateur.findByPk(req.params.id);
    if (!operateur) {
      return res.status(404).json({ message: 'Operateur not found' });
    }
    await operateur.update({ archived: true });
    res.json(operateur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete operateur
router.delete('/:id', async (req, res) => {
  try {
    const operateur = await Operateur.findByPk(req.params.id);
    if (!operateur) {
      return res.status(404).json({ message: 'Operateur not found' });
    }
    await operateur.destroy();
    res.json({ message: 'Operateur deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/add-mision/new', async (req, res) => {
  try {
    const { id_operateur, nom, adresse, code_postal, fiche_technique, telephone, details, titre } = req.body;
    if (!id_operateur || !nom || !adresse || !code_postal || !fiche_technique || !telephone || !details || !titre) {
      return res.status(400).json({ message: 'all fields required' });
    }
    const newIncident = await Incident.create(req.body);
    res.status(201).json(newIncident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Modifier la route pour récupérer les opérateurs archivés
router.get('/operateur-archiver', async (req, res) => {
  try {
    const operateurs = await Operateur.findAll({
      where: {
        archived: 1
      }
    });
    // Toujours renvoyer un tableau (vide si aucun résultat)
    res.json(operateurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /operateurs/profile
 * @description Récupère le profil de l'opérateur connecté
 */
router.get('/profile/me', verifyToken, async (req, res) => {
  try {
    const operateur = await Operateur.findByPk(req.user.id);
    if (!operateur) {
      return res.status(404).json({ message: 'Operateur not found' });
    }

    res.json(operateur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
/**
 * @route PUT /operateurs/profile/me/a
 * @description Met à jour le profil de l'opérateur connecté
 */
router.put('/profile/me/a', verifyToken, async (req, res) => {
  try {
    const operateur = await Operateur.findByPk(req.user.id);
    if (!operateur) {
      return res.status(404).json({ message: 'Operateur not found' });
    }
    await operateur.update(req.body);
    res.json(operateur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.put('/change-password/me', verifyToken, async (req, res) => {
  try {
    const operateur = await Operateur.findByPk(req.user.id);
    console.log("id operateur is : ", req.user.id);

    if (!operateur) {
      return res.status(404).json({ message: 'Operateur not foundd' });
    }
    const isMatch = await bcrypt.compare(req.body.currentPassword, operateur.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }
    if (req.body.newPassword.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }
    operateur.password = await bcrypt.hash(req.body.newPassword, 10);
    await operateur.update({ password: operateur.password });
    res.json(operateur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Routes pour la messagerie des opérateurs
router.get('/op/discussions', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'operateur') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Déterminer le champ d'association en fonction du rôle
    const associationField = 'id_operateur';

    // Récupérer les discussions avec les dernières informations
    const discussions = await Discussion.findAll({
      where: {
        [associationField]: userId
      },
      order: [['last_message_at', 'DESC']],
      include: [
        {
          model: Admin,
          as: 'Admin',
          attributes: ['id', 'nom', 'prenom', 'email']
        },
        {
          model: Message,
          as: 'Messages',
          attributes: ['id', 'content', 'created_at', 'sender_type'],
          order: [['created_at', 'DESC']],
          limit: 1
        }
      ]
    });

    // Formater la réponse
    const formattedDiscussions = discussions.map(d => {
      const counterpart = d.Admin;
      const lastMessage = d.Messages && d.Messages.length > 0 ? d.Messages[0] : null;

      return {
        id: d.id,
        created_at: d.created_at,
        last_message_at: d.last_message_at,
        status: d.status,
        counterpart: {
          id: counterpart.id,
          nom: counterpart.nom,
          prenom: counterpart.prenom,
          email: counterpart.email,
          role: 'admin'
        },
        last_message: lastMessage
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

router.get('/op/discussions/:id', verifyToken, async (req, res) => {
  try {
    const discussionId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'operateur') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Récupérer la discussion avec les participants
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
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }

    // Vérifier que l'utilisateur est un participant
    if (userId !== discussion.id_operateur) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette discussion'
      });
    }

    // Déterminer l'interlocuteur
    const counterpart = discussion.Admin;

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
          role: 'admin'
        },
        unread_count: await Message.count({
          where: {
            discussion_id: discussionId,
            sender_type: 'admin',
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

router.get('/op/discussions/:id/messages', verifyToken, async (req, res) => {
  try {
    const discussionId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'operateur') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Vérifier que la discussion existe et que l'utilisateur y a accès
    const discussion = await Discussion.findOne({
      where: { id: discussionId },
      include: [
        { model: Admin, as: 'Admin', attributes: ['id', 'nom', 'prenom'] },
        { model: Operateur, as: 'Operateur', attributes: ['id', 'name'] }
      ]
    });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }

    // Vérification de participation
    if (userId !== discussion.id_operateur) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette discussion'
      });
    }

    // Récupérer tous les messages de la discussion
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
          model: Operateur,
          as: 'OperateurSender',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    // Formater la réponse
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
              nom: sender.nom || '',
              prenom: sender.prenom || '',
              name: sender.name || '',
              role: msg.sender_type
            } : null,
            status: msg.status
          };
        })
      }
    };

    // Marquer les messages comme lus
    await Message.update(
      { status: 'read' },
      {
        where: {
          discussion_id: discussionId,
          sender_type: 'admin',
          status: 'delivered'
        }
      }
    );

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

router.post('/op/send-message', verifyToken, async (req, res) => {
  try {
    // Validation des données
    const { content, recipient_id } = req.body;
    const sender_id = req.user.id;
    const sender_role = req.user.role;

    if (!content || !recipient_id) {
      return res.status(400).json({
        success: false,
        message: 'Content et recipient_id sont requis'
      });
    }

    if (sender_role !== 'operateur') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Vérifier si l'admin existe
    const admin = await Admin.findByPk(recipient_id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin non trouvé'
      });
    }

    // Créer une nouvelle discussion si elle n'existe pas
    let discussion = await Discussion.findOne({
      where: {
        id_operateur: sender_id,
        id_admin: recipient_id
      }
    });

    if (!discussion) {
      discussion = await Discussion.create({
        id_operateur: sender_id,
        id_admin: recipient_id
      });
    }

    // Créer le message
    const message = await Message.create({
      content,
      sender_type: sender_role,
      discussion_id: discussion.id
    });

    // Mettre à jour la discussion avec la date du dernier message
    await discussion.update({
      last_message_at: message.created_at
    });

    res.json({
      success: true,
      message: 'Message envoyé avec succès',
      data: {
        message,
        discussion
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






