import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  fetchNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} from '../services/notificationService';
import './NotificationBell.css';

const BellIcon = ({ hasUnread }) => (
  <span className="bell-icon">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3a6 6 0 0 0-6 6v2.8c0 .5-.2 1-.6 1.3L4 14.5c-.9.7-.4 2.1.7 2.1h14.6c1.1 0 1.6-1.4.7-2.1l-1.4-1.1c-.4-.3-.6-.8-.6-1.3V9a6 6 0 0 0-6-6Z"/>
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
    </svg>
    {hasUnread ? <span className="bell-dot" /> : null}
  </span>
);

export default function NotificationBell() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const hasUnread = useMemo(() => items.some((n) => !n.read), [items]);

  const load = async () => {
    if (!user) return;
    setBusy(true);
    setError('');
    try {
      const data = await fetchNotifications(user.uid, 20);
      console.log('Bildirimler yüklendi:', data);
      setItems(data);
    } catch (e) {
      console.error('Bildirim yükleme hatası:', e);
      setError('Bildirimler alınamadı');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleToggle = () => {
    if (!open && user) load();
    setOpen(!open);
  };

  const onMarkRead = async (id, read = true) => {
    if (!user) return;
    await markRead(id, read);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read } : n)));
  };

  const onDelete = async (id) => {
    await deleteNotification(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  const onOpenNotification = async (notif) => {
    try {
      if (!notif.read) {
        await onMarkRead(notif.id, true);
      }
      if (notif.postId) {
        navigate(`/community?postId=${notif.postId}`);
        setOpen(false);
      }
    } catch (e) {
      console.error('Bildirim açma hatası:', e);
    }
  };

  const onMarkAll = async () => {
    if (!user) return;
    await markAllRead(user.uid);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="notif-bell-wrapper">
      <button type="button" className="notif-bell-btn" onClick={handleToggle} aria-label="Bildirimler">
        <BellIcon hasUnread={hasUnread} />
      </button>
      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <div>
              <strong>Bildirimler</strong>
              {busy && <span className="notif-status">Yükleniyor...</span>}
              {error && <span className="notif-error">{error}</span>}
            </div>
            <div className="notif-actions">
              <button onClick={onMarkAll} disabled={busy || items.length === 0}>Hepsini okundu işaretle</button>
              <Link to="/notifications" onClick={() => setOpen(false)}>Tümü</Link>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="notif-empty">Bildirim yok</div>
          ) : (
            <ul className="notif-list">
              {items.map((n) => {
                const createdTime = n.createdAt
                  ? new Date(n.createdAt.toDate?.() || n.createdAt).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })
                  : '';
                
                return (
                  <li
                    key={n.id}
                    className={`notif-item ${n.read ? '' : 'unread'}`}
                    onClick={() => onOpenNotification(n)}
                  >
                    <div className="notif-text">
                      <div className="notif-title">{n.message || 'Bildirim'}</div>
                      <div className="notif-body">{createdTime}</div>
                    </div>
                    <div className="notif-item-actions">
                      <button onClick={() => onMarkRead(n.id, !n.read)}>{n.read ? 'Yeniden işaretle' : 'Okundu'}</button>
                      <button className="danger" onClick={() => onDelete(n.id)}>Sil</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
