Enhanced_Cloudinary_URL_Builder.js
5.29 KB •182 lines
•
Formatting may be inconsistent from source
// Enhanced Cloudinary URL Builder
// Supports: Avatar, Neon, Gradient, 3D Shadow, Price Tag, Vintage

const cloudName = "dz3cmaxnc";
const imageId = $json.image_id || "sample";
const config = JSON.parse($json.final_config);
const text1 = $json.text1 || "";
const text2 = $json.text2 || "";
const text3 = $json.text3 || "";

// Start building URL
let url = `https://res.cloudinary.com/${cloudName}/image/upload/`;

// Base transformations
const baseWidth = config.base_width || 1080;
const baseHeight = config.base_height || 1080;
url += `w_${baseWidth},h_${baseHeight},c_fill,g_auto/`;

// Base effects (vintage, sepia, etc.)
if (config.base_effects && Array.isArray(config.base_effects)) {
  config.base_effects.forEach(effect => {
    url += `e_${effect}/`;
  });
}

// Background (for avatar mode)
if (config.background) {
  const bgColor = config.background.color || "ffffff";
  url += `b_rgb:${bgColor}/`;
  
  if (config.background.effect) {
    url += `e_${config.background.effect}/`;
  }
}

// Logo overlay
if (config.logo?.enabled) {
  const logoId = config.logo.public_id || "cremo_logo";
  const logoWidth = config.logo.width || 120;
  const logoPos = config.logo.position || "north_west";
  const logoX = config.logo.x_offset || 15;
  const logoY = config.logo.y_offset || 15;
  const logoOpacity = config.logo.opacity || 100;
  
  url += `l_${logoId},w_${logoWidth}`;
  if (logoOpacity < 100) {
    url += `,o_${logoOpacity}`;
  }
  url += `/fl_layer_apply,g_${logoPos},x_${logoX},y_${logoY}/`;
}

// Helper function to build text layer
function buildTextLayer(textConfig, textContent) {
  if (!textContent) return "";
  
  let layer = "";
  const font = textConfig.font || "Arial";
  const size = textConfig.size || 50;
  const weight = textConfig.weight || "normal";
  const color = textConfig.color || "000000";
  const maxWidth = textConfig.max_width || 800;
  const align = textConfig.align || "center";
  
  // Handle initials mode (for avatar)
  if (textConfig.initials_mode) {
    // Extract initials
    const words = textContent.trim().split(/\s+/);
    let initials = "";
    if (words.length === 1) {
      initials = words[0].substring(0, 2).toUpperCase();
    } else {
      initials = words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase();
    }
    textContent = initials;
  }
  
  // Handle price tag mode
  if (textConfig.prefix || textConfig.suffix) {
    const prefix = textConfig.prefix || "";
    const suffix = textConfig.suffix || "";
    textContent = `${prefix}${textContent}${suffix}`;
  }
  
  // Encode text
  const encodedText = encodeURIComponent(textContent);
  
  // Build text layer
  const fontStyle = weight === "normal" ? "" : `_${weight}`;
  layer += `l_text:${font}_${size}${fontStyle}_${align}:${encodedText},w_${maxWidth},c_fit,co_rgb:${color}/`;
  
  // Multiple strokes (layered effect)
  if (textConfig.stroke_enabled && textConfig.stroke_layers) {
    textConfig.stroke_layers.forEach(strokeLayer => {
      layer += `co_rgb:${strokeLayer.color},e_outline:${strokeLayer.width}/`;
    });
  } else if (textConfig.stroke_enabled) {
    const strokeColor = textConfig.stroke_color || "000000";
    const strokeWidth = textConfig.stroke_width || 5;
    layer += `co_rgb:${strokeColor},e_outline:${strokeWidth}/`;
  }
  
  // Apply effects
  if (textConfig.effects && Array.isArray(textConfig.effects)) {
    textConfig.effects.forEach(effect => {
      layer += `e_${effect}/`;
    });
  }
  
  // Shadow
  if (textConfig.shadow_enabled) {
    const shadowStrength = textConfig.shadow_strength || 50;
    layer += `e_shadow:${shadowStrength}/`;
  }
  
  // Arc curve
  if (textConfig.arc && textConfig.arc !== 0) {
    layer += `e_distort:arc:${textConfig.arc}/`;
  }
  
  // Background box for text
  if (textConfig.background_enabled) {
    const bgColor = textConfig.background_color || "000000";
    const bgOpacity = textConfig.background_opacity || 80;
    layer += `b_rgb:${bgColor},o_${bgOpacity}/`;
  }
  
  // Position
  const pos = textConfig.position || "center";
  const xOffset = textConfig.x_offset || 0;
  const yOffset = textConfig.y_offset || 0;
  
  layer += `fl_layer_apply,g_${pos}`;
  if (xOffset !== 0) layer += `,x_${xOffset}`;
  if (yOffset !== 0) layer += `,y_${yOffset}`;
  layer += `/`;
  
  return layer;
}

// Text Layer 1
if (text1 && config.text1) {
  url += buildTextLayer(config.text1, text1);
}

// Text Layer 2
if (text2 && config.text2?.enabled) {
  url += buildTextLayer(config.text2, text2);
}

// Text Layer 3
if (text3 && config.text3?.enabled) {
  url += buildTextLayer(config.text3, text3);
}

// Graphic overlay
if (config.graphic?.enabled) {
  const graphicId = config.graphic.public_id;
  const graphicWidth = config.graphic.width || 100;
  const graphicPos = config.graphic.position || "north_east";
  const graphicX = config.graphic.x_offset || 15;
  const graphicY = config.graphic.y_offset || 15;
  const graphicOpacity = config.graphic.opacity || 100;
  
  url += `l_${graphicId},w_${graphicWidth}`;
  if (graphicOpacity < 100) {
    url += `,o_${graphicOpacity}`;
  }
  url += `/fl_layer_apply,g_${graphicPos},x_${graphicX},y_${graphicY}/`;
}

// Add image file
const format = config.output_format || "jpg";
url += `${imageId}.${format}`;

// Return result
return [{
  cloudinary_url: url,
  template_used: $json.template_id,
  image_id: imageId,
  generation_time: new Date().toISOString()
}];
