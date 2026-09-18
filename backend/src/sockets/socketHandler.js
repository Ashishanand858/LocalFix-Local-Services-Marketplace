function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('join_user', (userId) => {
      if (userId) socket.join(`user_${userId}`);
    });

    socket.on('join_booking', (bookingId) => {
      if (bookingId) socket.join(`booking_${bookingId}`);
    });

    socket.on('disconnect', () => {});
  });
}

module.exports = registerSocketHandlers;
