import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function BodyAnalysis() {
  return (
    <PlanAccess requiredPlan="basic">
      {(profile) => (
        <div className="service-page">
          <header className="service-header">
            <h1>Detaylı Vücut Analizi ve Grafikleri</h1>
            <p>Temel ve üzeri planlarda vücut ölçümlerinizi takip edin.</p>
          </header>
          <section className="service-card">
            <h2>Ölçümler</h2>
            <ul className="service-list">
              <li>BMI: {profile?.analysis?.bmi || "Hesaplanmadı"}</li>
              <li>İdeal Kilo: {profile?.analysis?.idealWeight || "-"}</li>
              <li>Hedef Kilo: {profile?.targetWeight || "-"}</li>
            </ul>
            <div className="service-note">Grafikler demo amaçlıdır.</div>
          </section>
        </div>
      )}
    </PlanAccess>
  );
}
