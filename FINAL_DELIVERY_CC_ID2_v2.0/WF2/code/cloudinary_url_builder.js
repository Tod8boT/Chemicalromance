/**
 * ===================================================================
 * CC_ID2 - WF2: Cloudinary URL Builder (IMPROVED v2.0)
 * ===================================================================
 *
 * Purpose: Generate Cloudinary transformation URLs from Google Sheets settings
 * Phase: 1 - Foundation (Enhanced)
 * Author: CC_ID2
 *
 * Features:
 * - Read text settings from Google Sheets (VERTICAL FORMAT)
 * - Support 3 text layers simultaneously
 * - Parameter mapping to Cloudinary syntax
 * - URL validation with detailed checks
 * - Thai text encoding support
 * - Blend modes support (6 modes)
 * - Scale modes support (4 modes)
 * - Enhanced validation functions
 *
 * Changes from v1.0:
 * - BREAKING: Changed from horizontal to vertical format (like CC_ID1)
 * - Added blend modes (normal, multiply, screen, overlay, soft_light, hard_light)
 * - Added scale modes (fit, scale, fill, pad)
 * - Added comprehensive validation functions
 * - Added more keyboard builders for better UX
 *
 * ===================================================================
 */

// ===== CONFIGURATION =====
const CLOUD_NAME = "dz3cmaxnc";
const DEFAULT_BASE_WIDTH = 1080;
const DEFAULT_BASE_HEIGHT = 1080;

// ===== VALIDATION CONSTANTS =====
const VALID_POSITIONS = ['north', 'south', 'east', 'west', 'center',
                         'north_east', 'north_west', 'south_east', 'south_west'];
const VALID_BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'soft_light', 'hard_light'];
const VALID_SCALE_MODES = ['fit', 'scale', 'fill', 'pad'];
const VALID_FONTS = ['Mitr', 'Sarabun', 'Kanit', 'Prompt', 'Anuphan', 'Bai Jamjuree'];

// ===== INPUT DATA =====
// Expected input from previous n8n node (Google Sheets - VERTICAL FORMAT)
const inputData = $input.all(); // All rows from Google Sheets
const userId = $('Workflow Settings').first().json.user_id;
const textSet = $('Workflow Settings').first().json.text_set || 1;
const baseImageUrl = $('Workflow Settings').first().json.base_image_url;

/**
 * ===== HELPER FUNCTIONS =====
 */

/**
 * Encode Thai text for URL compatibility
 * @param {string} text - Text to encode
 * @returns {string} - URL-safe encoded text
 */
function encodeTextForURL(text) {
  if (!text) return "";
  return encodeURIComponent(text.trim());
}

/**
 * Normalize hex color (remove # if present)
 * @param {string} color - Hex color code
 * @returns {string} - Normalized color code
 */
function normalizeColor(color) {
  if (!color) return "000000";
  return color.replace('#', '').toUpperCase();
}

/**
 * Convert position name to Cloudinary gravity parameter
 * @param {string} position - Position name
 * @returns {string} - Cloudinary gravity value
 */
function convertPosition(position) {
  const positionMap = {
    'north': 'north',
    'south': 'south',
    'east': 'east',
    'west': 'west',
    'center': 'center',
    'north_east': 'north_east',
    'north_west': 'north_west',
    'south_east': 'south_east',
    'south_west': 'south_west'
  };

  return positionMap[position] || 'center';
}

/**
 * Parse vertical format from Google Sheets to settings object
 * @param {array} rows - Array of rows from Google Sheets
 * @param {string} userId - User ID to filter
 * @param {number} textSetNum - Text set number (1, 2, or 3)
 * @returns {object} - Parsed text settings
 */
function parseTextFromSheets(rows, userId, textSetNum) {
  const settings = {
    text_content: '',
    font_family: 'Mitr',
    font_size: 60,
    font_weight: 'normal',
    color: 'FFFFFF',
    position: 'center',
    x_offset: 0,
    y_offset: 0,
    max_width: 800,
    stroke_enabled: false,
    stroke_color: '000000',
    stroke_width: 2,
    shadow_enabled: false,
    shadow_strength: 40,
    arc_angle: 0,
    background_enabled: false,
    background_color: '000000',
    background_opacity: 80,
    blend_mode: 'normal',
    scale_mode: 'fit',
    status: 'active'
  };

  // Filter rows for this user and text set
  const relevantRows = rows.filter(row => {
    const data = row.json;
    return data.user_id === userId &&
           data.text_set === textSetNum;
  });

  // Parse each setting
  relevantRows.forEach(row => {
    const data = row.json;
    const settingType = data.setting_type;
    const value = data.value;

    if (settings.hasOwnProperty(settingType)) {
      // Type conversion
      if (typeof settings[settingType] === 'number') {
        settings[settingType] = parseInt(value) || settings[settingType];
      } else if (typeof settings[settingType] === 'boolean') {
        settings[settingType] = value === 'TRUE' || value === true || value === '1';
      } else {
        settings[settingType] = value;
      }
    }
  });

  return settings;
}

/**
 * Validate text setting value
 * @param {string} settingType - Type of setting
 * @param {any} value - Value to validate
 * @returns {object} - Validation result {valid: boolean, error: string}
 */
function validateTextSetting(settingType, value) {
  const result = { valid: true, error: null };

  switch (settingType) {
    case 'text_content':
      if (!value || value.length === 0) {
        result.valid = false;
        result.error = 'Text content cannot be empty';
      }
      break;

    case 'font_family':
      if (!VALID_FONTS.includes(value)) {
        result.valid = false;
        result.error = `Font must be one of: ${VALID_FONTS.join(', ')}`;
      }
      break;

    case 'font_size':
      const size = parseInt(value);
      if (isNaN(size) || size < 10 || size > 200) {
        result.valid = false;
        result.error = 'Font size must be between 10-200px';
      }
      break;

    case 'position':
      if (!VALID_POSITIONS.includes(value)) {
        result.valid = false;
        result.error = `Position must be one of: ${VALID_POSITIONS.join(', ')}`;
      }
      break;

    case 'x_offset':
    case 'y_offset':
      const offset = parseInt(value);
      if (isNaN(offset) || offset < -500 || offset > 500) {
        result.valid = false;
        result.error = 'Offset must be between -500 and 500px';
      }
      break;

    case 'max_width':
      const width = parseInt(value);
      if (isNaN(width) || width < 100 || width > 2000) {
        result.valid = false;
        result.error = 'Max width must be between 100-2000px';
      }
      break;

    case 'arc_angle':
      const arc = parseInt(value);
      if (isNaN(arc) || arc < -180 || arc > 180) {
        result.valid = false;
        result.error = 'Arc angle must be between -180° and 180°';
      }
      break;

    case 'blend_mode':
      if (!VALID_BLEND_MODES.includes(value)) {
        result.valid = false;
        result.error = `Blend mode must be one of: ${VALID_BLEND_MODES.join(', ')}`;
      }
      break;

    case 'scale_mode':
      if (!VALID_SCALE_MODES.includes(value)) {
        result.valid = false;
        result.error = `Scale mode must be one of: ${VALID_SCALE_MODES.join(', ')}`;
      }
      break;
  }

  return result;
}

/**
 * Build text layer transformation string (ENHANCED with blend modes & scale modes)
 * @param {object} settings - Text layer settings from Google Sheets
 * @returns {string} - Cloudinary transformation string
 */
function buildTextLayer(settings) {
  if (!settings.text_content || settings.status === 'disabled') {
    return "";
  }

  // Validate settings first
  const validation = validateTextSetting('text_content', settings.text_content);
  if (!validation.valid) {
    throw new Error(`Invalid text content: ${validation.error}`);
  }

  // Encode text content
  const encodedText = encodeTextForURL(settings.text_content);

  // Font configuration
  const fontFamily = settings.font_family || "Mitr";
  const fontSize = parseInt(settings.font_size) || 60;
  const fontWeight = settings.font_weight || "normal";

  // Build base text layer: l_text:Font_Size_Weight:EncodedText
  let layer = `l_text:${fontFamily}_${fontSize}_${fontWeight}:${encodedText}`;

  // === TEXT STYLING ===

  // Color
  const textColor = normalizeColor(settings.color);
  layer += `,co_rgb:${textColor}`;

  // Max width with scale mode
  const maxWidth = parseInt(settings.max_width) || 800;
  const scaleMode = settings.scale_mode || 'fit';
  layer += `,w_${maxWidth},c_${scaleMode}`;

  // === EFFECTS ===

  // Stroke/Outline
  if (settings.stroke_enabled === "TRUE" || settings.stroke_enabled === true) {
    const strokeWidth = parseInt(settings.stroke_width) || 2;
    const strokeColor = normalizeColor(settings.stroke_color);
    layer += `,bo_${strokeWidth}px_solid_rgb:${strokeColor}`;
  }

  // Shadow
  if (settings.shadow_enabled === "TRUE" || settings.shadow_enabled === true) {
    const shadowStrength = parseInt(settings.shadow_strength) || 40;
    layer += `,e_shadow:${shadowStrength}`;
  }

  // Arc (text curve)
  const arcAngle = parseInt(settings.arc_angle) || 0;
  if (arcAngle !== 0) {
    layer += `,e_distort:arc:${arcAngle}`;
  }

  // Background box
  if (settings.background_enabled === "TRUE" || settings.background_enabled === true) {
    const bgColor = normalizeColor(settings.background_color);
    const bgOpacity = parseInt(settings.background_opacity) || 80;
    layer += `,b_rgb:${bgColor},o_${bgOpacity}`;
  }

  // Blend mode (NEW FEATURE!)
  const blendMode = settings.blend_mode || 'normal';
  if (blendMode !== 'normal') {
    // Map our blend mode names to Cloudinary effect names
    const blendMap = {
      'multiply': 'e_multiply',
      'screen': 'e_screen',
      'overlay': 'e_overlay',
      'soft_light': 'e_soft_light',
      'hard_light': 'e_hard_light'
    };
    if (blendMap[blendMode]) {
      layer += `,${blendMap[blendMode]}`;
    }
  }

  // === POSITIONING ===

  const position = convertPosition(settings.position);
  const xOffset = parseInt(settings.x_offset) || 0;
  const yOffset = parseInt(settings.y_offset) || 0;

  layer += `,fl_layer_apply,g_${position}`;

  if (xOffset !== 0) {
    layer += `,x_${xOffset}`;
  }
  if (yOffset !== 0) {
    layer += `,y_${yOffset}`;
  }

  return layer;
}

/**
 * DEPRECATED: Old horizontal format parser - kept for backwards compatibility
 * Use parseTextFromSheets for new vertical format
 */
function filterSettingsByTemplate(allSettings, templateId) {
  console.warn('filterSettingsByTemplate is deprecated. Use parseTextFromSheets with vertical format instead.');
  const result = {
    text1: null,
    text2: null,
    text3: null
  };

  allSettings.forEach(item => {
    const settings = item.json;
    if (settings.template_id === templateId) {
      const layer = settings.text_layer;
      if (layer === 'text1') result.text1 = settings;
      if (layer === 'text2') result.text2 = settings;
      if (layer === 'text3') result.text3 = settings;
    }
  });

  return result;
}

/**
 * Build complete Cloudinary URL
 * @param {string} cloudName - Cloudinary cloud name
 * @param {string} baseImageUrl - Source image URL
 * @param {array} textLayers - Array of text layer transformation strings
 * @returns {string} - Complete Cloudinary URL
 */
function buildCloudinaryURL(cloudName, baseImageUrl, textLayers) {
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

  // Base transformations
  const baseTrans = `w_${DEFAULT_BASE_WIDTH},h_${DEFAULT_BASE_HEIGHT},c_fill`;

  // Combine all text layers
  const allLayers = textLayers.filter(layer => layer !== "").join("/");

  // Build final URL
  // Format: base/base_trans/text_layers/format/fetch:encoded_source_url
  const finalUrl = `${baseUrl}/${baseTrans}/${allLayers}/f_auto,q_auto/${encodeURIComponent(baseImageUrl)}`;

  return finalUrl;
}

/**
 * Validate Cloudinary URL
 * @param {string} url - URL to validate
 * @returns {object} - Validation result
 */
function validateURL(url) {
  const validation = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Check URL format
  if (!url.startsWith('https://res.cloudinary.com/')) {
    validation.valid = false;
    validation.errors.push('URL must start with https://res.cloudinary.com/');
  }

  // Check URL length (Cloudinary has limits)
  if (url.length > 4000) {
    validation.valid = false;
    validation.errors.push(`URL too long (${url.length} chars). Max 4000 chars.`);
  }

  // Check for common issues
  if (url.includes('undefined')) {
    validation.warnings.push('URL contains "undefined" - check your settings');
  }

  if (!url.includes('/f_auto')) {
    validation.warnings.push('Consider adding f_auto for format optimization');
  }

  return validation;
}

/**
 * ===== MAIN EXECUTION (for n8n) =====
 */

// Check if running in n8n context or as module
if (typeof $input !== 'undefined' && typeof $input.all === 'function') {
  try {
    // 1. Parse text settings from VERTICAL FORMAT
    const text1Settings = parseTextFromSheets(inputData, userId, 1);
    const text2Settings = parseTextFromSheets(inputData, userId, 2);
    const text3Settings = parseTextFromSheets(inputData, userId, 3);

    // 2. Build text layers
    const textLayers = [];

    if (text1Settings.text_content) {
      const layer1 = buildTextLayer(text1Settings);
      if (layer1) textLayers.push(layer1);
    }

    if (text2Settings.text_content) {
      const layer2 = buildTextLayer(text2Settings);
      if (layer2) textLayers.push(layer2);
    }

    if (text3Settings.text_content) {
      const layer3 = buildTextLayer(text3Settings);
      if (layer3) textLayers.push(layer3);
    }

    // 3. Build complete URL
    const cloudinaryUrl = buildCloudinaryURL(CLOUD_NAME, baseImageUrl, textLayers);

    // 4. Validate URL
    const urlValidation = validateURL(cloudinaryUrl);

    // 5. Build preview URL (smaller size)
    const previewUrl = cloudinaryUrl.replace(
      `w_${DEFAULT_BASE_WIDTH},h_${DEFAULT_BASE_HEIGHT}`,
      'w_600,h_600'
    );

    // 6. Return result
    return [{
      json: {
        success: true,
        user_id: userId,
        text_set: textSet,
        cloudinary_url: cloudinaryUrl,
        preview_url: previewUrl,
        url_validation: urlValidation,

        // Breakdown for debugging
        transformation_breakdown: {
          base: `w_${DEFAULT_BASE_WIDTH},h_${DEFAULT_BASE_HEIGHT},c_fill`,
          text_layer_1: textLayers[0] || "not used",
          text_layer_2: textLayers[1] || "not used",
          text_layer_3: textLayers[2] || "not used",
          source_image: baseImageUrl
        },

        // Settings used (VERTICAL FORMAT)
        settings_used: {
          text1: text1Settings.text_content ? {
            content: text1Settings.text_content,
            font: `${text1Settings.font_family} ${text1Settings.font_size}`,
            position: text1Settings.position,
            color: text1Settings.color,
            blend_mode: text1Settings.blend_mode,
            scale_mode: text1Settings.scale_mode
          } : null,
          text2: text2Settings.text_content ? {
            content: text2Settings.text_content,
            font: `${text2Settings.font_family} ${text2Settings.font_size}`,
            position: text2Settings.position,
            color: text2Settings.color,
            blend_mode: text2Settings.blend_mode,
            scale_mode: text2Settings.scale_mode
          } : null,
          text3: text3Settings.text_content ? {
            content: text3Settings.text_content,
            font: `${text3Settings.font_family} ${text3Settings.font_size}`,
            position: text3Settings.position,
            color: text3Settings.color,
            blend_mode: text3Settings.blend_mode,
            scale_mode: text3Settings.scale_mode
          } : null
        },

        // Metadata
        metadata: {
          generated_at: new Date().toISOString(),
          cloud_name: CLOUD_NAME,
          total_layers: textLayers.length,
          url_length: cloudinaryUrl.length,
          format_version: '2.0 (vertical)'
        }
      }
    }];

  } catch (error) {
    // Enhanced error handling
    return [{
      json: {
        success: false,
        error: error.message,
        error_stack: error.stack,
        input_data: {
          user_id: userId,
          text_set: textSet,
          base_image_url: baseImageUrl,
          total_settings: inputData.length
        },
        hint: 'Make sure you are using VERTICAL format (user_id, text_set, setting_type, value, updated_at)'
      }
    }];
  }
}

/**
 * ===== MODULE EXPORTS (for external integration) =====
 */

// Export functions for use in other workflows or scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Core functions (v2.0 ENHANCED)
    buildTextLayer,
    buildCloudinaryURL,
    validateURL,

    // NEW: Vertical format support
    parseTextFromSheets,
    validateTextSetting,

    // Helper functions
    encodeTextForURL,
    normalizeColor,
    convertPosition,

    // Deprecated (backwards compatibility)
    filterSettingsByTemplate,

    // Constants
    CLOUD_NAME,
    DEFAULT_BASE_WIDTH,
    DEFAULT_BASE_HEIGHT,

    // NEW: Validation constants
    VALID_POSITIONS,
    VALID_BLEND_MODES,
    VALID_SCALE_MODES,
    VALID_FONTS
  };
}
