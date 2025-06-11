const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const verifyToken = require('../middleware/verifyToken'); // Kullanıcı girişi gerektiren bir rota olduğu için

// POST /api/ai/ask
router.post('/ask', verifyToken, aiController.askAiAssistant);

module.exports = router;