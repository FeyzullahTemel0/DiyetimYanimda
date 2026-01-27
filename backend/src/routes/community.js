const express = require("express");
const router = express.Router();
const { firestore, FieldValue, admin } = require("../services/firebaseAdmin");
const verifyToken = require("../middleware/verifyToken");

const POSTS_COLLECTION = "community_posts";
const COMMENTS_COLLECTION = "community_comments";
const NOTIFICATIONS_COLLECTION = "notifications";

// Simple profanity list (Turkish and English common words)
const PROFANITY_LIST = [
  "fuck", "shit", "damn", "hell", "ass", "bitch",
  "siç", "oç"
];

function containsProfanity(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  // Word boundary matching - only match whole words
  return PROFANITY_LIST.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

async function getUserProfile(uid) {
  const doc = await firestore.collection("users").doc(uid).get();
  return doc.exists ? doc.data() : null;
}

function serializePost(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt ? data.createdAt.toDate() : null,
    updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
  };
}

function serializeComment(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt ? data.createdAt.toDate() : null,
    likeCount: data.likeCount || 0,
    likedBy: data.likedBy || [],
  };
}

function isOwnerOrAdmin(req, userId) {
  return req.user?.uid === userId || req.user?.admin === true;
}

function cleanContent(text) {
  if (!text) return text;
  // Check for profanity
  if (containsProfanity(text)) {
    return null; // Signal that content is inappropriate
  }
  return text.trim();
}

// Create a post (title + description + tags, no media)
router.post("/posts", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { title = "", description = "", tags = [] } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Başlık gereklidir." });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Açıklama gereklidir." });
    }

    // Clean content for profanity
    const cleanTitle = cleanContent(title);
    const cleanDescription = cleanContent(description);
    const cleanTags = (tags || []).map(tag => cleanContent(tag)).filter(t => t);

    if (!cleanTitle || !cleanDescription) {
      return res.status(400).json({ error: "İçerik saygısızlık içermektedir. Lütfen güncelleyiniz." });
    }

    const profile = await getUserProfile(uid);
    const userName = profile ? `${profile.name || ""} ${profile.surname || ""}`.trim() || "Anonim" : "Anonim";

    const docRef = await firestore.collection(POSTS_COLLECTION).add({
      userId: uid,
      userName,
      title: cleanTitle,
      description: cleanDescription,
      tags: cleanTags,
      archived: false,
      likeCount: 0,
      likedBy: [],
      commentCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const created = await docRef.get();
    return res.status(201).json({ post: serializePost(created) });
  } catch (err) {
    console.error("Post oluşturma hatası:", err.message);
    return res.status(500).json({ error: "Post oluşturulamadı: " + err.message });
  }
});

// Public feed
router.get("/posts", async (_req, res) => {
  try {
    const snap = await firestore
      .collection(POSTS_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const posts = snap.docs
      .map(serializePost)
      .filter(post => !post.archived);
    return res.json({ posts });
  } catch (err) {
    console.error("Post listeleme hatası:", err.message);
    return res.status(500).json({ error: "Postlar getirilemedi: " + err.message });
  }
});

// User posts (non-archived)
router.get("/users/:uid/posts", async (req, res) => {
  try {
    const { uid } = req.params;
    const snap = await firestore
      .collection(POSTS_COLLECTION)
      .where("userId", "==", uid)
      .get();

    const posts = snap.docs
      .map(serializePost)
      .filter(post => !post.archived)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return res.json({ posts });
  } catch (err) {
    console.error("Kullanıcı postları hatası:", err.message);
    return res.status(500).json({ error: "Kullanıcı postları getirilemedi: " + err.message });
  }
});

// Archived posts of current user
router.get("/posts/archived", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const snap = await firestore
      .collection(POSTS_COLLECTION)
      .where("userId", "==", uid)
      .get();

    const posts = snap.docs
      .map(serializePost)
      .filter(post => post.archived)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return res.json({ posts });
  } catch (err) {
    console.error("Arşiv postları hatası:", err.message);
    return res.status(500).json({ error: "Arşiv postları getirilemedi: " + err.message });
  }
});

// Toggle archive
router.patch("/posts/:postId/archive", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { archived = true } = req.body || {};
    const docRef = firestore.collection(POSTS_COLLECTION).doc(postId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Post bulunamadı." });
    const data = doc.data();
    if (!isOwnerOrAdmin(req, data.userId)) return res.status(403).json({ error: "Yetkisiz işlem." });

    await docRef.update({ archived: !!archived, updatedAt: FieldValue.serverTimestamp() });
    const updated = await docRef.get();
    return res.json({ post: serializePost(updated) });
  } catch (err) {
    console.error("Arşiv güncelleme hatası", err);
    return res.status(500).json({ error: "Arşiv durumu güncellenemedi." });
  }
});

// Delete post
router.delete("/posts/:postId", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const docRef = firestore.collection(POSTS_COLLECTION).doc(postId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Post bulunamadı." });
    const data = doc.data();
    if (!isOwnerOrAdmin(req, data.userId)) return res.status(403).json({ error: "Yetkisiz işlem." });

    // Delete all comments for this post
    const commentsSnap = await firestore
      .collection(COMMENTS_COLLECTION)
      .where("postId", "==", postId)
      .get();
    
    const batch = firestore.batch();
    commentsSnap.docs.forEach(doc => batch.delete(doc.ref));
    batch.delete(docRef);
    await batch.commit();

    return res.json({ message: "Post silindi." });
  } catch (err) {
    console.error("Post silme hatası:", err.message);
    return res.status(500).json({ error: "Post silinemedi." });
  }
});

// Like / unlike
router.post("/posts/:postId/like", verifyToken, async (req, res) => {
  const uid = req.user.uid;
  try {
    const { postId } = req.params;
    const actorProfile = await getUserProfile(uid);
    const actorName = actorProfile
      ? `${actorProfile.name || ""} ${actorProfile.surname || ""}`.trim() || "Bir kullanıcı"
      : "Bir kullanıcı";
    const postRef = firestore.collection(POSTS_COLLECTION).doc(postId);
    const postDoc = await postRef.get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post bulunamadı" });
    }

    const data = postDoc.data();
    const likedBy = data.likedBy || [];
    const alreadyLiked = likedBy.includes(uid);

    const updatedLikedBy = alreadyLiked
      ? likedBy.filter((id) => id !== uid)
      : [...likedBy, uid];
    const likeDelta = alreadyLiked ? -1 : 1;

    await postRef.update({
      likedBy: updatedLikedBy,
      likeCount: FieldValue.increment(likeDelta),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create notification only on like (not unlike) and not self-like
    if (!alreadyLiked && uid !== data.userId) {
      await firestore.collection(NOTIFICATIONS_COLLECTION).add({
        userId: data.userId,
        actorId: uid,
        type: "post_like",
        postId,
        message: `${actorName} paylaşımınızı beğendi`,
        createdAt: FieldValue.serverTimestamp(),
        read: false,
      });
    }

    const newLikeCount = (data.likeCount || 0) + likeDelta;
    return res.json({ liked: !alreadyLiked, likeCount: newLikeCount });
  } catch (err) {
    console.error("Beğeni hatası:", err.message);
    return res.status(500).json({ error: "Beğeni işlemi başarısız." });
  }
});

// Add comment to post
router.post("/posts/:postId/comments", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content = "" } = req.body || {};
    const uid = req.user.uid;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Yorum boş olamaz." });
    }

    // Check if post exists
    const postDoc = await firestore.collection(POSTS_COLLECTION).doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post bulunamadı." });
    }

    // Clean comment content
    const cleanedContent = cleanContent(content);
    if (!cleanedContent) {
      return res.status(400).json({ error: "Yorum saygısızlık içermektedir. Lütfen güncelleyiniz." });
    }

    const profile = await getUserProfile(uid);
    const userName = profile ? `${profile.name || ""} ${profile.surname || ""}`.trim() || "Anonim" : "Anonim";

    const docRef = await firestore
      .collection(POSTS_COLLECTION)
      .doc(postId)
      .collection("comments")
      .add({
        userId: uid,
        userName,
        content: cleanedContent,
        postId,
        createdAt: FieldValue.serverTimestamp(),
        likeCount: 0,
        likedBy: [],
      });

    // Increment post comment count
    await firestore.collection(POSTS_COLLECTION).doc(postId).update({
      commentCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create notification for post owner
    const postData = postDoc.data();
    if (uid !== postData.userId) {
      await firestore.collection(NOTIFICATIONS_COLLECTION).add({
        userId: postData.userId,
        actorId: uid,
        type: "post_comment",
        postId,
        message: `${userName} paylaşımınıza yorum yaptı`,
        createdAt: FieldValue.serverTimestamp(),
        read: false,
      });
    }

    const created = await docRef.get();
    return res.status(201).json({ comment: serializeComment(created) });
  } catch (err) {
    console.error("Yorum oluşturma hatası:", err.message);
    return res.status(500).json({ error: "Yorum oluşturulamadı: " + err.message });
  }
});

// Get comments for a post
router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const snap = await firestore
      .collection(POSTS_COLLECTION)
      .doc(postId)
      .collection("comments")
      .orderBy("createdAt", "asc")
      .get();

    const comments = snap.docs.map(serializeComment);
    return res.json({ comments });
  } catch (err) {
    console.error("Yorum listesi hatası:", err.message);
    return res.status(500).json({ error: "Yorumlar getirilemedi: " + err.message });
  }
});

// Like / Unlike a comment
router.post("/posts/:postId/comments/:commentId/like", verifyToken, async (req, res) => {
  const { postId, commentId } = req.params;
  const uid = req.user.uid;

  try {
    const commentRef = firestore
      .collection(POSTS_COLLECTION)
      .doc(postId)
      .collection("comments")
      .doc(commentId);

    const postRef = firestore.collection(POSTS_COLLECTION).doc(postId);

    const { liked, likeCount, commentData } = await firestore.runTransaction(async (t) => {
      const commentDoc = await t.get(commentRef);
      if (!commentDoc.exists) {
        throw new Error("Yorum bulunamadı");
      }

      const data = commentDoc.data();
      const likedBy = data.likedBy || [];
      const currentCount = data.likeCount || 0;

      let nextCount = currentCount;
      let nextLiked = false;

      if (likedBy.includes(uid)) {
        nextCount = Math.max(0, currentCount - 1);
        t.update(commentRef, {
          likedBy: admin.firestore.FieldValue.arrayRemove(uid),
          likeCount: nextCount,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        nextCount = currentCount + 1;
        nextLiked = true;
        t.update(commentRef, {
          likedBy: admin.firestore.FieldValue.arrayUnion(uid),
          likeCount: nextCount,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      return { liked: nextLiked, likeCount: nextCount, commentData: data };
    });

    // Send notification if post owner likes someone else's comment
    if (liked && commentData?.userId && commentData.userId !== uid) {
      const postDoc = await postRef.get();
      if (postDoc.exists) {
        const postData = postDoc.data();

        if (postData.userId === uid) {
          const profile = await getUserProfile(uid);
          const actorName = profile ? `${profile.name || ""} ${profile.surname || ""}`.trim() || "Anonim" : "Anonim";

          await firestore.collection(NOTIFICATIONS_COLLECTION).add({
            userId: commentData.userId,
            actorId: uid,
            type: "comment_like",
            postId,
            commentId,
            message: `${actorName} yorumunu beğendi`,
            createdAt: FieldValue.serverTimestamp(),
            read: false,
          });
        }
      }
    }

    return res.json({ liked, likeCount });
  } catch (err) {
    console.error("Yorum beğeni hatası:", err.message);
    const status = err.message === "Yorum bulunamadı" ? 404 : 500;
    return res.status(status).json({ error: err.message });
  }
});

// Delete comment
router.delete("/posts/:postId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const commentRef = firestore
      .collection(POSTS_COLLECTION)
      .doc(postId)
      .collection("comments")
      .doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: "Yorum bulunamadı." });
    }

    const commentData = commentDoc.data();
    if (!isOwnerOrAdmin(req, commentData.userId)) {
      return res.status(403).json({ error: "Yetkisiz işlem." });
    }

    // Delete comment and decrement post count
    const batch = firestore.batch();
    batch.delete(commentRef);
    batch.update(firestore.collection(POSTS_COLLECTION).doc(postId), {
      commentCount: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    return res.json({ message: "Yorum silindi." });
  } catch (err) {
    console.error("Yorum silme hatası:", err.message);
    return res.status(500).json({ error: "Yorum silinemedi." });
  }
});

module.exports = router;
