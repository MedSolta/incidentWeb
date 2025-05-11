import express from 'express';
import Technicien from '../models/Technicien.js';
import upload from '../middleware/upload.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import transporter from '../config/mailer.js';
import Verification from '../models/Verification.js';
import Incident from '../models/Incident.js';
import { verifyToken } from '../middleware/auth.js';
import { where } from 'sequelize';


const router = express.Router();

// Get all techniciens
router.get('/', async (req, res) => {
  try {
    const techniciens = await Technicien.findAll({
      where: {
        archived: 0
      }
    }
    );
    res.json(techniciens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/technicien-archiver', async (req, res) => {
  try {
    const techniciens = await Technicien.findAll({
      where: {
        archived: 1
      }
    });
    // Toujours renvoyer un tableau (vide si aucun résultat)
    res.json(techniciens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get technicien by ID
router.get('/:id', async (req, res) => {
  try {
    const technicien = await Technicien.findByPk(req.params.id);
    if (!technicien) {
      return res.status(404).json({ message: 'Technicien not found' });
    }
    res.json(technicien);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create technicien
router.post('/', async (req, res) => {
  try {
    const technicien = await Technicien.create(req.body);
    res.status(201).json(technicien);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update technicien
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const technicien = await Technicien.findByPk(req.params.id);
    if (!technicien) {
      return res.status(404).json({ message: 'Technicien not found' });
    }
    // Si un nouveau mot de passe est fourni, le hacher
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;
    }
    // Mettre à jour le technicien avec les nouvelles données (email, nom, téléphone, etc.)
    await technicien.update(req.body);
    // Si un fichier est uploadé, envoyer ce fichier à Cloudinary
    if (req.file) {
      technicien.file = req.file.path;
      await technicien.save();
    }
    res.json({
      message: 'Technicien updated successfully',
      technicien,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete technicien
router.delete('/:id', async (req, res) => {
  try {
    const technicien = await Technicien.findByPk(req.params.id);
    if (!technicien) {
      return res.status(404).json({ message: 'Technicien not found' });
    }
    await technicien.destroy();
    res.json({ message: 'Technicien deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/incident-lister', verifyToken, async (req, res) => {
  try {
    const technicien = await Technicien.findByPk(req.user.id)
    if (!technicien) {
      return res.status(400).json({ message: error.message })
    }
    const incidents = await Incident.findAll({
      where: {
        code_postal: technicien.code_postal,
        accepted_by: false
      }
    })
    res.json({ message: 'Mission afficher' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post('/incident-affecter', async (req, res) => {
  try {
    const { idTechnicien, idIncident } = req.body
    if (!idIncident, !idTechnicien) {
      return res.status(400).json({ message: "parametre null" })
    }
    const technicien = await Technicien.findByPk(idTechnicien)
    if (!technicien) {
      return res.status(400).json({ message: error.message })
    }
    const incident = await Incident.findByPk(idIncident)
    if (!incident) {
      return res.status(400).json({ message: error.message })
    }
    await incident.update({
      id_technicien: idTechnicien,
      accepted_by: true
    })
    await technicien.update({
      disponibilite: true
    })
    res.json({ message: 'Mission affecter ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// archiver technicien
router.put('/archiver/:id', async (req, res) => {
  try {
    const technicien = await Technicien.findByPk(req.params.id);
    if (!technicien) {
      return res.status(404).json({ message: 'Technicien not found' });
    }
    technicien.archived = true
    await technicien.save();

    res.json({
      message: 'Technicien archived successfully',
      technicien,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



export default router;
