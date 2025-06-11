// backend/scripts/promoteAdmin.js
const path = require("path");
const admin = require(path.resolve(__dirname, "../src/services/firebaseAdmin"));

async function promote(uid) {
  const db = admin.firestore();
  await db.collection("users").doc(uid).update({ role: "admin" });
  console.log(`✅ Kullanıcı ${uid} başarıyla admin yapıldı.`);
}

const uid = process.argv[2];
if (!uid) {
  console.error("❌ Kullanım: node promoteAdmin.js <UID>");
  process.exit(1);
}

promote(uid)
  .catch(err => {
    console.error("Hata:", err);
    process.exit(1);
  })
  .finally(() => process.exit());
