const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['created', 'success', 'failed', 'refunded'], default: 'created' },
    mode: { type: String, enum: ['razorpay', 'demo'], default: 'razorpay' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
