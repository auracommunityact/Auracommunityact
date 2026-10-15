import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { createProceduralLikenessHost, CharacterRig } from '../character/CharacterLoader';
import { CharacterController } from '../character/CharacterController';

interface AuraHeroSceneProps {
  className?: string;
  onCharacterClick?: () => void;
  lightingPreset?: 'cinematic' | 'cyber' | 'studio';
}

export default function AuraHeroScene({
  className = '',
  onCharacterClick,
  lightingPreset = 'cinematic',
}: AuraHeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  const characterRigRef = useRef<CharacterRig | null>(null);
  const controllerRef = useRef<CharacterController | null>(null);

  // Interaction coordinates
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Floating geometric objects
  const floatingObjectsRef = useRef<THREE.Mesh[]>([]);

  // Trigger welcome gesture
  const triggerGesture = useCallback(() => {
    controllerRef.current?.triggerWelcomeGesture();
    if (onCharacterClick) onCharacterClick();
  }, [onCharacterClick]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isMounted = true;
    let animId: number;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 80);
    camera.position.set(0, 0.5, 9.2);

    // 3. Renderer
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
      renderer.toneMappingExposure = 1.25;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
    } catch {
      setHasWebGL(false);
      return;
    }

    // 4. Cinematic Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x0a0d14, 1.2);
    scene.add(ambientLight);

    // Key Light (studio warmth)
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.8);
    keyLight.position.set(3.5, 4.5, 4.0);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Cyan Rim Light (brand electric edge)
    const cyanRim = new THREE.PointLight(0x00f3ff, 4.5, 20);
    cyanRim.position.set(-6, 2.5, 2);
    scene.add(cyanRim);

    // Magenta Rim Light (creative depth)
    const magentaRim = new THREE.PointLight(0xff00c1, 3.8, 20);
    magentaRim.position.set(6, -2, 2);
    scene.add(magentaRim);

    // Subtle Top Accent Light
    const topAccent = new THREE.PointLight(0x94ff00, 2.0, 15);
    topAccent.position.set(0, 5, -2);
    scene.add(topAccent);

    // 5. Digital Host 3D Character
    const characterRig = createProceduralLikenessHost();
    characterRigRef.current = characterRig;
    characterRig.root.position.set(2.8, -1.8, 1.2);
    characterRig.root.scale.set(1.2, 1.2, 1.2);
    scene.add(characterRig.root);

    const controller = new CharacterController(characterRig, {
      enableLookAt: true,
      enableBreathing: true,
      enableBlinking: true,
    });
    controllerRef.current = controller;

    // 6. Custom Aura Brand Monument Sculpture (Center Left)
    const brandSculpture = new THREE.Group();
    brandSculpture.position.set(-2.4, 0.4, 0);
    scene.add(brandSculpture);

    // Central Monolith
    const monolithGeo = new THREE.CylinderGeometry(0.7, 0.9, 3.2, 6);
    const monolithMat = new THREE.MeshPhysicalMaterial({
      color: 0x05070c,
      roughness: 0.12,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });
    const monolith = new THREE.Mesh(monolithGeo, monolithMat);
    brandSculpture.add(monolith);

    // Orbiting Holographic Rings
    const ringGeo1 = new THREE.TorusGeometry(1.6, 0.03, 16, 64);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x00f3ff,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    brandSculpture.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.9, 0.025, 16, 64);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xff00c1,
      emissive: 0xff00c1,
      emissiveIntensity: 1.0,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    brandSculpture.add(ring2);

    // 7. Floating Interactive Polyhedral Objects
    const floatingMeshes: THREE.Mesh[] = [];
    const polyGeos = [
      new THREE.OctahedronGeometry(0.35, 0),
      new THREE.IcosahedronGeometry(0.3, 0),
      new THREE.TetrahedronGeometry(0.28, 0),
      new THREE.DodecahedronGeometry(0.32, 0),
    ];

    const polyColors = [0x00f3ff, 0xff00c1, 0x94ff00, 0xffffff];

    for (let i = 0; i < 7; i++) {
      const g = polyGeos[i % polyGeos.length];
      const m = new THREE.MeshPhysicalMaterial({
        color: polyColors[i % polyColors.length],
        roughness: 0.2,
        metalness: 0.7,
        clearcoat: 1.0,
        wireframe: i % 2 === 1,
      });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 7 + 0.5,
        (Math.random() - 0.5) * 6 - 1
      );
      mesh.userData = {
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.6,
        baseY: mesh.position.y,
        floatFreq: 1.0 + Math.random() * 1.5,
      };
      scene.add(mesh);
      floatingMeshes.push(mesh);
    }
    floatingObjectsRef.current = floatingMeshes;

    // 8. Subtle Cosmic Particle Dust Field
    const particleCount = 280;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 25;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particleField = new THREE.Points(pGeo, pMat);
    scene.add(particleField);

    // 9. Pointer & Parallax Interaction Listeners
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
      controller.setPointer(nx, ny);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const nx = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        mouseRef.current.targetX = nx * 1.2;
        mouseRef.current.targetY = ny * 1.2;
        controller.setPointer(nx, ny);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input')) return;
      triggerGesture();
    };

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('click', handleClick);

    // 10. Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse damping for parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Update Digital Host Character animations
      controller.update(delta);

      // Camera subtle parallax
      camera.position.x = mouseRef.current.x * 0.6;
      camera.position.y = 0.5 + mouseRef.current.y * 0.4;
      camera.lookAt(0, 0, 0);

      // Rotate Brand Sculpture rings
      ring1.rotation.z = elapsed * 0.4;
      ring2.rotation.x = elapsed * 0.3;
      monolith.rotation.y = elapsed * 0.15;

      // Floating polyhedral objects movement
      floatingMeshes.forEach((mesh) => {
        mesh.rotation.x += delta * mesh.userData.speedX;
        mesh.rotation.y += delta * mesh.userData.speedY;
        mesh.position.y = mesh.userData.baseY + Math.sin(elapsed * mesh.userData.floatFreq) * 0.3;
      });

      // Particle field subtle drift
      particleField.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('click', handleClick);

      polyGeos.forEach((g) => g.dispose());
      pGeo.dispose();
      pMat.dispose();
      monolithGeo.dispose();
      monolithMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();

      characterRig.dispose();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, [triggerGesture]);

  if (!hasWebGL) {
    return (
      <div className={`absolute inset-0 bg-[#050505] overflow-hidden pointer-events-none ${className}`}>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[#00F3FF]/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#FF00C1]/10 blur-[120px]" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden cursor-crosshair select-none ${className}`}
      style={{ zIndex: 0 }}
      title="Click or tap to greet the 3D Digital Host"
      aria-hidden="true"
    />
  );
}
