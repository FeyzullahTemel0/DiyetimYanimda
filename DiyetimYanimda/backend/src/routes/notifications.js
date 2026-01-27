const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkAdmin = require('../middleware/checkAdmin');
const { addNotification } = require('../services/notificationService');

router.use(verifyToken);

// Admin hedef kullanıcıya bildirim gönderebilir
router.post('/:uid', checkAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { title, body, type, important, meta } = req.body || {};
    if (!title && !body) {
      return res.status(400).json({ error: 'Başlık veya içerik gerekli' });
    }
    const id = await addNotification(uid, { title, body, type, important, meta });
    res.status(201).json({ id, message: 'Bildirim gönderildi' });
  } catch (error) {
    console.error('POST /api/notifications/:uid', error);
    res.status(500).json({ error: 'Bildirim gönderilemedi' });
  }
});

module.exports = router;
