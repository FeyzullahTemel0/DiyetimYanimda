// frontend/src/components/PaymentStatus.jsx
import "./PaymentStatus.css";

export default function PaymentStatus({ subscription }) {
  // örnek veri: { plan: "Aylık", lastPayment: "2025-06-05" }
  return (
    <section className="payment-status">
      <h3>Ödeme Durumu</h3>
      <p><strong>Paket:</strong> {subscription.plan}</p>
      <p><strong>Son Ödeme:</strong> {new Date(subscription.lastPayment).toLocaleDateString()}</p>
      <button className="btn-small">Ödeme Yap</button>
    </section>
  );
}
