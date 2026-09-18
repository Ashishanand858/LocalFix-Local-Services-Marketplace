const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    experience: { type: Number, default: 0, min: 0 },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' }],
    pricePerVisit: { type: Number, default: 0, min: 0 },
    profileImage: { type: String, default: '' },
    gallery: [{ type: String }],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

providerProfileSchema.index({ location: '2dsphere' });
providerProfileSchema.index({ services: 1 });
providerProfileSchema.index({ city: 1 });

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
