const Notification = require('../models/Notification');

async function createNotification({ io, recipient, type, message, booking = null }) {
  const notification = await Notification.create({ recipient, type, message, booking });

  if (io) {
    const room = `user_${recipient.toString()}`;
    io.to(room).emit('new_notification', notification);
    if (type.startsWith('booking_')) io.to(room).emit(type, notification);
  }

  return notification;
}

module.exports = { createNotification };
