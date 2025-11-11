const express = require('express');
const router = express.Router();
const { register, getApiKey, revoke, regenerate } = require('../controllers/authController');

/**
 * POST /api/auth/register
 * body: { name, ownerEmail, expiresInDays }
 */
router.post('/register', register);
router.get('/api-key', getApiKey);
router.post('/revoke', revoke);
router.post('/regenerate', regenerate);

module.exports = router;
