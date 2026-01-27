import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function LiveChat() {
  return (
    <PlanAccess requiredPlan="premium">
      <div className="service-page">
        <header className="service-header">
          <h1>Canlı Sohbet Desteği</h1>
          <p>Premium ve üzeri için 08:00-16:00 (Pzt-Cuma) demo canlı destek.</p>
        </header>
        <section className="service-card">
          <h2>Durum</h2>
          <p>Sohbet sistemi henüz entegre değil. Demo placeholder.</p>
        </section>
      </div>
    </PlanAccess>
  );
}
