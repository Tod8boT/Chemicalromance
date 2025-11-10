/**
 * Text Layer Builder - Enhanced Version
 * CC_ID1 - WF5 Integration
 *
 * Builds Cloudinary text layers with support for:
 * - Font family selection
 * - Shadow effects
 * - Background color & opacity
 * - Max width control
 * - Video timing
 */

/**
 * Build single text layer with all features
 * @param {object} textSet - Text settings from Google Sheets
 * @param {number} index - Text set index (0, 1, 2)
 * @param {string} mediaType - 'image' or 'video'
 * @returns {string} - Cloudinary transformation layer
 */
function buildTextLayer(textSet, index, mediaType = 'image') {
  const {
    text,
    fontsize,
    font_family = 'Mitr',
    position,
    color,
    stroke,
    strokecolor,
    arc,
    shadow_enabled = false,
    shadow_strength = 0,
    bg_enabled = false,
    bg_color = '000000',
    bg_opacity = 80,
    max_width = 'auto',
    start_time,
    end_time,
    timing_mode
  } = textSet;

  if (!text) return null;

  // Encode text for URL
  const encodedText = encodeURIComponent(text);

  // Build base text layer with font family
  let layer = `l_text:${font_family}_${fontsize}_bold:${encodedText}`;

  // Text color
  layer += `,co_rgb:${color}`;

  // Max width
  let width = max_width;
  if (width === 'auto') {
    // Default widths by index
    width = [900, 800, 700][index] || 700;
  }
  layer += `,w_${width},c_fit`;

  // Background (must come before stroke/shadow for proper layering)
  if (bg_enabled && bg_color) {
    layer += `,b_rgb:${bg_color}`;
    if (bg_opacity < 100) {
      layer += `,o_${bg_opacity}`;
    }
  }

  // Stroke
  if (stroke > 0) {
    layer += `/co_rgb:${strokecolor},e_outline:${stroke}`;
  }

  // Shadow
  if (shadow_enabled && shadow_strength > 0) {
    layer += `/e_shadow:${shadow_strength}`;
  }

  // Arc curve
  if (arc !== 0) {
    layer += `/e_distort:arc:${arc}`;
  }

  // Video timing
  if (mediaType === 'video' && timing_mode === 'range' && start_time !== null && end_time !== null) {
    layer += `/so_${start_time.toFixed(1)}`;
    layer += `,eo_${end_time.toFixed(1)}`;
  }
  // If timing_mode === 'full' or 'none', no so/eo (shows entire video or image)

  // Apply layer with position
  layer += `/fl_layer_apply,g_${position}`;

  return layer;
}

/**
 * Build complete Cloudinary URL with multiple text layers
 * @param {string} cloudName - Cloudinary cloud name
 * @param {string} mediaUrl - Source media URL
 * @param {string} mediaType - 'image' or 'video'
 * @param {array} textSets - Array of text settings
 * @param {object} options - Additional options
 * @returns {object} - { finalUrl, previewUrl, transformations }
 */
function buildCloudinaryURL(cloudName, mediaUrl, mediaType, textSets, options = {}) {
  const baseUrl = `https://res.cloudinary.com/${cloudName}/${mediaType}/upload`;

  // Base transformations
  let baseTrans = '';
  if (mediaType === 'image') {
    baseTrans = options.baseTransform || 'w_1080,h_1080,c_fill';
  } else if (mediaType === 'video') {
    baseTrans = options.baseTransform || 'w_1080,h_1080,c_fill,q_auto:good';
  }

  // Build text layers
  const textLayers = textSets
    .map((ts, index) => buildTextLayer(ts, index, mediaType))
    .filter(layer => layer !== null);

  // Combine all transformations
  const allTrans = [baseTrans, ...textLayers].filter(t => t).join('/');

  // Build final URL (fetch external media)
  const finalUrl = `${baseUrl}/${allTrans}/f_auto/${encodeURIComponent(mediaUrl)}`;

  // Build preview URL (smaller for Telegram)
  const previewBaseTrans = mediaType === 'image'
    ? 'w_600,h_600,c_fill,q_auto:low'
    : 'w_600,h_600,c_fill,q_auto:low';
  const previewTrans = [previewBaseTrans, ...textLayers].filter(t => t).join('/');
  const previewUrl = `${baseUrl}/${previewTrans}/f_auto/${encodeURIComponent(mediaUrl)}`;

  return {
    finalUrl,
    previewUrl,
    transformations: {
      text_layers: textLayers,
      base: baseTrans,
      complete: textLayers.join('/')
    },
    textLayersCount: textLayers.length
  };
}

/**
 * Parse settings from Google Sheets (vertical format)
 * @param {array} rows - Rows from Google Sheets
 * @param {string} userId - User ID to filter
 * @returns {array} - Array of text sets with all settings
 */
function parseSettingsFromSheets(rows, userId) {
  const textSets = {};

  rows.forEach(row => {
    if (row.user_id !== userId) return;

    const textSet = row.text_set;
    const setting = row.setting_type;
    const value = row.value;

    if (!textSets[textSet]) {
      textSets[textSet] = {
        text_set: textSet,
        text: '',
        fontsize: 60,
        font_family: 'Mitr',
        position: 'center',
        color: 'FFFFFF',
        stroke: 0,
        strokecolor: '000000',
        arc: 0,
        shadow_enabled: false,
        shadow_strength: 0,
        bg_enabled: false,
        bg_color: '000000',
        bg_opacity: 80,
        max_width: 'auto',
        start_time: null,
        end_time: null,
        timing_mode: 'none'
      };
    }

    switch(setting) {
      case 'text':
        textSets[textSet].text = value;
        break;
      case 'fontsize':
        textSets[textSet].fontsize = parseInt(value);
        break;
      case 'font_family':
        textSets[textSet].font_family = value;
        break;
      case 'position':
        textSets[textSet].position = value;
        break;
      case 'color':
        textSets[textSet].color = value.replace('#', '');
        break;
      case 'stroke':
        textSets[textSet].stroke = parseInt(value);
        break;
      case 'strokecolor':
        textSets[textSet].strokecolor = value.replace('#', '');
        break;
      case 'arc':
        textSets[textSet].arc = parseFloat(value);
        break;
      case 'shadow_enabled':
        textSets[textSet].shadow_enabled = value === 'true';
        break;
      case 'shadow_strength':
        textSets[textSet].shadow_strength = parseInt(value);
        break;
      case 'bg_enabled':
        textSets[textSet].bg_enabled = value === 'true';
        break;
      case 'bg_color':
        textSets[textSet].bg_color = value.replace('#', '');
        break;
      case 'bg_opacity':
        textSets[textSet].bg_opacity = parseInt(value);
        break;
      case 'max_width':
        textSets[textSet].max_width = value === 'auto' ? 'auto' : parseInt(value);
        break;
      case 'start_time':
        textSets[textSet].start_time = parseFloat(value);
        break;
      case 'end_time':
        textSets[textSet].end_time = parseFloat(value);
        break;
      case 'timing_mode':
        textSets[textSet].timing_mode = value;
        break;
    }
  });

  // Convert to array and filter empty text sets
  return Object.values(textSets).filter(ts => ts.text);
}

/**
 * Validate video timings
 * @param {array} textSets - Array of text sets
 * @param {number} videoDuration - Video duration in seconds
 * @returns {array} - Validated text sets
 */
function validateVideoTimings(textSets, videoDuration) {
  return textSets.map(ts => {
    if (ts.timing_mode === 'range') {
      // Validate start/end times
      if (ts.start_time < 0) ts.start_time = 0;
      if (ts.end_time > videoDuration) ts.end_time = videoDuration;
      if (ts.start_time >= ts.end_time) {
        // Invalid range - use full video
        ts.timing_mode = 'full';
        ts.start_time = null;
        ts.end_time = null;
      }
    }
    return ts;
  });
}

// Example usage for n8n Code node:
/*
const cloudName = $env.CLOUDINARY_CLOUD_NAME || 'dz3cmaxnc';
const mediaType = $json.media_type;
const mediaUrl = $json.media_url;
const userId = $json.user_id;
const videoDuration = $json.video_duration || null;

// Parse settings from Google Sheets
const allRows = $input.all().map(item => item.json);
let textSets = parseSettingsFromSheets(allRows, userId);

// Validate timings for videos
if (mediaType === 'video' && videoDuration) {
  textSets = validateVideoTimings(textSets, videoDuration);
}

// Build URLs
const result = buildCloudinaryURL(cloudName, mediaUrl, mediaType, textSets);

return [{
  success: true,
  mediaType,
  ...result,
  metadata: {
    userId,
    textSets: textSets.map(ts => ({
      text: ts.text,
      font: ts.font_family,
      shadow: ts.shadow_enabled ? ts.shadow_strength : 'off',
      background: ts.bg_enabled ? `${ts.bg_color} (${ts.bg_opacity}%)` : 'off',
      timing: ts.timing_mode === 'range' ? `${ts.start_time}s - ${ts.end_time}s` : ts.timing_mode
    }))
  }
}];
*/

module.exports = {
  buildTextLayer,
  buildCloudinaryURL,
  parseSettingsFromSheets,
  validateVideoTimings
};
