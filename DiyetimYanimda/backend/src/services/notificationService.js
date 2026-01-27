const { firestore, FieldValue } = require('./firebaseAdmin');

// Firestore yol yardımcıları
const collectionPath = (uid) => firestore.collection('users').doc(uid).collection('notifications');

async function addNotification(uid, payload = {}) {
  if (!uid) throw new Error('Kullanıcı kimliği gerekli');
  const docRef = await collectionPath(uid).add({
    title: payload.title || 'Bildirim',
    body: payload.body || '',
    type: payload.type || 'general',
    important: !!payload.important,
    read: false,
    meta: payload.meta || null,
    createdAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

module.exports = {
  addNotification,
};
