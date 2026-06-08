import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import FeaturesBar from "./components/FeaturesBar";
import CategoryShowcase from "./components/CategoryShowcase";
import FavoriteProducts from "./components/FavoriteProducts";
import CollectionsGrid from "./components/CollectionsGrid";
import InfoBlocks from "./components/InfoBlocks";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main style={{ backgroundColor: "#0e0e0e", minHeight: "100vh" }}>
      <Navbar />
      <HeroSlider />
      <FeaturesBar />
      <CategoryShowcase />
      <FavoriteProducts />
      <CollectionsGrid />
      <InfoBlocks />
      <Footer />
    </main>
  );
}
