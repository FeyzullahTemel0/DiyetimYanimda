import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function ReportsDownload() {
  const samplePdf = "https://example.com/report.pdf";
  return (
    <PlanAccess requiredPlan="premium">
      <div className="service-page">
        <header className="service-header">
          <h1>PDF/Excel Raporlarını İndirme</h1>
          <p>Premium ve üzeri için rapor indirme (demo bağlantı).</p>
        </header>
        <section className="service-card">
          <h2>Örnek Dosya</h2>
          <a className="btn-download" href={samplePdf} target="_blank" rel="noreferrer">PDF indir</a>
          <div className="service-note">Gerçek raporlama henüz entegre değil.</div>
        </section>
      </div>
    </PlanAccess>
  );
}
