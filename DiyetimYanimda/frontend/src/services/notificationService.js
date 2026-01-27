import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function fetchNotifications(uid, max = 20) {
  try {
    console.log('Bildirimler çekiliyor, uid:', uid);
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', uid),
      limit(max)
    );
    const snap = await getDocs(q);
    const notifications = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return timeB - timeA; // En yeni önce
      });
    console.log('Çekilen bildirim sayısı:', notifications.length, 'Bildirimler:', notifications);
    return notifications;
  } catch (error) {
    console.error('fetchNotifications hatası:', error.code, error.message);
    throw error;
  }
}

export async function markRead(id, read = true) {
  return updateDoc(doc(db, 'notifications', id), { read });
}

export async function markAllRead(uid) {
  const items = await fetchNotifications(uid, 50);
  const ops = items.map((n) => markRead(n.id, true));
  return Promise.all(ops);
}

export async function deleteNotification(id) {
  return deleteDoc(doc(db, 'notifications', id));
}

