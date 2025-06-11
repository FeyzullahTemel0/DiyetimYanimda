const express = require("express");
const router = express.Router();
const { firestore } = require("../services/firebaseAdmin");
const verifyToken = require("../middleware/verifyToken");

// Bu rotaya gelen tüm istekler ÖNCE token kontrolünden geçer.
router.use(verifyToken);

// GET /api/diet-programs
router.get("/", async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const userDocRef = firestore.collection("users").doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Kullanıcı profili bulunamadı." });
    }

    const userProfile = userDoc.data();
    const userPlan = userProfile.subscription?.plan || 'free';
    const userGender = userProfile.gender;

    if (!userGender || userGender === 'not_specified') {
      return res.status(400).json({ error: "Size uygun programları listelemek için lütfen profilinizden cinsiyetinizi seçin." });
    }

    let accessiblePlans = ['free'];
    if (userPlan === 'basic') accessiblePlans.push('basic');
    else if (userPlan === 'premium') accessiblePlans.push('basic', 'premium');
    else if (userPlan === 'plus') accessiblePlans.push('basic', 'premium', 'plus');

    // DİKKAT: EN DOĞRU VE GÜVENLİ YÖNTEM
    // Önce SADECE cinsiyete göre tüm programları çekiyoruz. Bu, Firestore'da her zaman çalışır.
    const programsRef = firestore.collection("dietPrograms");
    const snapshot = await programsRef.where('gender', '==', userGender).get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const allProgramsForGender = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Şimdi, çektiğimiz bu veriyi sunucu tarafında (backend'de) filtreliyoruz.
    const filteredPrograms = allProgramsForGender.filter(program => {
      // Bir programın 'accessLevel' alanı hiç tanımlanmamışsa, onu 'free' olarak kabul ediyoruz.
      const programLevel = program.accessLevel || 'free';
      // Kullanıcının erişebileceği planlar dizisi, bu programın seviyesini içeriyor mu?
      return accessiblePlans.includes(programLevel);
    });
    
    return res.json(filteredPrograms);

  } catch (err) {
    console.error("!!! Kullanıcı için programları çekerken hata oluştu:", err);
    next(err);
  }
});

// GET /api/diet-programs/:id -> Bu rotada değişiklik yok
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const docRef = firestore.collection("dietPrograms").doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Program bulunamadı." });
        }
        return res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
        next(err);
    }
});
// POST /by-ids - ID listesine göre birden çok programı getir
router.post("/by-ids", verifyToken, async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Program ID listesi gereklidir." });
    }
    try {
        const programsRef = firestore.collection("dietPrograms");
        const snapshot = await programsRef.where(firestore.FieldPath.documentId(), 'in', ids).get();
        if (snapshot.empty) {
            return res.status(200).json([]);
        }
        const programs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(programs);
    } catch (error) {
        res.status(500).json({ error: "Programlar alınırken hata oluştu." });
    }
});


module.exports = router;