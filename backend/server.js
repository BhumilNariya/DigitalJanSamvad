// SECURITY FIX #5: All require statements moved to top of file (clean Node.js structure)
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/socketServer');

const app = express();
const server = http.createServer(app);

// Init socket.io
initSocket(server);

// Connect Database
connectDB();

// Seed Admin User
const seedAdmin = async () => {
  try {
    const User = require('./models/User');
    const adminExists = await User.findOne({ email: 'admin@jansamvad.in' });
    if (!adminExists) {
      await User.create({
        name: 'Rajesh Kumar (Admin)',
        email: 'admin@jansamvad.in',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Default Admin User Seeded (admin@jansamvad.in / admin123)');
    }
  } catch (err) {
    console.error('❌ Error seeding admin user:', err.message);
  }
};
seedAdmin();

// SECURITY FIX #4: CORS origin loaded from environment variable (not hardcoded)
// Set CLIENT_URL in .env for each environment (dev/staging/production)
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Default Route
app.get('/', (req, res) => res.send('Samvad API Running'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// SECURITY: Global error handler — prevents leaking raw stack traces to clients
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT} | CORS origin: ${allowedOrigin}`));
