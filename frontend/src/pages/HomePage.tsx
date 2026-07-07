import Nav from "../components/home/Nav";
import { HeroSection } from "../components/home/HeroSection";
import IdentityCardSection from "../components/home/IdentityCardSection";
import Mission from "../components/home/Mission";
import Advantages from "../components/home/Advantages";
import ModelForSuccess from "../components/home/ModelForSuccess";
import FinalCTA from "../components/home/FinalCTA";
import Footer from "../components/home/Footer";

export default function HomePage() {
  return (
    <div className="lovable-theme h-full min-h-screen">
      <main className="relative isolate text-foreground overflow-x-hidden">
        <Nav />
        <HeroSection />
        <IdentityCardSection />
        <Mission />
        <Advantages />
        <ModelForSuccess />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  );
}
