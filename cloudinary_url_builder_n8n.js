// ===== Cloudinary URL Builder for n8n Code Node =====
// Based on: Enhanced_Cloudinary_URL_Builder.js concept
// Purpose: Build text overlay transformation URLs for Cloudinary
//
// This code is designed to run inside n8n Code Node
// It processes text overlay configurations from Google Sheets
// and generates Cloudinary transformation URLs

// === INPUT VARIABLES (from n8n) ===
const imageUrl = $input.first().json.image_url;
const textContent = $input.first().json.text_content;
const templateId = $input.first().json.template_id;
const cloudName = $input.first().json.cloud_name || "dz3cmaxnc";

// Get all text configs from Google Sheets (from previous node)
const allConfigs = $input.all();

// === HELPER FUNCTIONS ===

/**
 * Find matching config from Google Sheets data
 * @param {string} templateId - Template ID to find
 * @param {array} configs - Array of config items from Load_Text_Config node
 * @returns {object|null} - Matching config or null
 */
function findConfig(templateId, configs) {
  for (const item of configs) {
    if (item.json.template_id === templateId) {
      return item.json;
    }
  }
  return null;
}

/**
 * Properly encode Thai text for URL
 * @param {string} text - Text to encode
 * @returns {string} - URL-encoded text
 */
function encodeThaiText(text) {
  return encodeURIComponent(text);
}

/**
 * Build complete text layer transformation string
 * @param {string} text - Text to overlay
 * @param {object} config - Text styling configuration
 * @returns {string} - Cloudinary transformation string
 */
function buildTextLayer(text, config) {
  const encodedText = encodeThaiText(text);
  const fontFamily = config.font_family || "Mitr";
  const fontSize = config.font_size || 80;
  const fontWeight = "bold";

  // Base text layer: l_text:Font_Size_Weight:EncodedText
  let layer = `l_text:${fontFamily}_${fontSize}_${fontWeight}:${encodedText}`;

  // Add color
  if (config.color) {
    const colorHex = config.color.replace('#', '');
    layer += `,co_rgb:${colorHex}`;
  }

  // Add stroke/outline (using border)
  if (config.stroke_enabled && config.stroke_width > 0) {
    const strokeColor = config.stroke_color ? config.stroke_color.replace('#', '') : '000000';
    layer += `,bo_${config.stroke_width}px_solid_rgb:${strokeColor}`;
  }

  // Add shadow (using effect)
  if (config.shadow_enabled && config.shadow_strength > 0) {
    layer += `,e_shadow:${config.shadow_strength}`;
  }

  // Add arc (text curve) - positive values curve up, negative curve down
  if (config.arc && config.arc !== 0) {
    layer += `,a_${config.arc}`;
  }

  // Add background
  if (config.bg_enabled && config.bg_color) {
    const bgColor = config.bg_color.replace('#', '');
    const bgOpacity = config.bg_opacity || 80;
    layer += `,b_rgb:${bgColor},o_${bgOpacity}`;
  }

  // Add max width constraint
  if (config.max_width && config.max_width > 0) {
    layer += `,w_${config.max_width}`;
  }

  // Apply layer with position
  const position = config.position || "north";
  const xOffset = config.x_offset || 0;
  const yOffset = config.y_offset || 0;

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
 * Build final Cloudinary URL using fetch method
 * @param {string} cloudName - Cloudinary cloud name
 * @param {string} imageSource - Source image URL (from Fal.AI)
 * @param {string} transformations - Transformation string
 * @returns {string} - Complete Cloudinary URL
 */
function buildCloudinaryURL(cloudName, imageSource, transformations) {
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

  // Base transformations for final image
  const baseTrans = "w_1080,h_1080,c_fill";

  // Fetch the external image and apply transformations
  const fetchUrl = `${baseUrl}/${baseTrans}/${transformations}/f_auto/${encodeURIComponent(imageSource)}`;

  return fetchUrl;
}

/**
 * Build preview URL (smaller size for Telegram)
 * @param {string} cloudName - Cloudinary cloud name
 * @param {string} imageSource - Source image URL
 * @param {string} transformations - Transformation string
 * @returns {string} - Preview Cloudinary URL
 */
function buildPreviewURL(cloudName, imageSource, transformations) {
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const baseTrans = "w_400,h_400,c_fill";

  return `${baseUrl}/${baseTrans}/${transformations}/f_auto/${encodeURIComponent(imageSource)}`;
}

// === MAIN LOGIC ===

try {
  // 1. Find config for this template
  const config = findConfig(templateId, allConfigs);

  if (!config) {
    throw new Error(`Config not found for template: ${templateId}. Available configs: ${allConfigs.map(c => c.json.template_id).join(', ')}`);
  }

  // 2. Build text layer transformation
  const textLayer = buildTextLayer(textContent, config);

  // 3. Build complete Cloudinary URL
  const cloudinaryUrl = buildCloudinaryURL(cloudName, imageUrl, textLayer);

  // 4. Build preview URL
  const previewUrl = buildPreviewURL(cloudName, imageUrl, textLayer);

  // 5. Return result
  return [{
    success: true,
    cloudinary_url: cloudinaryUrl,
    preview_url: previewUrl,
    transformation_breakdown: {
      base: "w_1080,h_1080,c_fill",
      text_layer: textLayer,
      image_source: imageUrl,
      full_transformation: `${textLayer}`
    },
    config_used: {
      template_id: config.template_id,
      font_size: config.font_size,
      font_family: config.font_family,
      position: config.position,
      color: config.color,
      stroke_enabled: config.stroke_enabled,
      shadow_enabled: config.shadow_enabled
    },
    metadata: {
      text_content: textContent,
      text_length: textContent.length,
      cloud_name: cloudName
    }
  }];

} catch (error) {
  // Return detailed error information
  return [{
    success: false,
    error: error.message,
    stack: error.stack,
    input_received: {
      image_url: imageUrl,
      text_content: textContent,
      template_id: templateId,
      cloud_name: cloudName,
      configs_count: allConfigs.length,
      available_templates: allConfigs.map(c => c.json.template_id || 'unknown')
    }
  }];
}
