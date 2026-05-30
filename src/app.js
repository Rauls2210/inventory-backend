const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const env = require('./config/env');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Security headers.
app.use(helmet());

// CORS — allow the configured frontend origin(s).
app.use(cors());
app.options("*", cors());
// const allowedOrigins = env.corsOrigin.split(',').map((o) => o.trim());
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Allow non-browser tools (no origin) and any whitelisted origin.
//       if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
//         return callback(null, true);
//       }
//       return callback(new Error('Not allowed by CORS'));
//     },
//     credentials: true,
//   })
// );

// Body parsing.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root.
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Inventory Management API', docs: '/api/health' });
});

// API routes mounted under /api.
app.use('/api', routes);

// 404 + central error handler (must be last).
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
