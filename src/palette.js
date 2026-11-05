/**
 * Anime Base 3.0 materials and palette.
 *
 * Five material slots: skin, body, eyes, clothes, accessories.
 * A palette is derived from a single base color with per-slot overrides.
 */

// Color keys available in a palette.
export const ANIMEBASE3_COLOR_KEYS = ['skin', 'eyes', 'clothes', 'hair', 'accent'];

// Default colors (approximate AB3 authored look).
export const ANIMEBASE3_DEFAULT_COLORS = {
  skin: '#ffdbac',
  eyes: '#7f4685',
  clothes: '#1a1a2e',
  hair: '#ffe4b5',
  accent: '#4a90e2',
};

// Material declaration order (stable across builds).
export const ANIMEBASE3_MATERIAL_ORDER = ['skin', 'body', 'eyes', 'clothes', 'accent'];

// Base material descriptions (no Three.js import — host instantiates materials).
export const ANIMEBASE3_MATERIALS = {
  skin: { type: 'MeshStandardMaterial', color: ANIMEBASE3_DEFAULT_COLORS.skin, roughness: 0.9, metalness: 0.1 },
  body: { type: 'MeshStandardMaterial', color: ANIMEBASE3_DEFAULT_COLORS.clothes, roughness: 0.8, metalness: 0.0 },
  eyes: { type: 'MeshStandardMaterial', color: ANIMEBASE3_DEFAULT_COLORS.eyes, roughness: 0.1, metalness: 0.9 },
  clothes: { type: 'MeshStandardMaterial', color: ANIMEBASE3_DEFAULT_COLORS.clothes, roughness: 0.85, metalness: 0.05 },
  accent: { type: 'MeshStandardMaterial', color: ANIMEBASE3_DEFAULT_COLORS.accent, roughness: 0.5, metalness: 0.6 },
};

/**
 * Normalize a hex color string.
 * @param {string} hex
 * @returns {string} normalized `#RRGGBB`
 */
export function normalizeHexColor(hex) {
  if (!hex) return ANIMEBASE3_DEFAULT_COLORS.skin;
  const h = String(hex).replace('#', '');
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    return '#' + h.split('').map((c) => c + c).join('');
  }
  if (/^[0-9a-fA-F]{6}$/.test(h)) return '#' + h.toLowerCase();
  return ANIMEBASE3_DEFAULT_COLORS.skin;
}

/**
 * Build a full palette from one base color with optional per-slot overrides.
 * @param {string} baseColor
 * @param {object} [overrides] partial palette, e.g. { eyes: '#0000ff' }
 * @returns {Record<string, string>} full palette
 */
export function animeBasePaletteFromColor(baseColor, overrides = null) {
  const base = normalizeHexColor(baseColor);
  const palette = { ...ANIMEBASE3_DEFAULT_COLORS, skin: base };
  if (overrides) {
    for (const key of Object.keys(overrides)) {
      if (ANIMEBASE3_COLOR_KEYS.includes(key)) {
        palette[key] = normalizeHexColor(overrides[key]);
      }
    }
  }
  return Object.freeze(palette);
}

/**
 * Resolve material descriptions from a palette.
 * @param {Record<string, string>} palette
 * @returns {Record<string, object>} material descriptions keyed by slot
 */
export function resolveMaterialPalette(palette = ANIMEBASE3_DEFAULT_COLORS) {
  const result = {};
  for (const key of ANIMEBASE3_MATERIAL_ORDER) {
    const base = ANIMEBASE3_MATERIALS[key];
    result[key] = { ...base, color: palette[key] ?? base.color };
  }
  return Object.freeze(result);
}
