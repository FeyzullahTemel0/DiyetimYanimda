import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function ThousandPrograms() {
  return (
    <PlanAccess requiredPlan="plus">
      <div className="service-page">
        <header className="service-header">
          <h1>1000+ Detaylı Diyet Programı</h1>
          <p>Plus kullanıcıları için geniş program kataloğu (demo listesi).</p>
        </header>
        <section className="service-card">
          <h2>Örnek Programlar</h2>
          <ul className="service-list">
            <li>Kesim 1800 kcal</li>
            <li>Bulk 2800 kcal</li>
            <li>Dayanıklılık 2400 kcal</li>
          </ul>
        </section>
      </div>
    </PlanAccess>
  );
}
