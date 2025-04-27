import Debate from '../models/debate.model.js';

export const getDebates = async (req, res) => {
  try {
    const debates = await Debate.find().populate('host participants');
    res.json({ success: true, debates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getDebateById = async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id).populate('host participants');
    if (!debate) return res.status(404).json({ success: false, error: 'Debate not found' });
    res.json({ success: true, debate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createDebate = async (req, res) => {
  try {
    const { title, description, languages, topics, capacity, startTime } = req.body;
    console.log('Creating debate with:', req.body);
    const debate = await Debate.create({
      title,
      description,
      languages,
      topics,
      capacity,
      startTime,
      host: req.user.id,
      participants: [req.user.id]
    });
    console.log('Debate created:', debate);
    res.status(201).json({ success: true, debate });
  } catch (err) {
    console.error('Debate creation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
