import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  fetchNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} from '../services/notificationService';
import './Notifications.css';

export default function Notifications() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const load = async () => {
    if (!user) return;
    setBusy(true);
    setError('');
    try {
      const data = await fetchNotifications(user.uid, 50);
      console.log('Notifications page - bildirimler yüklendi:', data);
      setItems(data);
    } catch (e) {
      console.error('Notifications page - hata:', e);
      setError('Bildirimler yüklenemedi');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    if (user) {
      load();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(items.map((n) => n.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const onMark = async (id, read = true) => {
    if (!user) return;
    await markRead(user.uid, id, read);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read } : n)));
  };

  const onMarkAll = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await markAllRead(user.uid);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      clearSelection();
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    if (!user) return;
    setBusy(true);
    try {
      await deleteNotification(user.uid, id);
      setItems((prev) => prev.filter((n) => n.id !== id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } finally {
      setBusy(false);
    }
  };

  const deleteSelected = async () => {
    if (!user || selected.size === 0) return;
    setBusy(true);
    try {
      await Promise.all(Array.from(selected).map((id) => deleteNotification(user.uid, id)));
      setItems((prev) => prev.filter((n) => !selected.has(n.id)));
      clearSelection();
    } finally {
      setBusy(false);
    }
  };

  const openNotification = async (notif) => {
    try {
      if (!notif.read) {
        await onMark(notif.id, true);
      }
      if (notif.postId) {
        navigate(`/community?postId=${notif.postId}`);
      }
    } catch (e) {
      console.error('Bildirim açma hatası:', e);
    }
  };

  return (
    <div className="notifications-page">
      <div className="notif-hero">
        <div>
          <h2>Bildirimler</h2>
          <p>Yeni gelişmeleri buradan takip edebilirsiniz.</p>
        </div>
        <div className="notif-hero-meta">
          <span className="pill">Toplam: {items.length}</span>
          <span className="pill attention">Okunmamış: {unreadCount}</span>
        </div>
      </div>

      <div className="notif-toolbar">
        <div className="notif-toolbar-left">
          <button onClick={load} disabled={busy}>Yenile</button>
          <button onClick={onMarkAll} disabled={busy || items.length === 0}>Hepsini okundu yap</button>
          <button onClick={selectAll} disabled={items.length === 0}>Tümünü seç</button>
          <button onClick={clearSelection} disabled={selected.size === 0}>Seçimi temizle</button>
        </div>
        <div className="notif-toolbar-right">
          <button className="danger" onClick={deleteSelected} disabled={busy || selected.size === 0}>Seçileni sil</button>
        </div>
      </div>

      {error && <div className="notif-error-box">{error}</div>}

      {items.length === 0 ? (
        <div className="notif-empty">Şu anda bildiriminiz yok.</div>
      ) : (
        <ul className="notif-grid">
          {items.map((n) => {
            const isSelected = selected.has(n.id);
            const createdDate = n.createdAt
              ? new Date(n.createdAt.toDate?.() || n.createdAt).toLocaleDateString('tr-TR')
              : '';
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
                className={`notif-card ${n.read ? '' : 'unread'} ${isSelected ? 'selected' : ''}`}
                onClick={() => openNotification(n)}
              >
                <div className="notif-card-top">
                  <label className="checkbox">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(n.id)} />
                    <span></span>
                  </label>
                  <span className={`badge ${n.type || 'general'}`}>
                    {n.type === 'post_like' ? '❤️ Beğeni' : n.type === 'post_comment' ? '💬 Yorum' : 'Bildirim'}
                  </span>
                </div>
                <h3>{n.title || 'Bildirim'}</h3>
                <div>{n.body}</div>
                <p>{createdDate} {createdTime}</p>
                <div className="notif-card-actions">
                  <button onClick={() => onMark(n.id, !n.read)}>{n.read ? 'Tekrar oku' : 'Okundu işaretle'}</button>
                  <button className="danger" onClick={() => onDelete(n.id)}>Sil</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
