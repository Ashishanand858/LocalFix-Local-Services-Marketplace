const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
    bookingDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    amount: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'in_progress', 'completed'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentMode: { type: String, enum: ['online', 'demo'], default: 'online' }
  },
  { timestamps: true }
);

bookingSchema.index({ provider: 1, bookingDate: 1, timeSlot: 1 });
bookingSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
