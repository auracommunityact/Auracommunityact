import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import StickyAudioPlayer from "./music/StickyAudioPlayer";
import SocialSidebar from "./navigation/SocialSidebar";
import CinematicIntro from "./intro/CinematicIntro";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";

export default function Layout() {
  const { pathname } = useLocation();
  const { currentTrack } = useAudioPlayer();

  // Show intro if user hasn't completed it in current browser session
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const hasCompleted = sessionStorage.getItem("aura_intro_completed");
      return !hasCompleted;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Global custom event listener so any button can trigger the intro
  useEffect(() => {
    const handleTriggerIntro = () => {
      setShowIntro(true);
    };
    window.addEventListener("aura:show-intro", handleTriggerIntro);
    return () => window.removeEventListener("aura:show-intro", handleTriggerIntro);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col bg-[#050505] text-white selection:bg-[#00F3FF]/30 ${currentTrack ? 'pb-20 sm:pb-24' : ''}`}>
      {/* Fullscreen 3D Cinematic Intro */}
      {showIntro && (
        <CinematicIntro onComplete={() => setShowIntro(false)} />
      )}

      <Navbar onOpenIntro={() => setShowIntro(true)} />
      <SocialSidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Ambient neon radial glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-[#00F3FF]/5 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#FF00C1]/5 blur-[140px] pointer-events-none" />
        
        <div className="relative z-10 w-full flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
      <Footer onOpenIntro={() => setShowIntro(true)} />
      <StickyAudioPlayer />
    </div>
  );
}
