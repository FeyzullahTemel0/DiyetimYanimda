// backend/scripts/makeUserAdmin.js
// Kullanıcıyı admin yapma scripti
// Kullanım: node backend/scripts/makeUserAdmin.js <user_email>

const admin = require('firebase-admin');
const serviceAccount = require('../src/services/firebaseAdminKey.json');

// Firebase Admin SDK'yı başlat
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function makeUserAdmin(email) {
  try {
    // Email'e göre kullanıcıyı bul
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.error(`❌ ${email} email'ine sahip kullanıcı bulunamadı!`);
      console.log('\n💡 İpucu: Önce uygulamaya kayıt olduğunuzdan emin olun.');
      process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;

    // Kullanıcıyı admin yap
    await db.collection('users').doc(userId).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Başarılı! ${email} artık admin!`);
    console.log(`📋 Kullanıcı ID: ${userId}`);
    console.log(`\n🎉 Artık /admin sayfasına erişebilirsiniz!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata oluştu:', error);
    process.exit(1);
  }
}

// Komut satırı argümanlarını al
const email = process.argv[2];

if (!email) {
  console.error('❌ Kullanım: node backend/scripts/makeUserAdmin.js <email>');
  console.log('Örnek: node backend/scripts/makeUserAdmin.js user@example.com');
  process.exit(1);
}

makeUserAdmin(email);
