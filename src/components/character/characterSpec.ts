/**
 * AURA COMMUNITY ACT — 3D CHARACTER LIKENESS SPECIFICATION
 * Primary Visual Identity: Shaan Mohammad (Founder, Aura Community Act)
 * Primary Reference Photograph: IMG_20260930_175344.png
 */

export interface CharacterLikenessTrait {
  title: string;
  category: 'anatomy' | 'hair' | 'eyewear' | 'clothing' | 'material';
  description: string;
  exactParameters: Record<string, string | number>;
  technicalGuidance: string;
}

export const FOUNDER_CHARACTER_SPEC = {
  identity: {
    name: "Shaan Mohammad",
    role: "Founder & Creative Director",
    brand: "Aura Community Act",
    referencePhotoUrl: "https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/app-icons/IMG_20260827_111033.jpg",
  },

  // 10 Mandatory Likeness Traits derived from high-resolution reference photo analysis
  traits: [
    {
      title: "1. Face Silhouette & Proportions",
      category: "anatomy",
      description: "Slender oval face shape with gentle youthful contours, clean jawline, and balanced vertical thirds.",
      exactParameters: {
        faceShape: "Slender Oval / Youthful Proportions",
        foreheadToBrowRatio: 0.32,
        browToNoseRatio: 0.34,
        noseToChinRatio: 0.34,
        cheekboneWidthRatio: 0.88,
      },
      technicalGuidance: "Maintain natural facial symmetry with subtle organic asymmetry. Avoid over-angular sculpted cheekbones.",
    },
    {
      title: "2. Hair Silhouette & Volume",
      category: "hair",
      description: "Thick, high-volume jet-black quiff/pompadour swept upward and back with natural strand clumps, soft temple fades, and healthy directional specular sheen.",
      exactParameters: {
        colorHex: "#111113",
        roughness: 0.42,
        anisotropy: 0.85,
        volumeHeightRatio: 0.38, // Above cranial bone
        strandDensity: "High-density natural fibers",
      },
      technicalGuidance: "Model hair with layered sculpted mesh cards or geometry spline cards with alpha cutout; apply anisotropic specular highlight along hair fiber tangents.",
    },
    {
      title: "3. Eyeglasses Shape & Placement",
      category: "eyewear",
      description: "Signature thin-frame circular / round spectacles in dark tortoiseshell/bronze with arched bridge and golden nose pads resting high on the nose.",
      exactParameters: {
        frameStyle: "Round Circular Wireframe",
        frameColorHex: "#2b1e19", // Dark tortoiseshell / bronze
        bridgeColorHex: "#c59a42", // Gold accent pads & bridge
        lensTransmission: 0.96,
        lensIOR: 1.52,
        lensRoughness: 0.04,
      },
      technicalGuidance: "Dual-ring geometry for thin wire rim. Lenses use MeshPhysicalMaterial with transmission, clearcoat 1.0, and chromatic aberration / anti-glare reflection.",
    },
    {
      title: "4. Eye Spacing, Irises & Corneal Depth",
      category: "anatomy",
      description: "Deep dark brown/black almond-shaped eyes with clear white sclera, sharp pupil definition, moist corneal specular reflection, and natural dark lashes.",
      exactParameters: {
        interpupillaryDistance: "Proportional 1 eye width between eyes",
        irisColorHex: "#1b140e",
        scleraColorHex: "#f0efe8",
        cornealRoughness: 0.02,
        specularIntensity: 1.8,
      },
      technicalGuidance: "Convex corneal geometry with recessed concave iris and refractive transparent cornea layer for accurate light depth and realistic catchlights.",
    },
    {
      title: "5. Nose Proportions",
      category: "anatomy",
      description: "Straight, slender nasal bridge with soft rounded tip, delicate nostril wings, and natural transition into the philtrum.",
      exactParameters: {
        bridgeWidthRatio: 0.22,
        tipProjectionAngle: 32, // degrees
        nostrilFlare: "Minimal / Youthful Natural",
      },
      technicalGuidance: "Avoid sharp low-poly creases; smooth normal maps around nostril crease and bridge highlight.",
    },
    {
      title: "6. Mouth, Lips & Philtrum",
      category: "anatomy",
      description: "Warm natural pinkish-peach lips with softly defined Cupid's bow, subtle upturned corners for a welcoming neutral expression, and very faint fine mustache shadow.",
      exactParameters: {
        lipColorHex: "#c97876",
        lipRoughness: 0.35,
        subsurfaceRadius: [0.08, 0.04, 0.02],
        facialHair: "Faint youthful mustache line",
      },
      technicalGuidance: "Subsurface scattering gives the lips warmth and organic translucency. Faint mustache texture baked into normal/albedo map.",
    },
    {
      title: "7. Jawline & Chin Silhouette",
      category: "anatomy",
      description: "Softly contoured jawline transitioning smoothly to a rounded chin without harsh square edges.",
      exactParameters: {
        jawAngle: 124, // degrees
        chinWidth: "Delicate rounded oval",
      },
      technicalGuidance: "Preserve the youthful warmth and clean contour shown in the reference photograph.",
    },
    {
      title: "8. Skin Tone & PBR Material",
      category: "material",
      description: "Warm golden beige / wheatish South Asian medium skin tone with realistic subsurface scattering (SSS), pore micro-roughness, and healthy studio skin sheen.",
      exactParameters: {
        baseColorHex: "#c99a77",
        subsurfaceColorHex: "#a64e3c",
        roughness: 0.58,
        clearcoat: 0.15,
        clearcoatRoughness: 0.3,
        sheenColorHex: "#ffd4b2",
      },
      technicalGuidance: "PBR MeshPhysicalMaterial with dual-lobe specular response and warm red-orange subsurface scattering on thin facial regions (ears, nostrils, lips).",
    },
    {
      title: "9. Neck & Shoulder Proportions",
      category: "anatomy",
      description: "Slender, athletic neck contour with defined trapezius and shoulder deltoid line.",
      exactParameters: {
        neckLengthRatio: 0.24,
        shoulderWidthRatio: 2.1, // of head width
      },
      technicalGuidance: "Natural athletic posture ready for upper-body bust or full-body rigging.",
    },
    {
      title: "10. Reference Clothing & Seam Stitching",
      category: "clothing",
      description: "Heather grey / charcoal marl sleeveless athletic crewneck tank top with distinctive dark contrast overlock zig-zag stitching along the collar and armhole edges.",
      exactParameters: {
        fabricColorHex: "#6b6f75",
        seamStitchColorHex: "#1e2024",
        fabricRoughness: 0.88,
        fabricSheen: 0.2,
      },
      technicalGuidance: "Heather fabric texture mapped with micro-weave bump map; contrast overlock seam trim modeled along collar and armhole hems.",
    },
  ] as CharacterLikenessTrait[],

  // Rigging, Blendshapes and Asset Import Workflow
  assetRequirements: {
    modelFormat: "glTF 2.0 Binary (.glb)",
    fileLocation: "/models/founder.glb",
    recommendedPolyCount: "15,000 to 45,000 triangles (Optimized real-time LOD0)",
    textureResolution: "2048 x 2048 (4096 x 4096 for hero cinematic view)",
    textureChannels: {
      albedo: "founder_albedo_srgb.png",
      normal: "founder_normal_tangent_gl.png",
      orm: "founder_orm_linear.png (R: AO, G: Roughness, B: Metallic)",
      emissive: "founder_emissive_optional.png",
    },
    skeletonBones: [
      "Hips", "Spine", "Spine1", "Spine2", "Neck", "Head",
      "LeftEye", "RightEye",
      "LeftShoulder", "RightShoulder",
      "LeftArm", "RightArm",
      "LeftForeArm", "RightForeArm",
      "LeftHand", "RightHand"
    ],
    blendshapes: [
      "eyeBlinkLeft", "eyeBlinkRight",
      "mouthSmileLeft", "mouthSmileRight",
      "jawOpen", "browInnerUp",
      "browDownLeft", "browDownRight",
      "eyeLookLeft", "eyeLookRight", "eyeLookUp", "eyeLookDown"
    ],
    supportedAnimations: [
      "idle_breathing",
      "welcome_gesture",
      "speaking_subtle",
      "look_around"
    ]
  }
};
