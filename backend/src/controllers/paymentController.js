const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { razorpay, enabled } = require('../config/razorpay');
const { sendEmail } = require('../services/emailService');

async function createOrder(req, res) {
  const booking = await Booking.findOne({ _id: req.body.bookingId, customer: req.user._id });
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.status !== 'pending') return res.status(400).json({ success: false, message: 'Payment can only be initiated for a pending booking' });

  if (!enabled) {
    const demoOrderId = `demo_order_${booking._id}`;
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      razorpayOrderId: demoOrderId,
      amount: booking.amount + booking.platformFee,
      mode: 'demo',
      status: 'created'
    });
    booking.paymentMode = 'demo';
    await booking.save();
    return res.json({ success: true, mode: 'demo', data: { orderId: demoOrderId, amount: payment.amount, currency: 'INR', keyId: '' } });
  }

  const amount = Math.round((booking.amount + booking.platformFee) * 100);
  const order = await razorpay.orders.create({ amount, currency: 'INR', receipt: booking._id.toString() });
  await Payment.create({ booking: booking._id, user: req.user._id, razorpayOrderId: order.id, amount: amount / 100, mode: 'razorpay' });

  res.json({ success: true, mode: 'razorpay', data: { orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID } });
}

async function verifyPayment(req, res) {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature, demo = false } = req.body;
  const booking = await Booking.findOne({ _id: bookingId, customer: req.user._id });
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  const payment = await Payment.findOne({ booking: booking._id }).sort({ createdAt: -1 });

  if (demo && !enabled) {
    booking.paymentStatus = 'paid';
    await booking.save();
    if (payment) {
      payment.status = 'success';
      await payment.save();
    }
    await sendEmail({
      to: req.user.email,
      subject: 'LocalFix demo payment confirmation',
      html: `<p>Demo payment for booking ${booking._id} was marked successful.</p>`
    });
    return res.json({ success: true, message: 'Demo payment successful', data: booking });
  }

  if (!payment || payment.razorpayOrderId !== razorpay_order_id) return res.status(400).json({ success: false, message: 'Payment order not found' });

  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) return res.status(400).json({ success: false, message: 'Invalid payment signature' });

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = 'success';
  await payment.save();

  booking.paymentStatus = 'paid';
  await booking.save();

  await sendEmail({
    to: req.user.email,
    subject: 'LocalFix payment confirmation',
    html: `<p>Your payment for booking ${booking._id} was successful.</p>`
  });

  res.json({ success: true, message: 'Payment verified', data: booking });
}

async function webhook(req, res) {
  // Razorpay webhooks should be validated with RAZORPAY_WEBHOOK_SECRET in production.
  // This endpoint is intentionally kept minimal so it can be wired to the merchant dashboard.
  res.json({ success: true, received: true });
}

async function getPayment(req, res) {
  const payment = await Payment.findOne({ booking: req.params.bookingId, user: req.user._id }).sort({ createdAt: -1 });
  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
  res.json({ success: true, data: payment });
}

module.exports = { createOrder, verifyPayment, webhook, getPayment };
