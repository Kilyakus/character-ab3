// Studio character-plugin profile for Anime Base 3.0.
//
// This is ONLY an adapter: no body logic, no geometry here. Everything the
// mannequin can do lives in `index.js` and works without Studio — the package
// can be connected to any host (see README.md next to it). The profile only
// describes how this character looks to the studio: model source, bone map,
// secondary physics.
//
// Three.js is not imported: the host passes its build in `model.build({ THREE })`
// just as it passes it to the engine.
import {
  ANIMEBASE3_BONE_MAP,
  ANIMEBASE3_BONE_PARTS,
  createAnimeBase3,
} from './index.js';

export default {
  id: 'animebase-3',
  name: 'Anime Base 3.0',
  subtitle: 'Anime Base 3.0 by Riceballer3D · FBX-based model · 4 variants',
  default: false,
  playable: true,
  // The studio already shows this character as builtin (`animebase`):
  // the plugin is the same character in portable form, no second roster card
  // is needed. The host reads this field, not the engine.
  builtInAlias: 'animebase',
  model: {
    // Source: authored FBX files distributed with the archive.
    source: 'fbx:animebase-3',
    importStrategy: 'legacy',
    // Geometry in FBX units (×100), same coefficient as AnimeBase3.
    scaleFactor: 0.01,
    /** Build the body.
     * @param {{THREE?: object, palette?: object, variant?: string}} [options]
     * @returns {object} AnimeBase 3 group (Armature + skinned mesh)
     */
    build: ({ THREE = null, palette = null, variant = 'tall-standard' } = {}) =>
      createAnimeBase3({ THREE, palette }).buildGroup({ variant }),
  },
  rig: {
    strategy: 'legacy',
    boneMap: ANIMEBASE3_BONE_MAP,
    // Bone → body part: the effect layer (damage, grab, heat map) understands
    // exactly what to highlight.
    boneParts: ANIMEBASE3_BONE_PARTS,
    preserveFineBones: true,
    // Soft bones of the reference rig: on AB3 they exist, so behave like
    // AnimeBase — damped by spring from the parent torso bone.
    secondaryPhysics: [
      {
        bones: ['Breast_L', 'Breast_L001', 'Breast_R', 'Breast_R001'],
        sourceBone: 'Spine1',
      },
      {
        bones: ['ButtBone_L', 'ButtBone_L001', 'ButtBone_R', 'ButtBone_R001'],
        sourceBone: 'Hips',
      },
    ],
  },
};
