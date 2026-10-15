import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FOUNDER_CHARACTER_SPEC } from './characterSpec';

export interface CharacterRig {
  root: THREE.Group;
  head: THREE.Object3D;
  neck: THREE.Object3D;
  chest: THREE.Object3D;
  leftEye?: THREE.Object3D;
  rightEye?: THREE.Object3D;
  leftEyelid?: THREE.Object3D;
  rightEyelid?: THREE.Object3D;
  rightArm?: THREE.Object3D;
  glasses?: THREE.Object3D;
  morphMeshes: THREE.Mesh[];
  mixer?: THREE.AnimationMixer;
  isGlbLoaded: boolean;
  dispose: () => void;
}

/**
 * Loads the production GLB asset (/models/founder.glb) if present,
 * or builds the high-fidelity procedural 3D likeness host based on the reference photo.
 */
export async function loadCharacterModel(
  customUrl: string = '/models/founder.glb',
  onProgress?: (progress: number) => void
): Promise<CharacterRig> {
  const loader = new GLTFLoader();

  try {
    const gltf = await new Promise<any>((resolve, reject) => {
      loader.load(
        customUrl,
        (data) => resolve(data),
        (event) => {
          if (event.total > 0 && onProgress) {
            onProgress((event.loaded / event.total) * 100);
          }
        },
        (err) => reject(err)
      );
    });

    // GLB loaded successfully
    const root = gltf.scene as THREE.Group;
    root.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    let head: THREE.Object3D = root.getObjectByName('Head') || root;
    let neck: THREE.Object3D = root.getObjectByName('Neck') || head;
    let chest: THREE.Object3D = root.getObjectByName('Spine2') || root.getObjectByName('Chest') || root;
    let leftEye = root.getObjectByName('LeftEye') || undefined;
    let rightEye = root.getObjectByName('RightEye') || undefined;
    let rightArm = root.getObjectByName('RightArm') || undefined;

    const morphMeshes: THREE.Mesh[] = [];
    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.morphTargetDictionary) {
        morphMeshes.push(obj);
      }
    });

    let mixer: THREE.AnimationMixer | undefined;
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(root);
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }

    return {
      root,
      head,
      neck,
      chest,
      leftEye,
      rightEye,
      rightArm,
      morphMeshes,
      mixer,
      isGlbLoaded: true,
      dispose: () => {
        root.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material?.dispose();
            }
          }
        });
      },
    };
  } catch {
    // Graceful fallback: construct procedural 3D digital host matching Shaan Mohammad's reference photo
    return createProceduralLikenessHost();
  }
}

/**
 * Builds a procedural 3D digital host matching the reference photo (IMG_20260930_175344.png):
 * - Slender oval face geometry with warm wheatish skin PBR shader
 * - Distinctive round tortoiseshell / dark bronze wireframe spectacles
 * - Thick voluminous quiff / pompadour black hair
 * - Heather grey sleeveless athletic tank top with dark contrast seam stitching
 * - Articulated eye pivots, eyelids for natural blinking, and chest for breathing
 */
export function createProceduralLikenessHost(): CharacterRig {
  const root = new THREE.Group();
  root.name = 'ShaanMohammad_ProceduralHost';

  const materialsToDispose: THREE.Material[] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  // PBR Skin Material
  const skinMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc99a77,
    roughness: 0.55,
    metalness: 0.05,
    clearcoat: 0.12,
    clearcoatRoughness: 0.35,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xffd4b2),
  });
  materialsToDispose.push(skinMaterial);

  // Jet-black styled hair material with anisotropic satin highlight
  const hairMaterial = new THREE.MeshStandardMaterial({
    color: 0x111113,
    roughness: 0.42,
    metalness: 0.18,
  });
  materialsToDispose.push(hairMaterial);

  // Tortoiseshell/bronze thin eyeglass wireframe material
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x241814,
    roughness: 0.25,
    metalness: 0.85,
  });
  materialsToDispose.push(frameMaterial);

  // Golden nose bridge and pads
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xc59a42,
    roughness: 0.2,
    metalness: 0.9,
  });
  materialsToDispose.push(goldMaterial);

  // Refractive PBR anti-reflective spectacle glass lenses
  const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.96,
    opacity: 1,
    transparent: true,
    roughness: 0.04,
    ior: 1.52,
    reflectivity: 0.5,
    attenuationColor: new THREE.Color(0x00f3ff),
    attenuationDistance: 5.0,
  });
  materialsToDispose.push(lensMaterial);

  // Heather grey tank top material with contrast seams
  const tankTopMaterial = new THREE.MeshStandardMaterial({
    color: 0x666a70,
    roughness: 0.82,
    metalness: 0.02,
  });
  materialsToDispose.push(tankTopMaterial);

  const seamMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1c,
    roughness: 0.9,
  });
  materialsToDispose.push(seamMaterial);

  // --- Chest & Shoulders Group ---
  const chest = new THREE.Group();
  chest.name = 'Chest';
  chest.position.set(0, -1.2, 0);
  root.add(chest);

  // Torso / Tank Top Body (Heather Grey)
  const torsoGeo = new THREE.CylinderGeometry(0.9, 0.75, 1.6, 32);
  geometriesToDispose.push(torsoGeo);
  const torso = new THREE.Mesh(torsoGeo, tankTopMaterial);
  torso.position.set(0, -0.6, 0);
  torso.scale.set(1.2, 1.0, 0.7);
  torso.castShadow = true;
  torso.receiveShadow = true;
  chest.add(torso);

  // Contrast Stitching along Tank Top Neckline
  const collarTrimGeo = new THREE.TorusGeometry(0.48, 0.035, 12, 32);
  geometriesToDispose.push(collarTrimGeo);
  const collarTrim = new THREE.Mesh(collarTrimGeo, seamMaterial);
  collarTrim.rotation.x = Math.PI / 2;
  collarTrim.position.set(0, 0.2, 0.02);
  collarTrim.scale.set(1.0, 0.6, 1.0);
  chest.add(collarTrim);

  // Athletic Shoulders & Arm Holes (Sleeveless tank top borders)
  const leftArmHoleGeo = new THREE.TorusGeometry(0.38, 0.03, 12, 28);
  geometriesToDispose.push(leftArmHoleGeo);
  const leftArmHole = new THREE.Mesh(leftArmHoleGeo, seamMaterial);
  leftArmHole.rotation.y = Math.PI / 2;
  leftArmHole.position.set(-1.05, -0.2, 0);
  chest.add(leftArmHole);

  const rightArmHole = leftArmHole.clone();
  rightArmHole.position.set(1.05, -0.2, 0);
  chest.add(rightArmHole);

  // Natural Skin Shoulders & Arms (Upper deltoids)
  const leftDeltoidGeo = new THREE.SphereGeometry(0.32, 24, 24);
  geometriesToDispose.push(leftDeltoidGeo);
  const leftDeltoid = new THREE.Mesh(leftDeltoidGeo, skinMaterial);
  leftDeltoid.position.set(-1.12, -0.25, 0);
  chest.add(leftDeltoid);

  const rightDeltoid = leftDeltoid.clone();
  rightDeltoid.position.set(1.12, -0.25, 0);
  chest.add(rightDeltoid);

  // Right Arm Group (for Welcome Gesture)
  const rightArm = new THREE.Group();
  rightArm.position.set(1.12, -0.25, 0);
  chest.add(rightArm);

  const rightForearmGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.9, 16);
  geometriesToDispose.push(rightForearmGeo);
  const rightForearm = new THREE.Mesh(rightForearmGeo, skinMaterial);
  rightForearm.position.set(0.1, -0.5, 0.1);
  rightForearm.rotation.z = -0.15;
  rightArm.add(rightForearm);

  // --- Neck Group ---
  const neck = new THREE.Group();
  neck.name = 'Neck';
  neck.position.set(0, 0.1, 0);
  chest.add(neck);

  const neckGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.65, 24);
  geometriesToDispose.push(neckGeo);
  const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
  neckMesh.position.set(0, 0.25, -0.05);
  neckMesh.castShadow = true;
  neck.add(neckMesh);

  // --- Head Group ---
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.65, 0);
  neck.add(head);

  // Slender Oval Face (Shaan Mohammad Likeness proportions)
  const faceGeo = new THREE.SphereGeometry(0.68, 36, 36);
  geometriesToDispose.push(faceGeo);
  const faceMesh = new THREE.Mesh(faceGeo, skinMaterial);
  faceMesh.scale.set(0.85, 1.15, 0.95);
  faceMesh.position.set(0, 0.45, 0);
  faceMesh.castShadow = true;
  faceMesh.receiveShadow = true;
  head.add(faceMesh);

  // Soft contoured chin & jawline
  const chinGeo = new THREE.SphereGeometry(0.32, 24, 24);
  geometriesToDispose.push(chinGeo);
  const chinMesh = new THREE.Mesh(chinGeo, skinMaterial);
  chinMesh.scale.set(0.75, 0.85, 0.85);
  chinMesh.position.set(0, -0.15, 0.42);
  head.add(chinMesh);

  // Straight Slender Nose
  const noseGeo = new THREE.ConeGeometry(0.12, 0.42, 16);
  geometriesToDispose.push(noseGeo);
  const noseMesh = new THREE.Mesh(noseGeo, skinMaterial);
  noseMesh.rotation.x = Math.PI / 2.3;
  noseMesh.position.set(0, 0.42, 0.68);
  noseMesh.scale.set(0.85, 1.0, 0.65);
  head.add(noseMesh);

  // Warm Peach Lips with subtle smile
  const lipMaterial = new THREE.MeshStandardMaterial({
    color: 0xc47a74,
    roughness: 0.4,
    metalness: 0.05,
  });
  materialsToDispose.push(lipMaterial);

  const lipsGeo = new THREE.TorusGeometry(0.16, 0.042, 12, 24, Math.PI);
  geometriesToDispose.push(lipsGeo);
  const lipsMesh = new THREE.Mesh(lipsGeo, lipMaterial);
  lipsMesh.rotation.x = Math.PI - 0.2;
  lipsMesh.position.set(0, 0.12, 0.58);
  lipsMesh.scale.set(1.2, 0.65, 0.8);
  head.add(lipsMesh);

  // Subtle natural dark eyebrows
  const browMaterial = new THREE.MeshStandardMaterial({
    color: 0x141416,
    roughness: 0.7,
  });
  materialsToDispose.push(browMaterial);

  const leftBrowGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.34, 12);
  geometriesToDispose.push(leftBrowGeo);
  const leftBrow = new THREE.Mesh(leftBrowGeo, browMaterial);
  leftBrow.rotation.z = Math.PI / 2 + 0.12;
  leftBrow.position.set(-0.28, 0.68, 0.58);
  head.add(leftBrow);

  const rightBrow = leftBrow.clone();
  rightBrow.rotation.z = -(Math.PI / 2 + 0.12);
  rightBrow.position.set(0.28, 0.68, 0.58);
  head.add(rightBrow);

  // --- Eyes & Corneas ---
  const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f4ed,
    roughness: 0.15,
  });
  materialsToDispose.push(eyeWhiteMaterial);

  const irisMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b130e,
    roughness: 0.1,
    metalness: 0.1,
  });
  materialsToDispose.push(irisMaterial);

  const eyeGeo = new THREE.SphereGeometry(0.12, 24, 24);
  geometriesToDispose.push(eyeGeo);

  // Left Eye
  const leftEye = new THREE.Group();
  leftEye.position.set(-0.28, 0.52, 0.54);
  const leftEyeWhite = new THREE.Mesh(eyeGeo, eyeWhiteMaterial);
  leftEye.add(leftEyeWhite);

  const pupilGeo = new THREE.CircleGeometry(0.052, 20);
  geometriesToDispose.push(pupilGeo);
  const leftIris = new THREE.Mesh(pupilGeo, irisMaterial);
  leftIris.position.set(0, 0, 0.118);
  leftEye.add(leftIris);
  head.add(leftEye);

  // Right Eye
  const rightEye = new THREE.Group();
  rightEye.position.set(0.28, 0.52, 0.54);
  const rightEyeWhite = new THREE.Mesh(eyeGeo, eyeWhiteMaterial);
  rightEye.add(rightEyeWhite);

  const rightIris = leftIris.clone();
  rightEye.add(rightIris);
  head.add(rightEye);

  // Eyelids for Natural Blinking
  const eyelidGeo = new THREE.SphereGeometry(0.125, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  geometriesToDispose.push(eyelidGeo);

  const leftEyelid = new THREE.Mesh(eyelidGeo, skinMaterial);
  leftEyelid.position.set(-0.28, 0.52, 0.54);
  leftEyelid.rotation.x = -Math.PI / 2;
  leftEyelid.scale.set(1.05, 1.05, 1.05);
  leftEyelid.visible = true;
  head.add(leftEyelid);

  const rightEyelid = leftEyelid.clone();
  rightEyelid.position.set(0.28, 0.52, 0.54);
  head.add(rightEyelid);

  // --- Signature Round Wireframe Glasses ---
  const glasses = new THREE.Group();
  glasses.name = 'Shaan_SignatureGlasses';
  glasses.position.set(0, 0.52, 0.65);
  head.add(glasses);

  // Left circular rim
  const rimGeo = new THREE.TorusGeometry(0.24, 0.022, 16, 40);
  geometriesToDispose.push(rimGeo);
  const leftRim = new THREE.Mesh(rimGeo, frameMaterial);
  leftRim.position.set(-0.28, 0, 0);
  glasses.add(leftRim);

  // Left refractive lens
  const lensGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.015, 32);
  geometriesToDispose.push(lensGeo);
  const leftLens = new THREE.Mesh(lensGeo, lensMaterial);
  leftLens.rotation.x = Math.PI / 2;
  leftLens.position.set(-0.28, 0, 0);
  glasses.add(leftLens);

  // Right circular rim & lens
  const rightRim = leftRim.clone();
  rightRim.position.set(0.28, 0, 0);
  glasses.add(rightRim);

  const rightLens = leftLens.clone();
  rightLens.position.set(0.28, 0, 0);
  glasses.add(rightLens);

  // Arched High Bridge (Gold accent)
  const bridgeGeo = new THREE.TorusGeometry(0.08, 0.018, 12, 24, Math.PI * 0.85);
  geometriesToDispose.push(bridgeGeo);
  const bridgeMesh = new THREE.Mesh(bridgeGeo, goldMaterial);
  bridgeMesh.rotation.z = Math.PI * 0.08;
  bridgeMesh.position.set(0, 0.09, 0.01);
  glasses.add(bridgeMesh);

  // Golden Nose Pads
  const padGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.07, 12);
  geometriesToDispose.push(padGeo);
  const leftPad = new THREE.Mesh(padGeo, goldMaterial);
  leftPad.position.set(-0.11, -0.04, -0.04);
  leftPad.rotation.z = -0.4;
  glasses.add(leftPad);

  const rightPad = leftPad.clone();
  rightPad.position.set(0.11, -0.04, -0.04);
  rightPad.rotation.z = 0.4;
  glasses.add(rightPad);

  // Temples / Ear stems extending back to ears
  const stemGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.85, 12);
  geometriesToDispose.push(stemGeo);
  const leftStem = new THREE.Mesh(stemGeo, frameMaterial);
  leftStem.rotation.x = Math.PI / 2 - 0.08;
  leftStem.rotation.y = 0.18;
  leftStem.position.set(-0.52, 0.02, -0.38);
  glasses.add(leftStem);

  const rightStem = leftStem.clone();
  rightStem.rotation.y = -0.18;
  rightStem.position.set(0.52, 0.02, -0.38);
  glasses.add(rightStem);

  // --- Thick Voluminous Quiff / Pompadour Jet-Black Hair ---
  const hairGroup = new THREE.Group();
  head.add(hairGroup);

  // Central high-volume quiff volume swept back
  const mainHairGeo = new THREE.SphereGeometry(0.76, 32, 24);
  geometriesToDispose.push(mainHairGeo);
  const mainHair = new THREE.Mesh(mainHairGeo, hairMaterial);
  mainHair.scale.set(0.88, 1.25, 1.05);
  mainHair.position.set(0, 0.65, -0.08);
  hairGroup.add(mainHair);

  // Front upward textured pompadour crest
  const crestGeo = new THREE.ConeGeometry(0.58, 0.85, 24);
  geometriesToDispose.push(crestGeo);
  const crest = new THREE.Mesh(crestGeo, hairMaterial);
  crest.rotation.x = -Math.PI / 4.5;
  crest.position.set(0, 1.05, 0.22);
  crest.scale.set(1.15, 0.8, 0.85);
  hairGroup.add(crest);

  // Left & right swept locks
  const lockGeo = new THREE.ConeGeometry(0.35, 0.7, 16);
  geometriesToDispose.push(lockGeo);
  const leftLock = new THREE.Mesh(lockGeo, hairMaterial);
  leftLock.rotation.z = 0.35;
  leftLock.rotation.x = -0.4;
  leftLock.position.set(-0.35, 0.95, 0.15);
  hairGroup.add(leftLock);

  const rightLock = leftLock.clone();
  rightLock.rotation.z = -0.35;
  rightLock.position.set(0.35, 0.95, 0.15);
  hairGroup.add(rightLock);

  return {
    root,
    head,
    neck,
    chest,
    leftEye,
    rightEye,
    leftEyelid,
    rightEyelid,
    rightArm,
    glasses,
    morphMeshes: [],
    isGlbLoaded: false,
    dispose: () => {
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
    },
  };
}
