import { 
  HeroSection, 
  AboutSection, 
  ProjectsSection, 
  ServicesSection, 
  CommunitySection 
} from "../components/Sections";
import { MemberSpotlightSection } from "../components/MemberSpotlightSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <MemberSpotlightSection />
      <AboutSection />
      <ProjectsSection />
      <ServicesSection />
      <CommunitySection />
    </>
  );
}
