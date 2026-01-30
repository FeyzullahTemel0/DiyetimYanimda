import { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToastContext } from '../contexts/ToastContext';
import './DietitianInvites.css';
 
export default function DietitianInvites() {
  const { showToast } = useToastContext();

  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [expiresIn, setExpiresIn] = useState(7);

  const handleDeleteInvite = async (tokenValue) => {
    if (!window.confirm('Bu davet linkini silmek istediğinize emin misiniz?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/admin/users/delete-dietitian-invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: tokenValue })
      });
      const data = await response.json();
      if (data.success) {
        showToast('✅ Davet linki silindi', 'success');
        fetchInvites();
      } else {
        showToast(`❌ ${data.error || 'Silinemedi'}`, 'error');
      }
    } catch (error) {
      showToast('❌ Silme işlemi başarısız', 'error');
    }
  };
  

  useEffect(() => {
    if (auth.currentUser) {
      fetchInvites();
    }
  }, []);

  const fetchInvites = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/admin/users/dietitian-invites/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setInvites(data.invites || []);
      } else {
        showToast(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Davet listesi yükleme hatası:', error);
      showToast('❌ Davet listesi yüklenemedi', 'error');
    }
  };

  const handleCreateInvite = async () => {
    if (!auth.currentUser) {
      showToast('❌ Lütfen giriş yapın', 'error');
      return;
    }

    setGeneratingToken(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/admin/users/create-dietitian-invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expiresIn: parseInt(expiresIn) })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast('✅ Davet linki başarıyla oluşturuldu!', 'success');
        
        // Davet linkini clipboard'a kopyala
        const fullUrl = data.inviteUrl;
        navigator.clipboard.writeText(fullUrl).then(() => {
          showToast('📋 Davet linki clipboard\'a kopyalandı!', 'success');
        });

        // Listeyi yenile
        fetchInvites();
      } else {
        showToast(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Token oluşturma hatası:', error);
      showToast('❌ Token oluşturulamadı', 'error');
    } finally {
      setGeneratingToken(false);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      showToast('📋 Davet linki clipboard\'a kopyalandı!', 'success');
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatus = (invite) => {
    if (invite.usedAt) {
      return { label: 'Kullanıldı', color: '#2dd4bf' };
    }
    if (new Date(invite.expiresAt) < new Date()) {
      return { label: 'Süresi Doldu', color: '#ff8a80' };
    }
    return { label: 'Aktif', color: '#4caf50' };
  };

  return (
    <div className="dietitian-invites-container">
      <div className="invites-header">
        <h1>🏥 Diyetisyen Davet Sistemi</h1>
        <p>Yeni diyetisyenleri davet etmek için link oluşturun</p>
      </div>

      <div className="create-invite-card">
        <h2>📧 Yeni Davet Linki Oluştur</h2>
        
        <div className="invite-form">
          <div className="form-group">
            <label>Geçerlilik Süresi (Gün)</label>
            <select 
              value={expiresIn} 
              onChange={(e) => setExpiresIn(e.target.value)}
              disabled={generatingToken}
            >
              <option value="1">1 Gün</option>
              <option value="3">3 Gün</option>
              <option value="7">7 Gün (Varsayılan)</option>
              <option value="14">14 Gün</option>
              <option value="30">30 Gün</option>
            </select>
          </div>

          <button
            onClick={handleCreateInvite}
            disabled={generatingToken}
            className="btn-create-invite"
          >
            {generatingToken ? '⏳ Oluşturuluyor...' : '✨ Davet Linki Oluştur'}
          </button>
        </div>
      </div>

      <div className="invites-list-card">
        <h2>📋 Oluşturulan Davetler</h2>
        
        {invites.length === 0 ? (
          <div className="empty-state">
            <p>Henüz davet linki oluşturulmadı</p>
          </div>
        ) : (
          <div className="invites-table">
            <table>
              <thead>
                <tr>
                  <th>Davet Linki</th>
                  <th>Durum</th>
                  <th>Oluşturulma Tarihi</th>
                  <th>Sona Erme Tarihi</th>
                  <th>Kullanan</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => {
                  const status = getStatus(invite);
                  return (
                    <tr key={invite.token}>
                      <td className="token-cell">
                        <code>{invite.token.substring(0, 10)}...{invite.token.substring(-10)}</code>
                      </td>
                      <td>
                        <span className="status-badge" style={{ color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td>{formatDate(invite.createdAt)}</td>
                      <td>{formatDate(invite.expiresAt)}</td>
                      <td>{invite.usedBy ? `✅ ${invite.usedBy}` : '-'}</td>
                      <td>
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/dietitian/register?token=${invite.token}`)}
                          className="btn-copy"
                          title="Linki kopyala"
                        >
                          📋 Kopyala
                        </button>
                        <button
                          onClick={() => handleDeleteInvite(invite.token)}
                          className="btn-delete"
                          title="Davet linkini sil"
                          style={{ marginLeft: 8, color: '#ff5252', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          🗑️ Sil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
