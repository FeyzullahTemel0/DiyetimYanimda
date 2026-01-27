import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function PlusConsultation() {
  return (
    <PlanAccess requiredPlan="plus">
      <div className="service-page">
        <header className="service-header">
          <h1>1-1 Beslenme Danışmanı (Aylık 2 Saat)</h1>
          <p>Plus kullanıcıları için kişisel danışmanlık randevusu (demo).</p>
        </header>
        <section className="service-card">
          <h2>Randevu Durumu</h2>
          <p>Gerçek randevu planlama henüz entegre değil.</p>
        </section>
      </div>
    </PlanAccess>
  );
}
