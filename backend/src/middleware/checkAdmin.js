// backend/src/middleware/checkAdmin.js

const { firestore } = require("../services/firebaseAdmin");

async function checkAdmin(req, res, next) {
  try {
    // Bu middleware'in verifyToken'dan sonra çalıştığını varsayıyoruz,
    // bu yüzden req.user.uid bilgisine erişebilmeliyiz.
    const uid = req.user.uid;
    const userDoc = await firestore.collection("users").doc(uid).get();

    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({ error: "Yetkisiz erişim. Sadece adminler bu işlemi yapabilir." });
    }
    // Her şey yolundaysa, bir sonraki işleme devam et.
    next();
  } catch (err) {
    console.error("Admin Middleware Hatası:", err);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
}

module.exports = checkAdmin;