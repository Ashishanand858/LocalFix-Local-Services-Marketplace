const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const ProviderProfile = require('../models/ProviderProfile');
const Review = require('../models/Review');

async function dashboard(req, res) {
  const [users, providers, bookings, completed, payments, reviews] = await Promise.all([
    User.countDocuments(),
    ProviderProfile.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'completed' }),
    Payment.find({ status: 'success' }).select('amount'),
    Review.countDocuments()
  ]);

  const revenue = payments.reduce((sum, p) => sum + p.amount, 0);
  res.json({ success: true, data: { users, providers, bookings, completed, revenue, reviews } });
}

async function listUsers(req, res) {
  const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, data: users });
}

async function toggleUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Admin accounts cannot be disabled from this endpoint' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, data: { id: user._id, isActive: user.isActive } });
}

module.exports = { dashboard, listUsers, toggleUser };
