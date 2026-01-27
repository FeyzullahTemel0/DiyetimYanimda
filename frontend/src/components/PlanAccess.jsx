import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../services/firebase";
import { getApiUrl } from "../config/apiConfig";

const PLAN_ORDER = ["free", "basic", "premium", "plus"];

const hasAccess = (userPlan = "free", requiredPlan = "free") => {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(requiredPlan);
};

export default function PlanAccess({ requiredPlan = "free", children }) {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const res = await fetch(getApiUrl("/api/profile"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Profil alınamadı");
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="service-guard">
        <p>Bu hizmeti görmek için giriş yapmalısınız.</p>
        <button className="btn-nav btn-primary" onClick={() => navigate("/login")}>Giriş Yap</button>
      </div>
    );
  }

  if (loading) {
    return <div className="service-guard">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="service-guard">Hata: {error}</div>;
  }

  const userPlan = profile?.subscription?.plan || "free";
  if (!hasAccess(userPlan, requiredPlan)) {
    return (
      <div className="service-guard">
        <h2>Bu hizmet {requiredPlan.toUpperCase()} ve üzeri planlar içindir.</h2>
        <p>Mevcut planınız: {userPlan.toUpperCase()}</p>
        <Link className="btn-nav btn-primary" to="/pricing">Planınızı Yükseltin</Link>
      </div>
    );
  }

  return typeof children === "function" ? children(profile) : children;
}
