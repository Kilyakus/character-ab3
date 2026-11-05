/**
 * Anime Base 3.0 — standalone character plugin.
 *
 * ## Purpose
 *
 * The character does not belong to any engine or host: it does not import
 * Rephlexia Studio, `spring-ik`, `rephlexia`, or even Three.js. Everything it
 * needs the host passes itself — the Three.js build and, optionally, a palette.
 * The same body can be placed in the Spring IK editor, Rephlexia physics,
 * character preview, or another game.
 *
 * ## What's inside
 *
 * - `rig.js` — AB3 rig data as plain data (bone names, hierarchy, rest matrices).
 *   Pure numbers: usable by any engine, even without rendering.
 * - `model.js` — FBX loader for AB3 bodies (short/tall, standard/flat-chest).
 *   Returns a skinned mesh with skeleton.
 * - `palette.js` — materials (skin, eyes, clothes) and palette from one color.
 * - `bindings.js` — "semantic node → bone" and "bone → body part" dictionaries,
 *   bone search, and binding assembly with rest transforms.
 * - `character.js` — Studio character-plugin profile (model declaration,
 *   bindings, secondary physics).
 *
 * ## Usage
 *
 * ```js
 * import { createAnimeBase3 } from './index.js';
 * import * as THREE from 'three';
 *
 * const ab3 = createAnimeBase3({ THREE });
 * const body = ab3.build({ variant: 'tall-standard' }); // { group, mesh, armature, skeleton, bones }
 * scene.add(body.group);
 *
 * const { bindings, missing } = ab3.bindings(body.skeleton);
 * // bindings.head.bone → Head bone, bindings.lHand.bone → L_Hand, etc.
 *
 * ab3.partForBone(bindings.head.bone); // → 'head'
 * ```
 *
 * Nothing runs on import: no scene, no renderer, no global state — only data
 * and factories.
 */

import { createAnimeBase3ModelBuilder } from './model.js';
import {
  ANIMEBASE3_BONES,
  ANIMEBASE3_HEIGHT_UNITS,
  ANIMEBASE3_ROOT,
} from './rig.js';
import {
  ANIMEBASE3_COLOR_KEYS,
  ANIMEBASE3_DEFAULT_COLORS,
  ANIMEBASE3_MATERIAL_ORDER,
  ANIMEBASE3_MATERIALS,
  animeBasePaletteFromColor,
  normalizeHexColor,
  resolveMaterialPalette,
} from './palette.js';
import {
  ANIMEBASE3_BODY_PARTS,
  ANIMEBASE3_BONE_MAP,
  ANIMEBASE3_BONE_PARTS,
  ANIMEBASE3_NODE_IDS,
  buildAnimeBase3Bindings,
  animeBasePartForBone,
  findAnimeBaseBone,
} from './bindings.js';

export const ANIMEBASE3_PLUGIN_ID = 'animebase-3';
export const ANIMEBASE3_VERSION = '1.0.0';

export {
  // Rig
  ANIMEBASE3_BONES,
  ANIMEBASE3_HEIGHT_UNITS,
  ANIMEBASE3_ROOT,
  // Materials and palette
  ANIMEBASE3_COLOR_KEYS,
  ANIMEBASE3_DEFAULT_COLORS,
  ANIMEBASE3_MATERIAL_ORDER,
  ANIMEBASE3_MATERIALS,
  animeBasePaletteFromColor,
  normalizeHexColor,
  resolveMaterialPalette,
  // Bindings and body parts
  ANIMEBASE3_BODY_PARTS,
  ANIMEBASE3_BONE_MAP,
  ANIMEBASE3_BONE_PARTS,
  ANIMEBASE3_NODE_IDS,
  buildAnimeBase3Bindings,
  animeBasePartForBone,
  findAnimeBaseBone,
  // Model loader
  createAnimeBase3ModelBuilder,
};

/**
 * A ready character for a specific Three.js build.
 *
 * `THREE` is needed only for geometry building: rig, node map, and palette are
 * plain data, so an instance can be created without Three.js (server-side pose
 * calculation, validation, tools). Then `build()` throws a clear error instead
 * of silently returning an empty group.
 *
 * @param {object} [options]
 * @param {object} [options.THREE] host's three.js build (needed for `build`)
 * @param {object} [options.palette] default palette for this instance
 * @returns {object} character API
 */
export function createAnimeBase3({ THREE = null, palette = null } = {}) {
  const buildModel = THREE ? createAnimeBase3ModelBuilder(THREE) : null;
  const requireModel = () => {
    if (!buildModel) {
      throw new Error(
        'Anime Base 3.0: a three.js build is required to build the body (`createAnimeBase3({ THREE })`).',
      );
    }
    return buildModel;
  };
  return {
    id: ANIMEBASE3_PLUGIN_ID,
    version: ANIMEBASE3_VERSION,
    THREE,
    /**
     * Build the body: `{ group, mesh, armature, skeleton, bones, variant }`.
     * @param {object} [options] `{ variant: 'tall-standard' | 'tall-flat' | 'short-standard' | 'short-flat', palette? }`
     */
    build(options = {}) {
      return requireModel()({ palette, ...options });
    },
    /** Just the body group — handy for the scene when details are not needed. */
    buildGroup(options = {}) {
      return requireModel()({ palette, ...options }).group;
    },
    /** Rig data: names, hierarchy, rest matrices. */
    rig: Object.freeze({
      bones: ANIMEBASE3_BONES,
      root: ANIMEBASE3_ROOT,
      heightUnits: ANIMEBASE3_HEIGHT_UNITS,
    }),
    /** Semantic node → bone (21 nodes). */
    boneMap: ANIMEBASE3_BONE_MAP,
    /** Bone → body part. */
    boneParts: ANIMEBASE3_BONE_PARTS,
    /** Bind semantic nodes to the bones of a built skeleton. */
    bindings(skeleton, options = {}) {
      return buildAnimeBase3Bindings({ skeleton, THREE, ...options });
    },
    /** Body part a bone belongs to (with hierarchy climb). */
    partForBone(bone, options = {}) {
      return animeBasePartForBone(bone, options);
    },
    /** Palette from a single color — e.g., for NPCs or color variants. */
    paletteFromColor(color, overrides = null) {
      return animeBasePaletteFromColor(color, overrides);
    },
    /** Final palette materials (without building geometry). */
    materials(customPalette = null) {
      return resolveMaterialPalette(customPalette ?? palette);
    },
  };
}

/** Build the body once if a character instance is not needed.
 * @param {{THREE: object, palette?: object, variant?: string}} options
 */
export function buildAnimeBase3Model({ THREE, palette = null, variant = 'tall-standard' } = {}) {
  return createAnimeBase3ModelBuilder(THREE)({ palette, variant });
}

export default {
  id: ANIMEBASE3_PLUGIN_ID,
  version: ANIMEBASE3_VERSION,
  create: createAnimeBase3,
  build: buildAnimeBase3Model,
};
