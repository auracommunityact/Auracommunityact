import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import StickyAudioPlayer from "./music/StickyAudioPlayer";
import SocialSidebar from "./navigation/SocialSidebar";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";

export default function Layout() {
  const { pathname } = useLocation();
  const { currentTrack } = useAudioPlayer();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={`min-h-screen flex flex-col bg-[#050505] text-white selection:bg-[#00F3FF]/30 ${currentTrack ? 'pb-20 sm:pb-24' : ''}`}>
      <Navbar />
      <SocialSidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Ambient neon radial glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-[#00F3FF]/5 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#FF00C1]/5 blur-[140px] pointer-events-none" />
        
        <div className="relative z-10 w-full flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
      <Footer />
      <StickyAudioPlayer />
    </div>
  );
}
