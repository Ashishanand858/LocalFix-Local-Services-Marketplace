const Availability = require('../models/Availability');
const ProviderProfile = require('../models/ProviderProfile');

async function getProviderId(userId) {
  const profile = await ProviderProfile.findOne({ user: userId });
  if (!profile) throw Object.assign(new Error('Create provider profile first'), { statusCode: 400 });
  return profile._id;
}

async function listAvailability(req, res) {
  let providerId;

  if (req.params.providerId === 'me') {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    providerId = await getProviderId(req.user._id);
  } else {
    providerId = req.params.providerId;
  }

  const records = await Availability.find({
    provider: providerId
  }).sort({ createdAt: 1 });

  res.json({
    success: true,
    data: records
  });
}

async function upsertAvailability(req, res) {
  const providerId = await getProviderId(req.user._id);
  const { day, startTime, endTime, isAvailable = true } = req.body;
  const record = await Availability.findOneAndUpdate(
    { provider: providerId, day },
    { $set: { startTime, endTime, isAvailable } },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, data: record });
}

module.exports = { listAvailability, upsertAvailability };
