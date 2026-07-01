import AnnouncementBar  from "./components/AnnouncementBar";
import Navbar           from "./components/Navbar";
import PromoStrip       from "./components/PromoStrip";
import HeroSlider       from "./components/HeroSlider";
import TrustBar         from "./components/TrustBar";
import PromoBanners     from "./components/PromoBanners";
import CategoryIcons    from "./components/CategoryIcons";
import FavoriteProducts from "./components/FavoriteProducts";
import CategoryShowcase from "./components/CategoryShowcase";
import BudgetBanners    from "./components/BudgetBanners";
import CollectionsGrid  from "./components/CollectionsGrid";
import InfoBlocks       from "./components/InfoBlocks";
import Footer           from "./components/Footer";

export default function Home() {
  return (
    <main style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <AnnouncementBar />
      <Navbar />
      <PromoStrip />
      <HeroSlider />
      <TrustBar />
      <PromoBanners />
      <CategoryIcons />
      <FavoriteProducts />
      <CategoryShowcase />
      <BudgetBanners />
      <CollectionsGrid />
      <InfoBlocks />
      <Footer />
    </main>
  );
}
