// frontend/src/pages/ProgramList.jsx (TAM VE KESİN ÇALIŞAN HALİ)

import { useEffect, useState, useCallback } from "react";
import { auth } from "../services/firebase";
import ProgramForm from "../pages/ProgramForm"; 
import "./ProgramList.css";

// Bildirim bileşeni (değişiklik yok)
const Notification = ({ message, type, onClear }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onClear(), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message) return null;
  return <div className={`notification ${type}`}>{message}</div>;
};

const API_BASE_URL = "http://localhost:5000/api";

export default function ProgramList({ gender }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProgram, setEditProgram] = useState(null); // Düzenlenecek programın *tam verisini* tutacak
  const [isAdding, setIsAdding] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false); // YENİ: Form verisi yüklenirken kullanılacak
  const [notification, setNotification] = useState({ message: "", type: "" });

  const clearNotification = useCallback(() => setNotification({ message: "", type: "" }), []);

  // Bu fonksiyon sadece listeyi getirir (değişiklik yok)
  const loadPrograms = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) { setLoading(false); setPrograms([]); return; }
    try {
      setLoading(true);
      clearNotification();
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/admin/diet-programs?gender=${gender}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Liste alınamadı (HTTP ${res.status})`);
      }
      const data = await res.json();
      setPrograms(data);
    } catch (err) {
      setPrograms([]);
      setNotification({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [gender, clearNotification]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadPrograms();
      } else {
        setLoading(false); setPrograms([]);
        setNotification({ message: "Programları listelemek için yetkiniz yok.", type: "error" });
      }
    });
    return () => unsubscribe();
  }, [loadPrograms]);
  
  // =================================================================================
  // === ASIL DÜZELTME BURADA: "Düzenle" butonuna basınca bu fonksiyon çalışacak ===
  // =================================================================================
  const handleEditClick = async (programId) => {
    // 1. Modalı hemen aç ve "Yükleniyor..." göster
    setIsFormLoading(true); 
    setEditProgram({}); // Boş bir obje ile state'i tetikle ki modal açılsın
    setIsAdding(false);
    clearNotification();
    
    try {
      const token = await auth.currentUser.getIdToken();
      // 2. Backend'deki YENİ endpoint'i çağırarak programın TÜM detaylarını çek
      const res = await fetch(`${API_BASE_URL}/admin/diet-programs/${programId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error((await res.json()).error || "Program detayı alınamadı.");
      }
      const fullProgramData = await res.json();
      
      // 3. Gelen TAM veriyle `editProgram` state'ini güncelle
      setEditProgram(fullProgramData); 

    } catch (err) {
      setNotification({ message: `Detay alınamadı: ${err.message}`, type: "error" });
      closeForm(); // Hata olursa formu kapat
    } finally {
      // 4. Yükleme durumunu bitir
      setIsFormLoading(false); 
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Programı kalıcı olarak silmek istediğinize emin misiniz?")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_BASE_URL}/admin/diet-programs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setPrograms((progs) => progs.filter((p) => p.id !== id));
      setNotification({ message: "Program başarıyla silindi.", type: "success" });
    } catch (err) {
      setNotification({ message: `Silme hatası: ${err.message}`, type: "error" });
    }
  };

  const handleSuccess = (newOrUpdatedProg) => {
    setPrograms((progs) => {
      const exists = progs.some((p) => p.id === newOrUpdatedProg.id);
      return exists
        ? progs.map((p) => (p.id === newOrUpdatedProg.id ? newOrUpdatedProg : p))
        : [newOrUpdatedProg, ...progs];
    });
    setNotification({
      message: `Program başarıyla ${editProgram?.id ? 'güncellendi' : 'eklendi'}.`,
      type: "success",
    });
    closeForm();
  };

  const closeForm = () => {
    setEditProgram(null);
    setIsAdding(false);
  };

  return (
    <div className="program-list-section">
      <Notification message={notification.message} type={notification.type} onClear={clearNotification} />
      
      <div className="list-header">
        <h2>Diyet Programları Yönetimi</h2>
        <button className="btn-add" onClick={() => setIsAdding(true)}>
          ➕ Yeni Program Ekle
        </button>
      </div>

      {loading && <div className="list-message">Programlar Yükleniyor...</div>}
      
      {!loading && programs.length === 0 && !notification.message && (
          <div className="list-message">Bu kritere uygun program bulunamadı.</div>
      )}

      {!loading && programs.length > 0 && (
        <div className="program-grid">
          {programs.map((p) => {
            const { macros = {}, title, description, calories, gender: progGender, id } = p;
            const { proteinPercent = 0, carbPercent = 0, fatPercent = 0 } = macros;

            return (
              <div key={id} className="program-card">
                <div className="card-header">
                  <h3>{title}</h3>
                  <span className={`gender-tag ${progGender}`}>{progGender === "male" ? "Erkek" : "Kadın"}</span>
                </div>
                <p className="card-description">{description}</p>
                <div className="card-details">
                  <p><strong>Kalori:</strong> {calories ?? "–"} kcal</p>
                  <p><strong>Makro:</strong> P%{proteinPercent} / C%{carbPercent} / F%{fatPercent}</p>
                </div>
                <div className="card-actions">
                  {/* DÜZELTME: onClick artık eski `setEditProgram(p)` yerine YENİ `handleEditClick(id)` fonksiyonunu çağırıyor */}
                  <button className="btn-action edit" onClick={() => handleEditClick(id)}>Düzenle</button>
                  <button className="btn-action delete" onClick={() => handleDelete(id)}>Sil</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(isAdding || editProgram) && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close" onClick={closeForm}>×</button>
            <h2>{editProgram?.id ? "Programı Düzenle" : "Yeni Program Ekle"}</h2>

            {/* DÜZELTME: Form verisi yüklenirken bir mesaj gösteriyoruz */}
            {isFormLoading ? (
              <div className="list-message">Program detayları yükleniyor...</div>
            ) : (
              <ProgramForm
                // DÜZELTME: Yeni ekleme durumunda `initialData`'yı null yapıyoruz ki boş form gelsin.
                initialData={isAdding ? null : editProgram}
                onSuccess={handleSuccess}
                onCancel={closeForm}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}