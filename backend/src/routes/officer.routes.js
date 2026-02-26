const express = require('express');
const router = express.Router();
const officerController = require('../controllers/officer.controller');

router.get('/', officerController.getAllOfficers);
router.get('/:id', officerController.getOfficerById);
router.get('/:id/tasks', officerController.getOfficerTasks);
router.patch('/:id/availability', officerController.updateAvailability);
router.get('/:id/performance', officerController.getPerformance);

module.exports = router;
