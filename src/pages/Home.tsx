import Interactive3DHero from "../components/hero/Interactive3DHero";
import ExploreAuraSection from "../components/home/ExploreAuraSection";
import AuraPuzzleExperience from "../components/puzzles/AuraPuzzleExperience";
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
      {/* 1. Fullscreen Real-Time 3D WebGL Hero with Character Host & Parallax */}
      <Interactive3DHero />

      {/* 2. Explore Aura Glassmorphism 3D Hub */}
      <ExploreAuraSection />

      {/* 3. Dedicated Interactive 3D Puzzle Experience (Harmonic Core Alignment) */}
      <div id="puzzle" className="scroll-mt-24">
        <AuraPuzzleExperience />
      </div>

      {/* 4. Database-driven Latest Music Releases (Audio Player integration) */}
      <LatestReleasesSection />

      {/* 5. Active Member Spotlight */}
      <MemberSpotlightSection />

      {/* 6. Projects & Tech Innovations (Live Supabase table integration) */}
      <ProjectsSection />

      {/* 7. Music Studio Feature Overview */}
      <MusicStudioSection />

      {/* 8. About Aura Community Act */}
      <AboutSection />

      {/* 9. Digital Services & Initiatives */}
      <ServicesSection />

      {/* 10. Futuristic Community Area */}
      <CommunitySection />
    </>
  );
}
