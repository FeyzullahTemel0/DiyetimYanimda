// Diyetisyen, çalışmayı bırakma isteğini onaylar
const express = require('express');
const router = express.Router();
const { admin, firestore } = require('../services/firebaseAdmin');
const verifyToken = require('../middleware/verifyToken');

const db = firestore;

// Diyetisyen leaveRequest'i onaylar
router.post('/', verifyToken, async (req, res) => {
  try {
    const dietitianId = req.user.uid;
    const { leaveRequestId } = req.body;
    if (!leaveRequestId) {
      return res.status(400).json({ error: 'leaveRequestId zorunlu.' });
    }
    // Leave request'i bul
    const leaveReqDoc = await db.collection('leaveRequests').doc(leaveRequestId).get();
    if (!leaveReqDoc.exists) {
      return res.status(404).json({ error: 'Leave request bulunamadı.' });
    }
    const leaveReq = leaveReqDoc.data();
    if (leaveReq.dietitianId !== dietitianId) {
      return res.status(403).json({ error: 'Bu isteği onaylama yetkiniz yok.' });
    }
    if (leaveReq.status !== 'pending') {
      return res.status(400).json({ error: 'Bu istek zaten işlem gördü.' });
    }
    // Aktif ilişkiyi bul
    const relationSnap = await db.collection('dietitian_clients')
      .where('userId', '==', leaveReq.userId)
      .where('dietitianId', '==', dietitianId)
      .where('isActive', '==', true)
      .get();
    if (relationSnap.empty) {
      return res.status(404).json({ error: 'Aktif ilişki bulunamadı.' });
    }
    const relationDoc = relationSnap.docs[0];
    // İlişkiyi pasif yap
    await relationDoc.ref.update({ isActive: false, endedAt: admin.firestore.FieldValue.serverTimestamp() });
    // Leave request'i onayla
    await leaveReqDoc.ref.update({ status: 'approved', respondedAt: admin.firestore.FieldValue.serverTimestamp() });
    // Bildirim gönder (kullanıcıya)
    try {
      const { addNotification } = require('../services/notificationService');
      await addNotification(leaveReq.userId, {
        title: 'Çalışma İlişkiniz Sonlandırıldı',
        body: 'Diyetisyeniniz çalışmayı bırakma isteğinizi onayladı ve ilişki sonlandırıldı.',
        type: 'leave-request-approved',
        important: true
      });
    } catch (e) { console.error('Bildirim gönderilemedi:', e); }
    res.json({ success: true, message: 'Çalışmayı bırakma isteği onaylandı.' });
  } catch (error) {
    console.error('Çalışmayı bırakma onay hatası:', error);
    res.status(500).json({ error: 'Onay sırasında hata oluştu.' });
  }
});

module.exports = router;
