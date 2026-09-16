import Header from "@/components/hy-cure/Header";
import Hero from "@/components/hy-cure/Hero";
import CurationSimulator from "@/components/hy-cure/CurationSimulator";
import MaterialLibrary from "@/components/hy-cure/MaterialLibrary";
import EffectsSection from "@/components/hy-cure/EffectsSection";
import Footer from "@/components/hy-cure/Footer";

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
