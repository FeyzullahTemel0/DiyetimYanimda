// frontend/src/App.js

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";

// Bileşenler
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
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
import PersonalizedNutrition from "./pages/PersonalizedNutrition";
import FavoritesTracking from "./pages/FavoritesTracking";
import BodyAnalysis from "./pages/BodyAnalysis";
import WeeklyPlanDownload from "./pages/WeeklyPlanDownload";
import MonthlyProgress from "./pages/MonthlyProgress";
import EmailSupport from "./pages/EmailSupport";
import AiConsultant from "./pages/AiConsultant";
import Recipes from "./pages/Recipes";
import NutritionOptimization from "./pages/NutritionOptimization";
import AutoMealPlan from "./pages/AutoMealPlan";
import MacroTracking from "./pages/MacroTracking";
import HabitBuilder from "./pages/HabitBuilder";
import LiveChat from "./pages/LiveChat";
import ReportsDownload from "./pages/ReportsDownload";
import PlusConsultation from "./pages/PlusConsultation";
import KetoVeganPlans from "./pages/KetoVeganPlans";
import FitnessIntegration from "./pages/FitnessIntegration";
import TrainingGuides from "./pages/TrainingGuides";
import SpecialProtocols from "./pages/SpecialProtocols";
import UnlimitedCustomization from "./pages/UnlimitedCustomization";
import PriorityChat from "./pages/PriorityChat";
import PhoneSupport from "./pages/PhoneSupport";
import MonthlyProReport from "./pages/MonthlyProReport";
import CustomMealService from "./pages/CustomMealService";
import ThousandPrograms from "./pages/ThousandPrograms";
import UserStories from "./pages/UserStories";
import SuccessStories from "./pages/SuccessStories";
import Notifications from "./pages/Notifications";
import Community from "./pages/Community";
import UserPosts from "./pages/UserPosts";
import ArchivedPosts from "./pages/ArchivedPosts";
import NutritionNewsletter from "./pages/NutritionNewsletter";
import AdminNutritionDashboard from "./pages/AdminNutritionDashboard";
import CalorieTracker from "./pages/CalorieTracker";
import AboutContactPage from "./pages/AboutContactPage";
import PricingPage from './pages/PricingPage';
import PaymentPage from './pages/PaymentPage';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PersonalizedNutritionRecommendations from "./pages/PersonalizedNutritionRecommendations";

// Yasal Sayfalar
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import KVKK from "./pages/KVKK";
import Security from "./pages/Security";





export default function App() {
  return (
    <ToastProvider>
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
            <Route path="/user-stories" element={<UserStories />} />
            <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="/about-contact" element={<AboutContactPage />} />
            <Route path="/advice" element={<DietAdvice />} />
            <Route path="/calorie-tracker" element={<CalorieTracker />} />
            <Route path="/personalized-nutrition" element={<PersonalizedNutrition />} />
            <Route path="/favorites-tracking" element={<FavoritesTracking />} />
            <Route path="/body-analysis" element={<BodyAnalysis />} />
            <Route path="/weekly-plan" element={<WeeklyPlanDownload />} />
            <Route path="/monthly-progress" element={<MonthlyProgress />} />
            <Route path="/email-support" element={<EmailSupport />} />
            <Route path="/ai-consultant" element={<AiConsultant />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/nutrition-optimization" element={<NutritionOptimization />} />
            <Route path="/auto-meal-plan" element={<AutoMealPlan />} />
            <Route path="/macro-tracking" element={<MacroTracking />} />
            <Route path="/habit-builder" element={<HabitBuilder />} />
            <Route path="/live-chat" element={<LiveChat />} />
            <Route path="/reports-download" element={<ReportsDownload />} />
            <Route path="/plus-consultation" element={<PlusConsultation />} />
            <Route path="/keto-vegan-plans" element={<KetoVeganPlans />} />
            <Route path="/fitness-integration" element={<FitnessIntegration />} />
            <Route path="/training-guides" element={<TrainingGuides />} />
            <Route path="/special-protocols" element={<SpecialProtocols />} />
            <Route path="/unlimited-customization" element={<UnlimitedCustomization />} />
            <Route path="/priority-chat" element={<PriorityChat />} />
            <Route path="/phone-support" element={<PhoneSupport />} />
            <Route path="/monthly-pro-report" element={<MonthlyProReport />} />
            <Route path="/custom-meal-service" element={<CustomMealService />} />
            <Route path="/thousand-programs" element={<ThousandPrograms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
            <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/community/user/:uid" element={<ProtectedRoute><UserPosts /></ProtectedRoute>} />
            <Route path="/community/archived" element={<ProtectedRoute><ArchivedPosts /></ProtectedRoute>} />
            <Route path="/nutrition-newsletter" element={<NutritionNewsletter />} />
            <Route path="/calorie-tracker" element={<ProtectedRoute><CalorieTracker /></ProtectedRoute>} />
            <Route path="/nutrition-recommendations" element={<ProtectedRoute><PersonalizedNutritionRecommendations /></ProtectedRoute>} />

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

            <Route
              path="/admin/nutrition-tips"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminNutritionDashboard />
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
    </ToastProvider>
  );
}