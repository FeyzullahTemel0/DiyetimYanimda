import { useState, useEffect } from 'react';
import { useGlobalUpdate } from '../contexts/GlobalUpdateContext';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToastContext } from '../contexts/ToastContext';
import { getApiUrl } from '../config/apiConfig';
import './DietitianPanel.css';



export default function DietitianPanel() {
    const { triggerGlobalUpdate } = useGlobalUpdate();
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  
  const [dietitianData, setDietitianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State'ler
  const [pendingRequests, setPendingRequests] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]); // Çalışmayı bırakma istekleri
  const [activeClients, setActiveClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [clientLoading, setClientLoading] = useState(false);

  // Çalışmayı bırakma isteğini onayla
  const handleApproveLeaveRequest = async (leaveRequestId, userId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(getApiUrl('/api/approve-leave-request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ leaveRequestId, userId })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Çalışma ilişkisi başarıyla sonlandırıldı.', 'success');
        await checkDietitianAndLoadData();
        triggerGlobalUpdate();
      } else {
        showToast(data.error || 'İşlem başarısız.', 'error');
      }
    } catch (error) {
      showToast('İşlem sırasında hata oluştu.', 'error');
    }
  };

  useEffect(() => {
    checkDietitianAndLoadData();
  }, []);

  const checkDietitianAndLoadData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        showToast('❌ Lütfen giriş yapın', 'error');
        navigate('/dietitian/login');
        return;
      }
      // Diyetisyen bilgilerini çek
      const dietitianDoc = await getDoc(doc(db, 'dietitians', user.uid));
      if (!dietitianDoc.exists()) {
        showToast('❌ Diyetisyen hesabı bulunamadı', 'error');
        navigate('/');
        return;
      }
      const data = dietitianDoc.data();
      if (!data.isActive) {
        showToast('❌ Hesabınız aktif değil', 'error');
        await auth.signOut();
        navigate('/dietitian/login');
        return;
      }
      setDietitianData(data);
      // İstekleri ve danışanları yükle
      await loadPendingRequests(user.uid);
      await loadActiveClients(user.uid);
      await loadAppointments(user.uid);
      await loadLeaveRequests();
    } catch (error) {
      console.error('Diyetisyen kontrol hatası:', error);
      showToast('❌ Bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Leave request'leri backend'den çek
  const loadLeaveRequests = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(getApiUrl('/api/leave-requests'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLeaveRequests(data.requests);
      } else {
        setLeaveRequests([]);
      }
    } catch (error) {
      setLeaveRequests([]);
    }
  };

  const loadPendingRequests = async (dietitianId) => {
    try {
      const q = query(
        collection(db, 'clientRequests'),
        where('dietitianId', '==', dietitianId),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      const requests = [];

      for (const docSnap of snapshot.docs) {
        const requestData = docSnap.data();

        // Kullanıcı bilgilerini çek
        const userDoc = await getDoc(doc(db, 'users', requestData.userId));
        const userData = userDoc.data();

        requests.push({
          id: docSnap.id,
          ...requestData,
          user: userData
        });
      }

      setPendingRequests(requests);
    } catch (error) {
      console.error('İstekler yüklenemedi:', error);
    }
  };

  const loadActiveClients = async (dietitianId) => {
    try {
      const q = query(
        collection(db, 'dietitian_clients'),
        where('dietitianId', '==', dietitianId),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      const uniqueClients = new Map();
      for (const docSnap of snapshot.docs) {
        const clientRelation = docSnap.data();
        // Kullanıcı bilgilerini çek
        const userDoc = await getDoc(doc(db, 'users', clientRelation.userId));
        const userData = userDoc.data();
        // Aynı userId varsa ekleme
        if (!uniqueClients.has(clientRelation.userId)) {
          uniqueClients.set(clientRelation.userId, {
            id: docSnap.id,
            relationId: docSnap.id,
            ...clientRelation,
            user: userData
          });
        }
      }
      setActiveClients(Array.from(uniqueClients.values()));
    } catch (error) {
      console.error('Danışanlar yüklenemedi:', error);
    }
  };

  const loadAppointments = async (dietitianId) => {
    try {
      const q = query(
        collection(db, 'appointments'),
        where('dietitianId', '==', dietitianId)
      );

      const snapshot = await getDocs(q);
      const appts = [];

      for (const docSnap of snapshot.docs) {
        const apptData = docSnap.data();

        // Kullanıcı bilgilerini çek
        const userDoc = await getDoc(doc(db, 'users', apptData.userId));
        const userData = userDoc.data();

        appts.push({
          id: docSnap.id,
          ...apptData,
          user: userData
        });
      }

      // Tarihe göre sırala (yakın randevular önce)
      appts.sort((a, b) => {
        if (!a.preferredDate || !b.preferredDate) return 0;
        return new Date(a.preferredDate) - new Date(b.preferredDate);
      });

      setAppointments(appts);
    } catch (error) {
      console.error('Randevular yüklenemedi:', error);
    }
  };

  const handleApproveRequest = async (requestId, userId) => {
    try {
      // Diyetisyen kontenjan kontrolü
      if (dietitianData.currentClients >= dietitianData.maxClients) {
        showToast('❌ Kontenjanınız dolu', 'error');
        return;
      }

      // Backend'e istek gönder
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(getApiUrl('/api/dietitians/approve-request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İstek onaylanamadı');
      }

      showToast('✅ İstek onaylandı!', 'success');

      // Verileri yenile
      await checkDietitianAndLoadData();
      triggerGlobalUpdate();
    } catch (error) {
      console.error('İstek onaylama hatası:', error);
      showToast(`❌ ${error.message}`, 'error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      // Backend'e istek gönder
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(getApiUrl('/api/dietitians/reject-request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İstek reddedilemedi');
      }

      showToast('ℹ️ İstek reddedildi', 'info');

      // Verileri yenile
      await checkDietitianAndLoadData();
      triggerGlobalUpdate();
    } catch (error) {
      console.error('İstek reddetme hatası:', error);
      showToast(`❌ ${error.message}`, 'error');
    }
  };

  const handleConfirmAppointment = async (appointmentId, confirmedDate, confirmedTime) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'confirmed',
        confirmedDate,
        confirmedTime,
        updatedAt: serverTimestamp()
      });

      showToast('✅ Randevu onaylandı!', 'success');
      await loadAppointments(auth.currentUser.uid);
      triggerGlobalUpdate();
    } catch (error) {
      console.error('Randevu onaylama hatası:', error);
      showToast('❌ Randevu onaylanamadı', 'error');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });

      showToast('ℹ️ Randevu iptal edildi', 'info');
      await loadAppointments(auth.currentUser.uid);
      triggerGlobalUpdate();
    } catch (error) {
      console.error('Randevu iptal hatası:', error);
      showToast('❌ Randevu iptal edilemedi', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      showToast('✅ Çıkış yapıldı', 'success');
      navigate('/dietitian/login');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  if (loading) {
    return (
      <div className="dietitian-panel">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dietitian-panel">
      {/* Sidebar */}
      <aside className="panel-sidebar">
        <div className="dietitian-profile">
          <div className="profile-photo">
            {dietitianData.profilePhoto ? (
              <img src={dietitianData.profilePhoto} alt={dietitianData.fullName} />
            ) : (
              <div className="default-photo">👤</div>
            )}
          </div>
          <h3>{dietitianData.fullName}</h3>
          <p className="specialization">{dietitianData.specialization}</p>
        </div>
        <nav className="panel-nav">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={activeTab === 'requests' ? 'active' : ''}
            onClick={() => setActiveTab('requests')}
          >
            📩 İstekler {pendingRequests.length > 0 && <span className="badge">{pendingRequests.length}</span>}
          </button>
          <button
            className={activeTab === 'clients' ? 'active' : ''}
            onClick={() => setActiveTab('clients')}
          >
            👥 Danışanlarım ({activeClients.length}/{dietitianData.maxClients})
          </button>
          <button
            className={activeTab === 'appointments' ? 'active' : ''}
            onClick={() => setActiveTab('appointments')}
          >
            📅 Randevular
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Çıkış Yap
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="panel-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'clients' && renderClients()}
        {activeTab === 'appointments' && renderAppointments()}
      </main>

      {/* Danışan Detay Modalı */}
      {selectedClient && (
        <div className="client-detail-modal">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setSelectedClient(null)}>Kapat ✖</button>
            <h2>{selectedClient.user?.name} {selectedClient.user?.surname} - Danışan Detayları</h2>
            <div className="modal-info">
              <p><b>Email:</b> {selectedClient.user?.email}</p>
              <p><b>Kilo:</b> {selectedClient.user?.weight || '-'} kg</p>
              <p><b>Boy:</b> {selectedClient.user?.height || '-'} cm</p>
              <p><b>Hedef Kilo:</b> {selectedClient.user?.targetWeight || '-'} kg</p>
              <p><b>Yaş:</b> {selectedClient.user?.age || '-'}</p>
              {/* Diyetisyen sistemine özel ek bilgiler buraya eklenebilir */}
              {/* ... */}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Dashboard
  function renderDashboard() {
    return (
      <div className="tab-content">
        <h1>📊 Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Aktif Danışan</h3>
              <p className="stat-value">{activeClients.length}/{dietitianData.maxClients}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📩</div>
            <div className="stat-info">
              <h3>Bekleyen İstek</h3>
              <p className="stat-value">{pendingRequests.length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>Yaklaşan Randevu</h3>
              <p className="stat-value">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-info">
              <h3>Deneyim</h3>
              <p className="stat-value">{dietitianData.experienceYears} yıl</p>
            </div>
          </div>
        </div>

        {pendingRequests.length > 0 && (
          <div className="quick-actions">
            <h2>⚡ Hızlı İşlemler</h2>
            <div className="action-card">
              <p>
                {pendingRequests.length} adet bekleyen istek var. Hemen kontrol edin!
              </p>
              <button onClick={() => setActiveTab('requests')} className="btn-action">
                İstekleri Görüntüle
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Çalışmayı bırakma isteğini onayla
  // (Bu fonksiyon zaten yukarıda tanımlı, tekrar tanımlamaya gerek yok)

  // İstekler
  function renderRequests() {
    return (
      <div className="tab-content">
        <h1>📩 Danışan İstekleri</h1>
        {/* Normal danışan istekleri */}
        <h2 style={{ marginTop: 24, fontSize: '1.2rem' }}>Diyetisyen Seçme İstekleri</h2>
        {pendingRequests.length === 0 ? (
          <div className="empty-state">
            <p>Henüz bekleyen istek yok.</p>
          </div>
        ) : (
          <div className="requests-list">
            {pendingRequests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="user-info">
                    <h3>{request.user?.name} {request.user?.surname}</h3>
                    <p className="user-email">{request.user?.email}</p>
                  </div>
                  <div className="request-date">
                    {request.requestedAt?.toDate?.() ? request.requestedAt.toDate().toLocaleDateString('tr-TR') : ''}
                  </div>
                </div>
                <div className="user-details">
                  <div className="detail-row">
                    <span className="label">Yaş:</span>
                    <span>{request.user?.age || 'Belirtilmemiş'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Kilo:</span>
                    <span>{request.user?.weight || '-'} kg</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Boy:</span>
                    <span>{request.user?.height || '-'} cm</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Hedef Kilo:</span>
                    <span>{request.user?.targetWeight || '-'} kg</span>
                  </div>
                </div>
                <div className="request-actions">
                  <button
                    onClick={() => handleApproveRequest(request.id, request.userId)}
                    className="btn-approve"
                    disabled={dietitianData.currentClients >= dietitianData.maxClients}
                  >
                    ✅ Onayla
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="btn-reject"
                  >
                    ❌ Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Çalışmayı bırakma istekleri */}
        <h2 style={{ marginTop: 32, fontSize: '1.2rem' }}>Çalışmayı Bırakma İstekleri</h2>
        {leaveRequests.length === 0 ? (
          <div className="empty-state">
            <p>Henüz bekleyen çalışmayı bırakma isteği yok.</p>
          </div>
        ) : (
          <div className="requests-list">
            {leaveRequests.map((req) => (
              <div key={req.id} className="request-card">
                <div className="request-header">
                  <div className="user-info">
                    <b>{req.user?.name} {req.user?.surname}</b><br />
                    <span style={{ fontSize: '0.95em', color: '#888' }}>{req.user?.email}</span>
                  </div>
                  <div className="request-date">
                    {req.requestedAt?.seconds ? new Date(req.requestedAt.seconds * 1000).toLocaleDateString('tr-TR') : ''}
                  </div>
                </div>
                <div className="request-actions">
                  <button
                    onClick={() => handleApproveLeaveRequest(req.id, req.userId)}
                    className="btn-approve"
                  >
                    ✅ İlişkiyi Sonlandır
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  // Danışanlar
  function renderClients() {
    return (
      <div className="tab-content">
        <h1>👥 Danışanlarım ({activeClients.length}/{dietitianData.maxClients})</h1>

        {activeClients.length === 0 ? (
          <div className="empty-state">
            <p>Henüz danışanınız yok.</p>
          </div>
        ) : (
          <div className="clients-grid">
            {activeClients.map((client) => (
              <div key={client.id} className="client-card">
                <div className="client-header">
                  <h3>{client.user?.name} {client.user?.surname}</h3>
                  <span className="client-status active">Aktif</span>
                </div>

                <div className="client-info">
                  <div className="info-item">
                    <span className="icon">📧</span>
                    <span>{client.user?.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="icon">⚖️</span>
                    <span>{client.user?.weight || '-'} kg</span>
                  </div>
                  <div className="info-item">
                    <span className="icon">📏</span>
                    <span>{client.user?.height || '-'} cm</span>
                  </div>
                  <div className="info-item">
                    <span className="icon">🎯</span>
                    <span>Hedef: {client.user?.targetWeight || '-'} kg</span>
                  </div>
                </div>

                <div className="client-actions">
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="btn-view-details"
                  >
                    📋 Detayları Gör
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Randevular
  function renderAppointments() {
    return (
      <div className="tab-content">
        <h1>📅 Randevular</h1>

        {appointments.length === 0 ? (
          <div className="empty-state">
            <p>Henüz randevu yok.</p>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((appointment) => (
              <div key={appointment.id} className={`appointment-card status-${appointment.status}`}>
                <div className="appointment-header">
                  <div>
                    <h3>{appointment.user?.name} {appointment.user?.surname}</h3>
                    <p className="appointment-type">
                      {appointment.type === 'video' && '🎥 Video Görüşme'}
                      {appointment.type === 'phone' && '📞 Telefon'}
                      {appointment.type === 'whatsapp' && '💬 WhatsApp'}
                    </p>
                  </div>
                  <span className={`status-badge ${appointment.status}`}>
                    {appointment.status === 'pending' && '⏳ Bekliyor'}
                    {appointment.status === 'confirmed' && '✅ Onaylandı'}
                    {appointment.status === 'cancelled' && '❌ İptal'}
                    {appointment.status === 'completed' && '✔️ Tamamlandı'}
                  </span>
                </div>

                <div className="appointment-details">
                  <div className="detail-item">
                    <span className="icon">📅</span>
                    <span>{appointment.preferredDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="icon">⏰</span>
                    <span>{appointment.preferredTime}</span>
                  </div>
                  {appointment.notes && (
                    <div className="detail-item notes">
                      <span className="icon">📝</span>
                      <span>{appointment.notes}</span>
                    </div>
                  )}
                </div>

                {appointment.status === 'pending' && (
                  <div className="appointment-actions">
                    <button
                      className="btn-confirm-appt"
                      onClick={() => handleConfirmAppointment(
                        appointment.id,
                        appointment.preferredDate,
                        appointment.preferredTime
                      )}
                    >
                      ✅ Onayla
                    </button>
                    <button
                      className="btn-cancel-appt"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      ❌ İptal Et
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
