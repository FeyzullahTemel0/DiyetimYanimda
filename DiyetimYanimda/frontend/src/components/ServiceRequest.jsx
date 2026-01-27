// frontend/src/components/ServiceRequest.jsx
import { useState } from "react";
import './ServiceRequest.css';

export default function ServiceRequest() {
    const [request, setRequest] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!request.trim()) {
            setStatus('Lütfen bir talep veya geri bildirim yazın.');
            setTimeout(() => setStatus(''), 3000);
            return;
        }
        setStatus('Talebiniz gönderiliyor...');
        setTimeout(() => {
            // Burada normalde backend'e bir API isteği atılır.
            // Örn: await api.sendFeedback({ message: request });
            setStatus('Talebiniz başarıyla alındı. Geri bildiriminiz için teşekkür ederiz!');
            setRequest('');
            setTimeout(() => setStatus(''), 5000); // 5 saniye sonra mesajı temizle
        }, 1500);
    };

    return (
        <section className="tab-section service-request-tab">
            <h2>Geliştirme ve Hizmet Talebi</h2>
            <p>Uygulamamızda görmek istediğiniz yeni özellikleri veya mevcut özelliklerle ilgili yaşadığınız sorunları bize bildirin. Geri bildirimleriniz, platformumuzu daha iyi hale getirmemize yardımcı olur.</p>
            <form onSubmit={handleSubmit}>
                <textarea 
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    placeholder="Örn: 'Yemek tarifleri için kalori hesaplama özelliği eklenebilir.' ya da 'Profil sayfasındaki kilo grafiği yavaş yükleniyor.'"
                    required
                    rows="6"
                />
                <button type="submit">Talebi Gönder</button>
            </form>
            {status && <p className="request-status">{status}</p>}
        </section>
    );
}