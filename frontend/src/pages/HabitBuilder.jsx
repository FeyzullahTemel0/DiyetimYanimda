import React, { useEffect, useMemo, useState } from "react";
import PlanAccess from "../components/PlanAccess";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import "./HabitBuilder.css";

const categoryLabels = {
  wellness: "Wellness",
  fitness: "Fitness",
  nutrition: "Beslenme",
  mindset: "Zihin",
  sleep: "Uyku",
};

const difficultyLabels = {
  kolay: "Kolay",
  orta: "Orta",
  zor: "Zor",
};

export default function HabitBuilder() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, "habitPrograms"));
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((item) => item.status !== "draft");
        // Client-side sort keeps newest on top without requiring an index
        setPrograms(rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      } catch (err) {
        console.error("Programlar yüklenemedi", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const catOk = category === "all" || p.category === category;
      const diffOk = difficulty === "all" || p.difficulty === difficulty;
      return catOk && diffOk;
    });
  }, [programs, category, difficulty]);

  const heroProgram = filtered[0];

  return (
    <PlanAccess requiredPlan="premium">
      <div className="habit-page">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Alışkanlık Laboratuvarı</p>
            <h1>Bilim temelli mikro alışkanlık planları</h1>
            <p className="lede">
              Haftalık görevler, takip metrikleri ve kolay/orta/zor seviyeleri ile sürdürülebilir bir düzen kurun.
            </p>
            <div className="filters">
              <div className="filter">
                <label>Kategori</label>
                <div className="chips">
                  <button className={category === "all" ? "chip active" : "chip"} onClick={() => setCategory("all")}>
                    Tümü
                  </button>
                  {Object.keys(categoryLabels).map((key) => (
                    <button key={key} className={category === key ? "chip active" : "chip"} onClick={() => setCategory(key)}>
                      {categoryLabels[key]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter">
                <label>Zorluk</label>
                <div className="chips">
                  {[
                    { key: "all", label: "Hepsi" },
                    { key: "kolay", label: "Kolay" },
                    { key: "orta", label: "Orta" },
                    { key: "zor", label: "Zor" },
                  ].map((d) => (
                    <button key={d.key} className={difficulty === d.key ? "chip active" : "chip"} onClick={() => setDifficulty(d.key)}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <p className="eyebrow">Öne Çıkan Program</p>
            {heroProgram ? (
              <>
                <h3>{heroProgram.title}</h3>
                <p className="meta">{heroProgram.subtitle}</p>
                <p className="desc">{heroProgram.description}</p>
                <div className="hero-stats">
                  <span>🔥 {difficultyLabels[heroProgram.difficulty] || heroProgram.difficulty}</span>
                  <span>📅 {heroProgram.durationWeeks} hafta</span>
                  <span>✅ Haftada {heroProgram.frequencyPerWeek} görev</span>
                </div>
                {heroProgram.focus?.length > 0 && (
                  <div className="tags">
                    {heroProgram.focus.map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="meta">Aktif program bulunamadı.</p>
            )}
          </div>
        </section>

        <section className="grid-section">
          <div className="grid-head">
            <div>
              <p className="eyebrow">Programlar</p>
              <h2>Alışkanlık kataloğu</h2>
              <p className="lede">Odak alanına göre seç, seviyeni belirle, haftalık görevlerini başlat.</p>
            </div>
            <div className="pill-group">
              <span className="pill muted">{filtered.length} aktif program</span>
            </div>
          </div>

          {loading && <p className="meta">Yükleniyor...</p>}
          {!loading && filtered.length === 0 && <p className="meta">Filtreye uyan program yok.</p>}

          <div className="cards">
            {filtered.map((item) => (
              <article key={item.id} className="card">
                <div className="card-top">
                  <span className="pill">{categoryLabels[item.category] || item.category}</span>
                  <span className={`pill ${item.difficulty}`}>{difficultyLabels[item.difficulty] || item.difficulty}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="meta">{item.subtitle}</p>
                <p className="desc">{item.description}</p>
                <div className="card-stats">
                  <span>📅 {item.durationWeeks} hafta</span>
                  <span>✅ Haftada {item.frequencyPerWeek} görev</span>
                </div>
                {item.focus?.length > 0 && (
                  <div className="tags">
                    {item.focus.map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                )}
                <div className="card-actions">
                  <button className="btn ghost">Önizle</button>
                  <button className="btn solid">Programı Başlat</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PlanAccess>
  );
}
