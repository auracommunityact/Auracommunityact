import Interactive3DHero from "../components/hero/Interactive3DHero";
import ExploreAuraSection from "../components/home/ExploreAuraSection";
import LatestReleasesSection from "../components/music/LatestReleasesSection";
import { MemberSpotlightSection } from "../components/MemberSpotlightSection";
import { 
  AboutSection, 
  ProjectsSection, 
  MusicStudioSection,
  ServicesSection, 
  CommunitySection 
} from "../components/Sections";

export default function Home() {
  return (
    <>
      {/* 1. Fullscreen Interactive 3D WebGL Hero */}
      <Interactive3DHero />

      {/* 2. Explore Aura Glassmorphism 3D Hub */}
      <ExploreAuraSection />

      {/* 3. Database-driven Latest Music Releases (Audio Player integration) */}
      <LatestReleasesSection />

      {/* 4. Active Member Spotlight */}
      <MemberSpotlightSection />

      {/* 5. Projects & Tech Innovations (Live Supabase table integration) */}
      <ProjectsSection />

      {/* 6. Music Studio Feature Overview */}
      <MusicStudioSection />

      {/* 7. About Aura Community Act */}
      <AboutSection />

      {/* 8. Digital Services & Initiatives */}
      <ServicesSection />

      {/* 9. Futuristic Community Area */}
      <CommunitySection />
    </>
  );
}
