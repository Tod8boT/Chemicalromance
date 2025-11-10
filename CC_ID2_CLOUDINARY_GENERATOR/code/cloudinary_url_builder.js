// ===== CLOUDINARY URL BUILDER V2 =====
// CC_ID2: Parameter Mapping & URL Generation Module
// Mission: แปลง text settings → Cloudinary transformation URLs
// Usage: สามารถใช้ standalone หรือใน n8n Code node
//
// **VERSION 2 UPDATE:**
// - รองรับ vertical format จาก CC_ID1 (user_id, text_set, setting_type, value)
// - รองรับ horizontal format เดิม (backward compatible)
// - Default values ตาม CC_ID1 specs

// ===== DEFAULT VALUES (from CC_ID1) =====
const DEFAULTS = {
  fontsize: 60,           // Medium size
  position: 'center',     // Center position
  color: 'FFFFFF',        // White text
  stroke: 0,              // No stroke
  strokecolor: '000000',  // Black stroke (if enabled)
  arc: 0,                 // Flat (no curve)
  font_family: 'Mitr',    // Thai font - fixed by CC_ID1
  font_weight: 'bold',    // Bold - fixed by CC_ID1
  text_align: 'center',   // Center align - fixed by CC_ID1
  max_width: {
    1: 900,               // Text set 1 (headline)
    2: 800,               // Text set 2 (sub-headline)
    3: 700                // Text set 3 (CTA)
  }
};

/**
 * Parse vertical format from CC_ID1 to settings object
 * @param {Array} rows - Array of rows from Google Sheets (vertical format)
 *                       Format: {user_id, text_set, setting_type, value, updated_at}
 * @param {number} textSetNum - Text set number (1, 2, or 3)
 * @returns {Object} - Settings object for one text set
 */
function parseVerticalFormat(rows, textSetNum) {
  // Filter rows for this text set
  const textSetRows = rows.filter(row =>
    parseInt(row.text_set) === textSetNum
  );

  // If no rows found, return null (text set not configured)
  if (textSetRows.length === 0) {
    return null;
  }

  // Helper: get setting value
  function getValue(settingType) {
    const row = textSetRows.find(r => r.setting_type === settingType);
    return row ? row.value : null;
  }

  // Get text content (required for text set to be enabled)
  const textContent = getValue('text');
  if (!textContent || textContent.trim() === '') {
    return null; // Skip empty text sets
  }

  // Build settings object with defaults
  const settings = {
    text_content: textContent,
    font_family: DEFAULTS.font_family,
    font_size: parseInt(getValue('fontsize')) || DEFAULTS.fontsize,
    font_weight: DEFAULTS.font_weight,
    text_align: DEFAULTS.text_align,
    text_color: getValue('color') || DEFAULTS.color,
    max_width: DEFAULTS.max_width[textSetNum] || 800,
    position: getValue('position') || DEFAULTS.position,
    x_offset: 0, // CC_ID1 doesn't support x/y offsets yet
    y_offset: 0,
    arc_curve: parseFloat(getValue('arc')) || DEFAULTS.arc
  };

  // Handle stroke (only if width > 0)
  const strokeWidth = parseInt(getValue('stroke')) || DEFAULTS.stroke;
  if (strokeWidth > 0) {
    settings.stroke = {
      enabled: true,
      color: getValue('strokecolor') || DEFAULTS.strokecolor,
      width: strokeWidth
    };
  } else {
    settings.stroke = { enabled: false };
  }

  // Shadow and background not supported by CC_ID1 yet (Phase 2)
  settings.shadow = { enabled: false };
  settings.background = { enabled: false };

  return settings;
}

/**
 * Build Cloudinary URLs from vertical format (CC_ID1 compatible)
 * @param {Array} rows - Array of rows from Google Sheets
 * @param {string} userId - User ID to filter (optional, uses first user if not provided)
 * @param {string} cloudName - Cloudinary cloud name (default: 'dz3cmaxnc')
 * @returns {Object} - Complete URL with metadata
 */
function buildCloudinaryURLFromVertical(rows, userId = null, cloudName = 'dz3cmaxnc') {
  // Filter by user_id if provided
  let userRows = rows;
  if (userId) {
    userRows = rows.filter(row => row.user_id === userId || row.user_id === userId.toString());
  }

  // Parse each text set
  const text1 = parseVerticalFormat(userRows, 1);
  const text2 = parseVerticalFormat(userRows, 2);
  const text3 = parseVerticalFormat(userRows, 3);

  // Build settings object for buildCloudinaryURL
  const settings = {};

  if (text1) {
    settings.text1 = text1;
  }

  if (text2) {
    settings.text2 = { ...text2, enabled: true };
  }

  if (text3) {
    settings.text3 = { ...text3, enabled: true };
  }

  // Use existing buildCloudinaryURL function
  return buildCloudinaryURL(settings, cloudName);
}

/**
 * Build Cloudinary text overlay URL from settings (horizontal format - backward compatible)
 * @param {Object} settings - Text settings object from Google Sheets
 * @param {string} cloudName - Cloudinary cloud name (default: 'dz3cmaxnc')
 * @returns {Object} - Complete URL with metadata
 */
function buildCloudinaryURL(settings, cloudName = 'dz3cmaxnc') {

  // === PARAMETER MAPPING FUNCTIONS ===

  /**
   * Map font settings to Cloudinary text layer syntax
   * Format: l_text:{font}_{size}_{weight}_{align}:{encoded_text}
   */
  function mapTextLayer(layerSettings) {
    const font = layerSettings.font_family || 'Mitr';
    const size = layerSettings.font_size || 80;
    const weight = layerSettings.font_weight || 'bold';
    const align = layerSettings.text_align || 'center';
    const text = encodeURIComponent(layerSettings.text_content || '');

    return `l_text:${font}_${size}_${weight}_${align}:${text}`;
  }

  /**
   * Map color to Cloudinary format
   * Input: #FFFFFF or FFFFFF
   * Output: co_rgb:FFFFFF
   */
  function mapColor(color) {
    const cleanColor = (color || 'FFFFFF').replace('#', '');
    return `co_rgb:${cleanColor}`;
  }

  /**
   * Map stroke settings
   * Output: co_rgb:{color},e_outline:{width}
   */
  function mapStroke(strokeSettings) {
    if (!strokeSettings || !strokeSettings.enabled) return null;

    const strokeColor = (strokeSettings.color || '#000000').replace('#', '');
    const strokeWidth = strokeSettings.width || 5;

    return `co_rgb:${strokeColor},e_outline:${strokeWidth}`;
  }

  /**
   * Map shadow settings
   * Output: e_shadow:{strength}
   */
  function mapShadow(shadowSettings) {
    if (!shadowSettings || !shadowSettings.enabled) return null;

    const strength = shadowSettings.strength || 50;
    return `e_shadow:${strength}`;
  }

  /**
   * Map arc curve
   * Input: -180 to 180
   * Output: e_distort:arc:{angle}
   */
  function mapArcCurve(arc) {
    const arcValue = parseFloat(arc) || 0;
    if (arcValue === 0) return null;

    // Validate range
    if (arcValue < -180 || arcValue > 180) {
      throw new Error(`Arc curve must be between -180° and 180°. Got: ${arcValue}°`);
    }

    return `e_distort:arc:${arcValue.toFixed(1)}`;
  }

  /**
   * Map background box settings
   * Output: b_rgb:{color},o_{opacity}
   */
  function mapBackground(bgSettings) {
    if (!bgSettings || !bgSettings.enabled) return null;

    const bgColor = (bgSettings.color || '#000000').replace('#', '');
    const opacity = bgSettings.opacity || 80;

    return `b_rgb:${bgColor},o_${opacity}`;
  }

  /**
   * Map position settings
   * Output: fl_layer_apply,g_{position},x_{offset},y_{offset}
   */
  function mapPosition(posSettings) {
    const position = posSettings.position || 'center';
    const xOffset = parseInt(posSettings.x_offset) || 0;
    const yOffset = parseInt(posSettings.y_offset) || 0;

    let posString = `fl_layer_apply,g_${position}`;
    if (xOffset !== 0) posString += `,x_${xOffset}`;
    if (yOffset !== 0) posString += `,y_${yOffset}`;

    return posString;
  }

  // === BUILD TRANSFORMATION FOR EACH LAYER ===

  const layers = [];

  // LAYER 1 (Required)
  if (settings.text1 && settings.text1.text_content) {
    const layer1Parts = [
      mapTextLayer(settings.text1),
      `w_${settings.text1.max_width || 900},c_fit`,
      mapColor(settings.text1.text_color),
      mapStroke(settings.text1.stroke),
      mapShadow(settings.text1.shadow),
      mapArcCurve(settings.text1.arc_curve),
      mapBackground(settings.text1.background),
      mapPosition(settings.text1)
    ].filter(p => p !== null);

    layers.push(layer1Parts.join(','));
  }

  // LAYER 2 (Optional)
  if (settings.text2 && settings.text2.enabled && settings.text2.text_content) {
    const layer2Parts = [
      mapTextLayer(settings.text2),
      `w_${settings.text2.max_width || 800},c_fit`,
      mapColor(settings.text2.text_color),
      mapArcCurve(settings.text2.arc_curve),
      mapPosition(settings.text2)
    ].filter(p => p !== null);

    layers.push(layer2Parts.join(','));
  }

  // LAYER 3 (Optional)
  if (settings.text3 && settings.text3.enabled && settings.text3.text_content) {
    const layer3Parts = [
      mapTextLayer(settings.text3),
      `w_${settings.text3.max_width || 700},c_fit`,
      mapColor(settings.text3.text_color),
      mapPosition(settings.text3)
    ].filter(p => p !== null);

    layers.push(layer3Parts.join(','));
  }

  // === BUILD COMPLETE URL ===

  const transformationString = layers.join('/');
  const baseURL = `https://res.cloudinary.com/${cloudName}/image/upload/`;
  const urlTemplate = `${baseURL}${transformationString}/`;

  // === RETURN RESULT ===

  return {
    success: true,
    url_template: urlTemplate,
    transformation_string: transformationString,
    layer_count: layers.length,
    character_count: transformationString.length,
    example_usage: {
      with_public_id: `${urlTemplate}my_image.jpg`,
      with_fetch: `${urlTemplate}f_auto/https://example.com/image.jpg`,
      with_sample: `${urlTemplate}sample.jpg`
    },
    breakdown: {
      layer1: settings.text1 ? 'configured' : 'missing',
      layer2: settings.text2?.enabled ? 'configured' : 'disabled',
      layer3: settings.text3?.enabled ? 'configured' : 'disabled'
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Validate Cloudinary URL
 * @param {string} url - URL to validate
 * @returns {Object} - Validation result
 */
function validateCloudinaryURL(url) {
  const errors = [];
  const warnings = [];

  // Required components
  if (!url.includes('res.cloudinary.com/')) errors.push('Missing Cloudinary domain');
  if (!url.includes('/image/upload/')) errors.push('Missing upload path');
  if (!url.includes('l_text:')) errors.push('Missing text layer');
  if (!url.includes('fl_layer_apply')) errors.push('Missing layer apply');

  // Format checks
  if (!/l_text:[A-Za-z]+_\\d+_[a-z]+_[a-z]+:/.test(url)) {
    warnings.push('Text layer format may be incorrect');
  }

  if (url.includes(' ')) errors.push('URL contains spaces (not encoded)');
  if (url.length > 2000) warnings.push('URL is very long (>2000 chars)');

  // Color format
  if (url.includes('co_rgb:') && !/co_rgb:[0-9A-Fa-f]{6}/.test(url)) {
    errors.push('Invalid color format');
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    score: errors.length === 0 ? (warnings.length === 0 ? 100 : 80) : 0
  };
}

// === EXPORT FOR USE ===
module.exports = {
  // V2 - CC_ID1 compatible (vertical format)
  buildCloudinaryURLFromVertical,
  parseVerticalFormat,

  // V1 - Backward compatible (horizontal format)
  buildCloudinaryURL,
  validateCloudinaryURL,

  // Constants
  DEFAULTS
};

// === EXAMPLE USAGE ===
/*

// ===== V2: VERTICAL FORMAT (CC_ID1 compatible) =====

const verticalRows = [
  { user_id: '123', text_set: '1', setting_type: 'text', value: 'ลด 70% วันนี้!', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'fontsize', value: '90', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'position', value: 'north', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'color', value: 'FF0000', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'stroke', value: '8', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'strokecolor', value: 'FFD700', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'arc', value: '-15', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '2', setting_type: 'text', value: 'CREMO', updated_at: '2025-11-09T12:05:00Z' },
  { user_id: '123', text_set: '2', setting_type: 'fontsize', value: '70', updated_at: '2025-11-09T12:05:00Z' },
  { user_id: '123', text_set: '2', setting_type: 'position', value: 'center', updated_at: '2025-11-09T12:05:00Z' },
  { user_id: '123', text_set: '2', setting_type: 'color', value: 'FFFFFF', updated_at: '2025-11-09T12:05:00Z' }
];

const { buildCloudinaryURLFromVertical } = require('./cloudinary_url_builder.js');
const result = buildCloudinaryURLFromVertical(verticalRows, '123');
console.log(result);

// Output:
// {
//   success: true,
//   url_template: 'https://res.cloudinary.com/dz3cmaxnc/image/upload/l_text:Mitr_90_bold_center:ลด%2070%25%20วันนี้!,w_900,c_fit,co_rgb:FF0000,co_rgb:FFD700,e_outline:8,e_distort:arc:-15.0,fl_layer_apply,g_north/l_text:Mitr_70_bold_center:CREMO,w_800,c_fit,co_rgb:FFFFFF,fl_layer_apply,g_center/',
//   layer_count: 2,
//   ...
// }

// ===== V1: HORIZONTAL FORMAT (Backward compatible) =====

const settings = {
  text1: {
    text_content: 'CREMO ICE CREAM',
    font_family: 'Mitr',
    font_size: 90,
    font_weight: 'bold',
    text_align: 'center',
    text_color: '#FFD700',
    max_width: 900,
    arc_curve: 60,
    position: 'north',
    x_offset: 0,
    y_offset: 50,
    stroke: {
      enabled: true,
      color: '#000000',
      width: 5
    },
    shadow: {
      enabled: true,
      strength: 50
    }
  },
  text2: {
    enabled: true,
    text_content: 'Premium Quality',
    font_family: 'Sarabun',
    font_size: 50,
    font_weight: 'normal',
    text_align: 'center',
    text_color: '#FFFFFF',
    max_width: 800,
    position: 'center',
    x_offset: 0,
    y_offset: 0
  }
};

const result = buildCloudinaryURL(settings);
console.log(result);

// Output:
{
  success: true,
  url_template: 'https://res.cloudinary.com/dz3cmaxnc/image/upload/l_text:Mitr_90_bold_center:CREMO%20ICE%20CREAM,w_900,c_fit,co_rgb:FFD700,co_rgb:000000,e_outline:5,e_shadow:50,e_distort:arc:60.0,fl_layer_apply,g_north,y_50/l_text:Sarabun_50_normal_center:Premium%20Quality,w_800,c_fit,co_rgb:FFFFFF,fl_layer_apply,g_center/',
  layer_count: 2,
  ...
}

*/
