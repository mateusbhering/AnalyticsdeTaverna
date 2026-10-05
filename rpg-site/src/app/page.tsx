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
      <main>
        <Hero />
        <JourneyAtlas />
        <ConceptSection />
        <FlowSection />
        <AttributesSection />
        <WhyDifferent />
        <TechSection />
        <GuildSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
