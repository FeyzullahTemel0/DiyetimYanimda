const admin = require("firebase-admin");
const serviceAccount = require("../src/services/firebaseAdminKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function removeInvalidTag() {
  try {
    console.log("\n🧹 Geçersiz '#metabolism' tag'i temizleniyor...\n");

    // #metabolism tag'ini bul ve sil
    const tagsSnapshot = await db.collection("nutrition_tags")
      .where("name", "==", "#metabolism")
      .get();

    if (!tagsSnapshot.empty) {
      const invalidTagId = tagsSnapshot.docs[0].id;
      console.log(`🔍 Bulundu: #metabolism (ID: ${invalidTagId})`);
      
      // Bu tag'i kullanan ipuçlarını bul
      const tipsSnapshot = await db.collection("nutrition_tips").get();
      let fixedTips = 0;

      for (const tipDoc of tipsSnapshot.docs) {
        const tip = tipDoc.data();
        const oldTags = tip.tags || [];
        
        if (oldTags.includes(invalidTagId)) {
          const newTags = oldTags.filter(t => t !== invalidTagId);
          await db.collection("nutrition_tips").doc(tipDoc.id).update({
            tags: newTags,
            updated_at: new Date()
          });
          console.log(`✅ İpucu düzeltildi: "${tip.title}"`);
          fixedTips++;
        }
      }

      // Tag'i sil
      await db.collection("nutrition_tags").doc(invalidTagId).delete();
      console.log(`\n✅ '#metabolism' tag'i silindi`);
      console.log(`🔧 Düzeltilen ipucu sayısı: ${fixedTips}`);
    } else {
      console.log("✓ '#metabolism' tag'i bulunamadı (zaten temiz)");
    }

    console.log("\n✨ Temizlik tamamlandı!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

removeInvalidTag();
