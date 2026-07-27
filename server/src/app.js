const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const { env, clientUrl } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const leadRoutes = require('./routes/lead.routes');
const publicRoutes = require('./routes/public.routes');

const app = express();

app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS - only allow the configured client origin, with credentials support
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// Sanitize against NoSQL injection and XSS payloads
app.use(mongoSanitize());
app.use(xss());

if (env !== 'test') {
  app.use(morgan(env === 'development' ? 'dev' : 'combined'));
}

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
