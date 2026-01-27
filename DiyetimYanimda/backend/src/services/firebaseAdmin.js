// backend/src/services/firebaseAdmin.js

/**
 * @fileoverview Firebase Admin SDK'nın merkezi başlatılması ve dışa aktarımı.
 * Bu dosya, Firebase Admin SDK'nın tüm arka uç uygulamasında yalnızca bir kez
 * (singleton pattern) başlatılmasını sağlar. Hem yerel geliştirmeyi (bir servis
 * hesabı anahtar dosyası kullanarak) hem de production ortamlarını (Google Cloud
 * ortam değişkenlerini kullanarak) destekler.
 */

const admin = require('firebase-admin');
const path = require('path');

// --- Singleton Garantisi: Tekrar Başlatmayı Önleme ---
// Sunucusuz (serverless) ortamlarda veya sıcak yeniden yükleme (hot-reloading) sırasında,
// bu modül birden çok kez çalıştırılabilir. Bu kontrol, uygulamayı yalnızca ilk
// çalıştırmada başlatmamızı sağlayarak çökmeleri ve gereksiz kaynak kullanımını önler.
if (!admin.apps.length) {
  try {
    // --- Başlatma Mantığı ---
    // Production (Vercel, Google Cloud vb.) için GOOGLE_APPLICATION_CREDENTIALS ortam değişkeni kullanılır.
    // Yerel geliştirme için ise projenin içindeki bir anahtar dosyası kullanılır.
    const serviceAccountKeyPath = path.join(__dirname, 'firebaseAdminKey.json');
    
    // Önce yerel anahtar dosyasını yüklemeyi deneriz.
    const serviceAccount = require(serviceAccountKeyPath);

    console.log('✅ Firebase Admin SDK, yerel firebaseAdminKey.json dosyası kullanılarak başlatıldı.');
    const appConfig = {
      credential: admin.credential.cert(serviceAccount),
    };
    // storageBucket öncelik: env var > serviceAccount > project_id.appspot.com
    if (process.env.STORAGE_BUCKET) {
      appConfig.storageBucket = process.env.STORAGE_BUCKET;
    } else if (serviceAccount.storage_bucket) {
      appConfig.storageBucket = serviceAccount.storage_bucket;
    } else {
      appConfig.storageBucket = serviceAccount.project_id + '.appspot.com';
    }
    admin.initializeApp(appConfig);
    console.log('📦 Storage Bucket:', appConfig.storageBucket);

  } catch (error) {
    // Yerel anahtar dosyası bulunamazsa, bir production ortamında olduğumuzu varsayarız
    // ve Firebase'in otomatik olarak GOOGLE_APPLICATION_CREDENTIALS ortam değişkenini
    // kullanmasına izin veririz.
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('✅ Firebase Admin SDK, GOOGLE_APPLICATION_CREDENTIALS ortam değişkeni kullanılarak başlatıldı.');
      admin.initializeApp();
    } else {
      // Bu kritik bir hatadır. Uygulama Firebase'e bağlanamaz.
      console.error(
        '🚨 Firebase Admin SDK başlatılamadı. ' +
        'Ne firebaseAdminKey.json dosyası bulundu, ne de GOOGLE_APPLICATION_CREDENTIALS ortam değişkeni ayarlandı. ' +
        'Backend, Firebase servislerine bağlanamıyor.'
      );
      // Gerçek bir uygulamada, sunucunun yanlış şekilde başlamasını önlemek için
      // burada bir hata fırlatmak isteyebilirsiniz:
      // throw new Error('Firebase Admin başlatılamadı.');
    }
  }
}

// --- Firebase Servislerini Dışa Aktarma ---
// Başlatılmış servisleri, backend'in diğer bölümlerinde kullanmak üzere dışa aktarırız.
const auth = admin.auth();
const firestore = admin.firestore();
const FieldValue = admin.firestore.FieldValue; // Kullanışlı bir kısayol

module.exports = {
  admin,
  auth,
  firestore,
  FieldValue,
};