import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import PlatformPreview from "@/components/landing/PlatformPreview";
import CTA from "@/components/landing/CTA";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

const Landing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <Hero />
    <Features />
    <HowItWorks />
    <PlatformPreview />
    <CTA />
    <Contact />
    <Footer />
  </div>
);

export default Landing;
