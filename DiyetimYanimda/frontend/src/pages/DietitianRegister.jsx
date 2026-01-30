  import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToastContext } from '../contexts/ToastContext';
import styles from './DietitianRegister.module.css';
import { getCities, getDistrictsByCityCode, getNeighbourhoodsByCityCodeAndDistrict } from 'turkey-neighbourhoods';
import Select from 'react-select';
  
  // Modern ve net react-select stilleri
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      background: '#fff',
      color: '#222',
      borderColor: state.isFocused ? '#4ca175' : '#bdbdbd',
      boxShadow: state.isFocused ? '0 0 0 2px #4ca17533' : 'none',
      minHeight: 44,
      fontWeight: 500,
      fontSize: 16,
      transition: 'border-color 0.2s, box-shadow 0.2s',
      '&:hover': { borderColor: '#4ca175' }
    }),
    menu: base => ({
      ...base,
      background: '#fff',
      color: '#222',
      borderRadius: 8,
      boxShadow: '0 4px 24px 0 rgba(60,60,60,0.10)'
    }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected
        ? '#4ca175'
        : state.isFocused
        ? '#e6f4ea'
        : '#fff',
      color: state.isSelected ? '#fff' : '#222',
      fontWeight: state.isSelected ? 600 : 400,
      fontSize: 15,
      cursor: 'pointer'
    }),
    singleValue: base => ({
      ...base,
      color: '#222'
    }),
    placeholder: base => ({
      ...base,
      color: '#888'
    })
  };



export default function DietitianRegister() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { showToast } = useToastContext();

  const [isTokenValid, setIsTokenValid] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Kayıt başarılıysa 3 sn sonra login sayfasına yönlendir
  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        navigate('/dietitian/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, navigate]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    specialization: '',
    experienceYears: '',
    certificates: [''],
    profilePhoto: '',
    city: '',
    district: '',
    neighborhood: '',
    workingHours: [
      { day: 'Pazartesi', start: '', end: '' },
      { day: 'Salı', start: '', end: '' },
      { day: 'Çarşamba', start: '', end: '' },
      { day: 'Perşembe', start: '', end: '' },
      { day: 'Cuma', start: '', end: '' },
      { day: 'Cumartesi', start: '', end: '' },
      { day: 'Pazar', start: '', end: '' },
    ],
  });

  // For location dropdowns
  const [cityId, setCityId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [districtList, setDistrictList] = useState([]);
  const [neighborhoodList, setNeighborhoodList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Token doğrulama
  useEffect(() => {
    if (!token) {
      showToast('❌ Geçersiz davet linki', 'error');
      navigate('/');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/dietitians/verify-invite/${token}`);
        const data = await response.json();

        if (data.valid) {
          setIsTokenValid(true);
        } else {
          showToast(`❌ ${data.error}`, 'error');
          setIsTokenValid(false);
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error) {
        console.error('Token doğrulama hatası:', error);
        showToast('❌ Token doğrulanamadı', 'error');
        setIsTokenValid(false);
      }
    };

    verifyToken();
  }, [token, navigate, showToast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Sertifika inputları için
  const handleCertificateChange = (idx, value) => {
    const updated = [...formData.certificates];
    updated[idx] = value;
    setFormData({ ...formData, certificates: updated });
  };
  const addCertificateField = () => {
    setFormData({ ...formData, certificates: [...formData.certificates, ''] });
  };
  const removeCertificateField = (idx) => {
    const updated = formData.certificates.filter((_, i) => i !== idx);
    setFormData({ ...formData, certificates: updated });
  };

  // Lokasyon seçimleri (turkey-neighbourhoods fonksiyonları ile)
  useEffect(() => {
    const cities = getCities();
    if (cityId) {
      const districts = getDistrictsByCityCode(cityId);
      console.log('cityId:', cityId, 'districts:', districts);
      setDistrictList(districts);
      setDistrictId('');
      setNeighborhoodList([]);
      // cityId her zaman id, formData.city ise name olacak
      const cityObj = cities.find(c => String(c.code) === String(cityId));
      setFormData(f => ({ ...f, city: cityObj ? cityObj.name : '', district: '', neighborhood: '' }));
    } else {
      setDistrictList([]);
      setDistrictId('');
      setNeighborhoodList([]);
      setFormData(f => ({ ...f, city: '', district: '', neighborhood: '' }));
    }
  }, [cityId]);

  useEffect(() => {
    if (cityId && districtId) {
      setFormData(f => ({ ...f, district: districtId, neighborhood: '' }));
    } else {
      setFormData(f => ({ ...f, district: '', neighborhood: '' }));
    }
  }, [cityId, districtId]);

  // Çalışma saatleri
  const handleWorkingHourChange = (idx, field, value) => {
    const updated = [...formData.workingHours];
    updated[idx][field] = value;
    setFormData({ ...formData, workingHours: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasyon
    if (formData.password !== formData.confirmPassword) {
      showToast('❌ Şifreler eşleşmiyor', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('❌ Şifre en az 6 karakter olmalı', 'error');
      return;
    }

    setLoading(true);

    try {
      // Backend'e kayıt isteği gönder
      const response = await fetch('http://localhost:5000/api/dietitians/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          specialization: formData.specialization,
          experienceYears: formData.experienceYears,
          certificates: formData.certificates.filter(c => c.trim() !== ''),
          profilePhoto: formData.profilePhoto,
          location: {
            city: formData.city,
            district: formData.district,
            neighborhood: formData.neighborhood
          },
          workingHours: formData.workingHours
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast('✅ Diyetisyen kaydınız başarıyla oluşturuldu!', 'success');
        setRegistrationSuccess(true);
      } else {
        showToast(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      showToast('❌ Kayıt sırasında bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };


  if (isTokenValid === null) {
    return (
      <div className={styles['diyetisyen-login-root']}>
        <div className={styles['diyetisyen-login-content']}>
          <div className={styles['diyetisyen-login-logo']}>
            <img src="/logo.png" alt="DiyetimYanımda Logo" />
            <h1>DiyetimYanımda</h1>
            <p>Profesyonel Diyetisyen Paneli</p>
          </div>
          <div className={styles['diyetisyen-login-form']}>
            <div className={styles['diyetisyen-login-form-box']}>
              <h2>⏳ Token doğrulanıyor...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className={styles['diyetisyen-login-root']}>
        <div className={styles['diyetisyen-login-content']}>
          <div className={styles['diyetisyen-login-logo']}>
            <img src="/logo.png" alt="DiyetimYanımda Logo" />
            <h1>DiyetimYanımda</h1>
            <p>Profesyonel Diyetisyen Paneli</p>
          </div>
          <div className={styles['diyetisyen-login-form']}>
            <div className={styles['diyetisyen-login-form-box']}>
              <h2>❌ Geçersiz Davet Linki</h2>
              <p style={{ color: '#666', marginTop: '1rem' }}>
                Bu davet linki geçersiz veya süresi dolmuş. Lütfen yeni bir link talep edin.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (registrationSuccess) {
    return (
      <div className={styles['diyetisyen-login-root']}>
        <div className={styles['diyetisyen-login-content']}>
          <div className={styles['diyetisyen-login-logo']}>
            <img src="/logo.png" alt="DiyetimYanımda Logo" />
            <h1>DiyetimYanımda</h1>
            <p>Profesyonel Diyetisyen Paneli</p>
          </div>
          <div className={styles['diyetisyen-login-form']}>
            <div className={styles['diyetisyen-login-form-box']}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅ Kaydınız Başarılı!</h2>
              <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1rem' }}>
                Diyetisyen hesabınız başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.
              </p>
              <button
                onClick={() => navigate('/dietitian/login')}
                className={styles['btn-auth']}
                style={{ marginBottom: '1rem' }}
              >
                🔐 Giriş Yap
              </button>
              <button
                onClick={() => navigate('/dietitian/register')}
                className={styles['btn-auth']}
                style={{ background: 'transparent', color: '#4ca175', border: '2px solid #4ca175' }}
              >
                📝 Başka Bir Hesap Oluştur
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['diyetisyen-register-root']}>
      <div className={styles['diyetisyen-register-content']}>
        <div className={styles['diyetisyen-register-logo']}>
          <img src="/logo.png" alt="DiyetimYanımda Logo" />
          <h1>DiyetimYanımda</h1>
          <p>Profesyonel Diyetisyen Paneli</p>
        </div>
        <div className={styles['diyetisyen-register-form']}>
          <div className={styles['diyetisyen-register-form-box']}>
            <h2>🏥 Diyetisyen Kayıt</h2>
            <p>
              Diyetisyen olarak sisteme kaydolun
            </p>
            <form onSubmit={handleSubmit} autoComplete="on">
              {/* Kişisel Bilgiler */}
              <input
                type="text"
                name="fullName"
                placeholder="Ad Soyad *"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Telefon *"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {/* Hesap Bilgileri */}
              <input
                type="email"
                name="email"
                placeholder="E-posta *"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Şifre (min. 6 karakter) *"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Şifre Tekrar *"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
              {/* Lokasyon Bilgileri */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <Select
                    options={getCities().map(il => ({ value: il.code, label: il.name }))}
                    value={getCities().map(il => ({ value: il.code, label: il.name })).find(opt => opt.value === cityId) || null}
                    onChange={opt => setCityId(opt ? String(opt.value) : '')}
                    placeholder="Şehir *"
                    isClearable
                    styles={customSelectStyles}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Select
                    options={districtList.map(ilce => ({ value: ilce, label: ilce }))}
                    value={districtList.map(ilce => ({ value: ilce, label: ilce })).find(opt => opt.value === districtId) || null}
                    onChange={opt => setDistrictId(opt ? opt.value : '')}
                    placeholder="İlçe *"
                    isClearable
                    isDisabled={!cityId}
                    styles={customSelectStyles}
                  />
                </div>
              </div>
              {/* Profesyonel Bilgiler */}
              <input
                type="text"
                name="specialization"
                placeholder="Uzmanlık Alanı *"
                value={formData.specialization}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="experienceYears"
                placeholder="Deneyim (Yıl) *"
                value={formData.experienceYears}
                onChange={handleChange}
                required
                min="0"
              />
              {/* Sertifikalar */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Sertifikalar</label>
                {formData.certificates.map((cert, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <input
                      type="text"
                      value={cert}
                      onChange={e => handleCertificateChange(idx, e.target.value)}
                      placeholder={`Sertifika ${idx + 1}`}
                      style={{ flex: 1 }}
                    />
                    {formData.certificates.length > 1 && (
                      <button type="button" onClick={() => removeCertificateField(idx)} style={{ fontSize: 18, color: '#ff5252', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    )}
                    {idx === formData.certificates.length - 1 && (
                      <button type="button" onClick={addCertificateField} style={{ fontSize: 18, color: '#4ca175', background: 'none', border: 'none', cursor: 'pointer' }}>＋</button>
                    )}
                  </div>
                ))}
              </div>
              {/* Çalışma Saatleri */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Çalışma Saatleri</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    style={{ padding: '6px 12px', borderRadius: 6, border: '1.5px solid #4ca175', background: '#e6f4ea', color: '#222', fontWeight: 500, cursor: 'pointer' }}
                    onClick={() => setFormData(f => ({ ...f, workingHours: [
                      { day: 'Pazartesi', start: '10:00', end: '17:00' },
                      { day: 'Salı', start: '10:00', end: '17:00' },
                      { day: 'Çarşamba', start: '10:00', end: '17:00' },
                      { day: 'Perşembe', start: '10:00', end: '17:00' },
                      { day: 'Cuma', start: '10:00', end: '17:00' },
                      { day: 'Cumartesi', start: '10:00', end: '17:00' },
                      { day: 'Pazar', start: '', end: '' },
                    ] }))}
                  >Tüm günler 10:00-17:00 (Pazar hariç)</button>
                </div>
                {formData.workingHours.map((wh, idx) => (
                  <div key={wh.day} className={styles['working-hours-row']}>
                    <span>{wh.day}</span>
                    <input
                      type="time"
                      value={wh.start}
                      onChange={e => handleWorkingHourChange(idx, 'start', e.target.value)}
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={wh.end}
                      onChange={e => handleWorkingHourChange(idx, 'end', e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <input
                type="url"
                name="profilePhoto"
                placeholder="Profil Fotoğrafı URL (opsiyonel)"
                value={formData.profilePhoto}
                onChange={handleChange}
              />
              <button
                type="submit"
                disabled={loading}
              >
                {loading ? '⏳ Kaydediliyor...' : '✅ Kayıt Ol'}
              </button>
              <div className={styles['alt-link']}>
                Zaten hesabınız var mı?{' '}
                <a href="/dietitian/login">Giriş yapın</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
