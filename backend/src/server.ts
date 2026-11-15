import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import meetingRoutes from './routes/meetings.js';
import habitRoutes from './routes/habits.js';
import focusRoutes from './routes/focus.js';
import noteRoutes from './routes/notes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/dailyflow';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW_MS as unknown as number) || 900000,
  max: (process.env.RATE_LIMIT_MAX_REQUESTS as unknown as number) || 100,
});
app.use(limiter);

// Database connection
const connectDB = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ MongoDB connected successfully');
};

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'DailyFlow Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    features: ['authentication', 'tasks', 'meetings', 'habits', 'focus', 'notes'],
  });
});

// Demo endpoints for testing
app.get('/api/demo/tasks', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        _id: '1',
        title: 'Build DailyFlow',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        priority: 'high',
        completed: false,
      },
    ],
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/notes', noteRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32 || jwtSecret === 'your_super_secret_jwt_key_change_in_production') {
    console.error('JWT_SECRET must be configured with a unique value of at least 32 characters.');
    process.exitCode = 1;
    return;
  }

  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exitCode = 1;
    return;
  }

  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🚀 DailyFlow Backend Server Running   ║
╚════════════════════════════════════════╝

📍 URL: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
📚 API Base: http://localhost:${PORT}/api

🔌 Connected Modules:
   ✅ Authentication
   ✅ Tasks
   ✅ Meetings
   ✅ Habits
   ✅ Focus Sessions
   ✅ Notes

📦 Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}

Press Ctrl+C to stop the server.
    `);
  });
};

startServer();

export default app;
