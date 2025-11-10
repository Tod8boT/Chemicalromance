/**
 * ===================================================================
 * CC_ID2 - WF2: Cloudinary URL Builder
 * ===================================================================
 *
 * Purpose: Generate Cloudinary transformation URLs from Google Sheets settings
 * Phase: 1 - Foundation
 * Author: CC_ID2
 *
 * Features:
 * - Read text settings from Google Sheets
 * - Support 3 text layers simultaneously
 * - Parameter mapping to Cloudinary syntax
 * - URL validation
 * - Thai text encoding support
 *
 * ===================================================================
 */

// ===== CONFIGURATION =====
const CLOUD_NAME = "dz3cmaxnc";
const DEFAULT_BASE_WIDTH = 1080;
const DEFAULT_BASE_HEIGHT = 1080;

// ===== INPUT DATA =====
// Expected input from previous n8n node (Google Sheets)
const inputData = $input.all(); // All rows from Google Sheets
const baseImageUrl = $('Workflow Settings').first().json.base_image_url; // Base image to overlay text on
const templateId = $('Workflow Settings').first().json.template_id; // Which template to use

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
 * @param {string} position - Position name (e.g., "north", "center", etc.)
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
 * Build text layer transformation string
 * @param {object} settings - Text layer settings from Google Sheets
 * @returns {string} - Cloudinary transformation string
 */
function buildTextLayer(settings) {
  if (!settings.text_content || settings.status === 'disabled') {
    return "";
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

  // Max width
  const maxWidth = parseInt(settings.max_width) || 800;
  layer += `,w_${maxWidth},c_fit`;

  // Text alignment
  const align = settings.align || "center";
  // Note: Cloudinary doesn't have direct align in text layer, handled by gravity

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
 * Filter settings by template ID and text layer
 * @param {array} allSettings - All settings from Google Sheets
 * @param {string} templateId - Template ID to filter
 * @returns {object} - Object with text1, text2, text3 settings
 */
function filterSettingsByTemplate(allSettings, templateId) {
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
 * ===== MAIN EXECUTION =====
 */

try {
  // 1. Filter settings by template ID
  const textSettings = filterSettingsByTemplate(inputData, templateId);

  // 2. Build text layers
  const textLayers = [];

  if (textSettings.text1) {
    const layer1 = buildTextLayer(textSettings.text1);
    if (layer1) textLayers.push(layer1);
  }

  if (textSettings.text2) {
    const layer2 = buildTextLayer(textSettings.text2);
    if (layer2) textLayers.push(layer2);
  }

  if (textSettings.text3) {
    const layer3 = buildTextLayer(textSettings.text3);
    if (layer3) textLayers.push(layer3);
  }

  // 3. Build complete URL
  const cloudinaryUrl = buildCloudinaryURL(CLOUD_NAME, baseImageUrl, textLayers);

  // 4. Validate URL
  const urlValidation = validateURL(cloudinaryUrl);

  // 5. Build preview URL (smaller size)
  const previewLayers = textLayers;
  const previewUrl = cloudinaryUrl.replace(
    `w_${DEFAULT_BASE_WIDTH},h_${DEFAULT_BASE_HEIGHT}`,
    'w_600,h_600'
  );

  // 6. Return result
  return [{
    json: {
      success: true,
      template_id: templateId,
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

      // Settings used
      settings_used: {
        text1: textSettings.text1 ? {
          content: textSettings.text1.text_content,
          font: `${textSettings.text1.font_family} ${textSettings.text1.font_size}`,
          position: textSettings.text1.position,
          color: textSettings.text1.color
        } : null,
        text2: textSettings.text2 ? {
          content: textSettings.text2.text_content,
          font: `${textSettings.text2.font_family} ${textSettings.text2.font_size}`,
          position: textSettings.text2.position,
          color: textSettings.text2.color
        } : null,
        text3: textSettings.text3 ? {
          content: textSettings.text3.text_content,
          font: `${textSettings.text3.font_family} ${textSettings.text3.font_size}`,
          position: textSettings.text3.position,
          color: textSettings.text3.color
        } : null
      },

      // Metadata
      metadata: {
        generated_at: new Date().toISOString(),
        cloud_name: CLOUD_NAME,
        total_layers: textLayers.length,
        url_length: cloudinaryUrl.length
      }
    }
  }];

} catch (error) {
  // Error handling
  return [{
    json: {
      success: false,
      error: error.message,
      error_stack: error.stack,
      input_data: {
        template_id: templateId,
        base_image_url: baseImageUrl,
        total_settings: inputData.length,
        available_templates: [...new Set(inputData.map(item => item.json.template_id))]
      }
    }
  }];
}
