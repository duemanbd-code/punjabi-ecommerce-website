import AllCollectionsSection from "@/components/AllCollectionsSection";
import BestSelling from "@/components/BestSelling";
import HeroBanner from "@/components/HeroBanner";
import NewArrivals from "@/components/NewArrivals";
import ShopCategories from "@/components/ShopCategories";
import Topbar from "@/components/Topbar";
 
export default function Home() {
  return (
    <main>
      <HeroBanner />
      <ShopCategories />
      <AllCollectionsSection/>
      <BestSelling/>
      <NewArrivals />
 
    </main>
  );
}
