import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// Color palettes inspired by NeonCore
export const COLOR_PALETTES = [
  { name: 'Neon Cyber', primary: 0x00F3FF, secondary: 0xFF00C1, accent: 0x94FF00 },
  { name: 'Ultra Cyan', primary: 0x00F3FF, secondary: 0x0088FF, accent: 0xFF00C1 },
  { name: 'Hyper Magenta', primary: 0xFF00C1, secondary: 0x8A00FF, accent: 0x00F3FF },
  { name: 'Acid Lime', primary: 0x94FF00, secondary: 0x00F3FF, accent: 0xFF00C1 },
  { name: 'Solar Flare', primary: 0xFF5500, secondary: 0xFF00C1, accent: 0x00F3FF },
];

interface NeonTubesSceneProps {
  onPaletteChange?: (paletteIndex: number) => void;
  className?: string;
}

export default function NeonTubesScene({ onPaletteChange, className = '' }: NeonTubesSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  // References for Three.js cleanup and animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const tubesGroupRef = useRef<THREE.Group | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const clockRef = useRef(new THREE.Clock());

  // Function to cycle palettes
  const cyclePalette = useCallback(() => {
    setPaletteIndex((prev) => {
      const next = (prev + 1) % COLOR_PALETTES.length;
      if (onPaletteChange) onPaletteChange(next);
      return next;
    });
  }, [onPaletteChange]);

  // Update tube material colors when palette changes
  useEffect(() => {
    if (!tubesGroupRef.current) return;
    const current = COLOR_PALETTES[paletteIndex];
    const colors = [current.primary, current.secondary, current.accent];

    tubesGroupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
        const col = colors[i % colors.length];
        child.material.color.setHex(col);
        child.material.emissive.setHex(col);
      }
    });
  }, [paletteIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) {
      setHasWebGL(false);
      return;
    }

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.04);
    sceneRef.current = scene;

    // 2. Camera setup
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);
    cameraRef.current = camera;

    // 3. Renderer setup
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      // Adaptively limit DPR to 2 for sharp retina but smooth 60fps performance
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (e) {
      setHasWebGL(false);
      return;
    }

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a0a14, 1.5);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00F3FF, 4, 30);
    cyanLight.position.set(-8, 5, 6);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xFF00C1, 4, 30);
    magentaLight.position.set(8, -5, 6);
    scene.add(magentaLight);

    const limeLight = new THREE.PointLight(0x94FF00, 2.5, 25);
    limeLight.position.set(0, 8, 4);
    scene.add(limeLight);

    // 5. Build dynamic 3D Neon Tube Splines
    const tubesGroup = new THREE.Group();
    tubesGroupRef.current = tubesGroup;
    scene.add(tubesGroup);

    const currentPalette = COLOR_PALETTES[paletteIndex];
    const paletteHexes = [currentPalette.primary, currentPalette.secondary, currentPalette.accent];

    // Create 9 fluid, intertwining 3D parametric curves
    const tubeCount = 9;
    const tubeObjects: { mesh: THREE.Mesh; basePoints: THREE.Vector3[]; speed: number; offset: number }[] = [];

    for (let i = 0; i < tubeCount; i++) {
      const points: THREE.Vector3[] = [];
      const segmentCount = 18;
      const angleOffset = (i / tubeCount) * Math.PI * 2;
      const radiusBase = 4.2 + (i % 3) * 1.5;

      for (let j = 0; j <= segmentCount; j++) {
        const t = (j / segmentCount) * Math.PI * 4;
        const x = Math.sin(t + angleOffset) * (radiusBase + Math.cos(t * 1.5) * 1.8);
        const y = Math.cos(t * 0.8 + angleOffset * 1.2) * (2.8 + Math.sin(t) * 1.5);
        const z = ((j / segmentCount) - 0.5) * 22 + Math.sin(t * 2) * 2;
        points.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, 90, 0.14, 10, false);

      const colorHex = paletteHexes[i % paletteHexes.length];
      const material = new THREE.MeshPhysicalMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 1.6,
        roughness: 0.15,
        metalness: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.92,
      });

      const tubeMesh = new THREE.Mesh(tubeGeometry, material);
      tubesGroup.add(tubeMesh);

      tubeObjects.push({
        mesh: tubeMesh,
        basePoints: points,
        speed: 0.4 + (i % 4) * 0.15,
        offset: angleOffset,
      });
    }

    // 6. Floating Neon Core particles in depth
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x00F3FF);
    const c2 = new THREE.Color(0xFF00C1);
    const c3 = new THREE.Color(0x94FF00);
    const particlePalette = [c1, c2, c3];

    for (let p = 0; p < particleCount; p++) {
      particlePositions[p * 3] = (Math.random() - 0.5) * 24;
      particlePositions[p * 3 + 1] = (Math.random() - 0.5) * 16;
      particlePositions[p * 3 + 2] = (Math.random() - 0.5) * 25;

      const pCol = particlePalette[p % particlePalette.length];
      particleColors[p * 3] = pCol.r;
      particleColors[p * 3 + 1] = pCol.g;
      particleColors[p * 3 + 2] = pCol.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 7. Event listeners for mouse/touch reactive physics
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = normX;
      mouseRef.current.targetY = normY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const normX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        mouseRef.current.targetX = normX * 1.2;
        mouseRef.current.targetY = normY * 1.2;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartRef.current && e.changedTouches.length > 0) {
        const dx = Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x);
        const dy = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
        // If it was a clean tap without large scroll drag, cycle palette
        if (dx < 10 && dy < 10) {
          cyclePalette();
        }
      }
      touchStartRef.current = null;
    };

    const handleClick = (e: MouseEvent) => {
      // Don't cycle if the user clicked an interactive link or button
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, [role="button"]')) return;
      cyclePalette();
    };

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    // Pause rendering when tab is hidden to conserve GPU/battery
    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) clockRef.current.getDelta(); // flush delta
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('click', handleClick);

    // 8. Main Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const elapsedTime = clockRef.current.getElapsedTime();

      // Smooth mouse interpolation (lerp)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Group rotation reacting to mouse coordinates and continuous orbital motion
      if (tubesGroup) {
        tubesGroup.rotation.z = elapsedTime * 0.06;
        tubesGroup.rotation.y = mouseRef.current.x * 0.45;
        tubesGroup.rotation.x = -mouseRef.current.y * 0.35;
      }

      // Dynamic light reaction to user interaction
      cyanLight.position.x = -8 + mouseRef.current.x * 6;
      cyanLight.position.y = 5 + mouseRef.current.y * 5;
      magentaLight.position.x = 8 - mouseRef.current.x * 6;
      magentaLight.position.y = -5 - mouseRef.current.y * 5;

      // Subtle particle drift
      particles.rotation.y = elapsedTime * 0.02;
      particles.rotation.x = mouseRef.current.y * 0.1;

      // Gentle wave deformation on camera position
      camera.position.x = mouseRef.current.x * 1.5;
      camera.position.y = mouseRef.current.y * 1.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // 9. Cleanup
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('click', handleClick);

      // Dispose Three.js objects
      tubeObjects.forEach((t) => {
        t.mesh.geometry.dispose();
        if (Array.isArray(t.mesh.material)) {
          t.mesh.material.forEach((m) => m.dispose());
        } else {
          t.mesh.material.dispose();
        }
      });
      particleGeometry.dispose();
      particleMaterial.dispose();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, [cyclePalette]);

  if (!hasWebGL) {
    // Beautiful CSS fallback if WebGL is unavailable
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#00F3FF]/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#FF00C1]/15 blur-[140px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#94FF00]/10 blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden cursor-crosshair ${className}`}
      style={{ zIndex: 0 }}
      title="Click or tap to shift the neon spectrum"
      aria-hidden="true"
    />
  );
}
