const express = require('express');
const router = express.Router();
const apiKeyAuth = require('../middlewares/apiKeyAuth');
const { collect, eventSummary, userStats } = require('../controllers/analyticsController');

router.post('/collect', apiKeyAuth, collect);
router.get('/event-summary', apiKeyAuth, eventSummary);
router.get('/user-stats', apiKeyAuth, userStats);

module.exports = router;
