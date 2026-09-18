const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');

async function createReview(req, res) {
  const { bookingId, rating, comment = '' } = req.body;
  const booking = await Booking.findOne({ _id: bookingId, customer: req.user._id });
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.status !== 'completed') return res.status(400).json({ success: false, message: 'Review is available after service completion' });

  const existing = await Review.findOne({ booking: booking._id });
  if (existing) return res.status(409).json({ success: false, message: 'You already reviewed this booking' });

  const review = await Review.create({
    booking: booking._id,
    customer: req.user._id,
    provider: booking.provider,
    rating,
    comment
  });

  const provider = await ProviderProfile.findById(booking.provider);
  const oldCount = provider.totalReviews;
  provider.rating = Number((((provider.rating * oldCount) + Number(rating)) / (oldCount + 1)).toFixed(2));
  provider.totalReviews = oldCount + 1;
  await provider.save();

  res.status(201).json({ success: true, data: review });
}

async function listProviderReviews(req, res) {
  const reviews = await Review.find({ provider: req.params.providerId })
    .populate('customer', 'name profileImage')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: reviews });
}

async function deleteReview(req, res) {
  const review = await Review.findOneAndDelete({ _id: req.params.id, customer: req.user._id });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

  const provider = await ProviderProfile.findById(review.provider);
  if (provider) {
    const countAfter = Math.max(0, provider.totalReviews - 1);
    if (countAfter === 0) {
      provider.rating = 0;
      provider.totalReviews = 0;
    } else {
      const total = provider.rating * provider.totalReviews - review.rating;
      provider.rating = Number((total / countAfter).toFixed(2));
      provider.totalReviews = countAfter;
    }
    await provider.save();
  }

  res.json({ success: true, message: 'Review deleted' });
}

module.exports = { createReview, listProviderReviews, deleteReview };
