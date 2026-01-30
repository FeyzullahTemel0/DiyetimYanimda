import Footer from '../components/Footer';

export default function MinimalLayout({ children }) {
  return (
    <>
      <div className="minimal-layout-content">{children}</div>
      <Footer compact />
    </>
  );
}
