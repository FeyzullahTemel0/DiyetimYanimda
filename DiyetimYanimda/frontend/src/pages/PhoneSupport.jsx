import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function PhoneSupport() {
  return (
    <PlanAccess requiredPlan="plus">
      <div className="service-page">
        <header className="service-header">
          <h1>Telefon Desteği</h1>
          <p>Plus kullanıcıları için telefonla destek (demo).</p>
        </header>
        <section className="service-card">
          <h2>İletişim</h2>
          <p>Gerçek hat henüz tanımlanmadı.</p>
        </section>
      </div>
    </PlanAccess>
  );
}
