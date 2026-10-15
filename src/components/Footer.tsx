import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Play, Puzzle, ShieldCheck, Heart } from 'lucide-react';
import { siteConfig } from '../config';

interface FooterProps {
  onOpenIntro?: () => void;
}

export default function Footer({ onOpenIntro }: FooterProps) {
  return (
    <footer className="border-t border-white/10 backdrop-blur-2xl bg-black/70 py-12 lg:py-16 relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#00F3FF]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* Brand Info Column */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-black border border-white/20 group-hover:border-[#00F3FF]/60 rounded-xl flex items-center justify-center p-1.5 transition duration-300">
                <img src={siteConfig.logo} alt="Aura Community ACT" className="w-full h-full object-contain" />
              </div>
              <span className="font-syncopate font-bold tracking-tight text-base sm:text-lg text-white">
                Aura Community <span className="text-[#00F3FF]">ACT</span>
              </span>
            </Link>

            <p className="text-white/60 text-xs sm:text-sm leading-relaxed font-space">
              A futuristic digital ecosystem bridging technology, creativity, music, education, and community action.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-[#94FF00] animate-ping" />
              <span className="text-[11px] font-mono text-[#94FF00] uppercase tracking-wider font-semibold">
                3D Digital Host Online
              </span>
            </div>

            {/* Quick Action: Replay 3D Intro */}
            {onOpenIntro && (
              <button
                onClick={onOpenIntro}
                className="mt-2 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-white/90 hover:text-white transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-[#00F3FF]" />
                <span>Replay 3D Intro</span>
              </button>
            )}
          </div>
          
          {/* Navigation Links */}
          <div>
            <h3 className="font-syncopate text-xs font-bold text-white tracking-widest uppercase mb-4 text-[#00F3FF]">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm font-space">
              <li>
                <Link to="/" className="text-white/60 hover:text-[#00F3FF] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-white/60 hover:text-[#00F3FF] transition-colors">
                  Projects & Innovations
                </Link>
              </li>
              <li>
                <a href="#puzzle" className="text-white/60 hover:text-[#94FF00] transition-colors flex items-center gap-1.5">
                  <Puzzle className="w-3 h-3 text-[#94FF00]" />
                  <span>3D Harmonic Puzzle</span>
                </a>
              </li>
              <li>
                <Link to="/music" className="text-white/60 hover:text-[#00F3FF] transition-colors">
                  Aura Music Studio
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-white/60 hover:text-[#00F3FF] transition-colors">
                  Community Network
                </Link>
              </li>
            </ul>
          </div>

          {/* Ecosystem Column */}
          <div>
            <h3 className="font-syncopate text-xs font-bold text-white tracking-widest uppercase mb-4 text-[#FF00C1]">
              Ecosystem
            </h3>
            <ul className="space-y-2.5 text-sm font-space">
              <li>
                <Link to="/founder" className="text-white/60 hover:text-[#FF00C1] transition-colors">
                  Meet the Founder
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/60 hover:text-[#FF00C1] transition-colors">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-white/60 hover:text-[#FF00C1] transition-colors">
                  Initiatives & Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/60 hover:text-[#FF00C1] transition-colors">
                  Contact & Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-syncopate text-xs font-bold text-white tracking-widest uppercase mb-4 text-white/80">
              Governance
            </h3>
            <ul className="space-y-2.5 text-sm font-space">
              <li>
                <Link to="/guidelines" className="text-white/60 hover:text-white transition-colors">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/60 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/60 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px] text-white/50 uppercase tracking-[0.2em] font-mono">
            © {siteConfig.year} {siteConfig.name} • Art Directed 3D Experience
          </p>
          <p className="text-[11px] text-white/40 font-mono flex items-center gap-1.5">
            <span>Founded by Shaan Mohammad</span>
            <span>•</span>
            <span className="text-[#00F3FF]">v3.0 3D Core</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
