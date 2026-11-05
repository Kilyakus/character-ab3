/**
 * Anime Base 3.0 model loader — FBX → Three.js skinned mesh.
 *
 * Host passes its own Three.js build; this module never imports Three.js
 * directly.
 *
 * Variants (FBX files live next to this package in reference/models/):
 *   anime-base-short.fbx / anime-base-tall.fbx
 *   anime-base-short-flat-chest.fbx / anime-base-tall-flat-chest.fbx
 */

const VARIANT_FILES = {
  'short-standard': 'anime-base-short.fbx',
  'short-flat': 'anime-base-short-flat-chest.fbx',
  'tall-standard': 'anime-base-tall.fbx',
  'tall-flat': 'anime-base-tall-flat-chest.fbx',
};

/**
 * Create a model builder bound to a specific Three.js build.
 * @param {object} THREE host's three.js build
 * @returns {(options) => Promise<{group, mesh, armature, skeleton, bones, variant}>}
 */
export function createAnimeBase3ModelBuilder(THREE) {
  if (!THREE || typeof THREE.FBXLoader !== 'function' && !THREE.LoaderUtils) {
    // Allow hosts that bundle FBXLoader separately; check at call time too.
  }

  /**
   * Build the AB3 body for a variant.
   * @param {object} [options]
   * @param {string} [options.variant='tall-standard']
   * @param {object} [options.palette] material palette
   * @param {string} [options.basePath='/assets/models/animebase3/'] URL prefix for FBX
   * @returns {Promise<{group, mesh, armature, skeleton, bones, variant}>}
   */
  return async function buildModel({
    variant = 'tall-standard',
    palette = null,
    basePath = '/assets/models/animebase3/',
  } = {}) {
    const file = VARIANT_FILES[variant];
    if (!file) {
      throw new Error(`Unknown AnimeBase 3.0 variant: ${variant}`);
    }

    const url = basePath + file;

    // Lazy import of FBXLoader so the module stays engine-agnostic until used.
    let FBXLoader;
    try {
      // eslint-disable-next-line no-undef
      const mod = await import('three/examples/jsm/loaders/FBXLoader.js');
      FBXLoader = mod.FBXLoader;
    } catch (error) {
      throw new Error(
        `Anime Base 3.0: FBXLoader not available in the host's three.js build (${error.message})`,
      );
    }

    const loader = new FBXLoader();
    loader.setCrossOrigin('anonymous');

    const scene = await new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });

    let mesh = null;
    scene.traverse((node) => {
      if (node.isSkinnedMesh && !mesh) mesh = node;
    });

    if (!mesh) {
      throw new Error(`No skinned mesh found in AnimeBase 3.0 FBX: ${file}`);
    }

    const skeleton = mesh.skeleton;
    const bones = {};
    skeleton.bones.forEach((bone) => {
      bones[bone.name] = bone;
    });

    // Capture rest matrices for the rig module.
    const restMatrices = {};
    skeleton.bones.forEach((bone) => {
      const m = new THREE.Matrix4().copy(bone.matrixWorld);
      restMatrices[bone.name] = m.elements.slice();
    });
    // eslint-disable-next-line no-undef
    // setAnimeBaseRestMatrices is imported at module top; call it here:
    // (kept inline to avoid circular import in this sketch)
    window.__AB3_REST_MATRICES__ = restMatrices;

    // Apply palette materials if provided.
    if (palette) {
      const materials = resolveMaterialPalette(palette);
      mesh.traverse((node) => {
        if (!node.isMesh) return;
        const name = (node.material?.name ?? '').toLowerCase();
        if (name.includes('head') || name.includes('face')) {
          node.material = materials.skin ?? node.material;
        } else if (name.includes('body') || name.includes('torso')) {
          node.material = materials.body ?? node.material;
        } else if (name.includes('eye')) {
          node.material = materials.eyes ?? node.material;
        }
      });
    }

    const group = new THREE.Group();
    group.add(mesh);
    group.name = `AnimeBase3_${variant}`;
    group.userData.variant = variant;

    return {
      group,
      mesh,
      armature: mesh,
      skeleton,
      bones,
      variant,
    };
  };
}
