import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useToastContext } from '../contexts/ToastContext';
import './UserStories.css';

function UserStories() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [userStory, setUserStory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    weight_before: '',
    weight_after: '',
    duration: '',
    images: [null, null, null, null], // 4 resim
  });

  // Hikayeler listesini çek
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const q = query(collection(db, 'userStories'));
        const snapshot = await getDocs(q);
        setStories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Hikayeler yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Mevcut kullanıcının hikayesini kontrol et
  useEffect(() => {
    if (user) {
      const userStoryData = stories.find(s => s.userId === user.uid);
      setUserStory(userStoryData || null);
    }
  }, [user, stories]);

  const handleImageChange = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...formData.images];
        newImages[index] = reader.result;
        setFormData({ ...formData, images: newImages });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Hikaye paylaşmak için giriş yapmalısınız 🔐', 'info');
      navigate('/login');
      return;
    }

    if (!formData.title || !formData.description || formData.images.filter(img => img !== null).length < 2) {
      showToast('Lütfen tüm alanları doldurun ve en az 2 resim ekleyin ⚠️', 'error');
      return;
    }

    try {
      setLoading(true);
      const storyData = {
        userId: user.uid,
        userName: user.displayName || 'Anonim',
        userEmail: user.email,
        ...formData,
        createdAt: new Date(),
        likes: 0,
      };

      if (userStory) {
        // Mevcut hikayeyi sil ve yenisini ekle
        await deleteDoc(doc(db, 'userStories', userStory.id));
      }

      await addDoc(collection(db, 'userStories'), storyData);
      showToast('Hikayeniz başarıyla paylaşıldı! ✨', 'success');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        weight_before: '',
        weight_after: '',
        duration: '',
        images: [null, null, null, null],
      });

      // Listeyi yenile
      const q = query(collection(db, 'userStories'));
      const snapshot = await getDocs(q);
      setStories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Hikaye kaydedilemedi:', error);
      showToast('Hikaye kaydedilirken hata oluştu 💾', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-stories-page">
      <div className="stories-header">
        <h1>🌟 Başarı Hikayelerimiz</h1>
        <p>Gerçek insanlar, gerçek sonuçlar. Onların başarısından esin al ve sen de değişimi başlat!</p>
        {user && (
          <button
            className="btn-share-story"
            onClick={() => setShowForm(!showForm)}
          >
            {userStory ? '📝 Hikayeni Güncelle' : '✍️ Hikayeni Paylaş'}
          </button>
        )}
      </div>

      {/* Hikaye Paylaşma Formu */}
      {showForm && (
        <div className="story-form-container">
          <div className="story-form">
            <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
            <h2>{userStory ? 'Hikayeni Güncelle' : 'Hikayeni Paylaş'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Başlık (örn: 3 Ayda -15 KG)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Başlığınız"
                  maxLength={60}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Başlangıç Kilosu (kg)</label>
                  <input
                    type="number"
                    value={formData.weight_before}
                    onChange={(e) => setFormData({ ...formData, weight_before: e.target.value })}
                    placeholder="75"
                  />
                </div>
                <div className="form-group">
                  <label>Final Kilosu (kg)</label>
                  <input
                    type="number"
                    value={formData.weight_after}
                    onChange={(e) => setFormData({ ...formData, weight_after: e.target.value })}
                    placeholder="60"
                  />
                </div>
                <div className="form-group">
                  <label>Süre (örn: 3 Ay)</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="3 Ay"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Hikayeni Anlatır (min 100 karakter)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deneyimini, zorlukları ve başarını anlatır..."
                  rows={6}
                  minLength={100}
                  maxLength={1000}
                />
                <small>{formData.description.length}/1000</small>
              </div>

              <div className="images-section">
                <label>Resimler (En az 2, En fazla 4)</label>
                <p className="images-hint">İlk resim: Başlangıç | 2. Resim: Son | 3-4 Resim: Süreci gösteren resimler</p>
                <div className="image-grid">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="image-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(index, e.target.files[0])}
                        id={`image-${index}`}
                      />
                      <label htmlFor={`image-${index}`}>
                        {formData.images[index] ? (
                          <img src={formData.images[index]} alt={`Resim ${index + 1}`} />
                        ) : (
                          <div className="image-placeholder">
                            <span>+</span>
                            <p>Resim {index + 1}</p>
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Kaydediliyor...' : 'Hikayeni Paylaş'}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hikayeler Listesi */}
      <div className="stories-grid">
        {loading ? (
          <p className="loading">Hikayeler yükleniyor...</p>
        ) : stories.length === 0 ? (
          <div className="empty-state">
            <p>Henüz hiç hikaye yok. İlk hikayeyi paylaş!</p>
          </div>
        ) : (
          stories.map((story) => (
            <div key={story.id} className="story-card">
              {/* Resim Galerisi */}
              {story.images && story.images.length > 0 && (
                <div className="story-images">
                  <div className="main-image">
                    <img src={story.images[0]} alt="Başlangıç" />
                  </div>
                  {story.images.length > 1 && (
                    <div className="thumbnail-row">
                      {story.images.map((img, idx) => (
                        img && (
                          <div key={idx} className="thumbnail">
                            <img src={img} alt={`Resim ${idx + 1}`} />
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Hikaye İçeriği */}
              <div className="story-content">
                <h3>{story.title}</h3>
                
                {/* İstatistikler */}
                <div className="story-stats">
                  {story.weight_before && story.weight_after && (
                    <div className="stat">
                      <span className="before">{story.weight_before} kg</span>
                      <span className="arrow">→</span>
                      <span className="after">{story.weight_after} kg</span>
                    </div>
                  )}
                  {story.duration && (
                    <div className="stat">
                      <span className="duration">⏱️ {story.duration}</span>
                    </div>
                  )}
                </div>

                {/* Hikaye Metni */}
                <p className="story-text">{story.description}</p>

                {/* Kullanıcı Bilgisi */}
                <div className="story-author">
                  <p className="author-name">{story.userName}</p>
                  <p className="story-date">
                    {new Date(story.createdAt?.toDate?.()).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UserStories;
