import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function AiConsultant() {
  return (
    <PlanAccess requiredPlan="premium">
      <div className="service-page">
        <header className="service-header">
          <h1>Yapay Zeka Destekli Kişisel Beslenme Danışmanı</h1>
          <p>Premium ve üzeri kullanıcılar için AI destekli öneri alanı (demo).</p>
        </header>
        <section className="service-card">
          <h2>Örnek Diyalog</h2>
          <div className="service-note">Gerçek AI entegrasyonu beklemede; demo içerik.</div>
          <ul className="service-list">
            <li>"Bugün 1800 kcal hedefliyorum, öğle ne yiyebilirim?"</li>
            <li>"Protein ağırlıklı akşam yemeği önerisi verir misin?"</li>
          </ul>
        </section>
      </div>
    </PlanAccess>
  );
}
