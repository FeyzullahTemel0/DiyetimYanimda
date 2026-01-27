import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import './SuccessStories.css';
import { Link } from 'react-router-dom';

export default function SuccessStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'successStories'));
      const storiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStories(storiesData);
    } catch (error) {
      console.error('Hikayeler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStories = filter === 'featured' 
    ? stories.filter(s => s.featured) 
    : stories;

  return (
    <div className="success-stories-page">
      {/* Hero Section */}
      <section className="success-hero">
        <div className="success-hero-content">
          <h1>🌟 Başarı Hikayeleri</h1>
          <p className="success-hero-subtitle">
            Gerçek insanlar, gerçek sonuçlar. Onların başarısı senin motivasyonun olsun!
          </p>
          <div className="success-stats-row">
            <div className="stat-box">
              <h3>3,850+</h3>
              <p>Başarılı Dönüşüm</p>
            </div>
            <div className="stat-box">
              <h3>42,000+ KG</h3>
              <p>Kaybedilen Ağırlık</p>
            </div>
            <div className="stat-box">
              <h3>98%</h3>
              <p>Memnuniyet Oranı</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tümü ({stories.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'featured' ? 'active' : ''}`}
            onClick={() => setFilter('featured')}
          >
            ⭐ Öne Çıkanlar ({stories.filter(s => s.featured).length})
          </button>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="stories-grid-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Başarı hikayeleri yükleniyor...</p>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="empty-state">
            <h3>Henüz hikaye eklenmemiş</h3>
            <p>İlk hikayeyi sen paylaş!</p>
          </div>
        ) : (
          <div className="stories-grid">
            {filteredStories.map(story => (
              <div key={story.id} className="story-card">
                {story.featured && <span className="featured-badge">⭐ Öne Çıkan</span>}
                
                {(story.beforeImage || story.afterImage) && (
                  <div className="story-images">
                    {story.beforeImage && (
                      <div className="story-img-wrapper">
                        <img src={story.beforeImage} alt="Öncesi" />
                        <span className="img-label">Öncesi</span>
                      </div>
                    )}
                    {story.afterImage && (
                      <div className="story-img-wrapper">
                        <img src={story.afterImage} alt="Sonrası" />
                        <span className="img-label">Sonrası</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="story-content">
                  <h3 className="story-name">{story.name}</h3>
                  <p className="story-result">{story.result}</p>
                  
                  {story.quote && (
                    <blockquote className="story-quote">
                      "{story.quote}"
                    </blockquote>
                  )}
                  
                  <div className="story-date">
                    {story.createdAt && new Date(story.createdAt.seconds * 1000).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="success-cta-section">
        <div className="success-cta-content">
          <h2>Sen de Başarı Hikayelerinden Biri Ol!</h2>
          <p>Binlerce kişi hedeflerine ulaştı. Sırada sen varsın.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              15 Günlük Ücretsiz Denemeyi Başlat
            </Link>
            <Link to="/pricing" className="btn btn-secondary btn-large">
              Planları İncele
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
