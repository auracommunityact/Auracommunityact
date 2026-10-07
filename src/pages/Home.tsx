import { 
  HeroSection, 
  AboutSection, 
  ProjectsSection, 
  MusicStudioSection,
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
      <MusicStudioSection />
      <ServicesSection />
      <CommunitySection />
    </>
  );
}
