const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const ServiceCategory = require('../models/ServiceCategory');
const Availability = require('../models/Availability');
const { createNotification } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');

function assertTransition(current, next) {
  const allowed = {
    pending: ['accepted', 'rejected', 'cancelled'],
    accepted: ['in_progress', 'cancelled'],
    in_progress: ['completed']
  };
  if (!allowed[current]?.includes(next)) {
    const err = new Error(`Cannot change booking from ${current} to ${next}`);
    err.statusCode = 400;
    throw err;
  }
}

async function createBooking(req, res) {
  const { providerId, serviceId, bookingDate, timeSlot, address, coordinates, notes } = req.body;
  const provider = await ProviderProfile.findById(providerId).populate('user', 'email name');
  const service = await ServiceCategory.findById(serviceId);

  if (!provider || !provider.isVerified) return res.status(400).json({ success: false, message: 'Provider is unavailable or not verified' });
  if (!service || !service.isActive) return res.status(400).json({ success: false, message: 'Invalid service' });
  if (!provider.services.some(s => s.toString() === serviceId.toString())) return res.status(400).json({ success: false, message: 'Provider does not offer this service' });

  const date = new Date(bookingDate);
  if (Number.isNaN(date.getTime())) return res.status(400).json({ success: false, message: 'Invalid booking date' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return res.status(400).json({ success: false, message: 'Booking date cannot be in the past' });

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const availability = await Availability.findOne({ provider: provider._id, day: dayName, isAvailable: true });
  if (!availability) return res.status(400).json({ success: false, message: `Provider is not available on ${dayName}` });

  const [slotStartRaw, slotEndRaw] = String(timeSlot).split(/\s*-\s*/);
  const toMinutes = (value) => { const [h, m] = String(value).split(':').map(Number); return (h * 60) + m; };
  if (toMinutes(slotStartRaw) < toMinutes(availability.startTime) || toMinutes(slotEndRaw) > toMinutes(availability.endTime)) {
    return res.status(400).json({ success: false, message: 'Selected time slot is outside provider availability' });
  }

  const conflict = await Booking.findOne({
    provider: provider._id,
    bookingDate: { $gte: new Date(date.setHours(0, 0, 0, 0)), $lt: new Date(date.setHours(23, 59, 59, 999)) },
    timeSlot,
    status: { $in: ['pending', 'accepted', 'in_progress'] }
  });
  if (conflict) return res.status(409).json({ success: false, message: 'Selected time slot is already booked' });

  const amount = Number(provider.pricePerVisit || service.basePrice);
  const platformFee = Math.round(amount * 0.05);
  const booking = await Booking.create({
    customer: req.user._id,
    provider: provider._id,
    service: service._id,
    bookingDate: new Date(bookingDate),
    timeSlot,
    address,
    location: { type: 'Point', coordinates: Array.isArray(coordinates) ? coordinates.map(Number) : [0, 0] },
    amount,
    platformFee,
    notes
  });

  await createNotification({
    io: req.app.get('io'),
    recipient: provider.user._id,
    type: 'new_booking',
    message: `New ${service.name} booking request from ${req.user.name}`,
    booking: booking._id
  });

  await sendEmail({
    to: provider.user.email,
    subject: 'New LocalFix booking request',
    html: `<p>You have a new booking request for ${service.name} on ${new Date(bookingDate).toDateString()}.</p>`
  });

  res.status(201).json({ success: true, data: booking });
}

async function getBooking(req, res) {
  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'name email phone profileImage')
    .populate({ path: 'provider', populate: { path: 'user', select: 'name email phone profileImage' } })
    .populate('service', 'name description basePrice');

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  res.json({ success: true, data: booking });
}

async function myBookings(req, res) {
  const filter = req.user.role === 'customer'
    ? { customer: req.user._id }
    : { provider: await ProviderProfile.findOne({ user: req.user._id }).then(p => p?._id) };

  if (!filter.provider && req.user.role === 'provider') return res.json({ success: true, data: [] });

  const bookings = await Booking.find(filter)
    .populate('customer', 'name phone profileImage')
    .populate({ path: 'provider', populate: { path: 'user', select: 'name phone profileImage' } })
    .populate('service', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: bookings });
}

async function updateStatus(req, res) {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id).populate('customer', 'name email').populate({ path: 'provider', populate: { path: 'user', select: 'name email' } }).populate('service', 'name');
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  if (req.user.role === 'customer' && booking.customer._id.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not your booking' });
  if (req.user.role === 'provider' && booking.provider.user._id.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not your booking' });

  assertTransition(booking.status, status);
  booking.status = status;
  await booking.save();

  const recipientId = req.user.role === 'provider' ? booking.customer._id : booking.provider.user._id;
  const actorText = req.user.role === 'provider' ? 'Provider' : 'Customer';

  await createNotification({
    io: req.app.get('io'),
    recipient: recipientId,
    type: `booking_${status}`,
    message: `${actorText} changed your booking to ${status.replace('_', ' ')}`,
    booking: booking._id
  });

  const recipientEmail = req.user.role === 'provider' ? booking.customer.email : booking.provider.user.email;
  await sendEmail({
    to: recipientEmail,
    subject: `LocalFix booking ${status.replace('_', ' ')}`,
    html: `<p>Your ${booking.service.name} booking is now <strong>${status.replace('_', ' ')}</strong>.</p>`
  });

  res.json({ success: true, data: booking });
}

async function adminListBookings(req, res) {
  const bookings = await Booking.find()
    .populate('customer', 'name email')
    .populate({ path: 'provider', populate: { path: 'user', select: 'name email' } })
    .populate('service', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: bookings });
}

module.exports = { createBooking, getBooking, myBookings, updateStatus, adminListBookings };
