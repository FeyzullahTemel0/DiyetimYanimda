import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function EmailSupport() {
  return (
    <PlanAccess requiredPlan="basic">
      <div className="service-page">
        <header className="service-header">
          <h1>Email Desteği</h1>
          <p>Temel ve üzeri planlar için email destek talebi gönderin (demo form).</p>
        </header>
        <section className="service-card">
          <h2>Destek Talebi</h2>
          <form className="service-form">
            <label>Konu<input type="text" placeholder="Örn: Beslenme programı sorusu" /></label>
            <label>Mesaj<textarea rows={4} placeholder="Sorunuzu veya talebinizi yazın"></textarea></label>
            <button type="button" className="btn-primary">Gönder (Demo)</button>
          </form>
          <div className="service-note">Gerçek email gönderimi henüz bağlı değil.</div>
        </section>
      </div>
    </PlanAccess>
  );
}
