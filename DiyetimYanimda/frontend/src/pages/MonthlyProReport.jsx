import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function MonthlyProReport() {
  const sample = "https://example.com/pro-report.pdf";
  return (
    <PlanAccess requiredPlan="plus">
      <div className="service-page">
        <header className="service-header">
          <h1>Ay Sonu Profesyonel Değerlendirme Raporu</h1>
          <p>Plus kullanıcıları için detaylı rapor (demo bağlantı).</p>
        </header>
        <section className="service-card">
          <h2>Örnek Rapor</h2>
          <a className="btn-download" href={sample} target="_blank" rel="noreferrer">PDF indir</a>
          <div className="service-note">Gerçek rapor üretimi henüz yok.</div>
        </section>
      </div>
    </PlanAccess>
  );
}
