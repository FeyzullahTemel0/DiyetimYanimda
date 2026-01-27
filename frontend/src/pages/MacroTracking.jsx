import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function MacroTracking() {
  return (
    <PlanAccess requiredPlan="premium">
      <div className="service-page">
        <header className="service-header">
          <h1>Makro Dengesi Takibi</h1>
          <p>Protein/yağ/karbonhidrat takibi için demo görünüm.</p>
        </header>
        <section className="service-card">
          <h2>Örnek Dağılım</h2>
          <ul className="service-list">
            <li>Protein: 130g (demo)</li>
            <li>Karbonhidrat: 180g (demo)</li>
            <li>Yağ: 60g (demo)</li>
          </ul>
        </section>
      </div>
    </PlanAccess>
  );
}
