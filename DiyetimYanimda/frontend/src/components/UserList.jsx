// frontend/src/components/UserList.jsx

import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import "./UserList.css"; // Güncellenmiş CSS'i kullanacak

export default function UserList({ onUserSelect }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Kullanıcı girişi yapılmamış.");

        const token = await user.getIdToken();
        const res = await fetch("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 403) throw new Error("Erişim reddedildi: Bu sayfayı görüntülemek için admin yetkiniz yok.");
        if (!res.ok) throw new Error(`Liste yüklenemedi (HTTP ${res.status})`);
        
        const fetchedUsers = await res.json();
        setUsers(fetchedUsers);
      } catch (err) {
        setError(err.message || "Sunucuya bağlanılamadı.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  if (loading) {
    return <div className="user-list-message">Kullanıcılar yükleniyor...</div>;
  }

  if (error) {
    return <p className="user-list-error">{error}</p>;
  }

  return (
    <section className="user-list-section">
      <h2 className="user-list-title">Kayıtlı Kullanıcılar</h2>
      <div className="user-cards">
        {users.map((u) => {
          const userRole = u.role || 'user';
          const cardClassName = `user-card ${!u.isAuthUser ? 'deleted-user' : ''}`;

          return (
            <div
              key={u.uid}
              className={cardClassName}
              onClick={() => u.isAuthUser && onUserSelect(u.uid)}
              tabIndex={u.isAuthUser ? 0 : -1} // Erişilebilirlik için
              onKeyPress={(e) => (e.key === 'Enter' && u.isAuthUser) && onUserSelect(u.uid)} // Klavye ile seçim
            >
              <div className={`user-avatar ${userRole}`}>
                {(u.displayName || u.email || '?').charAt(0)}
              </div>
              <div className="user-info">
                <p className="user-name">{u.displayName || u.email}</p>
                <p className="user-email">{u.email}</p>
              </div>
              <div className="user-meta">
                  <span className={`user-role ${userRole}`}>{userRole}</span>
                  {u.isAuthUser && <div className="user-arrow">→</div>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}