import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function Recipes() {
  return (
    <PlanAccess requiredPlan="premium">
      <div className="service-page">
        <header className="service-header">
          <h1>Yemek Tarifleri ve Özelleştirme</h1>
          <p>Premium ve üzeri için tarif kütüphanesi (demo).</p>
        </header>
        <section className="service-card">
          <h2>Örnek Tarifler</h2>
          <ul className="service-list">
            <li>Izgara tavuk + kinoalı salata (500 kcal)</li>
            <li>Somon + fırın sebze (480 kcal)</li>
          </ul>
          <div className="service-note">Tarif özelleştirme henüz bağlı değil.</div>
        </section>
      </div>
    </PlanAccess>
  );
}
