import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell">
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
