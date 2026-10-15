import { ProjectsSection } from "../components/Sections";
import AuraPuzzleExperience from "../components/puzzles/AuraPuzzleExperience";
import { Sparkles } from "lucide-react";

export default function Projects() {
  return (
    <div className="pt-16 pb-20">
      {/* Live Projects & Android Porting Initiatives */}
      <ProjectsSection />

      {/* Interactive 3D Puzzle & Discovery Challenge */}
      <div id="puzzle" className="scroll-mt-24 pt-8">
        <AuraPuzzleExperience />
      </div>
    </div>
  );
}
