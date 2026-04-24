const express = require('express');
const router = express.Router();
const WeatherController = require('../controllers/weatherController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');

router.use(authenticate);

router.get('/alerts', WeatherController.getAlerts);
router.get('/alerts/unread', WeatherController.getUnreadAlerts);
router.put('/alerts/:id/read', WeatherController.markAsRead);
router.put('/alerts/read-all', WeatherController.markAllAsRead);
router.get('/forecast', WeatherController.getForecast);

// Admin only
router.post('/check', isAdmin, WeatherController.checkWeather);

module.exports = router;