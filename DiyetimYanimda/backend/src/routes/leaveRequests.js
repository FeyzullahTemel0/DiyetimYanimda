// Diyetisyenin kendi leaveRequests isteklerini listelemesi için endpoint
const express = require('express');
const router = express.Router();
const { admin, firestore } = require('../services/firebaseAdmin');
const dietitianAuth = require('../middleware/dietitianAuth');

const db = firestore;

// GET /api/leave-requests (diyetisyen paneli için)
router.get('/', dietitianAuth, async (req, res) => {
  try {
    const dietitianId = req.dietitian.uid;
    console.log('leaveRequests sorgusu için dietitianId:', dietitianId);
    const snapshot = await db.collection('leaveRequests')
      .where('dietitianId', '==', dietitianId)
      .where('status', '==', 'pending')
      .orderBy('requestedAt', 'desc')
      .get();

    // Her leaveRequest için ilgili kullanıcıyı çek
    const requests = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      let user = null;
      try {
        const userDoc = await db.collection('users').doc(data.userId).get();
        if (userDoc.exists) {
          user = userDoc.data();
        }
      } catch (e) {}
      return { id: doc.id, ...data, user };
    }));
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Leave request listeleme hatası:', error);
    res.status(500).json({ error: 'İstekler listelenemedi' });
  }
});

module.exports = router;
