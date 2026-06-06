const Drop = require('../models/Drop');
const { sendDropNotification } = require('../utils/email');
const { pick } = require('../middleware/validate');

const ALLOWED_DROP_FIELDS = ['title', 'description', 'products', 'launchDate', 'status', 'slug'];

exports.getAllDrops = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    
    const drops = await Drop.find(filter).populate('products').sort({ launchDate: -1 });
    res.json(drops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDrop = async (req, res) => {
  try {
    const drop = await Drop.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }]
    }).populate('products');

    if (!drop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    res.json(drop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDrop = async (req, res) => {
  try {
    const drop = await Drop.create(pick(req.body, ALLOWED_DROP_FIELDS));
    res.status(201).json(drop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDrop = async (req, res) => {
  try {
    const drop = await Drop.findByIdAndUpdate(req.params.id, pick(req.body, ALLOWED_DROP_FIELDS), { new: true, runValidators: true });
    
    if (!drop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    drop.updateStatus();
    await drop.save();

    res.json(drop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDrop = async (req, res) => {
  try {
    const drop = await Drop.findByIdAndDelete(req.params.id);
    
    if (!drop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    res.json({ message: 'Drop deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.subscribeToNotification = async (req, res) => {
  try {
    const drop = await Drop.findById(req.params.id);
    
    if (!drop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    if (!drop.notifySubscribers.includes(req.user._id)) {
      drop.notifySubscribers.push(req.user._id);
      await drop.save();
    }

    res.json({ message: 'Subscribed to notifications' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.launchDrop = async (req, res) => {
  try {
    const drop = await Drop.findById(req.params.id).populate('notifySubscribers');
    
    if (!drop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    drop.status = 'live';
    await drop.save();

    // Send notifications
    for (const user of drop.notifySubscribers) {
      await sendDropNotification(user.email, drop);
    }

    res.json(drop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
