const ServiceCategory = require('../models/ServiceCategory');

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function listServices(req, res) {
  const query = req.user?.role === 'admin' && req.query.all === 'true' ? {} : { isActive: true };
  const services = await ServiceCategory.find(query).sort({ name: 1 });
  res.json({ success: true, data: services });
}

async function getService(req, res) {
  const service = await ServiceCategory.findById(req.params.id);
  if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
  res.json({ success: true, data: service });
}

async function createService(req, res) {
  const { name, description, basePrice, image } = req.body;
  const service = await ServiceCategory.create({ name, slug: slugify(name), description, basePrice, image });
  res.status(201).json({ success: true, data: service });
}

async function updateService(req, res) {
  const updates = { ...req.body };
  if (updates.name) updates.slug = slugify(updates.name);
  const service = await ServiceCategory.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
  res.json({ success: true, data: service });
}

async function deleteService(req, res) {
  const service = await ServiceCategory.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
  res.json({ success: true, message: 'Service deactivated' });
}

module.exports = { listServices, getService, createService, updateService, deleteService };
