// Export all recipes from Firestore to JSON (stdout)
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

// Load service account
const serviceAccountPath = path.join(__dirname, "../src/services/firebaseAdminKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error("firebaseAdminKey.json not found at", serviceAccountPath);
  process.exit(1);
}
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

(async () => {
  try {
    const snap = await db.collection("recipes").get();
    const recipes = [];
    snap.forEach(doc => {
      recipes.push({ id: doc.id, ...doc.data() });
    });

    // Sort by name then id for stable output
    recipes.sort((a, b) => {
      const an = (a.name || "").toLowerCase();
      const bn = (b.name || "").toLowerCase();
      if (an === bn) return (a.id || "").localeCompare(b.id || "");
      return an.localeCompare(bn);
    });

    const out = JSON.stringify({ count: recipes.length, recipes }, null, 2);
    process.stdout.write(out + "\n");
    process.exit(0);
  } catch (err) {
    console.error("Export error:", err);
    process.exit(1);
  }
})();
