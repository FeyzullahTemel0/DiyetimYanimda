// backend/src/middleware/dietitianAuth.js


const { admin, firestore } = require('../services/firebaseAdmin');
const db = firestore;

const dietitianAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Yetkilendirme token\'ı bulunamadı' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Token doğrulama
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Kullanıcının diyetisyen olduğunu kontrol et
    const dietitianDoc = await db.collection('dietitians').doc(uid).get();

    if (!dietitianDoc.exists) {
      return res.status(403).json({ error: 'Bu işlem için diyetisyen yetkisi gerekli' });
    }

    const dietitianData = dietitianDoc.data();

    if (!dietitianData.isActive) {
      return res.status(403).json({ error: 'Hesabınız aktif değil' });
    }

    // Request objesine diyetisyen bilgilerini ekle
    req.dietitian = {
      uid,
      ...dietitianData
    };

    next();
  } catch (error) {
    console.error('Diyetisyen auth hatası:', error);
    return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
};

module.exports = dietitianAuth;
