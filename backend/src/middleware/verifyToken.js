// backend/src/middleware/verifyToken.js

const { auth } = require('../services/firebaseAdmin');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).send({ message: 'Yetkilendirme başarısız. Token bulunamadı.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return res.status(403).send({ message: 'Geçersiz veya süresi dolmuş token.' });
  }
};

module.exports = verifyToken;