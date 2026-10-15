import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, User, Box, ShieldCheck, CheckCircle2, 
  ArrowRight, Download, Eye, ExternalLink, Code2 
} from 'lucide-react';
import CharacterScene, { LightingPreset } from '../components/character/CharacterScene';
import { FOUNDER_CHARACTER_SPEC } from '../components/character/characterSpec';
import { LocationSection } from '../components/Sections';
import { siteConfig } from '../config';

export default function Founder() {
  const [activeTab, setActiveTab] = useState<'overview' | 'likeness' | 'pipeline'>('overview');

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full select-none">
      
      {/* Header Eyebrow */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F3FF]/10 border border-[#00F3FF]/30 text-[#00F3FF] text-xs font-mono font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>LEADERSHIP & 3D DIGITAL IDENTITY</span>
        </div>
        <h1 className="font-syncopate font-bold text-3xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight">
          Shaan Mohammad
        </h1>
        <p className="text-white/60 text-sm sm:text-base font-space mt-3 max-w-xl mx-auto">
          Founder of Aura Community Act • Creator, Developer & 3D Digital Host
        </p>
      </div>

      {/* Hero Showcase: 3D Host Stage & Real Photo Side-by-Side */}
      <div className="grid lg:grid-cols-2 gap-8 mb-16 items-center">
        
        {/* Real-Time 3D Digital Host Stage */}
        <div className="rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 relative overflow-hidden shadow-2xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F3FF] animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00F3FF]">
                Real-Time 3D Host
              </span>
            </div>
            <span className="text-[11px] font-mono text-white/50">
              Interactive WebGL
            </span>
          </div>

          {/* 3D Viewport with Controls */}
          <div className="w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-b from-white/[0.03] to-black/90 border border-white/10 overflow-hidden relative">
            <CharacterScene showControls={true} />
          </div>

          <p className="text-[11px] font-mono text-white/50 text-center mt-3">
            Click / tap character to trigger welcome wave • Head follows cursor
          </p>
        </div>

        {/* Official Reference Photograph & Founder Mission */}
        <div className="rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-[#00F3FF]/40 p-1 flex-shrink-0 overflow-hidden shadow-[0_0_20px_rgba(0,243,255,0.2)]">
              <img 
                src={siteConfig.founderPhoto} 
                alt="Shaan Mohammad Reference Photo" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00F3FF] font-bold">
                Identity Reference
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Shaan Mohammad</h2>
              <p className="text-xs text-white/50 font-mono">Age: 15 years • India</p>
            </div>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-white/75 font-space leading-relaxed">
            <p>
              Shaan Mohammad founded <strong className="text-white">Aura Community ACT</strong> to create a dedicated hub where technology, education, game porting, independent music, and creative communities intersect.
            </p>
            <p>
              Driven by hands-on engineering, Shaan conceptualized major initiatives including <strong className="text-[#00F3FF]">Mission GTA Mobile</strong> (high-performance Android Snapdragon optimization), <strong className="text-[#FF00C1]">Aura Music Studio</strong>, and the <strong className="text-[#94FF00]">Aura Learning</strong> initiative.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-[10px] font-mono text-white/50 uppercase">Initiative Role</span>
              <span className="text-xs sm:text-sm font-bold text-white">Lead Architect</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-[10px] font-mono text-white/50 uppercase">Digital Host</span>
              <span className="text-xs sm:text-sm font-bold text-[#00F3FF]">Online • Interactive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Technical Likeness Specifications & Asset Pipeline Tabs */}
      <div className="rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 mb-16 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          <div>
            <h3 className="font-syncopate font-bold text-lg sm:text-xl text-white uppercase tracking-tight">
              3D Digital Character Specifications
            </h3>
            <p className="text-xs text-white/50 font-space mt-1">
              Photorealistic character likeness engineering derived from IMG_20260930_175344.png
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase transition cursor-pointer ${
                activeTab === 'overview' ? 'bg-[#00F3FF] text-black font-bold' : 'text-white/70 hover:text-white'
              }`}
            >
              10-Trait Likeness
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase transition cursor-pointer ${
                activeTab === 'pipeline' ? 'bg-[#00F3FF] text-black font-bold' : 'text-white/70 hover:text-white'
              }`}
            >
              GLB Pipeline
            </button>
          </div>
        </div>

        {/* Tab 1: 10 Likeness Traits Grid */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-4">
            {FOUNDER_CHARACTER_SPEC.traits.map((trait) => (
              <div 
                key={trait.title}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-syncopate text-[#00F3FF] uppercase tracking-wider">
                    {trait.title}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/50 uppercase">
                    {trait.category}
                  </span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed font-space">
                  {trait.description}
                </p>
                <p className="text-[11px] text-white/50 italic font-mono pt-1">
                  Guidance: {trait.technicalGuidance}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Asset Import Pipeline */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 font-space text-xs sm:text-sm text-white/80 leading-relaxed">
              <h4 className="font-syncopate font-bold text-white text-sm uppercase">
                Production Asset Import Path
              </h4>
              <p>
                The application automatically inspects <code className="text-[#00F3FF] bg-black px-2 py-1 rounded">/public/models/founder.glb</code>. 
                When a high-poly scanned or modeled glTF 2.0 binary asset is placed in this directory, the Three.js <code className="text-[#94FF00]">CharacterLoader</code> immediately switches to rendering the production asset with all attached skeletal bone animations and facial morph targets.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[#00F3FF] font-bold block">Rigging Hierarchy</span>
                <p className="text-white/60">
                  Mixamo / Humanoid standard bones: Head, Neck, Spine2, LeftEye, RightEye, LeftShoulder, RightShoulder, RightArm.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[#FF00C1] font-bold block">Facial Blendshapes</span>
                <p className="text-white/60">
                  eyeBlinkLeft, eyeBlinkRight, mouthSmileLeft, jawOpen, eyeLookLeft, eyeLookRight.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[#94FF00] font-bold block">PBR Textures</span>
                <p className="text-white/60">
                  2048x2048 Albedo (sRGB), Tangent Normal (OpenGL), packed ORM (AO/Roughness/Metallic).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Section */}
      <LocationSection />
    </div>
  );
}
