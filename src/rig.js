/**
 * Anime Base 3.0 rig data — plain data, no Three.js dependency.
 *
 * Bone names, hierarchy, and rest matrices taken from the AB3 FBX sources
 * (anime-base-short.fbx, anime-base-tall.fbx, and flat-chest variants).
 */

// Bone names as authored in the FBX files.
export const ANIMEBASE3_BONES = [
  'Hips',
  'Spine',
  'Spine1',
  'Neck',
  'Head',
  'L_Clavicle',
  'L_UpperArm',
  'L_LowerArm',
  'L_Hand',
  'R_Clavicle',
  'R_UpperArm',
  'R_LowerArm',
  'R_Hand',
  'L_UpperLeg',
  'L_LowerLeg',
  'L_Foot',
  'L_ToeBase',
  'R_UpperLeg',
  'R_LowerLeg',
  'R_Foot',
  'R_ToeBase',
  // Secondary / soft bones
  'Breast_L',
  'Breast_L001',
  'Breast_R',
  'Breast_R001',
  'ButtBone_L',
  'ButtBone_L001',
  'ButtBone_R',
  'ButtBone_R001',
];

// Root bone of the rig.
export const ANIMEBASE3_ROOT = 'Hips';

// Height in FBX-authored units (×100 cm per meter).
export const ANIMEBASE3_HEIGHT_UNITS = {
  'short-standard': 162,
  'short-flat': 162,
  'tall-standard': 182,
  'tall-flat': 182,
};

// Bone hierarchy: parent → [children].
export const ANIMEBASE3_BONE_HIERARCHY = {
  Hips: ['Spine'],
  Spine: ['Spine1'],
  Spine1: ['Neck', 'L_Clavicle', 'R_Clavicle'],
  Neck: ['Head'],
  Head: [],
  L_Clavicle: ['L_UpperArm'],
  L_UpperArm: ['L_LowerArm'],
  L_LowerArm: ['L_Hand'],
  L_Hand: [],
  R_Clavicle: ['R_UpperArm'],
  R_UpperArm: ['R_LowerArm'],
  R_LowerArm: ['R_Hand'],
  R_Hand: [],
  L_UpperLeg: ['L_LowerLeg'],
  L_LowerLeg: ['L_Foot'],
  L_Foot: ['L_ToeBase'],
  L_ToeBase: [],
  R_UpperLeg: ['R_LowerLeg'],
  R_LowerLeg: ['R_Foot'],
  R_Foot: ['R_ToeBase'],
  R_ToeBase: [],
  Breast_L: ['Breast_L001'],
  Breast_L001: [],
  Breast_R: ['Breast_R001'],
  Breast_R001: [],
  ButtBone_L: ['ButtBone_L001'],
  ButtBone_L001: [],
  ButtBone_R: ['ButtBone_R001'],
  ButtBone_R001: [],
};

// Rest matrices as plain arrays (16 floats, column-major).
// Populated at build time from the loaded FBX; here we declare the shape only.
export const ANIMEBASE3_REST_MATRICES = {};

/**
 * Look up rest matrix for a bone by name.
 * @param {string} boneName
 * @returns {number[]|null} 16 floats column-major, or null if not yet loaded
 */
export function getAnimeBaseRestMatrix(boneName) {
  return ANIMEBASE3_REST_MATRICES[boneName] ?? null;
}

/**
 * Set rest matrices (called by the model loader after parsing FBX).
 * @param {Record<string, number[]>} matrices
 */
export function setAnimeBaseRestMatrices(matrices) {
  Object.assign(ANIMEBASE3_REST_MATRICES, matrices);
}
