const admin = require("firebase-admin");
const serviceAccount = require("../src/services/firebaseAdminKey.json");

// Initialize
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function fixTagReferences() {
  try {
    console.log("\n🔧 Tag referansları düzeltiliyor...\n");

    // Tüm etiketleri al ve name->id map oluştur
    const tagsSnapshot = await db.collection("nutrition_tags").get();
    const tagNameToId = {};
    tagsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      tagNameToId[data.name] = doc.id;
      console.log(`Tag bulundu: ${data.name} -> ${doc.id}`);
    });

    // Tüm ipuçlarını al
    const tipsSnapshot = await db.collection("nutrition_tips").get();
    console.log(`\n${tipsSnapshot.docs.length} ipucu bulundu.\n`);

    let fixed = 0;
    for (const tipDoc of tipsSnapshot.docs) {
      const tip = tipDoc.data();
      const oldTags = tip.tags || [];
      
      // Eğer tags array'i string isimler içeriyorsa ID'ye çevir
      const needsFix = oldTags.some(tag => typeof tag === 'string' && tagNameToId[tag]);
      
      if (needsFix) {
        const newTags = oldTags.map(tag => {
          // Eğer tag bir ID ise (collection'da var mı kontrol et)
          if (typeof tag === 'string' && tagNameToId[tag]) {
            return tagNameToId[tag];
          }
          return tag; // Zaten ID ise değiştirme
        });

        await db.collection("nutrition_tips").doc(tipDoc.id).update({
          tags: newTags,
          updated_at: new Date()
        });

        console.log(`✅ Düzeltildi: "${tip.title}"`);
        console.log(`   Eski: [${oldTags.join(', ')}]`);
        console.log(`   Yeni: [${newTags.join(', ')}]`);
        fixed++;
      }
    }

    console.log(`\n✨ İşlem tamamlandı. Düzeltilen ipucu sayısı: ${fixed}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

fixTagReferences();
