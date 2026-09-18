const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const featureRequestRoutes = require('./routes/featureRequest.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes = require('./routes/admin.routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const corsOptions = {
  origin(origin, callback) {
    // Non-browser requests (curl, scripts) and dev are fine.
    if (!origin || !env.isProd) return callback(null, true);
    if (origin === env.clientOrigin) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(morgan(env.isProd ? 'combined' : 'dev'));

app.use(cookieParser());
app.use(express.json({ limit: '64kb' }));

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/requests', featureRequestRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api', adminRoutes); // includes public /api/roadmap + guarded /api/admin/*

const verifyAccessToken = require('./middleware/verifyAccessToken');
const authController = require('./controllers/auth.controller');
app.get('/api/users/me', verifyAccessToken, authController.me);

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;