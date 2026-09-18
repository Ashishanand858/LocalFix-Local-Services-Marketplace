const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../services/emailService');

async function register(req, res) {
  const { name, email, phone, password, role = 'customer' } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, phone and password are required' });
  }

  if (!['customer', 'provider'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Public registration only supports customer/provider roles' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, password: passwordHash, role });

  await sendEmail({
    to: user.email,
    subject: 'Welcome to LocalFix',
    html: `<h2>Welcome ${user.name}</h2><p>Your LocalFix account has been created successfully.</p>`
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token: generateToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  if (!user || !user.isActive || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  res.json({
    success: true,
    token: generateToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, profileImage: user.profileImage }
  });
}

async function me(req, res) {
  res.json({ success: true, user: req.user });
}

module.exports = { register, login, me };
