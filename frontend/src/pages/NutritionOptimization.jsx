import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function NutritionOptimization() {
  return (
    <PlanAccess requiredPlan="premium">
      <div className="service-page">
        <header className="service-header">
          <h1>Beslenme İhtiyaçları Analiz ve Optimizasyon</h1>
          <p>Makro/mikro ihtiyaç analizine yönelik demo özet.</p>
        </header>
        <section className="service-card">
          <h2>Örnek Analiz</h2>
          <ul className="service-list">
            <li>Günlük protein hedefi: 130g (demo)</li>
            <li>Karb/yağ dengesi: 40/30/30 (demo)</li>
          </ul>
          <div className="service-note">Gerçek analiz entegrasyonu bekliyor.</div>
        </section>
      </div>
    </PlanAccess>
  );
}
