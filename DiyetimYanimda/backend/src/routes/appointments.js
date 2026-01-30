const express = require('express');
const router = express.Router();
const { admin, firestore } = require('../services/firebaseAdmin');
const verifyToken = require('../middleware/verifyToken');

const db = firestore;

// ============================================
// KULLANICI: Randevu Talebi Oluştur
// ============================================
router.post('/create', verifyToken, async (req, res) => {
  try {
    const {
      dietitianId,
      type, // 'video', 'phone', 'whatsapp'
      preferredDate,
      preferredTime,
      notes
    } = req.body;

    const userId = req.user.uid;

    // Kullanıcı-diyetisyen ilişkisi kontrolü
    const relationSnapshot = await db.collection('dietitian_clients')
      .where('userId', '==', userId)
      .where('dietitianId', '==', dietitianId)
      .where('isActive', '==', true)
      .get();

    if (relationSnapshot.empty) {
      return res.status(403).json({ error: 'Bu diyetisyenle çalışmıyorsunuz' });
    }

    // Randevu oluştur
    const appointmentRef = await db.collection('appointments').add({
      userId,
      dietitianId,
      type,
      preferredDate,
      preferredTime,
      notes: notes || '',
      status: 'pending', // pending, confirmed, cancelled, completed
      confirmedDate: null,
      confirmedTime: null,
      meetingLink: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      appointmentId: appointmentRef.id,
      message: 'Randevu talebi oluşturuldu'
    });
  } catch (error) {
    console.error('Randevu oluşturma hatası:', error);
    res.status(500).json({ error: 'Randevu oluşturulamadı' });
  }
});

// ============================================
// DİYETİSYEN: Randevu Onaylama
// ============================================
router.patch('/:appointmentId/confirm', verifyToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { confirmedDate, confirmedTime, meetingLink } = req.body;
    const dietitianId = req.user.uid;

    // Randevu kontrolü
    const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
    
    if (!appointmentDoc.exists) {
      return res.status(404).json({ error: 'Randevu bulunamadı' });
    }

    const appointment = appointmentDoc.data();

    if (appointment.dietitianId !== dietitianId) {
      return res.status(403).json({ error: 'Bu randevuyu onaylama yetkiniz yok' });
    }

    // Randevu onaylama
    await db.collection('appointments').doc(appointmentId).update({
      status: 'confirmed',
      confirmedDate,
      confirmedTime,
      meetingLink: meetingLink || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'Randevu onaylandı' });
  } catch (error) {
    console.error('Randevu onaylama hatası:', error);
    res.status(500).json({ error: 'Randevu onaylanamadı' });
  }
});

// ============================================
// KULLANICI: Randevuları Listele
// ============================================
router.get('/my-appointments', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db.collection('appointments')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const appointments = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Diyetisyen bilgilerini ekle
      const dietitianDoc = await db.collection('dietitians').doc(data.dietitianId).get();
      const dietitianData = dietitianDoc.data();

      appointments.push({
        id: doc.id,
        ...data,
        dietitian: {
          fullName: dietitianData.fullName,
          specialization: dietitianData.specialization,
          profilePhoto: dietitianData.profilePhoto
        }
      });
    }

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Randevuları listeleme hatası:', error);
    res.status(500).json({ error: 'Randevular listelenemedi' });
  }
});

// ============================================
// DİYETİSYEN: Randevuları Listele
// ============================================
router.get('/dietitian-appointments', verifyToken, async (req, res) => {
  try {
    const dietitianId = req.user.uid;

    const snapshot = await db.collection('appointments')
      .where('dietitianId', '==', dietitianId)
      .orderBy('createdAt', 'desc')
      .get();

    const appointments = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Kullanıcı bilgilerini ekle
      const userDoc = await db.collection('users').doc(data.userId).get();
      const userData = userDoc.data();

      appointments.push({
        id: doc.id,
        ...data,
        user: {
          name: userData.name,
          profilePicture: userData.profilePicture
        }
      });
    }

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Randevuları listeleme hatası:', error);
    res.status(500).json({ error: 'Randevular listelenemedi' });
  }
});

// ============================================
// Randevu İptal Etme
// ============================================
router.patch('/:appointmentId/cancel', verifyToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.uid;

    const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
    
    if (!appointmentDoc.exists) {
      return res.status(404).json({ error: 'Randevu bulunamadı' });
    }

    const appointment = appointmentDoc.data();

    // Kullanıcı veya diyetisyen iptal edebilir
    if (appointment.userId !== userId && appointment.dietitianId !== userId) {
      return res.status(403).json({ error: 'Bu randevuyu iptal etme yetkiniz yok' });
    }

    await db.collection('appointments').doc(appointmentId).update({
      status: 'cancelled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'Randevu iptal edildi' });
  } catch (error) {
    console.error('Randevu iptal hatası:', error);
    res.status(500).json({ error: 'Randevu iptal edilemedi' });
  }
});

module.exports = router;
