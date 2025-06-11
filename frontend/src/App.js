// frontend/src/App.js

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Bileşenler
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
// DİKKAT: Üyelik planına göre koruma yapacak yeni bileşenimiz
import SubscriptionInfo from "./components/SubscriptionInfo"; 
import "./App.css";
// Sayfalar
import HomePage from "./pages/HomePage";
import DietPrograms from "./pages/DietPrograms";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import DietAdvice from "./pages/DietAdvice";
import Motivation from "./pages/Motivation";
import AboutContactPage from "./pages/AboutContactPage";
import PricingPage from './pages/PricingPage';

// Yasal Sayfalar
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import KVKK from "./pages/KVKK";
import Security from "./pages/Security";

// YENİ: AI Asistanı için özel bir sayfa (Örnek olarak)
// Bu sayfayı ileride oluşturacağız, şimdilik sadece rotasını tanımlıyoruz.
const AiAssistantPage = () => <div style={{padding: '2rem', color: 'white'}}>AI Assistant Page - Coming Soon!</div>;



export default function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <NavBar />
        <main className="app-content">
          <Routes>
            {/* ====================================================== */}
            {/* ===    1. HERKESİN ERİŞEBİLECEĞİ GENEL SAYFALAR    === */}
            {/* ====================================================== */}
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/motivation" element={<Motivation />} />
            <Route path="/about-contact" element={<AboutContactPage />} />
            <Route path="/advice" element={<DietAdvice />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/kvkk" element={<KVKK />} />
            <Route path="/security" element={<Security />} />


            {/* ====================================================== */}
            {/* ===      2. GİRİŞ YAPMIŞ KULLANICILAR İÇİN        === */}
            {/* ====================================================== */}

            {/* Bu rotalar, sadece giriş yapmış herhangi bir kullanıcının erişebileceği sayfalardır. */}
            <Route path="/diet-programs" element={<ProtectedRoute><DietPrograms /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            

            {/* ====================================================== */}
            {/* ===  3. BELİRLİ ÜYELİK PLANLARI GEREKTİREN SAYFALAR === */}
            {/* ====================================================== */}

            {/* ÖRNEK: AI Asistanı sayfası. Sadece 'premium' veya 'plus' üyeler erişebilir. */}
            {/* Diğerleri /pricing sayfasına yönlendirilir. */}
            <Route 
              path="/ai-assistant"
              element={
                <ProtectedRoute>
                  <SubscriptionInfo allowedPlans={['premium', 'plus']}>
                    {/* Bu, AI Asistanının tam ekran sayfası olabilir */}
                    <AiAssistantPage /> 
                  </SubscriptionInfo>
                </ProtectedRoute>
              }
            />


            {/* ====================================================== */}
            {/* ===         4. SADECE ADMIN İÇİN SAYFALAR         === */}
            {/* ====================================================== */}
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <Dashboard />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />

            {/* Geçersiz tüm rotalar ana sayfaya yönlendirilir */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}