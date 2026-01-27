import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function CustomMealService() {
  return (
    <PlanAccess requiredPlan="plus">
      <div className="service-page">
        <header className="service-header">
          <h1>Özel Yemek Listesi Oluşturma Hizmeti</h1>
          <p>Plus kullanıcıları için özel liste oluşturma (demo).</p>
        </header>
        <section className="service-card">
          <h2>Talep Formu</h2>
          <p>Form entegrasyonu beklemede.</p>
        </section>
      </div>
    </PlanAccess>
  );
}
