import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function FitnessIntegration() {
  return (
    <PlanAccess requiredPlan="plus">
      <div className="service-page">
        <header className="service-header">
          <h1>Fitness & Spor Entegrasyonu</h1>
          <p>Plus kullanıcıları için spor entegrasyonu (demo).</p>
        </header>
        <section className="service-card">
          <h2>Entegrasyon Durumu</h2>
          <p>Gerçek spor entegrasyonu henüz bağlı değil.</p>
        </section>
      </div>
    </PlanAccess>
  );
}
