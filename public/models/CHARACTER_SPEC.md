# 3D Character Likeness & Asset Import Workflow
## Subject: Shaan Mohammad (Founder, Aura Community Act)
## Primary Reference Photo: `IMG_20260930_175344.png`

This document defines the production standards for creating, rigging, and importing the realistic 3D digital host model for the Aura Community Act web application.

---

### 1. Mandatory Likeness Specifications

1. **Face Silhouette & Proportions**:
   - Slender oval face with gentle youthful contours.
   - Natural jawline curvature, soft rounded chin, smooth facial geometry.
   - Avoid aggressive square chins or generic Caucasian/stylized avatar proportions.

2. **Hair Silhouette & Density**:
   - Thick, voluminous jet-black quiff/pompadour swept upward and slightly back.
   - Realistic strand clump definition, soft temple edges, directional anisotropic specular sheen.
   - Base Color: `#111113`, Roughness: `0.42`, Anisotropy: `0.85`.

3. **Eyeglasses Geometry**:
   - Signature round/circular wireframe spectacles.
   - Dark tortoiseshell / dark bronze thin metal rims (`#2b1e19`).
   - Arched high nose bridge with golden nose pads (`#c59a42`).
   - Anti-reflective PBR glass lenses (`transmission: 0.96`, `roughness: 0.04`, `ior: 1.52`).

4. **Eyes & Corneal Depth**:
   - Deep dark brown / near-black irises (`#1b140e`).
   - Almond eye shape with natural dark upper eyelashes.
   - Realistic concave iris with refractive transparent cornea for genuine catchlight reflections.

5. **Nose**:
   - Straight, slender bridge with soft rounded tip and delicate nostril wings.

6. **Mouth & Lips**:
   - Natural warm peach-pink lips (`#c97876`) with subtle upturned neutral-welcoming smile.
   - Faint youthful upper lip shadow.

7. **Skin PBR Material**:
   - Warm golden-beige / wheatish South Asian medium skin tone (`#c99a77`).
   - Subsurface scattering (SSS) with warm red-orange scattering radius (`#a64e3c`).
   - Roughness: `0.58`, Clearcoat: `0.15`.

8. **Clothing**:
   - Heather grey / charcoal marl sleeveless athletic crewneck shirt (`#6b6f75`).
   - Dark contrast zig-zag overlock stitching along neck and armhole hems (`#1e2024`).

---

### 2. File Placement & Automatic Detection

Place the production 3D model at:
```
/public/models/founder.glb
```
The application's `CharacterLoader` automatically detects this file using Three.js `GLTFLoader`. If the file is placed there, it will seamlessly take over from the procedural high-fidelity digital host stage.

---

### 3. Rigging & Bone Hierarchy

Use standard Humanoid bone names (compatible with Mixamo, Blender Rigify, and Unreal Metahuman):
```
Hips
 └── Spine
      └── Spine1
           └── Spine2
                ├── LeftShoulder ── LeftArm ── LeftForeArm ── LeftHand
                ├── RightShoulder ── RightArm ── RightForeArm ── RightHand
                └── Neck
                     └── Head
                          ├── LeftEye
                          ├── RightEye
                          └── Glasses (or parented to Head)
```

---

### 4. Morph Targets / Blendshapes

Include these blendshapes on the head mesh for dynamic browser interactions:
- `eyeBlinkLeft`, `eyeBlinkRight` (automatic natural blinking)
- `mouthSmileLeft`, `mouthSmileRight` (welcoming expressions)
- `jawOpen` (speaking / audio reactive)
- `browInnerUp` (inquisitive / engaging look)
- `eyeLookLeft`, `eyeLookRight`, `eyeLookUp`, `eyeLookDown` (eye saccades and gaze tracking)

---

### 5. Recommended Tools & Generation Workflow

1. **Photogrammetry / Head Generation**:
   - Feed `IMG_20260930_175344.png` into **FaceGen**, **KeenTools FaceBuilder for Blender**, or **Epic Games Mesh to MetaHuman**.
2. **Hair & Accessories**:
   - Model the signature round glasses with high bridge and golden nose pads in Blender.
   - Create hair cards or hair mesh with directional UV mapping for anisotropic highlights.
3. **Texture Baking**:
   - Bake 2048x2048 PBR maps: Albedo, Normal (OpenGL), and packed ORM (Occlusion/Roughness/Metallic).
4. **Export**:
   - Export from Blender as `.glb` (glTF Binary) with `Custom Properties`, `Include Skins`, `Include Morph Targets`, and `Draco Compression` (optional).
5. **Verify**:
   - Test in the Aura Community Act 3D Host Inspector view!
