import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../services/firebase";
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./NotificationPanel.css";

export default function NotificationPanel({ isOpen, onClose }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !isOpen) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notifs);
      const unread = notifs.filter((n) => !n.read).length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.read) {
        await updateDoc(doc(db, "notifications", notification.id), {
          read: true,
        });
      }

      // Navigate to post
      if (notification.postId) {
        onClose();
        navigate(`/community`);
        // Scroll to post (optional - would need implementation)
      }
    } catch (err) {
      console.error("Bildirim güncelleme hatası:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter((n) => !n.read);
      for (const notif of unreadNotifs) {
        await updateDoc(doc(db, "notifications", notif.id), {
          read: true,
        });
      }
    } catch (err) {
      console.error("Tüm bildirimler işaretleme hatası:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <h3>Bildirimler ({notifications.length})</h3>
          {unreadCount > 0 && (
            <button className="btn-mark-read" onClick={handleMarkAllAsRead}>
              Tümünü oku
            </button>
          )}
        </div>

        <div className="notification-list">
          {notifications.length === 0 ? (
            <p className="no-notifications">Bildirim yok</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notification-item ${!notif.read ? "unread" : ""}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="notification-content">
                  <p className="notification-message">{notif.message}</p>
                  <span className="notification-time">
                    {notif.createdAt
                      ? new Date(notif.createdAt.toDate?.() || notif.createdAt).toLocaleDateString(
                          "tr-TR"
                        )
                      : ""}
                  </span>
                </div>
                {!notif.read && <span className="notification-dot"></span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
