import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function PriorityChat() {
  return (
    <PlanAccess requiredPlan="plus">
      <div className="service-page">
        <header className="service-header">
          <h1>Öncelikli Canlı Sohbet (07:00-22:00)</h1>
          <p>Plus kullanıcıları için geniş zamanlı öncelikli sohbet (demo).</p>
        </header>
        <section className="service-card">
          <h2>Durum</h2>
          <p>Sohbet entegrasyonu beklemede.</p>
        </section>
      </div>
    </PlanAccess>
  );
}
