import Header from "@/components/care-guide/Header";
import Hero from "@/components/care-guide/Hero";
import CurationSimulator from "@/components/care-guide/CurationSimulator";
import MaterialLibrary from "@/components/care-guide/MaterialLibrary";
import EffectsSection from "@/components/care-guide/EffectsSection";
import Footer from "@/components/care-guide/Footer";

export default function Home() {
  return (
    <>
      <div id="top" />
      <Header />
      <main className="flex-1">
        <Hero />
        <CurationSimulator />
        <MaterialLibrary />
        <EffectsSection />
      </main>
      <Footer />
    </>
  );
}
