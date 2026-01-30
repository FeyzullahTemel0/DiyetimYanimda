import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function fetchNotifications(uid, max = 20) {
  try {
    console.log('Bildirimler çekiliyor, uid:', uid);
    const notifCol = collection(db, 'users', uid, 'notifications');
    const q = query(
      notifCol,
      orderBy('createdAt', 'desc'),
      limit(max)
    );
    const snap = await getDocs(q);
    const notifications = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }));
    console.log('Çekilen bildirim sayısı:', notifications.length, 'Bildirimler:', notifications);
    return notifications;
  } catch (error) {
    console.error('fetchNotifications hatası:', error.code, error.message);
    throw error;
  }
}


// Needs uid to update correct subcollection
export async function markRead(uid, id, read = true) {
  return updateDoc(doc(db, 'users', uid, 'notifications', id), { read });
}

export async function markAllRead(uid) {
  const items = await fetchNotifications(uid, 50);
  const ops = items.map((n) => markRead(uid, n.id, true));
  return Promise.all(ops);
}

// Needs uid to delete from correct subcollection
export async function deleteNotification(uid, id) {
  return deleteDoc(doc(db, 'users', uid, 'notifications', id));
}

