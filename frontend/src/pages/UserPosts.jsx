import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PostCard from "../components/PostCard";
import "./Community.css";

export default function UserPosts() {
  const { uid } = useParams();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/community/users/${uid}/posts`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gönderiler alınamadı");
        setPosts(data.posts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [uid]);

  return (
    <div className="community-page">
      <div className="community-header">
        <div>
          <h2>Kullanıcının Gönderileri</h2>
          <p>{uid}</p>
        </div>
        <Link to="/community" className="link-btn">Topluluk Feed</Link>
      </div>
      {error && <div className="community-error">{error}</div>}
      {loading ? <div>Yükleniyor...</div> : (
        <div className="community-feed">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} currentUserId={user?.uid} showActions={false} />
          ))}
          {posts.length === 0 && <div>Gönderi yok.</div>}
        </div>
      )}
    </div>
  );
}
