// Test bildirimi gönderme scripti
const admin = require('../src/services/firebaseAdmin');
const { addNotification } = require('../src/services/notificationService');

async function sendTestNotification() {
  try {
    // Tüm kullanıcıları al
    const usersSnapshot = await admin.firestore.collection('users').limit(5).get();
    
    if (usersSnapshot.empty) {
      console.log('Hiç kullanıcı bulunamadı!');
      return;
    }

    console.log(`${usersSnapshot.size} kullanıcıya test bildirimi gönderiliyor...`);

    // Her kullanıcıya test bildirimi gönder
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      console.log(`Bildirim gönderiliyor: ${userData.email || userId}`);
      
      await addNotification(userId, {
        title: '🎉 Hoş Geldiniz!',
        body: 'Bildirim sistemi başarıyla çalışıyor. DiyetimYanımda\'ya hoş geldiniz!',
        type: 'welcome',
        important: true,
      });

      await addNotification(userId, {
        title: '📊 Günlük İpucu',
        body: 'Sağlıklı yaşamın sırrı düzenli beslenme ve egzersizdir. Bugünkü hedefinizi belirlediniz mi?',
        type: 'tip',
        important: false,
      });
      
      console.log(`✓ ${userData.email || userId} - Bildirimler gönderildi`);
    }

    console.log('\n✅ Test bildirimleri başarıyla gönderildi!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

sendTestNotification();
