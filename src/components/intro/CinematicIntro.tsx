import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, SkipForward, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { createProceduralLikenessHost, CharacterRig } from '../character/CharacterLoader';
import { CharacterController } from '../character/CharacterController';
import { siteConfig } from '../../config';

interface CinematicIntroProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export default function CinematicIntro({ onComplete, forceShow = false }: CinematicIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('A');
  const [isExiting, setIsExiting] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  const characterRigRef = useRef<CharacterRig | null>(null);
  const controllerRef = useRef<CharacterController | null>(null);

  // Skip or Enter Aura
  const handleExit = useCallback(() => {
    setIsExiting(true);
    try {
      sessionStorage.setItem('aura_intro_completed', 'true');
    } catch {
      // Ignore storage errors in restrictive environments
    }
    setTimeout(() => {
      onComplete();
    }, 700);
  }, [onComplete]);

  // Keyboard shortcut (Escape to skip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExit]);

  // Lock body scroll while intro is visible
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Three.js Cinematic Timeline & Particle Assembly Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setPhase('F');
      return;
    }

    let isMounted = true;
    let animId: number;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    // 3. Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      container.appendChild(renderer.domElement);
    } catch {
      setHasWebGL(false);
      setPhase('F');
      return;
    }

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x0e1118, 0.8);
    scene.add(ambientLight);

    const blueRim = new THREE.PointLight(0x00f3ff, 5, 25);
    blueRim.position.set(-6, 3, 2);
    scene.add(blueRim);

    const magentaRim = new THREE.PointLight(0xff00c1, 4, 25);
    magentaRim.position.set(6, -3, 2);
    scene.add(magentaRim);

    // Light sweep spotlight for Phase C
    const sweepLight = new THREE.SpotLight(0xffffff, 0, 30, Math.PI / 6, 0.4, 1);
    sweepLight.position.set(-10, 8, 8);
    scene.add(sweepLight);

    // 5. Phase A: Drifting Ambient Particles
    const particleCount = 450;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pTargetPos = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);

    // Scattered initial positions
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 35;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 30;

      // Color spectrum (Cyan / Magenta / White)
      const t = Math.random();
      if (t < 0.5) {
        pColors[i * 3] = 0.0;
        pColors[i * 3 + 1] = 0.95;
        pColors[i * 3 + 2] = 1.0;
      } else if (t < 0.8) {
        pColors[i * 3] = 1.0;
        pColors[i * 3 + 1] = 0.0;
        pColors[i * 3 + 2] = 0.75;
      } else {
        pColors[i * 3] = 1.0;
        pColors[i * 3 + 1] = 1.0;
        pColors[i * 3 + 2] = 1.0;
      }
    }

    // 6. Phase B: Target Assembly - The Aura Geometric Monolith & Ring
    // Outer Torus Ring
    const ringCount = 200;
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const r = 3.6 + (Math.random() - 0.5) * 0.2;
      pTargetPos[i * 3] = Math.cos(angle) * r;
      pTargetPos[i * 3 + 1] = Math.sin(angle) * r;
      pTargetPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }

    // Inner Tri-Chevron / "A" Glyph Assembly
    for (let i = ringCount; i < particleCount; i++) {
      const frac = (i - ringCount) / (particleCount - ringCount);
      // Left leg, right leg, crossbar of "A"
      if (frac < 0.45) {
        const u = frac / 0.45;
        pTargetPos[i * 3] = -2.0 + u * 2.0;
        pTargetPos[i * 3 + 1] = -2.2 + u * 4.4;
        pTargetPos[i * 3 + 2] = 0;
      } else if (frac < 0.9) {
        const u = (frac - 0.45) / 0.45;
        pTargetPos[i * 3] = 0.0 + u * 2.0;
        pTargetPos[i * 3 + 1] = 2.2 - u * 4.4;
        pTargetPos[i * 3 + 2] = 0;
      } else {
        const u = (frac - 0.9) / 0.1;
        pTargetPos[i * 3] = -1.1 + u * 2.2;
        pTargetPos[i * 3 + 1] = -0.4;
        pTargetPos[i * 3 + 2] = 0;
      }
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleMesh = new THREE.Points(pGeo, pMat);
    scene.add(particleMesh);

    // Assembled Solid Brand Glyph (Phase C)
    const brandGroup = new THREE.Group();
    brandGroup.scale.set(0.001, 0.001, 0.001);
    scene.add(brandGroup);

    // Glowing Holographic Outer Torus
    const solidRingGeo = new THREE.TorusGeometry(3.6, 0.06, 16, 64);
    const solidRingMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f3ff,
      emissive: 0x00f3ff,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
    });
    const solidRing = new THREE.Mesh(solidRingGeo, solidRingMat);
    brandGroup.add(solidRing);

    // 7. Phase D: Realistic 3D Character Host Integration
    const characterRig = createProceduralLikenessHost();
    characterRigRef.current = characterRig;
    characterRig.root.position.set(0, -6, 4); // start below frame
    characterRig.root.scale.set(1.4, 1.4, 1.4);
    scene.add(characterRig.root);

    const controller = new CharacterController(characterRig, {
      enableLookAt: true,
      enableBreathing: true,
      enableBlinking: true,
    });
    controllerRef.current = controller;

    // Handle Window Resize
    const handleResize = () => {
      if (!renderer || !camera) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Timeline Clock & Transitions
    const clock = new THREE.Clock();
    let assemblyFactor = 0; // 0: random, 1: assembled

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      controller.update(delta);

      // Phase Sequence Timing
      // 0.0s - 1.2s: Phase A (Dark void & drifting particles)
      if (elapsed < 1.2) {
        if (phase !== 'A') setPhase('A');
        // Gently rotate drifting particles
        particleMesh.rotation.y = elapsed * 0.08;
        particleMesh.rotation.x = elapsed * 0.04;
      }
      // 1.2s - 2.8s: Phase B (Assembling brand mark)
      else if (elapsed < 2.8) {
        if (phase !== 'B') setPhase('B');
        assemblyFactor = Math.min((elapsed - 1.2) / 1.5, 1.0);
        // Lerp particle positions toward target brand shape with smooth cubic ease
        const ease = assemblyFactor * assemblyFactor * (3 - 2 * assemblyFactor);
        const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          const ox = pPos[i * 3];
          const oy = pPos[i * 3 + 1];
          const oz = pPos[i * 3 + 2];
          const tx = pTargetPos[i * 3];
          const ty = pTargetPos[i * 3 + 1];
          const tz = pTargetPos[i * 3 + 2];

          posAttr.setXYZ(
            i,
            THREE.MathUtils.lerp(ox, tx, ease),
            THREE.MathUtils.lerp(oy, ty, ease),
            THREE.MathUtils.lerp(oz, tz, ease)
          );
        }
        posAttr.needsUpdate = true;
      }
      // 2.8s - 3.8s: Phase C (Light sweep across brand mark)
      else if (elapsed < 3.8) {
        if (phase !== 'C') setPhase('C');
        const sweepProgress = (elapsed - 2.8) / 1.0;
        brandGroup.scale.set(1, 1, 1);
        solidRingMat.emissiveIntensity = 1.0 + Math.sin(sweepProgress * Math.PI) * 2.5;

        sweepLight.intensity = 8 * Math.sin(sweepProgress * Math.PI);
        sweepLight.position.x = -8 + sweepProgress * 16;
      }
      // 3.8s - 4.8s: Phase D (Digital Character Host enters via camera dolly)
      else if (elapsed < 4.8) {
        if (phase !== 'D') {
          setPhase('D');
          controller.triggerWelcomeGesture();
        }
        const enterProgress = Math.min((elapsed - 3.8) / 1.0, 1.0);
        const easeEnter = enterProgress * enterProgress * (3 - 2 * enterProgress);

        // Smooth camera dolly and character entrance
        characterRig.root.position.y = THREE.MathUtils.lerp(-6, -1.8, easeEnter);
        camera.position.z = THREE.MathUtils.lerp(16, 11, easeEnter);
        brandGroup.position.y = THREE.MathUtils.lerp(0, 1.8, easeEnter);
        brandGroup.scale.set(0.65, 0.65, 0.65);
      }
      // 4.8s - 5.8s: Phase E (Display Typography)
      else if (elapsed < 5.8) {
        if (phase !== 'E') setPhase('E');
      }
      // 5.8s+: Phase F (Interactive "ENTER AURA" Button Ready)
      else {
        if (phase !== 'F') setPhase('F');
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);

      pGeo.dispose();
      pMat.dispose();
      solidRingGeo.dispose();
      solidRingMat.dispose();

      characterRig.dispose();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#050505] text-white flex flex-col justify-between select-none transition-opacity duration-700 ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Cinematic 3D Website Intro"
    >
      {/* Three.js Full-screen Canvas Layer */}
      <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Top Header / Skip Control */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-black/60 border border-white/20 p-1 flex items-center justify-center">
            <img src={siteConfig.logo} alt="Aura Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-syncopate font-bold text-xs uppercase tracking-[0.2em] text-white/80">
            Aura Experience
          </span>
        </div>

        {/* Skip Intro Button */}
        <button
          onClick={handleExit}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono uppercase tracking-wider text-white/90 hover:text-white transition flex items-center gap-2 group backdrop-blur-md cursor-pointer"
          title="Skip intro (Press Esc)"
        >
          <span>Skip Intro</span>
          <SkipForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* Center Cinematic Typography & Digital Host Presentation */}
      <main className="relative z-10 my-auto w-full max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        <AnimatePresence mode="wait">
          {(phase === 'D' || phase === 'E' || phase === 'F') && (
            <motion.div
              key="intro-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="space-y-4"
            >
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 border border-[#00F3FF]/40 backdrop-blur-xl shadow-[0_0_20px_rgba(0,243,255,0.25)]">
                <span className="w-2 h-2 rounded-full bg-[#00F3FF] animate-ping" />
                <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#00F3FF] uppercase">
                  SHAAN MOHAMMAD • DIGITAL HOST
                </span>
              </div>

              {/* Main Title: AURA COMMUNITY ACT */}
              <h1 className="font-syncopate font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-white uppercase drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
                AURA COMMUNITY <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F3FF] via-white to-[#FF00C1]">ACT</span>
              </h1>

              {/* Tagline: CREATIVITY. COMMUNITY. TECHNOLOGY. */}
              <p className="font-mono text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase text-white/70 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                CREATIVITY • COMMUNITY • TECHNOLOGY
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom CTA Button: ENTER AURA */}
      <footer className="relative z-10 w-full max-w-md mx-auto px-6 pb-12 flex flex-col items-center">
        <AnimatePresence>
          {phase === 'F' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              className="w-full flex flex-col items-center gap-3"
            >
              <button
                onClick={handleExit}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-[#00F3FF] via-[#00e1ec] to-[#00F3FF] text-black font-syncopate font-bold text-xs uppercase tracking-[0.2em] shadow-[0_0_35px_rgba(0,243,255,0.6)] hover:shadow-[0_0_50px_rgba(0,243,255,0.85)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer"
              >
                <span>ENTER AURA</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
              <p className="text-[11px] font-mono text-white/40">
                Press Esc anytime to skip intro
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
}
