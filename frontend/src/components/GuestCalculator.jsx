// frontend/src/components/GuestCalculator.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './GuestCalculator.css'; // Bu CSS dosyasını birazdan oluşturacağız

export default function GuestCalculator() {
  const [data, setData] = useState({
    gender: 'female',
    height: '',
    weight: '',
  });
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const analysis = useMemo(() => {
    const heightM = data.height / 100;
    const bmi = data.weight && heightM ? (data.weight / (heightM ** 2)).toFixed(1) : null;
    let bmiStatus = "", bmiClass = "";
    if (bmi) {
      if (bmi < 18.5) { bmiStatus = "Zayıf"; bmiClass = "underweight"; }
      else if (bmi < 25) { bmiStatus = "Normal Kilolu"; bmiClass = "normal"; }
      else if (bmi < 30) { bmiStatus = "Fazla Kilolu"; bmiClass = "overweight"; }
      else { bmiStatus = "Obez"; bmiClass = "obese"; }
    }
    const heightInch = data.height / 2.54;
    const idealWeight = data.gender === "male"
      ? (50 + 2.3 * (heightInch - 60)).toFixed(1)
      : (45.5 + 2.3 * (heightInch - 60)).toFixed(1);
    
    return { bmi, bmiStatus, bmiClass, idealWeight };
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.height && data.weight) {
      setShowResult(true);
    }
  };

  return (
    <div className="guest-calculator-container">
      <div className="calculator-card">
        <h2>Sana En Uygun Programı Bulalım!</h2>
        <p>Vücut kitle indeksini ve ideal kilonu anında öğrenmek için bilgilerini gir.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Cinsiyetiniz</label>
              <select name="gender" value={data.gender} onChange={handleChange}>
                <option value="female">Kadın</option>
                <option value="male">Erkek</option>
              </select>
            </div>
            <div className="form-group">
              <label>Boyunuz (cm)</label>
              <input type="number" name="height" value={data.height} onChange={handleChange} placeholder="Örn: 175" required />
            </div>
            <div className="form-group">
              <label>Kilonuz (kg)</label>
              <input type="number" name="weight" value={data.weight} onChange={handleChange} placeholder="Örn: 80" required />
            </div>
          </div>
          <button type="submit" className="calculate-btn">Hesapla</button>
        </form>

        {showResult && analysis.bmi && (
          <div className="result-box">
            <h3>İşte Analizin!</h3>
            <div className="result-grid">
              <div className="result-item">
                <span>Vücut Kitle İndeksin (BMI)</span>
                <strong className={analysis.bmiClass}>{analysis.bmi}</strong>
                <small>({analysis.bmiStatus})</small>
              </div>
              <div className="result-item">
                <span>İdeal Kilon (Yaklaşık)</span>
                <strong>{analysis.idealWeight} kg</strong>
              </div>
            </div>
            <div className="result-cta">
              <p>Harika! Şimdi bu bilgilere göre sana özel hazırlanmış diyet programlarını görmek için ilk adımı at.</p>
              <button onClick={() => navigate('/register')} className="register-btn">
                Ücretsiz Kayıt Ol ve Programları Gör
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}