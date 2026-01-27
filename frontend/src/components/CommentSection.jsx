import React, { useEffect, useState } from "react";
import { auth } from "../services/firebase";

export default function CommentSection({ postId, currentUserId, isLoggedIn, onCommentAdded, onCommentDeleted }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, currentUserId]);

  const mapWithLikeState = (items = []) =>
    items.map((comment) => ({
      ...comment,
      likeCount: comment.likeCount || 0,
      likedBy: comment.likedBy || [],
      liked: (comment.likedBy || []).includes(currentUserId),
    }));

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/community/posts/${postId}/comments`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yorumlar alınamadı");
      setComments(mapWithLikeState(data.comments));
    } catch (err) {
      console.error("Yorum alma hatası:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || !newComment.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yorum oluşturulamadı");
      setComments((prev) => [...prev, mapWithLikeState([data.comment])[0]]);
      setNewComment("");
      onCommentAdded?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Yorumu silmek istediğine emin misin?")) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/community/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yorum silinemedi");
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentDeleted?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!isLoggedIn) return;
    setError("");

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/community/posts/${postId}/comments/${commentId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Beğeni başarısız");

      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id !== commentId) return comment;

          const nextLikedBy = data.liked
            ? Array.from(new Set([...(comment.likedBy || []), currentUserId]))
            : (comment.likedBy || []).filter((id) => id !== currentUserId);

          return {
            ...comment,
            liked: data.liked,
            likeCount: data.likeCount,
            likedBy: nextLikedBy,
          };
        })
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="comment-section">
      <h3>Yorumlar ({comments.length})</h3>

      {isLoggedIn ? (
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <textarea
            placeholder="Bir yorum yazın..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength="500"
            rows="2"
          />
          <div className="comment-form-footer">
            <small>{newComment.length}/500</small>
            <button type="submit" disabled={submitting || !newComment.trim()}>
              {submitting ? "Gönderiliyor..." : "❤️ Yorum Yap"}
            </button>
          </div>
          {error && <p className="error-text">{error}</p>}
        </form>
      ) : (
        <p className="login-prompt">Yorum yapmak için giriş yapın.</p>
      )}

      <div className="comments-list">
        {loading && <p className="loading-text">Yorumlar yükleniyor...</p>}
        {!loading && comments.length === 0 && <p className="no-comments">Henüz yorum yok.</p>}

        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <strong>{comment.userName}</strong>
              <span className="comment-date">
                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("tr-TR") : ""}
              </span>
            </div>
            <p className="comment-content">{comment.content}</p>
            <div className="comment-actions">
              <button
                className={`comment-like-btn ${comment.liked ? "liked" : ""}`}
                onClick={() => handleLikeComment(comment.id)}
                disabled={!isLoggedIn}
              >
                ❤️ {comment.likeCount || 0}
              </button>
              {currentUserId === comment.userId && (
                <button
                  className="btn-delete-comment"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Sil
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
