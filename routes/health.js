const express = require('express');

const healthController = require('../controllers/healthController');

const router = express.Router();

// check health api
router.get('/health', healthController.getHealth);

module.exports = router;
