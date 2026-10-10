import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Music, BookOpen, Users, Smartphone, Sparkles, ArrowRight, 
  ExternalLink, Layers, Terminal, ShieldCheck 
} from 'lucide-react';

interface ExploreCard {
  id: string;
  title: string;
  tag: string;
  description: string;
  icon: React.ElementType;
  accent: 'cyan' | 'magenta' | 'lime';
  route: string;
  isExternal?: boolean;
  features: string[];
}

export default function ExploreAuraSection() {
  const cards: ExploreCard[] = [
    {
      id: 'music-studio',
      title: 'Aura Music Studio',
      tag: 'Original Soundtracks & Releases',
      description: 'Official music streaming catalog with master audio streaming, background playback, and digital releases.',
      icon: Music,
      accent: 'cyan',
      route: '/music',
      features: ['Official Catalog', 'Background Playback', 'MediaSession API', 'Streaming Releases']
    },
    {
      id: 'learning',
      title: 'Aura Learning',
      tag: 'Continuous Education Platform',
      description: 'Technology-supported educational hub empowering students and creators with curated materials, guides, and tools.',
      icon: BookOpen,
      accent: 'lime',
      route: 'https://aura.auralearning.workers.dev',
      isExternal: true,
      features: ['Curated Resources', 'E-Books & Modules', 'Tech Innovation', 'Open Access']
    },
    {
      id: 'community',
      title: 'Aura Community',
      tag: 'Collaborative Ecosystem',
      description: 'Connect with developers, digital artists, creators, and students. Join discussions, vote on projects, and build together.',
      icon: Users,
      accent: 'magenta',
      route: '/community',
      features: ['Member Discussions', 'Discord Server', 'Project Collaboration', 'Member Spotlight']
    },
    {
      id: 'mobile-dev',
      title: 'Innovative Projects & Tools',
      tag: 'Android Ports & Developer Tools',
      description: 'From Mission GTA Mobile Snapdragon optimization to the lightweight ACode mobile editor, experience cutting-edge apps.',
      icon: Terminal,
      accent: 'cyan',
      route: '/projects',
      features: ['Mission GTA Mobile', 'ACode Android Editor', 'Open Source', 'High Performance']
    }
  ];

  return (
    <section 
      id="explore-aura"
      className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10"
      aria-labelledby="explore-heading"
    >
      {/* Background ambient neon glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#00F3FF]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#FF00C1]/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-[#00F3FF]/10 border border-[#00F3FF]/30 text-[#00F3FF] mb-3 text-glow-cyan">
            <Sparkles className="w-3.5 h-3.5" /> EXPLORE THE ECOSYSTEM
          </div>
          <h2 id="explore-heading" className="text-3xl sm:text-5xl font-syncopate font-bold text-white tracking-tight uppercase">
            EXPLORE <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#00F3FF] to-[#FF00C1]">AURA</span>
          </h2>
          <p className="text-base sm:text-lg text-white/60 mt-3 max-w-2xl font-space">
            A united digital ecosystem bridging creative technology, education, original music, and collaborative community.
          </p>
        </div>

        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#00F3FF] hover:text-white transition-colors group px-5 py-3 rounded-xl bg-white/[0.03] hover:bg-[#00F3FF]/10 border border-white/10 hover:border-[#00F3FF]/40 w-fit"
        >
          View All Projects
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Glassmorphic 3D Interactive Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {cards.map((card, idx) => {
          const Icon = card.icon;

          const accentStyles = {
            cyan: {
              border: 'group-hover:border-[#00F3FF]/50',
              glow: 'group-hover:shadow-[0_8px_32px_-8px_rgba(0,243,255,0.3)]',
              badge: 'bg-[#00F3FF]/10 text-[#00F3FF] border-[#00F3FF]/20',
              iconBg: 'bg-[#00F3FF]/10 text-[#00F3FF] border-[#00F3FF]/30',
              btn: 'text-[#00F3FF] group-hover:text-white',
            },
            magenta: {
              border: 'group-hover:border-[#FF00C1]/50',
              glow: 'group-hover:shadow-[0_8px_32px_-8px_rgba(255,0,193,0.3)]',
              badge: 'bg-[#FF00C1]/10 text-[#FF00C1] border-[#FF00C1]/20',
              iconBg: 'bg-[#FF00C1]/10 text-[#FF00C1] border-[#FF00C1]/30',
              btn: 'text-[#FF00C1] group-hover:text-white',
            },
            lime: {
              border: 'group-hover:border-[#94FF00]/50',
              glow: 'group-hover:shadow-[0_8px_32px_-8px_rgba(148,255,0,0.3)]',
              badge: 'bg-[#94FF00]/10 text-[#94FF00] border-[#94FF00]/20',
              iconBg: 'bg-[#94FF00]/10 text-[#94FF00] border-[#94FF00]/30',
              btn: 'text-[#94FF00] group-hover:text-white',
            },
          }[card.accent];

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.19, 1, 0.22, 1] }}
              className={`group flex flex-col justify-between p-7 rounded-3xl bg-[#0a0a0a]/75 backdrop-blur-xl border border-white/10 ${accentStyles.border} ${accentStyles.glow} transition-all duration-300 hover:-translate-y-1.5`}
            >
              <div>
                {/* Top Icon & Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${accentStyles.iconBg} transition-transform group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${accentStyles.badge}`}>
                    {card.accent.toUpperCase()}
                  </span>
                </div>

                <span className="text-[11px] font-mono font-semibold text-white/40 uppercase tracking-widest block mb-2">
                  {card.tag}
                </span>

                <h3 className="text-xl font-syncopate font-bold text-white mb-3 group-hover:text-white transition-colors">
                  {card.title}
                </h3>

                <p className="text-sm font-space text-white/60 leading-relaxed mb-6">
                  {card.description}
                </p>

                {/* Micro feature pills */}
                <div className="flex flex-wrap gap-1.5 mb-8">
                  {card.features.map((feat) => (
                    <span 
                      key={feat}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-white/60 border border-white/5 font-mono"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-4 border-t border-white/10">
                {card.isExternal ? (
                  <a
                    href={card.route}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider ${accentStyles.btn} transition-colors`}
                  >
                    <span>Launch Platform</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                ) : (
                  <Link
                    to={card.route}
                    className={`inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider ${accentStyles.btn} transition-colors`}
                  >
                    <span>Open Section</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
