const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

availabilitySchema.index({ provider: 1, day: 1 }, { unique: true });
module.exports = mongoose.model('Availability', availabilitySchema);
