import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function MonthlyProgress() {
  return (
    <PlanAccess requiredPlan="basic">
      <div className="service-page">
        <header className="service-header">
          <h1>Aylık İlerleme Raporu</h1>
          <p>Temel ve üzeri planlar için aylık ilerleme özeti (demo).</p>
        </header>
        <section className="service-card">
          <h2>Özet</h2>
          <ul className="service-list">
            <li>Kilo değişimi: +0.0 kg (demo)</li>
            <li>Makro ortalamaları: demo</li>
            <li>En çok uygulanan program: demo</li>
          </ul>
          <div className="service-note">Gerçek rapor entegrasyonu henüz yapılmadı.</div>
        </section>
      </div>
    </PlanAccess>
  );
}
