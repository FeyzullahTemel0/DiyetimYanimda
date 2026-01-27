import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import UserDetail from "../components/UserDetail";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query } from 'firebase/firestore';
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useToastContext } from "../contexts/ToastContext";
import "../styles/Dashboard.css";
import "./AdminPanel.css";

export default function Dashboard({ initialTab = "admin-programs" }) {
  const { showToast } = useToastContext();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Admin panel states
  const [programs, setPrograms] = useState([]);
  const [users, setUsers] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingPricingId, setEditingPricingId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // Program yönetimi için yeni state'ler
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const activityOptions = [
    { value: 'sedentary', label: 'Sedanter' },
    { value: 'light', label: 'Az Aktif' },
    { value: 'moderate', label: 'Orta Aktif' },
    { value: 'active', label: 'Aktif' },
    { value: 'athlete', label: 'Sporcu' },
  ];

  const goalOptions = [
    { value: 'fat_loss', label: 'Yağ Yakma' },
    { value: 'muscle_gain', label: 'Kas Kazanma' },
    { value: 'recomposition', label: 'Vücut Rekompozisyonu' },
    { value: 'wellness', label: 'Sağlıklı Yaşam' },
    { value: 'medical', label: 'Medikal (Diyabet, HT vb.)' },
  ];

  const dietTypes = [
    { value: 'mediterranean', label: 'Akdeniz' },
    { value: 'keto', label: 'Ketojenik' },
    { value: 'low_carb', label: 'Düşük Karbonhidrat' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'vegetarian', label: 'Vejetaryen' },
    { value: 'dash', label: 'DASH' },
    { value: 'balanced', label: 'Dengeli' },
  ];

  const packageOptions = [
    { value: 'free', label: 'Ücretsiz' },
    { value: 'basic', label: 'Temel' },
    { value: 'premium', label: 'Premium' },
    { value: 'plus', label: 'Profesyonel Plus' },
  ];

  const labelFrom = (list, value) => list.find((i) => i.value === value)?.label || value;

  const toggleArrayValue = (key, value) => {
    const current = formData[key] || [];
    setFormData({
      ...formData,
      [key]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    });
  };

  const num = (val, fallback = 0) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  };

  // Zorluk seviyesini Türkçeye çevir
  const difficultyToTurkish = (difficulty) => {
    const map = {
      'beginner': 'Başlangıç',
      'intermediate': 'Orta',
      'advanced': 'İleri'
    };
    return map[difficulty] || difficulty;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Profil yüklenemedi.");
        const profileData = await res.json();
        // Admin kontrolü
        if (profileData.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setProfile(profileData);
      } catch (error) {
        console.error("Profil yükleme hatası:", error);
        window.location.href = '/';
      }
    };
    if (auth.currentUser) {
      fetchProfile();
    }
  }, []);

  // Admin panel data fetching
  useEffect(() => {
    if (activeTab === 'admin-programs') {
      fetchPrograms();
    } else if (activeTab === 'admin-quotes') {
      fetchQuotes();
    } else if (activeTab === 'admin-users') {
      fetchUsers();
    } else if (activeTab === 'admin-pricing') {
      fetchPricing();
    }
  }, [activeTab]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/admin/diet-programs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Programlar yüklenemedi');
      }
      
      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error('Programlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'motivationQuotes'));
      const snapshot = await getDocs(q);
      setQuotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Sözler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'pricing'));
      const snapshot = await getDocs(q);
      setPricing(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Fiyatlandırma yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.calories || !formData.targetGender) {
      showToast('Program adı, kalori ve cinsiyet bilgisi gerekli!', 'error');
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      
      // Backend'in beklediği formatta veri hazırla
      const programData = {
        title: formData.name,
        description: formData.description || '',
        gender: formData.targetGender === 'any' ? 'male' : formData.targetGender, // Backend 'male' veya 'female' bekliyor
        calories: num(formData.calories),
        macros: {
          proteinPercent: num(formData.protein, 30),
          carbPercent: num(formData.carbs, 40),
          fatPercent: num(formData.fat, 30),
        },
        accessLevel: formData.requiredPackage || 'free',
        tips: formData.notes || '',
        weeklyMenu: formData.weeklyMenu || '',
        // Eski alanları da sakla (uyumluluk için)
        category: formData.category || 'fat_loss',
        goal: formData.goal || 'fat_loss',
        difficulty: formData.difficulty || 'beginner',
        dietType: formData.dietType || 'balanced',
        durationWeeks: num(formData.durationWeeks, 8),
        mealsPerDay: num(formData.mealsPerDay, 3),
        repetitionType: formData.repetitionType || 'steady',
        ageRange: [num(formData.ageMin, 18), num(formData.ageMax, 60)],
        bmiRange: [num(formData.bmiMin, 18.5), num(formData.bmiMax, 30)],
        targetGender: formData.targetGender || 'any',
        activityLevels: formData.activityLevels || ['sedentary'],
        requiredPackage: formData.requiredPackage || 'free',
        price: num(formData.price, 0),
        tags: (formData.tags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        createdAt: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:5000/api/admin/diet-programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(programData)
      });

      if (!response.ok) {
        throw new Error('Program eklenemedi');
      }

      setFormData({});
      fetchPrograms();
      showToast('Program başarıyla eklendi! ✨', 'success');
      setShowProgramForm(false);
      setEditingProgramId(null);
    } catch (error) {
      console.error('Program eklenemedi:', error);
      showToast('Program eklenirken bir sorun oluştu', 'error');
    }
  };

  const handleEditProgram = async (program) => {
    setEditingProgramId(program.id);
    setFormData({
      name: program.title || program.name,
      description: program.description || '',
      targetGender: program.gender === 'male' ? 'male' : program.gender === 'female' ? 'female' : 'any',
      calories: program.calories || '',
      protein: program.macros?.proteinPercent || program.macros?.protein || '',
      carbs: program.macros?.carbPercent || program.macros?.carbs || '',
      fat: program.macros?.fatPercent || program.macros?.fat || '',
      requiredPackage: program.accessLevel || program.requiredPackage || 'free',
      notes: program.tips || program.notes || '',
      weeklyMenu: program.weeklyMenu || '',
      category: program.category || 'fat_loss',
      goal: program.goal || 'fat_loss',
      difficulty: program.difficulty || 'beginner',
      dietType: program.dietType || 'balanced',
      durationWeeks: program.durationWeeks || '',
      mealsPerDay: program.mealsPerDay || '',
      repetitionType: program.repetitionType || 'steady',
      ageMin: program.ageRange?.[0] || '',
      ageMax: program.ageRange?.[1] || '',
      bmiMin: program.bmiRange?.[0] || '',
      bmiMax: program.bmiRange?.[1] || '',
      activityLevels: program.activityLevels || ['sedentary'],
      price: program.price || '',
      tags: program.tags?.join(', ') || '',
    });
    setShowProgramForm(true);
    setSelectedProgram(null);
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.calories || !formData.targetGender) {
      showToast('Program adı, kalori ve cinsiyet bilgisi gerekli!', 'error');
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      
      const programData = {
        title: formData.name,
        description: formData.description || '',
        gender: formData.targetGender === 'any' ? 'male' : formData.targetGender,
        calories: num(formData.calories),
        macros: {
          proteinPercent: num(formData.protein, 30),
          carbPercent: num(formData.carbs, 40),
          fatPercent: num(formData.fat, 30),
        },
        accessLevel: formData.requiredPackage || 'free',
        tips: formData.notes || '',
        weeklyMenu: formData.weeklyMenu || '',
        category: formData.category || 'fat_loss',
        goal: formData.goal || 'fat_loss',
        difficulty: formData.difficulty || 'beginner',
        dietType: formData.dietType || 'balanced',
        durationWeeks: num(formData.durationWeeks, 8),
        mealsPerDay: num(formData.mealsPerDay, 3),
        repetitionType: formData.repetitionType || 'steady',
        ageRange: [num(formData.ageMin, 18), num(formData.ageMax, 60)],
        bmiRange: [num(formData.bmiMin, 18.5), num(formData.bmiMax, 30)],
        targetGender: formData.targetGender || 'any',
        activityLevels: formData.activityLevels || ['sedentary'],
        requiredPackage: formData.requiredPackage || 'free',
        price: num(formData.price, 0),
        tags: (formData.tags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const response = await fetch(`http://localhost:5000/api/admin/diet-programs/${editingProgramId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(programData)
      });

      if (!response.ok) {
        throw new Error('Program güncellenemedi');
      }

      setFormData({});
      setEditingProgramId(null);
      setShowProgramForm(false);
      fetchPrograms();
      showToast('Program başarıyla güncellendi! 💾', 'info');
    } catch (error) {
      console.error('Program güncellenemedi:', error);
      showToast('Program güncellenirken bir sorun oluştu', 'error');
    }
  };

  const handleDeleteProgram = async (id) => {
    if (window.confirm('Bu programı silmek istediğine emin misin?')) {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`http://localhost:5000/api/admin/diet-programs/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Program silinemedi');
        }
        
        fetchPrograms();
        showToast('Program başarıyla silindi! 🗑️', 'error');
        setSelectedProgram(null);
      } catch (error) {
        console.error('Program silinemedi:', error);
        showToast('Program silinirken bir hata oluştu', 'error');
      }
    }
  };

  const handleAddQuote = async (e) => {
    e.preventDefault();
    if (!formData.quoteText) {
      showToast('Söz metni gerekli!', 'error');
      return;
    }
    try {
      if (editingQuoteId) {
        // Güncelleme
        await updateDoc(doc(db, 'motivationQuotes', editingQuoteId), {
          text: formData.quoteText,
          author: formData.author || 'Anonim',
          category: formData.category || 'genel',
          updatedAt: new Date(),
        });
        showToast('Söz başarıyla güncellendi! 💡', 'info');
        setEditingQuoteId(null);
      } else {
        // Yeni ekleme
        await addDoc(collection(db, 'motivationQuotes'), {
          text: formData.quoteText,
          author: formData.author || 'Anonim',
          category: formData.category || 'genel',
          createdAt: new Date(),
        });
        showToast('Söz başarıyla eklendi! ✨', 'success');
      }
      setFormData({});
      fetchQuotes();
    } catch (error) {
      console.error('Söz işlemi başarısız:', error);
      showToast('Söz işlemi sırasında bir sorun oluştu', 'error');
    }
  };

  const handleEditQuote = (quote) => {
    setEditingQuoteId(quote.id);
    setFormData({
      quoteText: quote.text,
      author: quote.author,
      category: quote.category,
    });
  };

  const handleCancelEdit = () => {
    setEditingQuoteId(null);
    setFormData({});
  };

  const handleDeleteQuote = async (id) => {
    if (window.confirm('Bu sözü silmek istediğine emin misin?')) {
      try {
        await deleteDoc(doc(db, 'motivationQuotes', id));
        fetchQuotes();
        showToast('Söz başarıyla silindi! 🗑️', 'error');
      } catch (error) {
        console.error('Söz silinemedi:', error);
      }
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: currentStatus === 'active' ? 'banned' : 'active'
      });
      fetchUsers();
      showToast(currentStatus === 'active' ? 'Kullanıcı yasaklandı 🚫' : 'Kullanıcı aktif edildi ✅', 'info');
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setFormData({
      userName: user.name || '',
      userSurname: user.surname || '',
      userEmail: user.email || '',
      userRole: user.role || 'user',
      userStatus: user.status || 'active',
    });
  };

  const handleCancelUserEdit = () => {
    setEditingUserId(null);
    setFormData({});
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUserId) return;
    
    try {
      await updateDoc(doc(db, 'users', editingUserId), {
        name: formData.userName || '',
        surname: formData.userSurname || '',
        role: formData.userRole || 'user',
        status: formData.userStatus || 'active',
        updatedAt: new Date(),
      });
      setEditingUserId(null);
      setFormData({});
      fetchUsers();
      showToast('Kullanıcı başarıyla güncellendi! 👤', 'success');
    } catch (error) {
      console.error('Kullanıcı güncellenemedi:', error);
      showToast('Kullanıcı güncellenirken bir sorun oluştu', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğine emin misin? Bu işlem geri alınamaz!')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        fetchUsers();
        showToast('Kullanıcı başarıyla silindi! 🗑️', 'error');
      } catch (error) {
        console.error('Kullanıcı silinemedi:', error);
        showToast('Kullanıcı silinirken bir sorun oluştu', 'error');
      }
    }
  };

  // Pricing fonksiyonları
  const handleAddPricing = async (e) => {
    e.preventDefault();
    if (!formData.planName || !formData.price) {
      showToast('Plan adı ve fiyat gereklidir!', 'error');
      return;
    }
    try {
      if (editingPricingId) {
        // Güncelleme
        await updateDoc(doc(db, 'pricing', editingPricingId), {
          planName: formData.planName,
          price: num(formData.price),
          currency: formData.currency || '₺',
          billingPeriod: formData.billingPeriod || 'monthly',
          description: formData.description || '',
          features: formData.features ? formData.features.split('\n').filter(Boolean) : [],
          active: formData.active !== false,
          updatedAt: new Date(),
        });
        showToast('Plan başarıyla güncellendi! 💰', 'info');
        setEditingPricingId(null);
      } else {
        // Yeni plan ekleme
        await addDoc(collection(db, 'pricing'), {
          planName: formData.planName,
          price: num(formData.price),
          currency: formData.currency || '₺',
          billingPeriod: formData.billingPeriod || 'monthly',
          description: formData.description || '',
          features: formData.features ? formData.features.split('\n').filter(Boolean) : [],
          active: true,
          createdAt: new Date(),
        });
        showToast('Plan başarıyla eklendi! ✨', 'success');
      }
      setFormData({});
      fetchPricing();
    } catch (error) {
      console.error('Plan işlemi başarısız:', error);
      showToast('Plan işlemi sırasında bir sorun oluştu', 'error');
    }
  };

  const handleEditPricing = (plan) => {
    setEditingPricingId(plan.id);
    setFormData({
      planName: plan.planName,
      price: plan.price,
      currency: plan.currency || '₺',
      billingPeriod: plan.billingPeriod || 'monthly',
      description: plan.description || '',
      features: plan.features ? plan.features.join('\n') : '',
      active: plan.active !== false,
    });
  };

  const handleCancelPricingEdit = () => {
    setEditingPricingId(null);
    setFormData({});
  };

  const handleDeletePricing = async (planId) => {
    if (window.confirm('Bu planı silmek istediğine emin misin?')) {
      try {
        await deleteDoc(doc(db, 'pricing', planId));
        fetchPricing();
        showToast('Plan başarıyla silindi! 🗑️', 'error');
      } catch (error) {
        console.error('Plan silinemedi:', error);
        showToast('Plan silinirken bir sorun oluştu', 'error');
      }
    }
  };

  const handleUpdatePricing = async (e) => {
    e.preventDefault();
    try {
      showToast('Fiyatlandırma başarıyla güncellendi! 💰', 'success');
      setFormData({});
    } catch (error) {
      console.error('Fiyatlandırma güncellenemedi:', error);
    }
  };

  if (!profile) return <div className="loading">Yükleniyor…</div>;

  const handleTabSelect = (key) => {
    setFormData({});
    setActiveTab(key);
  };

  const renderContent = () => {
    switch (activeTab) {
      // ADMIN SEKMELERI
      case "admin-programs":
        return renderAdminPrograms();
      case "admin-quotes":
        return renderAdminQuotes();
      case "admin-users":
        return renderAdminUsers();
      case "admin-pricing":
        return renderAdminPricing();
        
      default:
        return renderAdminPrograms();
    }
  };

  const renderAdminPrograms = () => (
    <div className="tab-content">
      <h2>📋 Diyet Programları Yönetimi</h2>

      {/* Yeni Program Ekle Butonu */}
      {!showProgramForm && (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <button 
            className="btn-add-program"
            onClick={() => {
              setShowProgramForm(true);
              setEditingProgramId(null);
              setFormData({});
            }}
            style={{
              padding: '1.5rem 3rem',
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #4ca175 0%, #3d8a5e 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 4px 12px rgba(76, 161, 117, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: '1.5rem' }}>+</span>
            Yeni Program Ekle
          </button>
        </div>
      )}

      {/* Program Ekleme/Düzenleme Formu */}
      {showProgramForm && (
        <form className="admin-form" onSubmit={editingProgramId ? handleUpdateProgram : handleAddProgram}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>{editingProgramId ? '✏️ Programı Düzenle' : '➕ Yeni Program Ekle'}</h3>
            <button 
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowProgramForm(false);
                setEditingProgramId(null);
                setFormData({});
              }}
              style={{ padding: '0.5rem 1.5rem' }}
            >
              ✕ İptal
            </button>
          </div>
        <div className="form-section">
          <h4 className="section-title">📋 Temel Bilgiler</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Program Adı *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Yağ Yakma - Başlangıç"
                required
              />
            </div>

            <div className="form-group">
              <label>Kategori</label>
              <select
                value={formData.category || 'fat_loss'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="fat_loss">Yağ Yakma</option>
                <option value="muscle_gain">Kas Kazanma</option>
                <option value="recomposition">Rekompozisyon</option>
                <option value="wellness">Sağlıklı Yaşam</option>
                <option value="medical">Medikal</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hedef</label>
              <select
                value={formData.goal || 'fat_loss'}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              >
                {goalOptions.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Zorluk Seviyesi</label>
              <select
                value={formData.difficulty || 'beginner'}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="beginner">Başlangıç</option>
                <option value="intermediate">Orta</option>
                <option value="advanced">İleri</option>
              </select>
            </div>

            <div className="form-group">
              <label>Diyet Türü</label>
              <select
                value={formData.dietType || 'balanced'}
                onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
              >
                {dietTypes.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Program Süresi (hafta)</label>
              <input
                type="number"
                value={formData.durationWeeks || ''}
                onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value })}
                placeholder="12"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Açıklama</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Program hakkında açıklama..."
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h4 className="section-title">🥗 Beslenme ve Makro</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Günlük Kalori *</label>
              <input
                type="number"
                value={formData.calories || ''}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                placeholder="2000"
                required
              />
            </div>
            <div className="form-group">
              <label>Protein (g)</label>
              <input
                type="number"
                value={formData.protein || ''}
                onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                placeholder="150"
              />
            </div>
            <div className="form-group">
              <label>Karbonhidrat (g)</label>
              <input
                type="number"
                value={formData.carbs || ''}
                onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                placeholder="200"
              />
            </div>
            <div className="form-group">
              <label>Yağ (g)</label>
              <input
                type="number"
                value={formData.fat || ''}
                onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                placeholder="65"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Günlük Öğün Sayısı</label>
              <input
                type="number"
                value={formData.mealsPerDay || ''}
                onChange={(e) => setFormData({ ...formData, mealsPerDay: e.target.value })}
                placeholder="3"
              />
            </div>
            <div className="form-group">
              <label>Günlük Yineleme</label>
              <select
                value={formData.repetitionType || 'steady'}
                onChange={(e) => setFormData({ ...formData, repetitionType: e.target.value })}
              >
                <option value="steady">Eşit</option>
                <option value="variable">Değişken</option>
                <option value="rotation">Rotasyon</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notlar</label>
              <textarea
                rows="2"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Özel talimatlar, alerjen uyarıları..."
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4 className="section-title">🎯 Hedef Kitlesi</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Yaş Aralığı</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={formData.ageMin || ''}
                  onChange={(e) => setFormData({ ...formData, ageMin: e.target.value })}
                  placeholder="18"
                />
                <span>-</span>
                <input
                  type="number"
                  value={formData.ageMax || ''}
                  onChange={(e) => setFormData({ ...formData, ageMax: e.target.value })}
                  placeholder="60"
                />
              </div>
            </div>

            <div className="form-group">
              <label>BMI Aralığı</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={formData.bmiMin || ''}
                  onChange={(e) => setFormData({ ...formData, bmiMin: e.target.value })}
                  placeholder="18.5"
                  step="0.1"
                />
                <span>-</span>
                <input
                  type="number"
                  value={formData.bmiMax || ''}
                  onChange={(e) => setFormData({ ...formData, bmiMax: e.target.value })}
                  placeholder="30"
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Cinsiyet</label>
              <select
                value={formData.targetGender || 'any'}
                onChange={(e) => setFormData({ ...formData, targetGender: e.target.value })}
              >
                <option value="any">Farketmez</option>
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Aktivite Seviyesi</label>
            <div className="chip-group">
              {activityOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`chip ${
                    (formData.activityLevels || ['sedentary']).includes(opt.value) ? 'active' : ''
                  }`}
                  onClick={() => toggleArrayValue('activityLevels', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Etiketler (virgül ile)</label>
            <input
              type="text"
              value={formData.tags || ''}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="ör: glütensiz, ofis, hızlı öğün"
            />
          </div>
        </div>

        <div className="form-section">
          <h4 className="section-title">🔐 Erişim & Fiyat</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Gerekli Paket</label>
              <select
                value={formData.requiredPackage || 'free'}
                onChange={(e) => setFormData({ ...formData, requiredPackage: e.target.value })}
              >
                {packageOptions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Fiyat (₺)</label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
          {editingProgramId ? '💾 Güncelle' : '➕ Program Ekle'}
        </button>
      </form>
      )}

      {/* Programlar Listesi */}
      <div className="admin-list" style={{ marginTop: '2rem' }}>
        <h3>Mevcut Programlar ({programs.length})</h3>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>
            <i className="fa fa-spinner fa-spin"></i> Yükleniyor...
          </p>
        ) : programs.length > 0 ? (
          <div className="programs-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            {programs.map((program) => (
              <div 
                key={program.id} 
                className="program-card-admin"
                onClick={() => setSelectedProgram(program)}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#4ca175';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(76, 161, 117, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="program-badge" style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: '#4ca175',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {labelFrom(packageOptions, program.accessLevel || program.requiredPackage)}
                </div>

                <h4 style={{ color: '#c4c4c4', marginBottom: '0.5rem', paddingRight: '4rem' }}>
                  {program.title || program.name}
                </h4>
                
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                  {program.description?.substring(0, 100)}{program.description?.length > 100 ? '...' : ''}
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <span style={{ background: '#0f172a', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>
                    <i className="fa fa-fire" style={{ color: '#ef4444', marginRight: '0.25rem' }}></i>
                    {program.calories} kcal
                  </span>
                  <span style={{ background: '#0f172a', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>
                    <i className={`fa ${program.gender === 'male' ? 'fa-mars' : 'fa-venus'}`} 
                       style={{ color: program.gender === 'male' ? '#3b82f6' : '#ec4899', marginRight: '0.25rem' }}></i>
                    {program.gender === 'male' ? 'Erkek' : 'Kadın'}
                  </span>
                </div>

                <div style={{ 
                  marginTop: '1rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid #334155',
                  fontSize: '0.8rem',
                  color: '#94a3b8'
                }}>
                  P{program.macros?.proteinPercent || program.macros?.protein || 0}% • 
                  K{program.macros?.carbPercent || program.macros?.carbs || 0}% • 
                  Y{program.macros?.fatPercent || program.macros?.fat || 0}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <i className="fa fa-folder-open" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
            <p>Henüz program eklenmemiş. Yukarıdaki butona tıklayarak ilk programınızı ekleyin.</p>
          </div>
        )}
      </div>

      {/* Program Detay Modalı */}
      {selectedProgram && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedProgram(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1e293b',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              border: '1px solid #334155'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ color: '#c4c4c4', marginBottom: '0.5rem' }}>
                  {selectedProgram.title || selectedProgram.name}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ 
                    background: '#4ca175', 
                    color: 'white', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {labelFrom(packageOptions, selectedProgram.accessLevel || selectedProgram.requiredPackage)}
                  </span>
                  <span style={{ 
                    background: '#0f172a', 
                    color: '#94a3b8', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}>
                    {selectedProgram.calories} kcal
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProgram(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#4ca175', fontSize: '1rem', marginBottom: '0.5rem' }}>Açıklama</h3>
              <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>{selectedProgram.description || 'Açıklama eklenmemiş.'}</p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1rem',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#0f172a',
              borderRadius: '8px'
            }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Cinsiyet:</span>
                <p style={{ color: '#c4c4c4', fontWeight: '600', margin: '0.25rem 0 0 0' }}>
                  {selectedProgram.gender === 'male' ? '👨 Erkek' : '👩 Kadın'}
                </p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Zorluk:</span>
                <p style={{ color: '#c4c4c4', fontWeight: '600', margin: '0.25rem 0 0 0' }}>
                  {difficultyToTurkish(selectedProgram.difficulty) || 'Belirtilmemiş'}
                </p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Makro Dağılımı:</span>
                <p style={{ color: '#c4c4c4', fontWeight: '600', margin: '0.25rem 0 0 0' }}>
                  P{selectedProgram.macros?.proteinPercent || 0}% • 
                  K{selectedProgram.macros?.carbPercent || 0}% • 
                  Y{selectedProgram.macros?.fatPercent || 0}%
                </p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Süre:</span>
                <p style={{ color: '#c4c4c4', fontWeight: '600', margin: '0.25rem 0 0 0' }}>
                  {selectedProgram.durationWeeks || '-'} hafta
                </p>
              </div>
            </div>

            {selectedProgram.tips && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#4ca175', fontSize: '1rem', marginBottom: '0.5rem' }}>💡 İpuçları</h3>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedProgram.tips}</p>
              </div>
            )}

            {selectedProgram.weeklyMenu && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#4ca175', fontSize: '1rem', marginBottom: '0.5rem' }}>📅 Haftalık Menü</h3>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedProgram.weeklyMenu}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                className="btn-primary"
                onClick={() => handleEditProgram(selectedProgram)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#4ca175',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}
              >
                ✏️ Düzenle
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  handleDeleteProgram(selectedProgram.id);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}
              >
                🗑️ Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAdminQuotes = () => (
    <div className="tab-content">
      <h2>💡 Motivasyon Sözleri Yönetimi</h2>

      <form className="admin-form" onSubmit={handleAddQuote}>
        <div className="form-group">
          <label>Söz Metni *</label>
          <textarea
            value={formData.quoteText || ''}
            onChange={(e) => setFormData({ ...formData, quoteText: e.target.value })}
            placeholder="Motivasyonel söz girin..."
            rows="2"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Yazar</label>
            <input
              type="text"
              value={formData.author || ''}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Anonim"
            />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select
              value={formData.category || 'genel'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="genel">Genel</option>
              <option value="motivasyon">Motivasyon</option>
              <option value="basarı">Başarı</option>
              <option value="sağlık">Sağlık</option>
              <option value="disiplin">Disiplin</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <button type="submit" className="btn-primary">
            {editingQuoteId ? '✏️ Güncelle' : '➕ Söz Ekle'}
          </button>
          {editingQuoteId && (
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handleCancelEdit}
            >
              ❌ İptal
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        <h3>Motivasyon Sözleri ({quotes.length})</h3>
        {loading ? (
          <p>Yükleniyor...</p>
        ) : quotes.length > 0 ? (
          <div className="list-items">
            {quotes.map((quote) => (
              <div key={quote.id} className="list-item">
                <div className="item-info">
                  <p className="quote-text">"{quote.text}"</p>
                  <small>
                    — {quote.author} • {quote.category?.toUpperCase()}
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-primary"
                    onClick={() => handleEditQuote(quote)}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteQuote(quote.id)}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Henüz söz yok.</p>
        )}
      </div>
    </div>
  );

  const renderAdminUsers = () => (
    <div className="tab-content">
      <h2>👥 Kullanıcı Yönetimi</h2>

      {editingUserId && (
        <form className="admin-form" onSubmit={handleUpdateUser} style={{ marginBottom: '2rem' }}>
          <h3>👤 Kullanıcı Düzenle</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Ad *</label>
              <input
                type="text"
                value={formData.userName || ''}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                placeholder="Adı girin"
                required
              />
            </div>
            <div className="form-group">
              <label>Soyadı *</label>
              <input
                type="text"
                value={formData.userSurname || ''}
                onChange={(e) => setFormData({ ...formData, userSurname: e.target.value })}
                placeholder="Soyadı girin"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>E-posta</label>
              <input
                type="email"
                value={formData.userEmail || ''}
                disabled
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
              />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select
                value={formData.userRole || 'user'}
                onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
              >
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Durum</label>
              <select
                value={formData.userStatus || 'active'}
                onChange={(e) => setFormData({ ...formData, userStatus: e.target.value })}
              >
                <option value="active">Aktif</option>
                <option value="banned">Engellendi</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <button type="submit" className="btn-primary">✅ Güncelle</button>
            <button type="button" className="btn-secondary" onClick={handleCancelUserEdit}>❌ İptal</button>
          </div>
        </form>
      )}

      <div className="admin-list">
        {selectedUserId ? (
          <UserDetail uid={selectedUserId} onBack={() => setSelectedUserId(null)} />
        ) : (
          <>
            <h3>Kayıtlı Kullanıcılar ({users.length})</h3>
            {loading ? (
              <p>Yükleniyor...</p>
            ) : users.length > 0 ? (
              <div className="list-items">
                {users.map((user) => (
                  <div key={user.id} className="list-item">
                    <div className="item-info">
                      <h4>{user.name && user.surname ? `${user.name} ${user.surname}` : user.email}</h4>
                      <p>{user.email}</p>
                      <small>
                        Rol: <strong>{user.role === 'admin' ? '🔧 Admin' : '👤 Kullanıcı'}</strong> • Durum: <strong>{user.status === 'banned' ? '⛔ Engellendi' : '✅ Aktif'}</strong>
                      </small>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => setSelectedUserId(user.id)}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      >
                        👁️ Bilgileri Görüntüle
                      </button>
                      <button
                        className={`btn-${user.status === 'banned' ? 'success' : 'warning'}`}
                        onClick={() =>
                          handleToggleUserStatus(user.id, user.status || 'active')
                        }
                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      >
                        {user.status === 'banned' ? '✅ Aktivleştir' : '⛔ Engelle'}
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteUser(user.id)}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Henüz kullanıcı yok.</p>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderAdminPricing = () => (
    <div className="tab-content">
      <h2>💰 Fiyatlandırma Yönetimi</h2>

      <form className="admin-form" onSubmit={handleAddPricing}>
        <h3>{editingPricingId ? '✏️ Plan Düzenle' : '➕ Yeni Plan Ekle'}</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Plan ID (Sistem Adı) *</label>
            <select
              value={formData.planId || ''}
              onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
              disabled={editingPricingId}
              required
            >
              <option value="">Seçiniz...</option>
              <option value="free">free (Ücretsiz)</option>
              <option value="basic">basic (Temel)</option>
              <option value="premium">premium (Premium)</option>
              <option value="plus">plus (Plus+)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Plan Adı *</label>
            <input
              type="text"
              value={formData.planName || ''}
              onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
              placeholder="Örn: Premium, Pro, Plus"
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Fiyat *</label>
            <input
              type="number"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="99"
              required
            />
          </div>
          <div className="form-group">
            <label>Para Birimi</label>
            <input
              type="text"
              value={formData.currency || '₺'}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              placeholder="₺"
            />
          </div>
          <div className="form-group">
            <label>Fatura Dönemi</label>
            <select
              value={formData.billingPeriod || 'monthly'}
              onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value })}
            >
              <option value="monthly">Aylık</option>
              <option value="yearly">Yıllık</option>
              <option value="lifetime">Seumur Boyu</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Aktif</label>
            <select
              value={formData.active !== false ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
            >
              <option value="true">Evet</option>
              <option value="false">Hayır</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>En Popüler</label>
            <select
              value={formData.isPopular !== false ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isPopular: e.target.value === 'true' })}
            >
              <option value="false">Hayır</option>
              <option value="true">Evet</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Açıklama</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Plan hakkında kısa açıklama..."
            rows="2"
          />
        </div>

        <div className="form-group">
          <label>Özellikler (Her satırda bir özellik)</label>
          <textarea
            value={formData.features || ''}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            placeholder="Sınırsız Programlar&#10;Premium Destek&#10;Özel Danışmanlık"
            rows="4"
          />
        </div>

        <div className="form-row">
          <button type="submit" className="btn-primary">
            {editingPricingId ? '✏️ Planı Güncelle' : '➕ Plan Ekle'}
          </button>
          {editingPricingId && (
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handleCancelPricingEdit}
            >
              ❌ İptal
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        <h3>Fiyatlandırma Planları ({pricing.length})</h3>
        {loading ? (
          <p>Yükleniyor...</p>
        ) : pricing.length > 0 ? (
          <div className="list-items">
            {pricing.map((plan) => (
              <div key={plan.id} className="list-item">
                <div className="item-info">
                  <h4>{plan.planName}</h4>
                  <p>
                    <strong>{plan.price} {plan.currency} / {plan.billingPeriod === 'monthly' ? 'ay' : plan.billingPeriod === 'yearly' ? 'yıl' : 'Seumur Boyu'}</strong>
                  </p>
                  <p>{plan.description}</p>
                  {plan.features && plan.features.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <small style={{ color: '#666' }}>
                        <strong>Özellikler:</strong> {plan.features.join(', ')}
                      </small>
                    </div>
                  )}
                  <small style={{ marginTop: '0.5rem', display: 'block' }}>
                    Durum: {plan.active !== false ? '✅ Aktif' : '❌ Pasif'}
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn-primary"
                    onClick={() => handleEditPricing(plan)}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeletePricing(plan.id)}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Henüz fiyatlandırma planı yok.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <Header userEmail={profile?.email} />
      <div className="dashboard__body">
        <Sidebar active={activeTab} onSelect={handleTabSelect} />
        <main className="dashboard__main">{renderContent()}</main>
      </div>
    </div>
  );
}