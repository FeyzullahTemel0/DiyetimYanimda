const admin = require("firebase-admin");
const serviceAccount = require("../src/services/firebaseAdminKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function cleanDuplicateTags() {
  try {
    console.log("\n🧹 Duplicate tag'ler temizleniyor...\n");

    // Tüm tag'leri al
    const tagsSnapshot = await db.collection("nutrition_tags").get();
    
    const tagsByName = {};
    tagsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const name = data.name;
      
      if (!tagsByName[name]) {
        tagsByName[name] = [];
      }
      tagsByName[name].push({ id: doc.id, ...data });
    });

    // Duplicate'leri bul ve temizle
    const tagNameToId = {}; // Tutulacak tag'lerin mapping'i
    
    for (const [name, tags] of Object.entries(tagsByName)) {
      if (tags.length > 1) {
        console.log(`⚠️  Duplicate bulundu: ${name} (${tags.length} adet)`);
        
        // İlkini tut, diğerlerini sil
        const keepTag = tags[0];
        tagNameToId[name] = keepTag.id;
        console.log(`   ✓ Tutulacak: ${keepTag.id}`);
        
        for (let i = 1; i < tags.length; i++) {
          await db.collection("nutrition_tags").doc(tags[i].id).delete();
          console.log(`   ✗ Silindi: ${tags[i].id}`);
        }
      } else {
        tagNameToId[name] = tags[0].id;
        console.log(`✓ OK: ${name} -> ${tags[0].id}`);
      }
    }

    console.log("\n🔧 İpuçlarındaki tag referansları düzeltiliyor...\n");

    // Tüm ipuçlarını al ve tag referanslarını düzelt
    const tipsSnapshot = await db.collection("nutrition_tips").get();
    let fixed = 0;

    for (const tipDoc of tipsSnapshot.docs) {
      const tip = tipDoc.data();
      const oldTags = tip.tags || [];
      
      if (oldTags.length === 0) continue;

      // Her tag'i kontrol et - geçersiz ID'leri temizle
      const newTags = oldTags.filter(tagId => {
        // Bu tag ID'si hala collection'da var mı?
        return Object.values(tagNameToId).includes(tagId);
      });

      if (newTags.length !== oldTags.length) {
        await db.collection("nutrition_tips").doc(tipDoc.id).update({
          tags: newTags,
          updated_at: new Date()
        });
        console.log(`✅ Düzeltildi: "${tip.title}" (${oldTags.length} -> ${newTags.length} tag)`);
        fixed++;
      }
    }

    console.log(`\n✨ Temizleme tamamlandı!`);
    console.log(`   📋 Unique tag sayısı: ${Object.keys(tagNameToId).length}`);
    console.log(`   🔧 Düzeltilen ipucu: ${fixed}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

cleanDuplicateTags();
