// frontend/src/App.js

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";

// Bileşenler
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import MinimalLayout from "./layouts/MinimalLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DietitianRoute from "./components/DietitianRoute";
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
import MonthlyProgress from "./pages/MonthlyProgress";
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
import AdminRecipes from "./pages/AdminRecipes";
import AdminHabits from "./pages/AdminHabits";
import AdminPrograms from "./pages/AdminPrograms";
import AdminQuotes from "./pages/AdminQuotes";
import AdminUsers from "./pages/AdminUsers";
import AdminPricing from "./pages/AdminPricing";
import DietitianRegister from "./pages/DietitianRegister";
import DietitianLogin from "./pages/DietitianLogin";
import Dietitians from "./pages/Dietitians";
import DietitianPanel from "./pages/DietitianPanel";
import DietitianInvites from "./pages/DietitianInvites";

// Yasal Sayfalar
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import KVKK from "./pages/KVKK";
import Security from "./pages/Security";





export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Diyetisyen özel route'ları - MinimalLayout ile */}
          <Route path="/dietitian/login" element={<MinimalLayout><DietitianLogin /></MinimalLayout>} />
          <Route path="/dietitian/register" element={<MinimalLayout><DietitianRegister /></MinimalLayout>} />
          <Route path="/dietitian/panel" element={<DietitianRoute><MinimalLayout><DietitianPanel /></MinimalLayout></DietitianRoute>} />

          {/* Kullanıcı ve admin route'ları - NavBar/Footer ile */}
          <Route path="/" element={<><NavBar /><HomePage /><Footer /></>} />
          <Route path="/pricing" element={<><NavBar /><PricingPage /><Footer /></>} />
          <Route path="/motivation" element={<><NavBar /><Motivation /><Footer /></>} />
          <Route path="/user-stories" element={<><NavBar /><UserStories /><Footer /></>} />
          <Route path="/success-stories" element={<><NavBar /><SuccessStories /><Footer /></>} />
          <Route path="/about-contact" element={<><NavBar /><AboutContactPage /><Footer /></>} />
          <Route path="/advice" element={<><NavBar /><DietAdvice /><Footer /></>} />
          <Route path="/calorie-tracker" element={<ProtectedRoute><NavBar /><CalorieTracker /><Footer /></ProtectedRoute>} />
          <Route path="/personalized-nutrition" element={<><NavBar /><PersonalizedNutrition /><Footer /></>} />
          <Route path="/favorites-tracking" element={<><NavBar /><FavoritesTracking /><Footer /></>} />
          <Route path="/body-analysis" element={<><NavBar /><BodyAnalysis /><Footer /></>} />
          <Route path="/monthly-progress" element={<><NavBar /><MonthlyProgress /><Footer /></>} />
          <Route path="/ai-consultant" element={<><NavBar /><AiConsultant /><Footer /></>} />
          <Route path="/recipes" element={<><NavBar /><Recipes /><Footer /></>} />
          <Route path="/nutrition-optimization" element={<><NavBar /><NutritionOptimization /><Footer /></>} />
          <Route path="/auto-meal-plan" element={<><NavBar /><AutoMealPlan /><Footer /></>} />
          <Route path="/macro-tracking" element={<><NavBar /><MacroTracking /><Footer /></>} />
          <Route path="/habit-builder" element={<><NavBar /><HabitBuilder /><Footer /></>} />
          <Route path="/live-chat" element={<><NavBar /><LiveChat /><Footer /></>} />
          <Route path="/reports-download" element={<><NavBar /><ReportsDownload /><Footer /></>} />
          <Route path="/plus-consultation" element={<><NavBar /><PlusConsultation /><Footer /></>} />
          <Route path="/keto-vegan-plans" element={<><NavBar /><KetoVeganPlans /><Footer /></>} />
          <Route path="/fitness-integration" element={<><NavBar /><FitnessIntegration /><Footer /></>} />
          <Route path="/training-guides" element={<><NavBar /><TrainingGuides /><Footer /></>} />
          <Route path="/special-protocols" element={<><NavBar /><SpecialProtocols /><Footer /></>} />
          <Route path="/unlimited-customization" element={<><NavBar /><UnlimitedCustomization /><Footer /></>} />
          <Route path="/priority-chat" element={<><NavBar /><PriorityChat /><Footer /></>} />
          <Route path="/phone-support" element={<><NavBar /><PhoneSupport /><Footer /></>} />
          <Route path="/monthly-pro-report" element={<><NavBar /><MonthlyProReport /><Footer /></>} />
          <Route path="/custom-meal-service" element={<><NavBar /><CustomMealService /><Footer /></>} />
          <Route path="/thousand-programs" element={<><NavBar /><ThousandPrograms /><Footer /></>} />
          <Route path="/login" element={<><NavBar /><Login /><Footer /></>} />
          <Route path="/register" element={<><NavBar /><Register /><Footer /></>} />
          <Route path="/forgot-password" element={<><NavBar /><ForgotPassword /><Footer /></>} />
          <Route path="/reset-password" element={<><NavBar /><ResetPassword /><Footer /></>} />
          <Route path="/terms" element={<><NavBar /><Terms /><Footer /></>} />
          <Route path="/privacy" element={<><NavBar /><PrivacyPolicy /><Footer /></>} />
          <Route path="/kvkk" element={<><NavBar /><KVKK /><Footer /></>} />
          <Route path="/security" element={<><NavBar /><Security /><Footer /></>} />

          {/* Giriş yapmış kullanıcılar için */}
          <Route path="/diet-programs" element={<ProtectedRoute><NavBar /><DietPrograms /><Footer /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><NavBar /><Profile /><Footer /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><NavBar /><PaymentPage /><Footer /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NavBar /><Notifications /><Footer /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><NavBar /><Community /><Footer /></ProtectedRoute>} />
          <Route path="/community/user/:uid" element={<ProtectedRoute><NavBar /><UserPosts /><Footer /></ProtectedRoute>} />
          <Route path="/community/archived" element={<ProtectedRoute><NavBar /><ArchivedPosts /><Footer /></ProtectedRoute>} />
          <Route path="/nutrition-newsletter" element={<><NavBar /><NutritionNewsletter /><Footer /></>} />
          <Route path="/nutrition-recommendations" element={<ProtectedRoute><NavBar /><PersonalizedNutritionRecommendations /><Footer /></ProtectedRoute>} />
          <Route path="/dietitians" element={<ProtectedRoute><NavBar /><Dietitians /><Footer /></ProtectedRoute>} />
          <Route path="/admin/dietitian-invites" element={<AdminRoute><NavBar /><DietitianInvites /><Footer /></AdminRoute>} />

          {/* Admin için */}
          <Route path="/dashboard" element={<ProtectedRoute><AdminRoute><NavBar /><Dashboard /><Footer /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/nutrition-tips" element={<ProtectedRoute><AdminRoute><NavBar /><AdminNutritionDashboard /><Footer /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/recipes" element={<ProtectedRoute><AdminRoute><NavBar /><AdminRecipes /><Footer /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/habits" element={<ProtectedRoute><AdminRoute><NavBar /><AdminHabits /><Footer /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/programs" element={<ProtectedRoute><AdminRoute><NavBar /><AdminPrograms /><Footer /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/quotes" element={<ProtectedRoute><AdminRoute><NavBar /><AdminQuotes /><Footer /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><NavBar /><AdminUsers /><Footer /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/pricing" element={<ProtectedRoute><AdminRoute><NavBar /><AdminPricing /><Footer /></AdminRoute></ProtectedRoute>} />

          {/* Geçersiz tüm rotalar ana sayfaya yönlendirilir */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}