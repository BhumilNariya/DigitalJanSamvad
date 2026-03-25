const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
  // SECURITY FIX #3: Restrict Socket.IO CORS to known frontend origin via env var.
  // Using '*' would allow any website to establish a WebSocket connection to this server.
  const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';

  io = socketIo(server, {
    cors: {
      origin: allowedOrigin,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] New client connected: ${socket.id}`);

    // Allow clients to join a personal room for targeted notifications.
    // Each user joins a room identified by their MongoDB _id.
    socket.on('joinRoom', (userId) => {
      if (userId && typeof userId === 'string') {
        socket.join(userId);
        console.log(`[Socket] ${socket.id} joined room: ${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized — call initSocket(server) first');
  }
  return io;
};

module.exports = { initSocket, getIo };
