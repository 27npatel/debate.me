import { MainLayout } from "@/components/main-layout";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialSection } from "@/components/testimonial-section";
import { CTASection } from "@/components/cta-section";

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturesSection />
      <TestimonialSection id="about" />
      <CTASection />
    </MainLayout>
  );
}
