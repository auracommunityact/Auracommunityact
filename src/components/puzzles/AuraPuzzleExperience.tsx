import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, RotateCw, CheckCircle2, Award, Sparkles, 
  HelpCircle, RefreshCw, Layers, ShieldCheck, Flame
} from 'lucide-react';

interface PuzzleState {
  yawLocked: boolean;
  pitchLocked: boolean;
  rollLocked: boolean;
  alignment: number; // 0 to 100
  moves: number;
  solved: boolean;
  startTime: number;
  solveTimeSeconds: number | null;
}

export default function AuraPuzzleExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [puzzleState, setPuzzleState] = useState<PuzzleState>({
    yawLocked: false,
    pitchLocked: false,
    rollLocked: false,
    alignment: 15,
    moves: 0,
    solved: false,
    startTime: Date.now(),
    solveTimeSeconds: null,
  });

  const [activeMode, setActiveMode] = useState<'resonator' | 'fragments'>('resonator');
  const [showHelp, setShowHelp] = useState(false);
  const [achievements, setAchievements] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aura_puzzle_achievements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const coreGroupRef = useRef<THREE.Group | null>(null);
  const ringXRef = useRef<THREE.Mesh | null>(null);
  const ringYRef = useRef<THREE.Mesh | null>(null);
  const ringZRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Target angles (harmonic alignment solution)
  const targetRotation = useRef({
    x: 0.0,
    y: 0.0,
    z: 0.0,
  });

  // Current rotation & drag physics
  const currentRotation = useRef({ x: 1.2, y: -0.8, z: 0.6 });
  const isDragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });

  // Reset puzzle
  const handleReset = useCallback(() => {
    currentRotation.current = {
      x: (Math.random() - 0.5) * 2.5 + 1.0,
      y: (Math.random() - 0.5) * 2.5 - 1.0,
      z: (Math.random() - 0.5) * 2.5 + 0.8,
    };
    setPuzzleState({
      yawLocked: false,
      pitchLocked: false,
      rollLocked: false,
      alignment: 15,
      moves: 0,
      solved: false,
      startTime: Date.now(),
      solveTimeSeconds: null,
    });
  }, []);

  // Check alignment & snap
  const checkAlignment = useCallback(() => {
    const rx = currentRotation.current.x % (Math.PI * 2);
    const ry = currentRotation.current.y % (Math.PI * 2);
    const rz = currentRotation.current.z % (Math.PI * 2);

    const diffX = Math.min(Math.abs(rx), Math.abs(rx - Math.PI * 2));
    const diffY = Math.min(Math.abs(ry), Math.abs(ry - Math.PI * 2));
    const diffZ = Math.min(Math.abs(rz), Math.abs(rz - Math.PI * 2));

    const threshold = 0.22; // ~12 degrees tolerance
    const xLocked = diffX < threshold;
    const yLocked = diffY < threshold;
    const zLocked = diffZ < threshold;

    const alignScore = Math.max(
      15,
      Math.min(
        100,
        Math.round(100 - (diffX + diffY + diffZ) * 25)
      )
    );

    const isSolved = xLocked && yLocked && zLocked;

    setPuzzleState((prev) => {
      if (prev.solved) return prev;
      if (isSolved && !prev.solved) {
        // Unlock achievement
        const newAchievements = Array.from(new Set([...achievements, 'Aura Core Harmonizer']));
        setAchievements(newAchievements);
        try {
          localStorage.setItem('aura_puzzle_achievements', JSON.stringify(newAchievements));
        } catch {
          // ignore
        }
        return {
          ...prev,
          yawLocked: true,
          pitchLocked: true,
          rollLocked: true,
          alignment: 100,
          solved: true,
          solveTimeSeconds: Math.round((Date.now() - prev.startTime) / 1000),
        };
      }
      return {
        ...prev,
        yawLocked: yLocked,
        pitchLocked: xLocked,
        rollLocked: zLocked,
        alignment: alignScore,
      };
    });

    // Update ring colors based on lock state
    if (ringXRef.current && ringXRef.current.material instanceof THREE.MeshStandardMaterial) {
      ringXRef.current.material.color.setHex(xLocked ? 0x00f3ff : 0xff00c1);
      ringXRef.current.material.emissive.setHex(xLocked ? 0x00f3ff : 0xff00c1);
    }
    if (ringYRef.current && ringYRef.current.material instanceof THREE.MeshStandardMaterial) {
      ringYRef.current.material.color.setHex(yLocked ? 0x94ff00 : 0xff5500);
      ringYRef.current.material.emissive.setHex(yLocked ? 0x94ff00 : 0xff5500);
    }
    if (ringZRef.current && ringZRef.current.material instanceof THREE.MeshStandardMaterial) {
      ringZRef.current.material.color.setHex(zLocked ? 0x00f3ff : 0x8a00ff);
      ringZRef.current.material.emissive.setHex(zLocked ? 0x00f3ff : 0x8a00ff);
    }
  }, [achievements]);

  // Three.js WebGL Core Polyhedron Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isMounted = true;
    let animId: number;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0, 7.5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x0e111a, 1.2);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f3ff, 4, 15);
    cyanLight.position.set(4, 4, 4);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xff00c1, 3.5, 15);
    magentaLight.position.set(-4, -4, 3);
    scene.add(magentaLight);

    // 5. 3D Core Polyhedron Hierarchy
    const coreGroup = new THREE.Group();
    coreGroupRef.current = coreGroup;
    scene.add(coreGroup);

    // Central Dodecahedron Core
    const coreGeo = new THREE.DodecahedronGeometry(1.6, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0c14,
      emissive: 0x00f3ff,
      emissiveIntensity: 0.15,
      roughness: 0.18,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Inner glowing crystal core
    const innerCrystalGeo = new THREE.OctahedronGeometry(0.9, 0);
    const innerCrystalMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
    });
    const innerCrystal = new THREE.Mesh(innerCrystalGeo, innerCrystalMat);
    coreGroup.add(innerCrystal);

    // Wireframe Outer Cage
    const wireGeo = new THREE.IcosahedronGeometry(2.1, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireMesh);

    // 6. Three Resonant Alignment Node Rings (Pitch, Yaw, Roll)
    const ringGeoX = new THREE.TorusGeometry(2.4, 0.04, 16, 64);
    const ringMatX = new THREE.MeshStandardMaterial({
      color: 0xff00c1,
      emissive: 0xff00c1,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ringX = new THREE.Mesh(ringGeoX, ringMatX);
    ringX.rotation.y = Math.PI / 2;
    coreGroup.add(ringX);
    ringXRef.current = ringX;

    const ringGeoY = new THREE.TorusGeometry(2.6, 0.04, 16, 64);
    const ringMatY = new THREE.MeshStandardMaterial({
      color: 0xff5500,
      emissive: 0xff5500,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ringY = new THREE.Mesh(ringGeoY, ringMatY);
    ringY.rotation.x = Math.PI / 2;
    coreGroup.add(ringY);
    ringYRef.current = ringY;

    const ringGeoZ = new THREE.TorusGeometry(2.8, 0.04, 16, 64);
    const ringMatZ = new THREE.MeshStandardMaterial({
      color: 0x8a00ff,
      emissive: 0x8a00ff,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ringZ = new THREE.Mesh(ringGeoZ, ringMatZ);
    coreGroup.add(ringZ);
    ringZRef.current = ringZ;

    // 7. Floating Quantum Node Particles
    const pCount = 180;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const radius = 3.2 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = radius * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 8. Pointer / Touch Interactive Rotation
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousPointer.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousPointer.current.x;
      const deltaY = clientY - previousPointer.current.y;

      currentRotation.current.y += deltaX * 0.012;
      currentRotation.current.x += deltaY * 0.012;

      previousPointer.current = { x: clientX, y: clientY };

      setPuzzleState((prev) => ({ ...prev, moves: prev.moves + 1 }));
      checkAlignment();
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    container.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // Initial check
    checkAlignment();

    // 9. Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (coreGroupRef.current) {
        // Smoothly interpolate rotation toward drag coordinates
        coreGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          coreGroupRef.current.rotation.x,
          currentRotation.current.x,
          0.1
        );
        coreGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          coreGroupRef.current.rotation.y,
          currentRotation.current.y,
          0.1
        );
        coreGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          coreGroupRef.current.rotation.z,
          currentRotation.current.z,
          0.1
        );
      }

      // Inner crystal dynamic pulse
      innerCrystal.rotation.y += delta * 0.8;
      innerCrystal.rotation.x += delta * 0.4;

      // Subtle particle cloud drift
      particles.rotation.y = elapsed * 0.04;

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);

      container.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      coreGeo.dispose();
      coreMat.dispose();
      innerCrystalGeo.dispose();
      innerCrystalMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringGeoX.dispose();
      ringMatX.dispose();
      ringGeoY.dispose();
      ringMatY.dispose();
      ringGeoZ.dispose();
      ringMatZ.dispose();
      pGeo.dispose();
      pMat.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [checkAlignment]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full select-none" aria-label="Interactive 3D Puzzle">
      <div className="p-6 sm:p-10 lg:p-12 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 relative overflow-hidden shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F3FF]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF00C1]/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          
          {/* 3D Interactive Viewport Column */}
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F3FF] animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00F3FF]">
                  Aura Core Resonator 3D
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition flex items-center gap-1 text-xs font-mono"
                  title="Reset 3D Core"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition text-xs"
                  title="Puzzle Instructions"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3D Canvas Box */}
            <div 
              ref={containerRef} 
              className="w-full h-[360px] sm:h-[440px] rounded-2xl bg-gradient-to-b from-white/[0.04] to-black/80 border border-white/10 relative cursor-grab active:cursor-grabbing touch-none overflow-hidden shadow-inner flex items-center justify-center"
            >
              {/* Interaction Hint Overlay */}
              {!puzzleState.solved && (
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 pointer-events-none text-[11px] font-mono text-white/60">
                  <RotateCw className="w-3.5 h-3.5 text-[#00F3FF] animate-spin" />
                  <span>Drag 3D Core to align node rings</span>
                </div>
              )}

              {/* Solved Celebration Overlay */}
              <AnimatePresence>
                {puzzleState.solved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F3FF] to-[#94FF00] p-0.5 mb-4 shadow-[0_0_30px_rgba(0,243,255,0.7)] animate-bounce">
                      <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center text-[#00F3FF]">
                        <CheckCircle2 className="w-8 h-8 text-[#94FF00]" />
                      </div>
                    </div>
                    <h3 className="font-syncopate font-bold text-xl sm:text-2xl text-white uppercase tracking-tight mb-2">
                      RESONANCE ALIGNED!
                    </h3>
                    <p className="text-xs sm:text-sm text-white/75 max-w-sm mb-4">
                      You harmonized the Aura Quantum Core in {puzzleState.moves} moves ({puzzleState.solveTimeSeconds}s).
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00F3FF]/15 border border-[#00F3FF]/40 text-[#00F3FF] font-mono text-xs font-bold uppercase tracking-widest">
                      <Award className="w-4 h-4" />
                      <span>ACHIEVEMENT UNLOCKED: AURA PIONEER</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Puzzle Status, Progress & Achievements Column */}
          <div className="flex flex-col space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F3FF]/10 border border-[#00F3FF]/30 text-[#00F3FF] text-xs font-mono font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INTERACTIVE DISCOVERY</span>
              </div>
              <h2 className="font-syncopate font-bold text-2xl sm:text-3xl text-white uppercase tracking-tight">
                Harmonic Alignment Challenge
              </h2>
              <p className="text-sm text-white/60 leading-relaxed mt-2 font-space">
                Rotate the 3D quantum core to match the harmonic resonance frequencies. When all 3 node axes lock into alignment, the core triggers an energy surge.
              </p>
            </div>

            {/* Live Harmonic Resonance Meter */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/60 uppercase">Harmonic Resonance</span>
                <span className={`font-bold ${puzzleState.alignment >= 90 ? 'text-[#94FF00]' : 'text-[#00F3FF]'}`}>
                  {puzzleState.alignment}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00F3FF] via-[#FF00C1] to-[#94FF00] transition-all duration-300"
                  style={{ width: `${puzzleState.alignment}%` }}
                />
              </div>

              {/* 3 Axis Status Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className={`p-2.5 rounded-xl border text-center transition-all ${
                  puzzleState.pitchLocked ? 'bg-[#00F3FF]/15 border-[#00F3FF]/50 text-[#00F3FF]' : 'bg-white/5 border-white/10 text-white/50'
                }`}>
                  <span className="block text-[10px] font-mono uppercase tracking-wider">Pitch Axis</span>
                  <span className="text-xs font-bold">{puzzleState.pitchLocked ? 'LOCKED' : 'ALIGNING'}</span>
                </div>

                <div className={`p-2.5 rounded-xl border text-center transition-all ${
                  puzzleState.yawLocked ? 'bg-[#94FF00]/15 border-[#94FF00]/50 text-[#94FF00]' : 'bg-white/5 border-white/10 text-white/50'
                }`}>
                  <span className="block text-[10px] font-mono uppercase tracking-wider">Yaw Axis</span>
                  <span className="text-xs font-bold">{puzzleState.yawLocked ? 'LOCKED' : 'ALIGNING'}</span>
                </div>

                <div className={`p-2.5 rounded-xl border text-center transition-all ${
                  puzzleState.rollLocked ? 'bg-[#00F3FF]/15 border-[#00F3FF]/50 text-[#00F3FF]' : 'bg-white/5 border-white/10 text-white/50'
                }`}>
                  <span className="block text-[10px] font-mono uppercase tracking-wider">Roll Axis</span>
                  <span className="text-xs font-bold">{puzzleState.rollLocked ? 'LOCKED' : 'ALIGNING'}</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="block text-[11px] font-mono uppercase tracking-wider text-white/50">Total Moves</span>
                <span className="text-xl font-bold font-syncopate text-white">{puzzleState.moves}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="block text-[11px] font-mono uppercase tracking-wider text-white/50">Core Status</span>
                <span className={`text-sm font-bold font-mono uppercase ${puzzleState.solved ? 'text-[#94FF00]' : 'text-amber-400'}`}>
                  {puzzleState.solved ? 'HARMONIZED' : 'SEEKING LOCK'}
                </span>
              </div>
            </div>

            {/* Instructions / Help collapse */}
            {showHelp && (
              <div className="p-4 rounded-2xl bg-[#00F3FF]/5 border border-[#00F3FF]/20 text-xs text-white/80 space-y-2">
                <p className="font-bold text-[#00F3FF]">How to solve:</p>
                <ul className="list-disc list-inside space-y-1 text-white/70">
                  <li>Click/tap and drag on the 3D core to rotate it.</li>
                  <li>Watch the outer rings: when an axis approaches harmonic resonance, the ring changes color to cyan/lime.</li>
                  <li>Hold the core near the neutral orientation until all 3 axes turn green/cyan.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
