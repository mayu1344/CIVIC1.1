const express = require('express');
const router = express.Router();
const mlaController = require('../controllers/mla.controller');

router.get('/issues', mlaController.getConstituencyIssues);
router.get('/stats', mlaController.getMLAStats);
router.post('/directives', mlaController.issueDirective);
router.get('/directives', mlaController.getDirectives);

module.exports = router;
