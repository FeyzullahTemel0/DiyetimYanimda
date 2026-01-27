import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function AutoMealPlan() {
  return (
    <PlanAccess requiredPlan="premium">
      <div className="service-page">
        <header className="service-header">
          <h1>Haftalık Otomatik Beslenme Planı</h1>
          <p>Premium ve üzeri için otomatik plan oluşturma (demo).</p>
        </header>
        <section className="service-card">
          <h2>Örnek Plan</h2>
          <ul className="service-list">
            <li>Pazartesi: Yüksek protein, düşük karbon</li>
            <li>Salı: Dengeli makro dağılımı</li>
          </ul>
          <div className="service-note">Gerçek otomatik oluşturma henüz bağlı değil.</div>
        </section>
      </div>
    </PlanAccess>
  );
}
