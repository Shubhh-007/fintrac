const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();

const startServer = async () => {
  // Connect to DB first
  await connectDB();
  
  const app = express();

  // Trust proxy for Render/Netlify
  app.set('trust proxy', 1);

  // Security Headers
  app.use(helmet());

  // CORS configuration
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'https://fintrac1.netlify.app',
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      // Allow if origin is in the allowedOrigins list
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any *.vercel.app or *.netlify.app subdomain (for preview deployments)
      if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) || /^https:\/\/[a-z0-9-]+\.netlify\.app$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true
  }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Request Parsing
  app.use(express.json());
  app.use(cookieParser());

  // Versioned API Routes
  app.use('/api/v1/auth', require('./routes/authRoutes'));
  app.use('/api/v1/expenses', require('./routes/expenseRoutes'));
  app.use('/api/v1/users', require('./routes/userRoutes'));
  app.use('/api/v1/groups', require('./routes/groupRoutes'));
  app.use('/api/v1/notifications', require('./routes/notificationRoutes'));

  app.get('/', (req, res) => res.send('Fintrac Family Expense Tracker API running...'));

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
