// Kullanıcı, diyetisyenle olan ilişkiyi iptal etmek istediğinde çağrılır
const express = require('express');
const router = express.Router();
const { admin, firestore } = require('../services/firebaseAdmin');
const verifyToken = require('../middleware/verifyToken');

const db = firestore;

// Diyetisyen ilişiğini iptal et
// Çalışmayı bırakma isteği oluştur (kullanıcıdan diyetisyene)
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    // Aktif ilişkiyi bul
    const relationSnap = await db.collection('dietitian_clients')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();
    if (relationSnap.empty) {
      return res.status(404).json({ error: 'Aktif diyetisyen bulunamadı.' });
    }
    const relationDoc = relationSnap.docs[0];
    const dietitianId = relationDoc.data().dietitianId;

    // Zaten bekleyen bir leaveRequest var mı kontrol et
    const leaveReqSnap = await db.collection('leaveRequests')
      .where('userId', '==', userId)
      .where('dietitianId', '==', dietitianId)
      .where('status', '==', 'pending')
      .get();
    if (!leaveReqSnap.empty) {
      return res.status(400).json({ error: 'Zaten bekleyen bir çalışmayı bırakma isteğiniz var.' });
    }

    // Leave request oluştur
    await db.collection('leaveRequests').add({
      userId,
      dietitianId,
      status: 'pending',
      requestedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    // Bildirim gönder (kullanıcıya)
    try {
      const { addNotification } = require('../services/notificationService');
      await addNotification(userId, {
        title: 'Çalışmayı Bırakma İsteği Gönderildi',
        body: 'Çalışmayı bırakma isteğiniz diyetisyene iletildi. Onaylandığında bilgilendirileceksiniz.',
        type: 'leave-request',
        important: true
      });
    } catch (e) { console.error('Bildirim gönderilemedi:', e); }
    res.json({ success: true, message: 'Çalışmayı bırakma isteğiniz diyetisyene iletildi.' });
  } catch (error) {
    console.error('Çalışmayı bırakma isteği hatası:', error);
    res.status(500).json({ error: 'İstek sırasında hata oluştu.' });
  }
});

module.exports = router;
