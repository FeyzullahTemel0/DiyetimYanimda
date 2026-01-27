import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import "./NutritionNewsletter.css";

const ITEMS_PER_PAGE = 10;
const AI_AUTHOR = {
  name: "DiyetimYanımda AI",
  avatar: "https://robohash.org/diyetimyanimda-ai?set=set4&bgset=bg2",
};

export default function NutritionNewsletter() {
  const { user } = useAuth();
  
  // State
  const [featuredTip, setFeaturedTip] = useState(null);
  const [tips, setTips] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [showCategories, setShowCategories] = useState(() => window.innerWidth > 768);
  const [showTags, setShowTags] = useState(() => window.innerWidth > 768);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowCategories(true);
        setShowTags(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Veri çek - Featured Tip
  useEffect(() => {
    const fetchFeaturedTip = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/nutrition-tips/featured");
        const data = await res.json();
        if (data.success && data.tip) {
          setFeaturedTip(data.tip);
        }
      } catch (err) {
        console.error("Featured tip fetch hatası:", err);
      }
    };

    fetchFeaturedTip();
  }, []);

  // Veri çek - Kategoriler ve Etiketler
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch("http://localhost:5000/api/nutrition-tips/categories"),
          fetch("http://localhost:5000/api/nutrition-tips/tags"),
        ]);

        const catData = await catRes.json();
        const tagData = await tagRes.json();

        if (catData.success) setCategories(catData.categories);
        if (tagData.success) setTags(tagData.tags);
      } catch (err) {
        console.error("Metadata fetch hatası:", err);
      }
    };

    fetchMetadata();
  }, []);

  // Veri çek - İpuçları
  const fetchTips = useCallback(async (pageNum = 1, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: ITEMS_PER_PAGE,
      });

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      const res = await fetch(`http://localhost:5000/api/nutrition-tips?${params}`);
      const data = await res.json();

      if (data.success) {
        if (reset) {
          setTips(data.tips);
        } else {
          setTips((prev) => [...prev, ...data.tips]);
        }
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Tips fetch hatası:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // Kategori değiştiğinde
  useEffect(() => {
    setPage(1);
    fetchTips(1, true);
  }, [selectedCategory, fetchTips]);

  // İlk yüklemede
  useEffect(() => {
    fetchTips(1, true);
  }, []);

  // Daha fazla yükle
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTips(nextPage, false);
  };

  // E-posta abone ol
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      // localStorage'a kaydet
      const emails = JSON.parse(localStorage.getItem("subscribedEmails") || "[]");
      if (!emails.includes(email)) {
        emails.push(email);
        localStorage.setItem("subscribedEmails", JSON.stringify(emails));
      }
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  // Filtrele
  const filteredTips = selectedTag
    ? tips.filter((tip) => tip.tags && tip.tags.includes(selectedTag))
    : tips;

  const tagNameMap = useMemo(() => {
    const map = new Map();
    tags.forEach((tag) => map.set(tag.id, tag.name));
    return map;
  }, [tags]);

  const categoryNameMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  const formatRelativeTime = (dateValue) => {
    const date = new Date(dateValue || Date.now());
    if (isNaN(date.getTime())) return "Şimdi";
    const diffMs = now - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "Şimdi";
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} sa önce`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} g önce`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} hf önce`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} ay önce`;
    const years = Math.floor(days / 365);
    return `${years} yıl önce`;
  };
  return (
    <div className="newsletter-container">
      <div className="newsletter-inner">
        {/* Header */}
        <div className="newsletter-header">
          <div className="header-badge">Beslenme</div>
          <h1>📧 Beslenme İpuçları Bülteni</h1>
          <p>Günlük beslenme ipuçları, tarifler ve sağlıklı yaşam rehberi</p>
        </div>

        {/* Featured Tip */}
        {featuredTip && (
          <div className="featured-tip">
            <div className="featured-top">
              <div className="featured-badge">⭐ GÜNÜN İPUCUSU</div>
              <div className="featured-author">
                <img src={AI_AUTHOR.avatar} alt={AI_AUTHOR.name} />
                <div className="author-text">
                  <p className="author-name">{AI_AUTHOR.name}</p>
                  <p className="author-meta">{categoryNameMap.get(featuredTip.category) || featuredTip.category}</p>
                </div>
              </div>
            </div>
            <h2>{featuredTip.title}</h2>
            <p>{featuredTip.short_description}</p>
            <div className="featured-footer">
              <span className="time-posted">
                {formatRelativeTime(featuredTip.created_at?.toDate?.() || featuredTip.created_at)} paylaşıldı
              </span>
            </div>
          </div>
        )}

        {/* Subscribe Section */}
        <div className="subscribe-section">
          <div className="subscribe-text">
            <h2>📬 Haftanın İpuçlarını Al</h2>
            <p>Her hafta yeni beslenme ipuçları doğrudan e-postanıza gelsin</p>
          </div>
          <form onSubmit={handleSubscribe} className="subscribe-form">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={80}
            />
            <button type="submit">Abone Ol</button>
          </form>
          {subscribed && <p className="success-message">✓ E-postanız kaydedildi!</p>}
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <button
              type="button"
              className="filter-toggle"
              onClick={() => setShowCategories((v) => !v)}
            >
              <span>Kategori</span>
              <span className={`chevron ${showCategories ? "open" : ""}`}>▾</span>
            </button>
            <div className={`filter-chips ${showCategories || !isMobile ? "open" : "collapsed"}`}>
              <button
                className={`filter-chip ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                Tümü
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-chip ${selectedCategory === cat.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="filter-group">
              <button
                type="button"
                className="filter-toggle"
                onClick={() => setShowTags((v) => !v)}
              >
                <span>Etiketler</span>
                <span className={`chevron ${showTags ? "open" : ""}`}>▾</span>
              </button>
              <div className={`filter-chips ${showTags || !isMobile ? "open" : "collapsed"}`}>
                <button
                  className={`filter-chip ${selectedTag === "" ? "active" : ""}`}
                  onClick={() => setSelectedTag("")}
                >
                  Tümü
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    className={`filter-chip ${selectedTag === tag.id ? "active" : ""}`}
                    onClick={() => setSelectedTag(tag.id)}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tips Feed */}
        <div className="tips-feed">
          {filteredTips.length === 0 && !loading && (
            <p className="no-tips">İpucu bulunamadı. Başka bir filtre seçmeyi deneyin.</p>
          )}

          {filteredTips.map((tip) => {
            const createdAt = tip.created_at?.toDate?.() || tip.created_at || Date.now();
            const relative = formatRelativeTime(createdAt);
            // Tag ID veya doğrudan tag name olabilir - her ikisini de kontrol et
            const prettyTags = (tip.tags || []).slice(0, 4).map((tag) => {
              // Eğer tag bir ID ise map'ten ismi al, değilse direkt kullan
              const tagName = tagNameMap.get(tag);
              if (tagName) return tagName;
              // ID değilse, tag name olarak saklanmış olabilir
              const tagObj = tags.find(t => t.name === tag);
              return tagObj ? tagObj.name : tag;
            });

            return (
              <div key={tip.id} className="tip-card">
                <div className="tip-header">
                  <div className="avatar">
                    <img src={AI_AUTHOR.avatar} alt={AI_AUTHOR.name} />
                  </div>
                  <div className="tip-author">
                    <p className="author-name">{AI_AUTHOR.name}</p>
                    <p className="author-meta">{relative}</p>
                  </div>
                  <span className="category-chip">{categoryNameMap.get(tip.category) || tip.category}</span>
                </div>

                <div className="tip-body">
                  <h3>{tip.title}</h3>
                  <p className="tip-description">{tip.short_description}</p>
                </div>

                {prettyTags.length > 0 && (
                  <div className="tip-tags">
                    {prettyTags.map((tag, idx) => (
                      <span key={idx} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="tip-footer">
                  <span className="time-posted">{relative} paylaşıldı</span>
                </div>
              </div>
            );
          })}

          {loading && <p className="loading">Yükleniyor...</p>}

          {hasMore && !loading && filteredTips.length > 0 && (
            <button className="load-more-btn" onClick={loadMore}>
              Daha Fazla Yükle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
