import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ConceptSection from "@/components/ConceptSection";
import FlowSection from "@/components/FlowSection";
import AttributesSection from "@/components/AttributesSection";
import WhyDifferent from "@/components/WhyDifferent";
import TechSection from "@/components/TechSection";
import DashboardSection from "@/components/DashboardSection";
import GuildSection from "@/components/GuildSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import MotionProvider from "@/components/MotionProvider";
import { getPlayerStats } from "@/lib/stats";

export default async function Home() {
  // Agregado no servidor: o navegador recebe os números prontos, não a tabela.
  const stats = await getPlayerStats();

  return (
    <MotionProvider>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <ConceptSection />
        <FlowSection />
        <AttributesSection />
        <WhyDifferent />
        <TechSection />
        <DashboardSection stats={stats} />
        <GuildSection />
        <CTASection />
      </main>
      <Footer />
    </MotionProvider>
  );
}
