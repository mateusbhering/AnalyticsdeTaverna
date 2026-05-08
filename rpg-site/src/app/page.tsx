import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ConceptSection from "@/components/ConceptSection";
import FlowSection from "@/components/FlowSection";
import AttributesSection from "@/components/AttributesSection";
import WhyDifferent from "@/components/WhyDifferent";
import TechSection from "@/components/TechSection";
import DashboardSection from "@/components/DashboardSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ConceptSection />
        <FlowSection />
        <AttributesSection />
        <WhyDifferent />
        <TechSection />
        <DashboardSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
