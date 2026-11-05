/**
 * Anime Base 3.0 bindings — semantic node → bone and bone → body part.
 *
 * 21 semantic nodes mapped to AB3 bone names.
 */

// Semantic node IDs.
export const ANIMEBASE3_NODE_IDS = [
  'root', 'hips', 'spine', 'chest', 'neck', 'head',
  'lShoulder', 'lUpperArm', 'lLowerArm', 'lHand',
  'rShoulder', 'rUpperArm', 'rLowerArm', 'rHand',
  'lUpperLeg', 'lLowerLeg', 'lFoot',
  'rUpperLeg', 'rLowerLeg', 'rFoot',
];

// Semantic node → AB3 bone name.
export const ANIMEBASE3_BONE_MAP = Object.freeze({
  root: 'Hips',
  hips: 'Hips',
  spine: 'Spine',
  chest: 'Spine1',
  neck: 'Neck',
  head: 'Head',
  lShoulder: 'L_Clavicle',
  lUpperArm: 'L_UpperArm',
  lLowerArm: 'L_LowerArm',
  lHand: 'L_Hand',
  rShoulder: 'R_Clavicle',
  rUpperArm: 'R_UpperArm',
  rLowerArm: 'R_LowerArm',
  rHand: 'R_Hand',
  lUpperLeg: 'L_UpperLeg',
  lLowerLeg: 'L_LowerLeg',
  lFoot: 'L_Foot',
  rUpperLeg: 'R_UpperLeg',
  rLowerLeg: 'R_LowerLeg',
  rFoot: 'R_Foot',
});

// Bone → body part (for damage / grab / heat-map layers).
export const ANIMEBASE3_BODY_PARTS = [
  'head', 'chest', 'spine', 'hips',
  'lShoulder', 'lArm', 'lHand',
  'rShoulder', 'rArm', 'rHand',
  'lLeg', 'lFoot',
  'rLeg', 'rFoot',
];

// Bone → part mapping (bone name → part id).
export const ANIMEBASE3_BONE_PARTS = Object.freeze({
  Head: 'head',
  Neck: 'chest',
  Spine1: 'chest',
  Spine: 'spine',
  Hips: 'hips',
  L_Clavicle: 'lShoulder',
  L_UpperArm: 'lArm',
  L_LowerArm: 'lArm',
  L_Hand: 'lHand',
  R_Clavicle: 'rShoulder',
  R_UpperArm: 'rArm',
  R_LowerArm: 'rArm',
  R_Hand: 'rHand',
  L_UpperLeg: 'lLeg',
  L_LowerLeg: 'lLeg',
  L_Foot: 'lFoot',
  R_UpperLeg: 'rLeg',
  R_LowerLeg: 'rLeg',
  R_Foot: 'rFoot',
  Breast_L: 'chest',
  Breast_R: 'chest',
  ButtBone_L: 'hips',
  ButtBone_R: 'hips',
});

/**
 * Find a bone object by name in a skeleton's bones.
 * @param {THREE.Skeleton} skeleton
 * @param {string} boneName
 * @returns {THREE.Bone|null}
 */
export function findAnimeBaseBone(skeleton, boneName) {
  if (!skeleton || !Array.isArray(skeleton.bones)) return null;
  return skeleton.bones.find((b) => b.name === boneName) ?? null;
}

/**
 * Build semantic-node → bone bindings for a built skeleton.
 * @param {object} options
 * @param {THREE.Skeleton} options.skeleton
 * @param {object} [options.THREE] host's three.js build (unused here, kept for API parity)
 * @returns {{[nodeId: string]: { bone: THREE.Bone|null, boneName: string }}}
 */
export function buildAnimeBase3Bindings({ skeleton, THREE = null } = {}) {
  const bindings = {};
  let missing = 0;
  for (const [nodeId, boneName] of Object.entries(ANIMEBASE3_BONE_MAP)) {
    const bone = findAnimeBaseBone(skeleton, boneName);
    if (!bone) missing += 1;
    bindings[nodeId] = { bone, boneName };
  }
  return { bindings, missing };
}

/**
 * Body part a bone belongs to (climbs the bone-name hierarchy if needed).
 * @param {THREE.Bone|null} bone
 * @param {object} [options]
 * @returns {string|null} part id or null
 */
export function animeBasePartForBone(bone, options = {}) {
  if (!bone || !bone.name) return null;
  const direct = ANIMEBASE3_BONE_PARTS[bone.name];
  if (direct) return direct;
  // Try stripping numeric suffixes (e.g. Breast_L001 → Breast_L).
  const base = bone.name.replace(/\d+$/, '');
  if (ANIMEBASE3_BONE_PARTS[base]) return ANIMEBASE3_BONE_PARTS[base];
  return null;
}
