import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../services/firebase";
import PostCard from "../components/PostCard";
import "./Community.css";

export default function ArchivedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchArchived = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/community/posts/archived", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Arşivler alınamadı");
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArchived(); }, []);

  const handleArchiveToggle = async (post, archived) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/community/posts/${post.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ archived }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncellenemedi");
      fetchArchived();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm("Bu paylaşımı kalıcı olarak silmek istiyor musun?")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/community/posts/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Silinemedi");
      fetchArchived();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="community-page">
      <div className="community-header">
        <div>
          <h2>Arşivlenen Gönderilerim</h2>
          <p>Buradan geri yükleyebilir veya kalıcı silebilirsin.</p>
        </div>
        <Link to="/community" className="link-btn">Topluluk Feed</Link>
      </div>
      {error && <div className="community-error">{error}</div>}
      {loading ? <div>Yükleniyor...</div> : (
        <div className="community-feed">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              currentUserId={auth.currentUser?.uid}
              onArchive={handleArchiveToggle}
              onDelete={handleDelete}
            />
          ))}
          {posts.length === 0 && <div>Arşivli gönderi yok.</div>}
        </div>
      )}
    </div>
  );
}
