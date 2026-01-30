const express = require('express');
const router = express.Router();
const { admin, firestore } = require('../services/firebaseAdmin');
const verifyToken = require('../middleware/verifyToken');
const checkAdmin = require('../middleware/checkAdmin');

const db = firestore;

// ============================================
// ADMIN: Diyetisyen Davet Token Oluşturma
// ============================================
router.post('/create-invite-token', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { expiresIn = 7 } = req.body; // 7 gün default
    
    // Unique token oluştur
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiresIn);

    // Token'ı Firestore'a kaydet
    await db.collection('dietitianInvites').doc(token).set({
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: expiryDate,
      used: false,
      usedBy: null,
      usedAt: null
    });

    res.json({
      success: true,
      token,
      inviteUrl: `${process.env.FRONTEND_URL}/dietitian/register?token=${token}`,
      expiresAt: expiryDate
    });
  } catch (error) {
    console.error('Davet token oluşturma hatası:', error);
    res.status(500).json({ error: 'Token oluşturulamadı' });
  }
});

// ============================================
// Token Doğrulama (Kayıt öncesi)
// ============================================
router.get('/verify-invite/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const inviteDoc = await db.collection('dietitianInvites').doc(token).get();
    
    if (!inviteDoc.exists) {
      return res.status(404).json({ error: 'Geçersiz davet linki' });
    }

    const invite = inviteDoc.data();
    
    if (invite.used) {
      return res.status(400).json({ error: 'Bu davet linki kullanılmış' });
    }

    if (new Date() > invite.expiresAt.toDate()) {
      return res.status(400).json({ error: 'Davet linki süresi dolmuş' });
    }

    res.json({ success: true, valid: true });
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    res.status(500).json({ error: 'Doğrulama başarısız' });
  }
});

// ============================================
// Diyetisyen Kayıt (Firebase Auth + Firestore)
// ============================================
router.post('/register', async (req, res) => {
  try {
    const {
      token,
      email,
      password,
      fullName,
      phone,
      location,
      specialization,
      experienceYears,
      certificates,
      profilePhoto
    } = req.body;

    // Token kontrolü
    const inviteDoc = await db.collection('dietitianInvites').doc(token).get();
    
    if (!inviteDoc.exists || inviteDoc.data().used) {
      return res.status(400).json({ error: 'Geçersiz veya kullanılmış token' });
    }

    if (new Date() > inviteDoc.data().expiresAt.toDate()) {
      return res.status(400).json({ error: 'Token süresi dolmuş' });
    }

    // Önce e-posta Auth'ta var mı kontrol et
    let existingUser = null;
    try {
      existingUser = await admin.auth().getUserByEmail(email);
    } catch (err) {
      // Kullanıcı yoksa hata fırlatır, bu normal
      if (err.code !== 'auth/user-not-found') {
        console.error('Firebase Auth kontrol hatası:', err);
        return res.status(500).json({ error: 'Kullanıcı kontrolü sırasında hata oluştu' });
      }
    }

    if (existingUser) {
      // Kullanıcı varsa önce sil
      try {
        await admin.auth().deleteUser(existingUser.uid);
      } catch (delErr) {
        console.error('Mevcut kullanıcı silinemedi:', delErr);
        return res.status(500).json({ error: 'Mevcut kullanıcı silinemedi, kayıt yapılamadı.' });
      }
    }

    // Şimdi yeni kullanıcı oluştur
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName
    });

    // Custom claims ekle (role: dietitian)
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'dietitian'
    });

    // Firestore'a diyetisyen bilgileri kaydet
    await db.collection('dietitians').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      fullName,
      phone,
      location,
      specialization,
      experienceYears: parseInt(experienceYears),
      certificates: certificates || [],
      profilePhoto: profilePhoto || '',
      maxClients: 10,
      currentClients: 0,
      role: 'dietitian',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    });

    // Token'ı kullanılmış olarak işaretle
    await db.collection('dietitianInvites').doc(token).update({
      used: true,
      usedBy: userRecord.uid,
      usedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      uid: userRecord.uid,
      message: 'Diyetisyen kaydı başarılı'
    });
  } catch (error) {
    console.error('Diyetisyen kayıt hatası:', error);
    res.status(500).json({ error: error.message || 'Kayıt başarısız' });
  }
});

// ============================================
// Tüm Diyetisyenleri Listele (Premium+ kullanıcılar için)
// ============================================
router.get('/list', verifyToken, async (req, res) => {
  try {
    // Kullanıcının planını kontrol et
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userPlan = userDoc.data()?.subscription?.plan || 'free';

    if (!['premium', 'plus'].includes(userPlan)) {
      return res.status(403).json({ error: 'Bu özelliğe erişim için Premium veya Profesyonel Plus+ plan gerekli' });
    }

    const snapshot = await db.collection('dietitians')
      .where('isActive', '==', true)
      .get();

    const dietitians = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Hassas bilgileri çıkar
      delete data.email;
      delete data.phone; // İlk listede gösterme
      dietitians.push({ id: doc.id, ...data });
    });

    res.json({ success: true, dietitians });
  } catch (error) {
    console.error('Diyetisyen listeleme hatası:', error);
    res.status(500).json({ error: 'Listeleme başarısız' });
  }
});

// ============================================
// Diyetisyen Seçme İsteği Gönder
// ============================================
router.post('/request', verifyToken, async (req, res) => {
  try {
    const { dietitianId } = req.body;
    const userId = req.user.uid;

    // Kullanıcının planını kontrol et
    const userDoc = await db.collection('users').doc(userId).get();
    const userPlan = userDoc.data()?.subscription?.plan || 'free';

    if (!['premium', 'plus'].includes(userPlan)) {
      return res.status(403).json({ error: 'Bu özellik Premium veya Profesyonel Plus+ plan gerektirir' });
    }


    // Kullanıcının zaten bir diyetisyeni var mı kontrol et
    const existingRelation = await db.collection('dietitian_clients')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    if (!existingRelation.empty) {
      // Diyetisyen kaydı gerçekten var mı kontrol et
      const relationDoc = existingRelation.docs[0];
      const relationData = relationDoc.data();
      const dietitianDoc = await db.collection('dietitians').doc(relationData.dietitianId).get();
      if (!dietitianDoc.exists) {
        // Diyetisyen silinmişse ilişkiyi pasif yap
        await relationDoc.ref.update({ isActive: false, endedAt: new Date() });
        // Devam et, yeni istek oluşturulabilir
      } else {
        // Diyetisyen hala varsa, yeni istek gönderilemez
        return res.status(400).json({ error: 'Zaten bir diyetisyenle çalışıyorsunuz' });
      }
    }

    // Bekleyen istek var mı kontrol et
    const pendingRequest = await db.collection('clientRequests')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .get();

    if (!pendingRequest.empty) {
      return res.status(400).json({ error: 'Zaten bekleyen bir isteğiniz var' });
    }

    // Diyetisyen doluluk kontrolü
    const dietitianDoc = await db.collection('dietitians').doc(dietitianId).get();
    if (!dietitianDoc.exists) {
      return res.status(404).json({ error: 'Diyetisyen bulunamadı' });
    }

    const dietitianData = dietitianDoc.data();
    if (dietitianData.currentClients >= dietitianData.maxClients) {
      return res.status(400).json({ error: 'Diyetisyen kontenjanı dolu' });
    }

    // İstek oluştur
    await db.collection('clientRequests').add({
      userId,
      dietitianId,
      status: 'pending',
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      respondedAt: null
    });

    // Bildirim gönder (kullanıcıya)
    try {
      const { addNotification } = require('../services/notificationService');
      await addNotification(userId, {
        title: 'Diyetisyen İsteği Gönderildi',
        body: 'Diyetisyen isteğiniz başarıyla gönderildi. Onaylandığında bilgilendirileceksiniz.',
        type: 'dietitian-request',
        important: true
      });
    } catch (e) { console.error('Bildirim gönderilemedi:', e); }

    res.json({ success: true, message: 'İstek gönderildi' });
  } catch (error) {
    console.error('İstek gönderme hatası:', error);
    res.status(500).json({ error: 'İstek gönderilemedi' });
  }
});

// ============================================
// Danışan İsteğini Onayla (Diyetisyen)
// ============================================
router.post('/approve-request', verifyToken, async (req, res) => {
  try {
    const { requestId, userId } = req.body;
    const dietitianId = req.user.uid;

    // Validasyon
    if (!requestId || !userId) {
      return res.status(400).json({ error: 'Request ID ve User ID gereklidir' });
    }

    // İstek bulunup bulunmadığını kontrol et
    const requestDoc = await db.collection('clientRequests').doc(requestId).get();
    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'İstek bulunamadı' });
    }

    const requestData = requestDoc.data();
    if (requestData.status !== 'pending') {
      return res.status(400).json({ error: 'Bu istek zaten işlem gördü' });
    }

    if (requestData.dietitianId !== dietitianId) {
      return res.status(403).json({ error: 'Bu işlemi yapma yetkiniz yok' });
    }

    // Diyetisyen kontenjan kontrolü
    const dietitianDoc = await db.collection('dietitians').doc(dietitianId).get();
    if (!dietitianDoc.exists) {
      return res.status(404).json({ error: 'Diyetisyen bulunamadı' });
    }

    const dietitianData = dietitianDoc.data();
    if (dietitianData.currentClients >= dietitianData.maxClients) {
      return res.status(400).json({ error: 'Kontenjanınız dolu' });
    }

    // İsteği onayla
    await db.collection('clientRequests').doc(requestId).update({
      status: 'approved',
      respondedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Danışan-Diyetisyen ilişkisini oluştur
    await db.collection('dietitian_clients').add({
      dietitianId: dietitianId,
      userId: userId,
      isActive: true,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      endedAt: null
    });

    // Diyetisyen currentClients sayısını artır
    await db.collection('dietitians').doc(dietitianId).update({
      currentClients: dietitianData.currentClients + 1
    });

    // Bildirim gönder (kullanıcıya)
    try {
      const { addNotification } = require('../services/notificationService');
      await addNotification(userId, {
        title: 'Diyetisyen İsteğiniz Onaylandı',
        body: 'Diyetisyen isteğiniz onaylandı ve ilişki başlatıldı.',
        type: 'dietitian-request-approved',
        important: true
      });
    } catch (e) { console.error('Bildirim gönderilemedi:', e); }

    console.log(`✅ İstek onaylandı - Kullanıcı: ${userId}, Diyetisyen: ${dietitianId}`);

    res.json({ 
      success: true, 
      message: 'İstek başarıyla onaylandı',
      relationCreated: true
    });
  } catch (error) {
    console.error('İstek onaylama hatası:', error);
    res.status(500).json({ error: `İstek onaylanamadı: ${error.message}` });
  }
});

// ============================================
// Danışan İsteğini Reddet (Diyetisyen)
// ============================================
router.post('/reject-request', verifyToken, async (req, res) => {
  try {
    const { requestId } = req.body;
    const dietitianId = req.user.uid;

    // Validasyon
    if (!requestId) {
      return res.status(400).json({ error: 'Request ID gereklidir' });
    }

    // İstek bulunup bulunmadığını kontrol et
    const requestDoc = await db.collection('clientRequests').doc(requestId).get();
    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'İstek bulunamadı' });
    }

    const requestData = requestDoc.data();
    if (requestData.status !== 'pending') {
      return res.status(400).json({ error: 'Bu istek zaten işlem gördü' });
    }

    if (requestData.dietitianId !== dietitianId) {
      return res.status(403).json({ error: 'Bu işlemi yapma yetkiniz yok' });
    }

    // İsteği reddet
    await db.collection('clientRequests').doc(requestId).update({
      status: 'rejected',
      respondedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`⊘ İstek reddedildi - Request: ${requestId}`);

    res.json({ 
      success: true, 
      message: 'İstek başarıyla reddedildi'
    });
  } catch (error) {
    console.error('İstek reddetme hatası:', error);
    res.status(500).json({ error: `İstek reddedilemedi: ${error.message}` });
  }
});

module.exports = router;
