import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Sparkles, MousePointer, Hand } from 'lucide-react';
import NeonTubesScene, { COLOR_PALETTES } from '../3d/NeonTubesScene';
import { siteConfig } from '../../config';

export default function Interactive3DHero() {
  const [activePaletteIndex, setActivePaletteIndex] = useState(0);

  const currentPalette = COLOR_PALETTES[activePaletteIndex] || COLOR_PALETTES[0];

  return (
    <section 
      className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-[#050505] pt-24 pb-16 px-4 sm:px-6 lg:px-8 select-none"
      aria-label="Interactive 3D Hero"
    >
      {/* 1. Full-screen Interactive 3D WebGL Canvas Layer (z-index 0) */}
      <NeonTubesScene 
        onPaletteChange={(idx) => setActivePaletteIndex(idx)} 
        className="z-0"
      />

      {/* Atmospheric Vignette and radial lighting overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#050505]/40 to-[#050505]/90 pointer-events-none z-[1]" />

      {/* 2. Hero Content Composition (z-index 10) */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center space-y-8 sm:space-y-10 my-auto">
        
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          className="flex items-center gap-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-[#00F3FF]/30 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#00F3FF] animate-ping" />
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#00F3FF] uppercase text-glow-cyan">
              CREATIVITY • TECHNOLOGY • COMMUNITY
            </span>
          </div>
        </motion.div>

        {/* Brand Logo Floating Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00F3FF] via-[#FF00C1] to-[#94FF00] rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl p-2.5 shadow-2xl flex items-center justify-center">
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

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.19, 1, 0.22, 1] }}
          className="text-base sm:text-lg md:text-xl text-white/75 max-w-2xl mx-auto font-light leading-relaxed font-space drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
        >
          Discover a connected world of creativity, technology, learning, music, and community — all in one place.
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
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00F3FF] via-[#00e1ec] to-[#00F3FF] text-black font-syncopate font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,243,255,0.45)] hover:shadow-[0_0_45px_rgba(0,243,255,0.7)] flex items-center justify-center gap-3 group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>EXPLORE AURA</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>

          {/* Secondary CTA: "DISCOVER OUR PROJECTS" */}
          <Link
            to="/community"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 hover:border-[#FF00C1]/60 text-white font-syncopate font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-[#FF00C1]/10 shadow-[0_0_20px_rgba(255,0,193,0.15)] hover:shadow-[0_0_30px_rgba(255,0,193,0.35)] flex items-center justify-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF00C1]"
          >
            <Compass className="w-4 h-4 text-[#FF00C1] group-hover:rotate-45 transition-transform duration-300" />
            <span>DISCOVER OUR PROJECTS</span>
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
            <span className="hidden sm:inline">MOVE TO INTERACT</span>
            <span className="sm:hidden">TOUCH TO EXPLORE</span>
          </span>
        </div>
        <p className="text-[11px] font-space text-white/50 tracking-wider">
          Click or tap to shift the neon spectrum • <span className="text-[#00F3FF] font-semibold">{currentPalette.name}</span>
        </p>
      </motion.div>
    </section>
  );
}
