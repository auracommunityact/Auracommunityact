import * as THREE from 'three';
import { CharacterRig } from './CharacterLoader';

export interface ControllerOptions {
  enableLookAt?: boolean;
  enableBreathing?: boolean;
  enableBlinking?: boolean;
}

export class CharacterController {
  private rig: CharacterRig;
  private options: Required<ControllerOptions>;

  // Interaction coordinates (normalized -1 to 1)
  private targetPointer = new THREE.Vector2(0, 0);
  private currentPointer = new THREE.Vector2(0, 0);

  // Blinking timer & state
  private nextBlinkTime = 2.5;
  private blinkDuration = 0.14; // seconds
  private isBlinking = false;
  private blinkProgress = 0;

  // Breathing parameters
  private breathPhase = 0;

  // Welcome gesture state
  private isWelcoming = false;
  private welcomeProgress = 0;
  private welcomeDuration = 2.4;

  constructor(rig: CharacterRig, options: ControllerOptions = {}) {
    this.rig = rig;
    this.options = {
      enableLookAt: options.enableLookAt ?? true,
      enableBreathing: options.enableBreathing ?? true,
      enableBlinking: options.enableBlinking ?? true,
    };
  }

  public setPointer(x: number, y: number) {
    this.targetPointer.set(
      THREE.MathUtils.clamp(x, -1, 1),
      THREE.MathUtils.clamp(y, -1, 1)
    );
  }

  public triggerWelcomeGesture() {
    this.isWelcoming = true;
    this.welcomeProgress = 0;
  }

  public update(delta: number) {
    // 1. Advance Three.js AnimationMixer if GLB animations are attached
    if (this.rig.mixer) {
      this.rig.mixer.update(delta);
    }

    // 2. Smoothly damp pointer coordinates (damped lerp)
    this.currentPointer.lerp(this.targetPointer, 0.08);

    // 3. Subtle Natural Breathing (4.2 second cycle)
    if (this.options.enableBreathing && this.rig.chest) {
      this.breathPhase += delta * 1.5;
      const breathRise = Math.sin(this.breathPhase) * 0.025;
      this.rig.chest.position.y = -1.2 + breathRise;
      this.rig.chest.rotation.x = Math.sin(this.breathPhase) * 0.015;
    }

    // 4. Natural Blinking logic (every 3.2 to 5.5 seconds, rapid 140ms eyelid close)
    if (this.options.enableBlinking) {
      this.nextBlinkTime -= delta;
      if (this.nextBlinkTime <= 0 && !this.isBlinking) {
        this.isBlinking = true;
        this.blinkProgress = 0;
        this.nextBlinkTime = 3.2 + Math.random() * 2.5;
      }

      if (this.isBlinking) {
        this.blinkProgress += delta / this.blinkDuration;
        // Blink curve: 0 -> 1 (closing) -> 0 (opening)
        const blinkAmount = Math.sin(Math.min(this.blinkProgress, 1) * Math.PI);

        // A. Morph targets (for GLB models with blendshapes)
        if (this.rig.morphMeshes.length > 0) {
          this.rig.morphMeshes.forEach((mesh) => {
            if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
              const leftIdx = mesh.morphTargetDictionary['eyeBlinkLeft'] ?? mesh.morphTargetDictionary['blink_left'];
              const rightIdx = mesh.morphTargetDictionary['eyeBlinkRight'] ?? mesh.morphTargetDictionary['blink_right'];
              if (leftIdx !== undefined) mesh.morphTargetInfluences[leftIdx] = blinkAmount;
              if (rightIdx !== undefined) mesh.morphTargetInfluences[rightIdx] = blinkAmount;
            }
          });
        }

        // B. Procedural eyelids
        if (this.rig.leftEyelid && this.rig.rightEyelid) {
          const closedRot = -Math.PI / 2 + blinkAmount * (Math.PI / 2.2);
          this.rig.leftEyelid.rotation.x = closedRot;
          this.rig.rightEyelid.rotation.x = closedRot;
        }

        if (this.blinkProgress >= 1) {
          this.isBlinking = false;
          if (this.rig.leftEyelid && this.rig.rightEyelid) {
            this.rig.leftEyelid.rotation.x = -Math.PI / 2;
            this.rig.rightEyelid.rotation.x = -Math.PI / 2;
          }
        }
      }
    }

    // 5. Head and Neck Rotation (Gaze following within natural ergonomic constraints)
    if (this.options.enableLookAt && this.rig.head) {
      // Natural human head rotation limits (yaw ±25 deg, pitch -14 to +12 deg)
      const targetHeadYaw = this.currentPointer.x * 0.44;
      const targetHeadPitch = -this.currentPointer.y * 0.25;

      // Add gentle organic micro-sway
      const idleSwayYaw = Math.sin(this.breathPhase * 0.5) * 0.02;
      const idleSwayPitch = Math.cos(this.breathPhase * 0.7) * 0.015;

      this.rig.head.rotation.y = THREE.MathUtils.lerp(
        this.rig.head.rotation.y,
        targetHeadYaw + idleSwayYaw,
        0.1
      );
      this.rig.head.rotation.x = THREE.MathUtils.lerp(
        this.rig.head.rotation.x,
        targetHeadPitch + idleSwayPitch,
        0.1
      );

      if (this.rig.neck) {
        this.rig.neck.rotation.y = targetHeadYaw * 0.35;
        this.rig.neck.rotation.x = targetHeadPitch * 0.25;
      }

      // Eye gaze tracking saccades
      if (this.rig.leftEye && this.rig.rightEye) {
        const eyeYaw = this.currentPointer.x * 0.25;
        const eyePitch = -this.currentPointer.y * 0.2;
        this.rig.leftEye.rotation.y = eyeYaw;
        this.rig.leftEye.rotation.x = eyePitch;
        this.rig.rightEye.rotation.y = eyeYaw;
        this.rig.rightEye.rotation.x = eyePitch;
      }
    }

    // 6. Welcome Gesture (Warm hand gesture)
    if (this.isWelcoming && this.rig.rightArm) {
      this.welcomeProgress += delta / this.welcomeDuration;
      const t = Math.min(this.welcomeProgress, 1);
      // Bell curve animation with wave oscillation
      const envelope = Math.sin(t * Math.PI);
      const wave = Math.sin(t * Math.PI * 4) * 0.15;

      this.rig.rightArm.rotation.z = -envelope * 0.85 + wave * envelope;
      this.rig.rightArm.rotation.x = envelope * 0.4;

      if (this.welcomeProgress >= 1) {
        this.isWelcoming = false;
        this.rig.rightArm.rotation.set(0, 0, 0);
      }
    }
  }

  public dispose() {
    this.rig.dispose();
  }
}
