import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function UnlimitedCustomization() {
  return (
    <PlanAccess requiredPlan="plus">
      <div className="service-page">
        <header className="service-header">
          <h1>Uygulamada Sınırsız Özelleştirme</h1>
          <p>Plus kullanıcıları için özelleştirme seçenekleri (demo).</p>
        </header>
        <section className="service-card">
          <h2>Örnek Özelleştirmeler</h2>
          <ul className="service-list">
            <li>Özel makro hedefleri</li>
            <li>Özel öğün zamanları</li>
            <li>Özel yasak/içerme listeleri</li>
          </ul>
        </section>
      </div>
    </PlanAccess>
  );
}
