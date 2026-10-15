import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { loadCharacterModel, CharacterRig } from './CharacterLoader';
import { CharacterController } from './CharacterController';
import { Sparkles, Sun, Eye, Hand, Box } from 'lucide-react';

export type LightingPreset = 'studio' | 'cyber' | 'warm';

interface CharacterSceneProps {
  className?: string;
  lighting?: LightingPreset;
  interactive?: boolean;
  onLoaded?: () => void;
  showControls?: boolean;
}

export default function CharacterScene({
  className = '',
  lighting = 'studio',
  interactive = true,
  onLoaded,
  showControls = false,
}: CharacterSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isGlb, setIsGlb] = useState(false);
  const [currentLighting, setCurrentLighting] = useState<LightingPreset>(lighting);
  const [wireframe, setWireframe] = useState(false);

  const controllerRef = useRef<CharacterController | null>(null);
  const rigRef = useRef<CharacterRig | null>(null);
  const lightsRef = useRef<{
    keyLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    rimLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
  } | null>(null);

  // Trigger welcome wave gesture
  const handleWelcomeWave = () => {
    controllerRef.current?.triggerWelcomeGesture();
  };

  // Toggle wireframe mode
  const toggleWireframe = () => {
    if (!rigRef.current) return;
    const nextState = !wireframe;
    setWireframe(nextState);
    rigRef.current.root.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => (m.wireframe = nextState));
        } else {
          obj.material.wireframe = nextState;
        }
      }
    });
  };

  // Switch lighting mood
  const handleLightingChange = (preset: LightingPreset) => {
    setCurrentLighting(preset);
    if (!lightsRef.current) return;
    const { keyLight, fillLight, rimLight, ambientLight } = lightsRef.current;

    if (preset === 'studio') {
      // Natural studio lighting matching the reference photo
      keyLight.color.setHex(0xfff7ee);
      keyLight.intensity = 2.4;
      keyLight.position.set(2, 4, 3);

      fillLight.color.setHex(0xe8edf5);
      fillLight.intensity = 1.2;
      fillLight.position.set(-3, 1, 2);

      rimLight.color.setHex(0xffffff);
      rimLight.intensity = 2.0;
      rimLight.position.set(0, 3, -3);

      ambientLight.color.setHex(0x222228);
      ambientLight.intensity = 1.0;
    } else if (preset === 'cyber') {
      // Cyber Neon lighting
      keyLight.color.setHex(0x00f3ff);
      keyLight.intensity = 3.0;
      keyLight.position.set(3, 2, 2);

      fillLight.color.setHex(0xff00c1);
      fillLight.intensity = 2.2;
      fillLight.position.set(-3, 0, 1);

      rimLight.color.setHex(0x94ff00);
      rimLight.intensity = 2.5;
      rimLight.position.set(0, 4, -2.5);

      ambientLight.color.setHex(0x0a0a14);
      ambientLight.intensity = 0.8;
    } else {
      // Warm Golden lighting
      keyLight.color.setHex(0xffaa44);
      keyLight.intensity = 2.8;
      keyLight.position.set(2.5, 3, 2.5);

      fillLight.color.setHex(0xff7744);
      fillLight.intensity = 1.4;
      fillLight.position.set(-2, 1, 2);

      rimLight.color.setHex(0xffd488);
      rimLight.intensity = 1.8;
      rimLight.position.set(0, 2, -3);

      ambientLight.color.setHex(0x22150d);
      ambientLight.intensity = 0.9;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isMounted = true;
    let animId: number;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0.35, 3.8);

    // 3. Renderer with high-fidelity PBR tone mapping
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
    } catch {
      setIsLoading(false);
      return;
    }

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x222228, 1.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ee, 2.4);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8edf5, 1.2);
    fillLight.position.set(-3, 1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    lightsRef.current = { keyLight, fillLight, rimLight, ambientLight };
    handleLightingChange(currentLighting);

    // Subtle backdrop pedestal glow
    const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.1, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x08080c,
      roughness: 0.8,
      metalness: 0.5,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -1.9, 0);
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Ring light around pedestal
    const ringGeo = new THREE.TorusGeometry(1.42, 0.02, 16, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, -1.84, 0);
    scene.add(ring);

    // 5. Load Character (production GLB or procedural likeness rig)
    loadCharacterModel('/models/founder.glb', (p) => {
      if (isMounted) setLoadProgress(p);
    }).then((rig) => {
      if (!isMounted) {
        rig.dispose();
        return;
      }
      rigRef.current = rig;
      setIsGlb(rig.isGlbLoaded);
      scene.add(rig.root);

      const controller = new CharacterController(rig, {
        enableLookAt: interactive,
        enableBreathing: true,
        enableBlinking: true,
      });
      controllerRef.current = controller;

      setIsLoading(false);
      if (onLoaded) onLoaded();
    });

    // 6. Interactive Mouse & Touch Tracking
    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive || !controllerRef.current) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      controllerRef.current.setPointer(nx, ny);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!interactive || !controllerRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const nx = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
      controllerRef.current.setPointer(nx, ny);
    };

    const handleClick = () => {
      if (!interactive) return;
      controllerRef.current?.triggerWelcomeGesture();
    };

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('click', handleClick);

    // 7. Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (controllerRef.current) {
        controllerRef.current.update(delta);
      }

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    // 8. Cleanup
    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('click', handleClick);

      pedestalGeo.dispose();
      pedestalMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();

      if (rigRef.current) {
        rigRef.current.dispose();
      }

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, [interactive]);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[360px] sm:min-h-[460px] cursor-pointer touch-none relative select-none"
        title="Interact with Shaan Mohammad (Click to trigger Welcome Gesture)"
        role="region"
        aria-label="Shaan Mohammad 3D Digital Host"
      />

      {/* Neutral Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/80 backdrop-blur-md z-20 pointer-events-none transition-opacity duration-500">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#00F3FF] animate-spin mb-4" />
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/70">
            Initialising 3D Digital Host
          </p>
          {loadProgress > 0 && (
            <p className="text-[11px] font-mono text-[#00F3FF] mt-1">
              {loadProgress.toFixed(0)}%
            </p>
          )}
        </div>
      )}

      {/* Floating Status & Controls Dock */}
      {showControls && !isLoading && (
        <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 z-20 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#94FF00] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/90">
              {isGlb ? 'Custom GLB Model' : 'PBR Likeness Rig'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Wave Gesture Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleWelcomeWave();
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition flex items-center gap-1.5"
              title="Greet visitors"
            >
              <span>Wave</span>
            </button>

            {/* Wireframe Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWireframe();
              }}
              className={`p-1.5 rounded-xl text-xs transition ${
                wireframe ? 'bg-[#00F3FF] text-black font-bold' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Toggle Wireframe Mesh"
            >
              <Box className="w-3.5 h-3.5" />
            </button>

            {/* Lighting Mode Switcher */}
            <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLightingChange('studio');
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono uppercase transition ${
                  currentLighting === 'studio' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
                title="Cinematic Studio Lighting"
              >
                Studio
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLightingChange('cyber');
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono uppercase transition ${
                  currentLighting === 'cyber' ? 'bg-[#00F3FF] text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
                title="Cyber Neon Lighting"
              >
                Neon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
