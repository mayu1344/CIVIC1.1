const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.get('/stats', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);
router.get('/officers', adminController.getAllOfficers);
router.post('/officers', adminController.createOfficer);
router.get('/notifications', adminController.getNotificationCounts);

module.exports = router;