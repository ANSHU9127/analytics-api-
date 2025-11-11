require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const limiter = require('./middlewares/rateLimiter');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(limiter);

// routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

// swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/healthz', (req,res)=>res.json({ ok: true }));
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, ()=>console.log(`Listening ${PORT}`));
} else {
  module.exports = app;
}
