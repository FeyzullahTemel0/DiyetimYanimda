import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../services/firebase";
import CommentSection from "./CommentSection";
import "./PostCard.css";

export default function PostCard({ post, currentUserId, onPostUpdate, onPostDelete, showActions = true }) {
  const [liked, setLiked] = useState(post.liked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [error, setError] = useState("");
  const [showComments, setShowComments] = useState(false);

  const created = post.createdAt ? new Date(post.createdAt) : null;
  const isOwner = currentUserId === post.userId;

  const handleLike = async () => {
    if (!currentUserId) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/community/posts/${post.id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Beğeni başarısız");
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleArchive = async () => {
    if (!currentUserId) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/community/posts/${post.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ archived: !post.archived }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Arşivleme başarısız");
      onPostUpdate?.({ ...post, archived: !post.archived });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!currentUserId || !window.confirm("Bu paylaşımı silmek istediğine emin misin?")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/community/posts/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Silme başarısız");
      onPostDelete?.(post.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const initials = (post.userName || "K").split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatarUrl = post.userAvatarUrl;

  return (
    <div className="post-card" id={`post-${post.id}`}>
      <div className="post-header">
        <div className="post-user">
          <div className="post-avatar" aria-label={post.userName || "Kullanıcı"}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={post.userName || "Kullanıcı"} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="post-user-info">
            <Link to={`/community/user/${post.userId}`} className="post-username">
              {post.userName || "Kullanıcı"}
            </Link>
            {created && (
              <span className="post-date">
                {created.toLocaleDateString("tr-TR")} {created.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>
        {isOwner && showActions && (
          <div className="post-owner-menu">
            <button className="post-btn-small" onClick={handleArchive}>
              {post.archived ? "📌" : "📌"}
            </button>
            <button className="post-btn-small danger" onClick={handleDelete}>
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-description">{post.description}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="post-footer">
        <button className={`post-btn-like ${liked ? "liked" : ""}`} onClick={handleLike}>
          ❤️ {likeCount}
        </button>
        <button className="post-comment-count" onClick={() => setShowComments(!showComments)}>
          💬 {commentCount}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {showComments && (
        <CommentSection 
          postId={post.id} 
          currentUserId={currentUserId} 
          isLoggedIn={!!currentUserId}
          onCommentAdded={() => setCommentCount(commentCount + 1)}
          onCommentDeleted={() => setCommentCount(Math.max(0, commentCount - 1))}
        />
      )}
    </div>
  );
}
