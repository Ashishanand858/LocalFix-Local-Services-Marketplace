const ProviderProfile = require('../models/ProviderProfile');
const ServiceCategory = require('../models/ServiceCategory');
const Review = require('../models/Review');
const { cloudinary, enabled: cloudinaryEnabled } = require('../config/cloudinary');

async function uploadFile(file) {
  if (!file) return '';
  if (!cloudinaryEnabled) return `/uploads/${file.filename}`;
  const result = await cloudinary.uploader.upload(file.path, { folder: 'localfix/providers' });
  return result.secure_url;
}

async function upsertProfile(req, res) {
  const { businessName, description, experience, pricePerVisit, address, city, latitude, longitude, services = [] } = req.body;
  const serviceIds = Array.isArray(services) ? services : String(services).split(',').filter(Boolean);

  const validServices = await ServiceCategory.find({ _id: { $in: serviceIds }, isActive: true }).select('_id');
  const profileImage = await uploadFile(req.file);

  const update = {
    businessName,
    description,
    experience,
    pricePerVisit,
    address,
    city,
    services: validServices.map(s => s._id),
    ...(profileImage ? { profileImage } : {})
  };

  if (Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))) {
    update.location = { type: 'Point', coordinates: [Number(longitude), Number(latitude)] };
  }

  const profile = await ProviderProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: update, $setOnInsert: { user: req.user._id } },
    { new: true, upsert: true, runValidators: true }
  ).populate('services', 'name basePrice');

  res.json({ success: true, data: profile });
}


async function getMyProfile(req, res) {
  const profile = await ProviderProfile.findOne({ user: req.user._id }).populate('services', 'name basePrice');
  res.json({ success: true, data: profile });
}

async function listProviders(req, res) {
  const { service, city, lat, lng, radius = 10000, q } = req.query;
  const filter = { isVerified: true };

  if (service) filter.services = service;
  if (city) filter.city = new RegExp(`^${String(city).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, 'i');
  if (q) filter.$or = [
    { businessName: new RegExp(q, 'i') },
    { description: new RegExp(q, 'i') },
    { city: new RegExp(q, 'i') }
  ];

  if (lat && lng) {
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(radius)
      }
    };
  }

  const providers = await ProviderProfile.find(filter)
    .populate('user', 'name email phone profileImage')
    .populate('services', 'name basePrice')
    .limit(50);

  res.json({ success: true, data: providers });
}

async function getProvider(req, res) {
  const profile = await ProviderProfile.findById(req.params.id)
    .populate('user', 'name email phone profileImage')
    .populate('services', 'name description basePrice');
  if (!profile) return res.status(404).json({ success: false, message: 'Provider not found' });

  const reviews = await Review.find({ provider: profile._id })
    .populate('customer', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({ success: true, data: { ...profile.toObject(), reviews } });
}

async function verifyProvider(req, res) {
  const profile = await ProviderProfile.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
  if (!profile) return res.status(404).json({ success: false, message: 'Provider not found' });
  res.json({ success: true, data: profile });
}

async function listAllProviders(req, res) {
  const providers = await ProviderProfile.find()
    .populate('user', 'name email phone isActive')
    .populate('services', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: providers });
}

module.exports = { upsertProfile, getMyProfile, listProviders, getProvider, verifyProvider, listAllProviders };
