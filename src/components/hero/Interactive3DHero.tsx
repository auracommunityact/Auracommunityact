import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Compass, Sparkles, MousePointer, Hand, 
  User, Puzzle, Eye, X, Check, ExternalLink 
} from 'lucide-react';
import AuraHeroScene from './AuraHeroScene';
import CharacterScene from '../character/CharacterScene';
import { FOUNDER_CHARACTER_SPEC } from '../character/characterSpec';
import { siteConfig } from '../../config';

export default function Interactive3DHero() {
  const [showHostInspector, setShowHostInspector] = useState(false);
  const [hostGreetingCount, setHostGreetingCount] = useState(0);

  const handleCharacterClick = () => {
    setHostGreetingCount((prev) => prev + 1);
  };

  return (
    <section 
      className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-[#050505] pt-28 pb-16 px-4 sm:px-6 lg:px-8 select-none"
      aria-label="Interactive 3D Hero"
    >
      {/* 1. Full-screen Real-Time 3D WebGL Canvas Layer (Character + Brand Monument + Floating Polyhedra) */}
      <AuraHeroScene 
        className="z-0"
        onCharacterClick={handleCharacterClick}
      />

      {/* Atmospheric Vignette and lighting depth overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#050505]/40 to-[#050505]/95 pointer-events-none z-[1]" />

      {/* 2. Hero Content Composition (Accessible HTML/CSS Layer, z-index 10) */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center space-y-6 sm:space-y-8 my-auto pointer-events-auto">
        
        {/* Eyebrow badge with Host Status */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-[#00F3FF]/40 shadow-[0_0_20px_rgba(0,243,255,0.25)]">
            <span className="w-2 h-2 rounded-full bg-[#94FF00] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] text-[#00F3FF] uppercase text-glow-cyan">
              SHAAN MOHAMMAD • 3D DIGITAL HOST
            </span>
          </div>

          <button
            onClick={() => setShowHostInspector(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-mono uppercase tracking-wider text-white transition cursor-pointer"
          >
            <User className="w-3 h-3 text-[#00F3FF]" />
            <span>Inspect 3D Host</span>
          </button>
        </motion.div>

        {/* Brand Logo Floating Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00F3FF] via-[#FF00C1] to-[#94FF00] rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-black/85 backdrop-blur-2xl border border-white/20 rounded-2xl p-2.5 shadow-2xl flex items-center justify-center">
            <img 
              src={siteConfig.logo} 
              alt="Aura Community Act Logo" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(0,243,255,0.6)]"
            />
          </div>
        </motion.div>

        {/* Main Bold Headline: "BEYOND THE ORDINARY." */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          className="font-syncopate font-bold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-white uppercase"
        >
          <span className="block text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            BEYOND
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00F3FF] to-[#FF00C1] text-glow-cyan">
            THE ORDINARY.
          </span>
        </motion.h1>

        {/* Supporting description */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.19, 1, 0.22, 1] }}
          className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed font-space drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
        >
          Discover a connected 3D digital ecosystem of creativity, technology, learning, music, and community — hosted by Shaan Mohammad.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full pt-2"
        >
          {/* Primary CTA: "EXPLORE AURA" */}
          <Link
            to="/projects"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00F3FF] via-[#00e1ec] to-[#00F3FF] text-black font-syncopate font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,243,255,0.5)] hover:shadow-[0_0_45px_rgba(0,243,255,0.8)] flex items-center justify-center gap-3 group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>EXPLORE AURA</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>

          {/* Secondary CTA: "3D PUZZLE EXPERIENCE" */}
          <a
            href="#puzzle"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/20 hover:border-[#94FF00]/60 text-white font-syncopate font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-[#94FF00]/10 shadow-[0_0_20px_rgba(148,255,0,0.15)] hover:shadow-[0_0_30px_rgba(148,255,0,0.35)] flex items-center justify-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#94FF00]"
          >
            <Puzzle className="w-4 h-4 text-[#94FF00] group-hover:rotate-12 transition-transform duration-300" />
            <span>PLAY 3D PUZZLE</span>
          </a>

          {/* Tertiary CTA: "MEET THE FOUNDER" */}
          <Link
            to="/founder"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-syncopate font-medium text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4 text-white/60" />
            <span>FOUNDER</span>
          </Link>
        </motion.div>
      </div>

      {/* 3. Interactive Hint at Bottom Center */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="relative z-10 mt-12 sm:mt-8 flex flex-col items-center gap-1.5 pointer-events-none"
      >
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <MousePointer className="w-3.5 h-3.5 text-[#00F3FF] animate-bounce hidden sm:block" />
          <Hand className="w-3.5 h-3.5 text-[#00F3FF] animate-pulse sm:hidden" />
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-white/80">
            <span className="hidden sm:inline">PARALLAX ACTIVE • CLICK TO GREET DIGITAL HOST</span>
            <span className="sm:hidden">TOUCH TO EXPLORE 3D ENVIRONMENT</span>
          </span>
        </div>
      </motion.div>

      {/* 4. Host Likeness Inspection Modal */}
      <AnimatePresence>
        {showHostInspector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-gradient-to-b from-[#0c0d14] to-black rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden my-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowHostInspector(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer z-30"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* 3D Viewport Column */}
                <div className="w-full h-80 sm:h-96 rounded-2xl bg-black/60 border border-white/10 overflow-hidden relative">
                  <CharacterScene showControls={true} />
                </div>

                {/* Specification & Reference Column */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F3FF]/10 border border-[#00F3FF]/30 text-[#00F3FF] text-xs font-mono font-bold uppercase tracking-wider">
                    <span>DIGITAL HOST SPECIFICATION</span>
                  </div>
                  <h3 className="font-syncopate font-bold text-xl sm:text-2xl text-white uppercase">
                    Shaan Mohammad
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-space">
                    Modeled directly from the primary reference photograph with signature round wireframe spectacles, high-volume jet-black quiff, PBR subsurface skin, and grey sleeveless athletic attire.
                  </p>

                  <div className="space-y-2 pt-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-white/60">Asset Pipeline</span>
                      <span className="text-[#94FF00] font-bold">glTF 2.0 / PBR Ready</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-white/60">Facial Blendshapes</span>
                      <span className="text-[#00F3FF] font-bold">Natural Blinking & Gaze</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-white/60">Reference Clothing</span>
                      <span className="text-white font-bold">Heather Grey Tank Top</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      to="/founder"
                      onClick={() => setShowHostInspector(false)}
                      className="px-5 py-2.5 rounded-xl bg-white text-black font-syncopate font-bold text-xs uppercase tracking-wider hover:bg-white/90 transition flex items-center gap-2"
                    >
                      <span>Full Founder Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
