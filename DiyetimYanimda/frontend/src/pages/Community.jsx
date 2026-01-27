import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../services/firebase";
import PostCard from "../components/PostCard";
import "./Community.css";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

export default function Community() {
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterMode, setFilterMode] = useState("all"); // all | mine | archived
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | likes | comments
  const [tagFilter, setTagFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showCreateHint, setShowCreateHint] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/community/posts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gönderiler alınamadı");
      const enriched = (data.posts || []).map((p) => ({
        ...p,
        liked: user ? (p.likedBy || []).includes(user.uid) : false,
      }));
      setPosts(enriched);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      const key = `createHintSeen:${user.uid}`;
      if (!localStorage.getItem(key)) {
        setShowCreateHint(true);
      } else {
        setShowCreateHint(false);
      }
    }
  }, [user]);

  useEffect(() => {
    const targetPostId = searchParams.get("postId");
    if (!targetPostId || posts.length === 0) return;
    const el = document.getElementById(`post-${targetPostId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("highlight-post");
      setTimeout(() => el.classList.remove("highlight-post"), 1500);
    }
  }, [posts, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) {
      setError("Başlık gereklidir");
      return;
    }
    if (!description.trim()) {
      setError("Açıklama gereklidir");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
      
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, description, tags: tagsArray }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Paylaşım başarısız");
      setTitle("");
      setDescription("");
      setTags("");
      setPosts((prev) => [data.post, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p))
    );
  };

  const handleCreateClick = () => {
    setShowForm((prev) => !prev);
    if (user) {
      const key = `createHintSeen:${user.uid}`;
      localStorage.setItem(key, "1");
    }
    setShowCreateHint(false);
  };

  const handleCloseHint = () => {
    setShowCreateHint(false);
    if (user) {
      const key = `createHintSeen:${user.uid}`;
      localStorage.setItem(key, "1");
    }
  };

  const trendingTags = useMemo(() => {
    const counts = {};
    posts.forEach((p) => (p.tags || []).forEach((t) => {
      const k = String(t).toLowerCase();
      counts[k] = (counts[k] || 0) + 1;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);
  }, [posts]);

  const displayedPosts = useMemo(() => {
    let list = [...posts];

    // Segment filter
    if (filterMode === "mine" && user) {
      list = list.filter((p) => p.userId === user.uid && !p.archived);
    } else if (filterMode === "archived") {
      list = list.filter((p) => p.archived);
    } else {
      // default "all" -> arşivdekileri gizle
      list = list.filter((p) => !p.archived);
    }

    // Tag filter
    if (tagFilter) {
      list = list.filter((p) => (p.tags || []).some((t) => String(t).toLowerCase() === tagFilter.toLowerCase()));
    }

    // Text search
    const q = searchText.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const inTitle = String(p.title || "").toLowerCase().includes(q);
        const inDesc = String(p.description || "").toLowerCase().includes(q);
        const inTags = (p.tags || []).some((t) => String(t).toLowerCase().includes(q));
        return inTitle || inDesc || inTags;
      });
    }

    // Sorting
    if (sortBy === "likes") {
      list.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    } else if (sortBy === "comments") {
      list.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return list;
  }, [posts, filterMode, searchText, sortBy, tagFilter, user]);

  return (
    <div className="community-container">
      <div className="community-header">
        <h1>Topluluk Forumları</h1>
        <p>Düşüncelerini, deneyimlerini ve fikirlerini paylaş ve diğer üyelerle etkileşime geç.</p>
      </div>

      {user && showForm && (
        <form className="post-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Başlık *</label>
            <input
              id="title"
              type="text"
              placeholder="Konunun başlığını yazın"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength="100"
              required
            />
            <small>{title.length}/100</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Açıklama *</label>
            <textarea
              id="description"
              placeholder="Düşüncelerini ve deneyimlerini ayrıntılı bir şekilde paylaş..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength="1000"
              rows="6"
              required
            />
            <small>{description.length}/1000</small>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Etiketler</label>
            <input
              id="tags"
              type="text"
              placeholder="Etiketler (virgülle ayırın, örn: sağlık, fitness, beslenme)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "⏳ Gönderiliyor..." : "✨ Gönder"}
          </button>
        </form>
      )}

      {!user && (
        <div style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "32px",
          textAlign: "center"
        }}>
          <p style={{ margin: 0, color: "#e2e8f0", fontSize: "15px", fontWeight: 600 }}>
            Gönderi paylaşmak ve yorum yapmak için <Link to="/login" style={{ color: "#60a5fa", fontWeight: 700 }}>giriş yapın</Link> veya <Link to="/register" style={{ color: "#60a5fa", fontWeight: 700 }}>kaydolun</Link>.
          </p>
        </div>
      )}

      {loading && (
        <div className="skeleton-feed">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="sk-header">
                <div className="sk-avatar" />
                <div className="sk-lines">
                  <div className="sk-line short" />
                  <div className="sk-line xshort" />
                </div>
              </div>
              <div className="sk-line" />
              <div className="sk-line" />
              <div className="sk-line long" />
            </div>
          ))}
        </div>
      )}
      {!loading && posts.length === 0 && <p className="no-posts">Henüz hiç gönderi yok. İlk gönderiyi sen yap! 🚀</p>}

      <div className="feed-tools">
        <div className="tools-top">
          <div className="segment-control" role="tablist" aria-label="Filtreler">
            <button className={`segment ${filterMode === "all" ? "active" : ""}`} onClick={() => setFilterMode("all")}>Tümü</button>
            <button className={`segment ${filterMode === "mine" ? "active" : ""}`} onClick={() => setFilterMode("mine")}>Benim</button>
            <button className={`segment ${filterMode === "archived" ? "active" : ""}`} onClick={() => setFilterMode("archived")}>Arşiv</button>
          </div>
          {user && (
            <div className="create-new">
              <button className="create-button-round" onClick={handleCreateClick} aria-label="Yeni gönderi paylaş">
                +
              </button>
              {showCreateHint && (
                <div className="hint-bubble">
                  <span>Buraya tıklayarak gönderi paylaşabilirsiniz.</span>
                  <button className="hint-close" onClick={handleCloseHint}>×</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="search-sort">
          <input
            type="text"
            placeholder="Ara: başlık, açıklama veya etiket"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">En Yeni</option>
            <option value="likes">En Çok Beğeni</option>
            <option value="comments">En Çok Yorum</option>
          </select>
        </div>
        {trendingTags.length > 0 && (
          <div className="trending-tags">
            <span className="trend-label">Trend:</span>
            {trendingTags.map((t) => (
              <button key={t} className={`trend-chip ${tagFilter === t ? "active" : ""}`} onClick={() => setTagFilter(tagFilter === t ? "" : t)}>
                #{t}
              </button>
            ))}
            {tagFilter && (
              <button className="trend-clear" onClick={() => setTagFilter("")}>Temizle</button>
            )}
          </div>
        )}
      </div>

      <div className="posts-feed">
        {displayedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostUpdate={handlePostUpdate}
            onPostDelete={handlePostDelete}
            currentUserId={user?.uid}
          />
        ))}
      </div>
    </div>
  );
}
