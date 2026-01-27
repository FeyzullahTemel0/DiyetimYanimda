import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function WeeklyPlanDownload() {
  const samplePdfUrl = "https://example.com/weekly-plan.pdf"; // demo link
  return (
    <PlanAccess requiredPlan="basic">
      <div className="service-page">
        <header className="service-header">
          <h1>Haftalık Beslenme Planı İndirme</h1>
          <p>Temel ve üzeri planlarda haftalık beslenme planını indir.</p>
        </header>
        <section className="service-card">
          <h2>Örnek PDF</h2>
          <p>Demo amaçlı bağlantı:</p>
          <a className="btn-download" href={samplePdfUrl} target="_blank" rel="noreferrer">PDF İndir</a>
          <div className="service-note">Gerçek PDF üretimi henüz bağlı değil.</div>
        </section>
      </div>
    </PlanAccess>
  );
}
