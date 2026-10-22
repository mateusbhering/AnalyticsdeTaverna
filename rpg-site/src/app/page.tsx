import PixelWorldZone from "@/components/PixelWorldZone";
import Hero from "@/components/Hero";
import JourneyAtlas from "@/components/JourneyAtlas";
import ConceptSection from "@/components/ConceptSection";
import FlowSection from "@/components/FlowSection";
import AttributesSection from "@/components/AttributesSection";
import WhyDifferent from "@/components/WhyDifferent";
import TechSection from "@/components/TechSection";
import GuildSection from "@/components/GuildSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main className="tavern-cinematic">
        <Hero />
        <JourneyAtlas />
        <div className="continuous-pixel-world">
          <PixelWorldZone stage={0}><ConceptSection /></PixelWorldZone>
          <PixelWorldZone stage={1}><FlowSection /></PixelWorldZone>
          <PixelWorldZone stage={2}><AttributesSection /></PixelWorldZone>
          <PixelWorldZone stage={3}><WhyDifferent /></PixelWorldZone>
          <PixelWorldZone stage={4}><TechSection /></PixelWorldZone>
          <PixelWorldZone stage={5}><GuildSection /></PixelWorldZone>
        </div>
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

