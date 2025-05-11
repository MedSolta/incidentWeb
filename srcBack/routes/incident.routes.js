import express from 'express';
import { Incident, Operateur, Technicien } from '../models/index.js';

const router = express.Router();

// Get all incidents with related operateur and technicien
router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.findAll({
      include: [
        { model: Operateur },
        { model: Technicien }
      ]
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get incident by ID
router.get('/:id', async (req, res) => {
  try {
    const incident = await Incident.findByPk(req.params.id, {
      include: [
        { model: Operateur },
        { model: Technicien }
      ]
    });
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create incident
router.post('/', async (req, res) => {
  try {
    const incident = await Incident.create(req.body);
    res.status(201).json(incident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update incident
router.put('/:id', async (req, res) => {
  try {
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    await incident.update(req.body);
    res.json(incident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete incident
router.delete('/:id', async (req, res) => {
  try {
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    await incident.destroy();
    res.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;