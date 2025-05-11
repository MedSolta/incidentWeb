import express from 'express';
import { Feedback, Technicien, Incident } from '../models/index.js';

const router = express.Router();

// Get all feedback with related technicien and incident
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      include: [
        { model: Technicien },
        { model: Incident }
      ]
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get feedback by ID
router.get('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id, {
      include: [
        { model: Technicien },
        { model: Incident }
      ]
    });
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create feedback
router.post('/', async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update feedback
router.put('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    await feedback.update(req.body);
    res.json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete feedback
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    await feedback.destroy();
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;