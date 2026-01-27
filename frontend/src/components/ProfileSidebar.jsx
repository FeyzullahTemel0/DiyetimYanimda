import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import "./ProfileSidebar.css";

const PLAN_ORDER = ["free", "basic", "premium", "plus"];
const hasPlanAccess = (userPlan = "free", requiredPlan = "basic") =>
  PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(requiredPlan);

export default function ProfileSidebar({ profile, currentTab, onTabChange }) {
  const navigate = useNavigate();

  const FREE_FEATURES = [
    { key: "calorie-tracker", label: "📊 Günlük Kalori Tracker", to: "/calorie-tracker", requiredPlan: "free", type: "route" },
    { key: "newsletter", label: "📧 Beslenme İpuçları Bülteni", to: "/nutrition-newsletter", requiredPlan: "free", type: "route" },
  ];

  const baseLinks = [
    { key: "info", label: "Profil Bilgileri", type: "tab" },
    { key: "subscription", label: "Aboneliğim", type: "tab" },
    { key: "diet", label: "Favori Programlarım", type: "tab" },
    { key: "assistant", label: "Diyet Asistanım", type: "tab" },
    { key: "request", label: "Geri Bildirim & Talep", type: "tab" },
    { key: "community", label: "🌍 Topluluk Forumları", to: "/community", type: "route" },
    ...FREE_FEATURES,
  ];

  const serviceLinks = [
    { key: "svc-personalized-nutrition", label: "Kişiselleştirilmiş Beslenme Önerileri", to: "/personalized-nutrition", requiredPlan: "basic", type: "route" },
    { key: "svc-favorites-tracking", label: "Favori Programları Kaydetme ve Takip Etme", to: "/favorites-tracking", requiredPlan: "basic", type: "route" },
    { key: "svc-body-analysis", label: "Detaylı Vücut Analizi ve Grafikleri", to: "/body-analysis", requiredPlan: "basic", type: "route" },
    { key: "svc-weekly-plan", label: "Haftalık Beslenme Planı İndirme", to: "/weekly-plan", requiredPlan: "basic", type: "route" },
    { key: "svc-monthly-progress", label: "Aylık İlerleme Raporu", to: "/monthly-progress", requiredPlan: "basic", type: "route" },
    { key: "svc-email-support", label: "Email Desteği (12-24 saat)", to: "/email-support", requiredPlan: "basic", type: "route" },
    { key: "svc-ai-consultant", label: "Yapay Zeka Destekli Kişisel Beslenme Danışmanı", to: "/ai-consultant", requiredPlan: "premium", type: "route" },
    { key: "svc-recipes", label: "Yemek Tariflerine Erişim ve Özelleştirme", to: "/recipes", requiredPlan: "premium", type: "route" },
    { key: "svc-nutrition-opt", label: "Beslenme İhtiyaçları Analiz ve Optimizasyon", to: "/nutrition-optimization", requiredPlan: "premium", type: "route" },
    { key: "svc-auto-meal", label: "Haftalık Otomatik Beslenme Planı Oluşturma", to: "/auto-meal-plan", requiredPlan: "premium", type: "route" },
    { key: "svc-macro-track", label: "Makro Dengesi Takibi", to: "/macro-tracking", requiredPlan: "premium", type: "route" },
    { key: "svc-habit-builder", label: "Alışkanlık Geliştirme Programları", to: "/habit-builder", requiredPlan: "premium", type: "route" },
    { key: "svc-live-chat", label: "Canlı Sohbet Desteği", to: "/live-chat", requiredPlan: "premium", type: "route" },
    { key: "svc-reports", label: "PDF/Excel Raporlarını İndirme", to: "/reports-download", requiredPlan: "premium", type: "route" },
    { key: "svc-thousand-programs", label: "1000+ Detaylı Diyet Programı", to: "/thousand-programs", requiredPlan: "plus", type: "route" },
    { key: "svc-plus-consult", label: "1-1 Konsultasyon (Aylık 2 Saat)", to: "/plus-consultation", requiredPlan: "plus", type: "route" },
    { key: "svc-keto-vegan", label: "Keto, Vegan, Gluten-Free Planları", to: "/keto-vegan-plans", requiredPlan: "plus", type: "route" },
    { key: "svc-fitness", label: "Fitness Entegreli Planlar", to: "/fitness-integration", requiredPlan: "plus", type: "route" },
    { key: "svc-training", label: "Antrenman Rehberleri", to: "/training-guides", requiredPlan: "plus", type: "route" },
    { key: "svc-protocols", label: "Özel Beslenme Protokolleri", to: "/special-protocols", requiredPlan: "plus", type: "route" },
    { key: "svc-customization", label: "Sınırsız Özelleştirme", to: "/unlimited-customization", requiredPlan: "plus", type: "route" },
    { key: "svc-priority-chat", label: "Öncelikli Canlı Sohbet", to: "/priority-chat", requiredPlan: "plus", type: "route" },
    { key: "svc-phone", label: "Telefon Desteği", to: "/phone-support", requiredPlan: "plus", type: "route" },
    { key: "svc-pro-report", label: "Profesyonel Değerlendirme Raporu", to: "/monthly-pro-report", requiredPlan: "plus", type: "route" },
    { key: "svc-meal-service", label: "Özel Yemek Listesi Oluşturma", to: "/custom-meal-service", requiredPlan: "plus", type: "route" },
  ];

  const plan = profile?.subscription?.plan || "free";
  const visibleServices = serviceLinks.filter((l) => hasPlanAccess(plan, l.requiredPlan));
  const sidebarLinks = [...baseLinks, ...visibleServices];

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <aside className="profile-sidebar-compact">
      <ul>
        {sidebarLinks.map((link) => (
          <li
            key={link.key}
            className={link.type === "tab" && currentTab === link.key ? "active" : ""}
            onClick={link.type === "tab" ? () => onTabChange?.(link.key) : undefined}
          >
            {link.type === "route" ? (
              <Link to={link.to}>{link.label}</Link>
            ) : (
              link.label
            )}
          </li>
        ))}
        <li className="logout-item" onClick={handleLogout}>
          🚪 Çıkış Yap
        </li>
      </ul>
    </aside>
  );
}
