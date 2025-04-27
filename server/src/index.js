import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';
import config from './config/config.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import debateRoutes from './routes/debate.routes.js';
import userRoutes from './routes/user.routes.js';
import friendRoutes from './routes/friend.routes.js';
import connectionRoutes from './routes/connection.routes.js';
import translateRoutes from './routes/translate.routes.js';
import geminiRoutes from './routes/geminiRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000, // Reduced to 60 seconds
  pingInterval: 25000, // 25 seconds
  connectTimeout: 60000 // Reduced to 60 seconds
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/debates', debateRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api', translateRoutes);
app.use('/api/ai', geminiRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join debate room
  socket.on('join-debate', (data) => {
    const debateId = typeof data === 'string' ? data : data.debateId;
    socket.join(`debate:${debateId}`);
    console.log(`Client ${socket.id} joined debate room: debate:${debateId}`);
  });

  // Leave debate room
  socket.on('leave-debate', (data) => {
    const debateId = typeof data === 'string' ? data : data.debateId;
    socket.leave(`debate:${debateId}`);
    console.log(`Client ${socket.id} left debate room: debate:${debateId}`);
  });

  // Handle send-message event
  socket.on('send-message', ({ debateId, message }) => {
    console.log(`Broadcasting message to debate: ${debateId}`);
    // Validate message format
    if (!message || !message.text || !message.user) {
      console.error('Invalid message format:', message);
      return;
    }
    
    // Ensure message has required fields
    const validMessage = {
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
      translatedTexts: message.translatedTexts || {}
    };
    
    // Emit to all clients in the debate room, including the sender
    io.to(`debate:${debateId}`).emit('new-message', validMessage);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in controllers
export { io };

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Set server timeouts
httpServer.keepAliveTimeout = 60000; // Reduced to 60 seconds
httpServer.headersTimeout = 60000; // Reduced to 60 seconds

// Connect to MongoDB
mongoose.connect(config.mongodb.uri, {
  ...config.mongodb.options,
  serverSelectionTimeoutMS: 5000, // 5 seconds
  socketTimeoutMS: 45000, // 45 seconds
})
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || config.server.port;
    const HOST = '0.0.0.0';
    httpServer.listen(PORT, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }); 