import { 
  AboutSection, 
  MissionSection, 
  VisionSection 
} from "../components/Sections";

export default function About() {
  return (
    <div className="pt-12">
      <AboutSection />
      <MissionSection />
      <VisionSection />
    </div>
  );
}
