/**
 * Logo Placement Controller
 *
 * Helper functions for Logo Placement System
 * WF3 - Phase 3
 *
 * Purpose: ควบคุม Telegram inline keyboards สำหรับ logo placement
 * Cloudinary logo overlay transformations
 */

// ===== PRESET LOGOS =====

/**
 * Available preset logos in Cloudinary
 */
const PRESET_LOGOS = {
  cremo_main: {
    id: 'cremo_logo_main',
    name: 'CREMO Logo (Main)',
    emoji: '🏢',
    default_width: 200
  },
  cremo_watermark: {
    id: 'cremo_watermark',
    name: 'CREMO Watermark',
    emoji: '💧',
    default_width: 150
  },
  cremo_badge: {
    id: 'cremo_badge',
    name: 'CREMO Badge',
    emoji: '🏅',
    default_width: 100
  },
  facebook_icon: {
    id: 'facebook_icon',
    name: 'Facebook Icon',
    emoji: '📘',
    default_width: 80
  },
  line_icon: {
    id: 'line_icon',
    name: 'LINE Icon',
    emoji: '💚',
    default_width: 80
  },
  custom: {
    id: 'custom',
    name: 'Custom Upload',
    emoji: '📁',
    default_width: 150
  }
};

// ===== STATE MANAGEMENT =====

/**
 * Get default logo settings
 * @param {string} userId - Telegram user ID
 * @param {number} logoSetNum - Logo set number (1, 2, or 3)
 * @returns {object} - Default settings
 */
function getDefaultLogoSettings(userId, logoSetNum) {
  return {
    userId: userId,
    logoSetNum: logoSetNum,
    logoId: '',
    position: 'south_east',
    width: 150,
    height: 'auto',
    opacity: 100,
    xOffset: 20,
    yOffset: 20,
    scaleMode: 'fit',
    blendMode: 'normal',
    effect: 'none',
    updatedAt: new Date().toISOString()
  };
}

/**
 * Format logo settings for display
 * @param {object} settings - Logo settings object
 * @returns {string} - Formatted text
 */
function formatLogoSettingsDisplay(settings) {
  const logoName = Object.values(PRESET_LOGOS).find(l => l.id === settings.logoId)?.name || settings.logoId || '(not set)';

  const lines = [
    `🖼️ **Logo Set ${settings.logoSetNum}**`,
    '',
    `📦 Logo: ${logoName}`,
    `📍 Position: ${settings.position}`,
    `📏 Size: ${settings.width}px × ${settings.height}`,
    `👻 Opacity: ${settings.opacity}%`,
    `📐 Offset: X=${settings.xOffset}px, Y=${settings.yOffset}px`,
    `🔧 Scale Mode: ${settings.scaleMode}`,
    `🎨 Blend: ${settings.blendMode}`,
    `✨ Effect: ${settings.effect}`,
    '',
    `🕒 Updated: ${new Date(settings.updatedAt).toLocaleString('th-TH')}`
  ];

  return lines.join('\\n');
}

// ===== INLINE KEYBOARD BUILDERS =====

/**
 * Build main logo menu
 * @returns {object} - Telegram inline keyboard
 */
function buildLogoMainMenu() {
  return {
    inline_keyboard: [
      [
        { text: '🖼️ Logo Set 1', callback_data: 'edit_logo_1' },
        { text: '🖼️ Logo Set 2', callback_data: 'edit_logo_2' },
        { text: '🖼️ Logo Set 3', callback_data: 'edit_logo_3' }
      ],
      [
        { text: '👁️ Preview All Logos', callback_data: 'preview_all_logos' },
        { text: '💾 Save to Sheets', callback_data: 'save_logos_to_sheets' }
      ],
      [
        { text: '🗑️ Clear All Logos', callback_data: 'clear_all_logos' },
        { text: 'ℹ️ Help', callback_data: 'logo_help' }
      ]
    ]
  };
}

/**
 * Build logo set settings menu
 * @param {number} logoSetNum - Logo set number
 * @returns {object} - Telegram inline keyboard
 */
function buildLogoSetMenu(logoSetNum) {
  return {
    inline_keyboard: [
      [
        { text: '📦 Select Logo', callback_data: `select_logo_${logoSetNum}` }
      ],
      [
        { text: '📍 Position', callback_data: `logo_position_${logoSetNum}` },
        { text: '📏 Size', callback_data: `logo_size_${logoSetNum}` }
      ],
      [
        { text: '👻 Opacity', callback_data: `logo_opacity_${logoSetNum}` },
        { text: '📐 Offset', callback_data: `logo_offset_${logoSetNum}` }
      ],
      [
        { text: '🔧 Scale Mode', callback_data: `logo_scale_${logoSetNum}` },
        { text: '🎨 Blend Mode', callback_data: `logo_blend_${logoSetNum}` }
      ],
      [
        { text: '✨ Effects', callback_data: `logo_effects_${logoSetNum}` }
      ],
      [
        { text: '👁️ Preview This Logo', callback_data: `preview_logo_${logoSetNum}` }
      ],
      [
        { text: '🔙 Back to Menu', callback_data: 'logo_main_menu' }
      ]
    ]
  };
}

/**
 * Build logo selection keyboard
 * @param {number} logoSetNum - Logo set number
 * @returns {object} - Telegram inline keyboard
 */
function buildLogoSelectionKeyboard(logoSetNum) {
  const buttons = Object.entries(PRESET_LOGOS).map(([key, logo]) => ({
    text: `${logo.emoji} ${logo.name}`,
    callback_data: `set_logo_${logoSetNum}_${key}`
  }));

  // Group into rows of 2
  const rows = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2));
  }

  rows.push([{ text: '🔙 Back', callback_data: `edit_logo_${logoSetNum}` }]);

  return { inline_keyboard: rows };
}

/**
 * Build position keyboard (9-grid)
 * @param {number} logoSetNum - Logo set number
 * @returns {object} - Telegram inline keyboard
 */
function buildLogoPositionKeyboard(logoSetNum) {
  return {
    inline_keyboard: [
      [
        { text: '↖️ Top-Left', callback_data: `set_logo_position_${logoSetNum}_north_west` },
        { text: '⬆️ Top', callback_data: `set_logo_position_${logoSetNum}_north` },
        { text: '↗️ Top-Right', callback_data: `set_logo_position_${logoSetNum}_north_east` }
      ],
      [
        { text: '⬅️ Left', callback_data: `set_logo_position_${logoSetNum}_west` },
        { text: '🎯 Center', callback_data: `set_logo_position_${logoSetNum}_center` },
        { text: '➡️ Right', callback_data: `set_logo_position_${logoSetNum}_east` }
      ],
      [
        { text: '↙️ Bottom-Left', callback_data: `set_logo_position_${logoSetNum}_south_west` },
        { text: '⬇️ Bottom', callback_data: `set_logo_position_${logoSetNum}_south` },
        { text: '↘️ Bottom-Right', callback_data: `set_logo_position_${logoSetNum}_south_east` }
      ],
      [
        { text: '🔙 Back', callback_data: `edit_logo_${logoSetNum}` }
      ]
    ]
  };
}

/**
 * Build logo size keyboard
 * @param {number} logoSetNum - Logo set number
 * @returns {object} - Telegram inline keyboard
 */
function buildLogoSizeKeyboard(logoSetNum) {
  return {
    inline_keyboard: [
      [
        { text: 'Tiny (50px)', callback_data: `set_logo_size_${logoSetNum}_50` },
        { text: 'Small (100px)', callback_data: `set_logo_size_${logoSetNum}_100` },
        { text: 'Medium (150px)', callback_data: `set_logo_size_${logoSetNum}_150` }
      ],
      [
        { text: 'Large (200px)', callback_data: `set_logo_size_${logoSetNum}_200` },
        { text: 'X-Large (300px)', callback_data: `set_logo_size_${logoSetNum}_300` },
        { text: 'XX-Large (400px)', callback_data: `set_logo_size_${logoSetNum}_400` }
      ],
      [
        { text: '✏️ Custom Size', callback_data: `input_logo_size_${logoSetNum}` }
      ],
      [
        { text: '🔙 Back', callback_data: `edit_logo_${logoSetNum}` }
      ]
    ]
  };
}

/**
 * Build opacity keyboard
 * @param {number} logoSetNum - Logo set number
 * @returns {object} - Telegram inline keyboard
 */
function buildLogoOpacityKeyboard(logoSetNum) {
  return {
    inline_keyboard: [
      [
        { text: '100% (Opaque)', callback_data: `set_logo_opacity_${logoSetNum}_100` },
        { text: '90%', callback_data: `set_logo_opacity_${logoSetNum}_90` },
        { text: '80%', callback_data: `set_logo_opacity_${logoSetNum}_80` }
      ],
      [
        { text: '70%', callback_data: `set_logo_opacity_${logoSetNum}_70` },
        { text: '60%', callback_data: `set_logo_opacity_${logoSetNum}_60` },
        { text: '50%', callback_data: `set_logo_opacity_${logoSetNum}_50` }
      ],
      [
        { text: '40%', callback_data: `set_logo_opacity_${logoSetNum}_40` },
        { text: '30%', callback_data: `set_logo_opacity_${logoSetNum}_30` },
        { text: '20%', callback_data: `set_logo_opacity_${logoSetNum}_20` }
      ],
      [
        { text: '✏️ Custom (0-100)', callback_data: `input_logo_opacity_${logoSetNum}` }
      ],
      [
        { text: '🔙 Back', callback_data: `edit_logo_${logoSetNum}` }
      ]
    ]
  };
}

/**
 * Build scale mode keyboard
 * @param {number} logoSetNum - Logo set number
 * @returns {object} - Telegram inline keyboard
 */
function buildLogoScaleModeKeyboard(logoSetNum) {
  return {
    inline_keyboard: [
      [
        { text: '📐 Fit (Keep Ratio)', callback_data: `set_logo_scale_${logoSetNum}_fit` }
      ],
      [
        { text: '📏 Scale (Exact Size)', callback_data: `set_logo_scale_${logoSetNum}_scale` }
      ],
      [
        { text: '🖼️ Fill (Crop if needed)', callback_data: `set_logo_scale_${logoSetNum}_fill` }
      ],
      [
        { text: '⬜ Pad (Add space)', callback_data: `set_logo_scale_${logoSetNum}_pad` }
      ],
      [
        { text: '🔙 Back', callback_data: `edit_logo_${logoSetNum}` }
      ]
    ]
  };
}

/**
 * Build blend mode keyboard
 * @param {number} logoSetNum - Logo set number
 * @returns {object} - Telegram inline keyboard
 */
function buildLogoBlendModeKeyboard(logoSetNum) {
  return {
    inline_keyboard: [
      [
        { text: '◽ Normal', callback_data: `set_logo_blend_${logoSetNum}_normal` }
      ],
      [
        { text: '✖️ Multiply', callback_data: `set_logo_blend_${logoSetNum}_multiply` },
        { text: '☀️ Screen', callback_data: `set_logo_blend_${logoSetNum}_screen` }
      ],
      [
        { text: '🎨 Overlay', callback_data: `set_logo_blend_${logoSetNum}_overlay` },
        { text: '🌟 Soft Light', callback_data: `set_logo_blend_${logoSetNum}_soft_light` }
      ],
      [
        { text: '🔦 Hard Light', callback_data: `set_logo_blend_${logoSetNum}_hard_light` }
      ],
      [
        { text: '🔙 Back', callback_data: `edit_logo_${logoSetNum}` }
      ]
    ]
  };
}

/**
 * Build effects keyboard
 * @param {number} logoSetNum - Logo set number
 * @returns {object} - Telegram inline keyboard
 */
function buildLogoEffectsKeyboard(logoSetNum) {
  return {
    inline_keyboard: [
      [
        { text: '❌ No Effect', callback_data: `set_logo_effect_${logoSetNum}_none` }
      ],
      [
        { text: '🌑 Shadow (Light)', callback_data: `set_logo_effect_${logoSetNum}_shadow_light` },
        { text: '🌚 Shadow (Dark)', callback_data: `set_logo_effect_${logoSetNum}_shadow_dark` }
      ],
      [
        { text: '🔲 Border (White)', callback_data: `set_logo_effect_${logoSetNum}_border_white` },
        { text: '⬛ Border (Black)', callback_data: `set_logo_effect_${logoSetNum}_border_black` }
      ],
      [
        { text: '💫 Glow', callback_data: `set_logo_effect_${logoSetNum}_glow` }
      ],
      [
        { text: '🔙 Back', callback_data: `edit_logo_${logoSetNum}` }
      ]
    ]
  };
}

// ===== VALIDATION =====

/**
 * Validate logo setting value
 * @param {string} settingType - Type of setting
 * @param {string} value - Value to validate
 * @returns {object} - { valid: boolean, error: string }
 */
function validateLogoSetting(settingType, value) {
  switch (settingType) {
    case 'logo_id':
      if (!value || value.trim() === '') {
        return { valid: false, error: 'Logo ID cannot be empty' };
      }
      return { valid: true };

    case 'position':
      const validPositions = ['north', 'south', 'east', 'west', 'center',
                             'north_east', 'north_west', 'south_east', 'south_west'];
      if (!validPositions.includes(value)) {
        return { valid: false, error: 'Invalid position' };
      }
      return { valid: true };

    case 'width':
    case 'height':
      if (value === 'auto') return { valid: true };
      const size = parseInt(value);
      if (isNaN(size) || size < 10 || size > 2000) {
        return { valid: false, error: 'Size must be 10-2000px or "auto"' };
      }
      return { valid: true };

    case 'opacity':
      const opacity = parseInt(value);
      if (isNaN(opacity) || opacity < 0 || opacity > 100) {
        return { valid: false, error: 'Opacity must be 0-100%' };
      }
      return { valid: true };

    case 'x_offset':
    case 'y_offset':
      const offset = parseInt(value);
      if (isNaN(offset) || offset < -500 || offset > 500) {
        return { valid: false, error: 'Offset must be -500 to 500px' };
      }
      return { valid: true };

    case 'scale_mode':
      const validScaleModes = ['fit', 'scale', 'fill', 'pad'];
      if (!validScaleModes.includes(value)) {
        return { valid: false, error: 'Invalid scale mode' };
      }
      return { valid: true };

    case 'blend_mode':
      const validBlendModes = ['normal', 'multiply', 'screen', 'overlay', 'soft_light', 'hard_light'];
      if (!validBlendModes.includes(value)) {
        return { valid: false, error: 'Invalid blend mode' };
      }
      return { valid: true };

    case 'effect':
      const validEffects = ['none', 'shadow_light', 'shadow_dark', 'border_white', 'border_black', 'glow'];
      if (!validEffects.includes(value)) {
        return { valid: false, error: 'Invalid effect' };
      }
      return { valid: true };

    default:
      return { valid: true };
  }
}

// ===== GOOGLE SHEETS HELPERS =====

/**
 * Format logo setting for Google Sheets
 * @param {string} userId - Telegram user ID
 * @param {number} logoSetNum - Logo set number
 * @param {string} settingType - Setting type
 * @param {string} value - Setting value
 * @returns {object} - Row data for Google Sheets
 */
function formatLogoForSheets(userId, logoSetNum, settingType, value) {
  return {
    user_id: userId,
    logo_set: logoSetNum,
    setting_type: settingType,
    value: value,
    updated_at: new Date().toISOString()
  };
}

/**
 * Parse Google Sheets data to logo settings
 * @param {array} rows - Rows from Google Sheets
 * @param {number} logoSetNum - Logo set number to filter
 * @returns {object} - Logo settings object
 */
function parseLogoFromSheets(rows, logoSetNum) {
  const settings = getDefaultLogoSettings(null, logoSetNum);

  rows.forEach(row => {
    if (row.logo_set === logoSetNum) {
      switch (row.setting_type) {
        case 'logo_id':
          settings.logoId = row.value;
          break;
        case 'position':
          settings.position = row.value;
          break;
        case 'width':
          settings.width = row.value === 'auto' ? 'auto' : parseInt(row.value);
          break;
        case 'height':
          settings.height = row.value === 'auto' ? 'auto' : parseInt(row.value);
          break;
        case 'opacity':
          settings.opacity = parseInt(row.value);
          break;
        case 'x_offset':
          settings.xOffset = parseInt(row.value);
          break;
        case 'y_offset':
          settings.yOffset = parseInt(row.value);
          break;
        case 'scale_mode':
          settings.scaleMode = row.value;
          break;
        case 'blend_mode':
          settings.blendMode = row.value;
          break;
        case 'effect':
          settings.effect = row.value;
          break;
      }
    }
  });

  return settings;
}

// ===== CLOUDINARY TRANSFORMATION =====

/**
 * Build Cloudinary logo layer transformation
 * @param {object} logoSettings - Logo settings object
 * @returns {string} - Cloudinary transformation string
 */
function buildLogoLayer(logoSettings) {
  if (!logoSettings.logoId || logoSettings.logoId === '') {
    return null;
  }

  let layer = `l_${logoSettings.logoId}`;

  // Size
  if (logoSettings.width !== 'auto') {
    layer += `,w_${logoSettings.width}`;
  }
  if (logoSettings.height !== 'auto') {
    layer += `,h_${logoSettings.height}`;
  }

  // Scale mode
  layer += `,c_${logoSettings.scaleMode}`;

  // Opacity
  if (logoSettings.opacity < 100) {
    layer += `,o_${logoSettings.opacity}`;
  }

  // Effects
  if (logoSettings.effect !== 'none') {
    switch (logoSettings.effect) {
      case 'shadow_light':
        layer += `/e_shadow:50`;
        break;
      case 'shadow_dark':
        layer += `/e_shadow:80`;
        break;
      case 'border_white':
        layer += `/bo_3px_solid_rgb:FFFFFF`;
        break;
      case 'border_black':
        layer += `/bo_3px_solid_rgb:000000`;
        break;
      case 'glow':
        layer += `/e_outline:outer:15:200`;
        break;
    }
  }

  // Blend mode (if not normal)
  if (logoSettings.blendMode !== 'normal') {
    layer += `,e_${logoSettings.blendMode}`;
  }

  // Position and offset
  layer += `/fl_layer_apply,g_${logoSettings.position}`;

  if (logoSettings.xOffset !== 0 || logoSettings.yOffset !== 0) {
    layer += `,x_${logoSettings.xOffset},y_${logoSettings.yOffset}`;
  }

  return layer;
}

// ===== EXPORTS =====

module.exports = {
  // Constants
  PRESET_LOGOS,

  // State
  getDefaultLogoSettings,
  formatLogoSettingsDisplay,

  // Keyboards
  buildLogoMainMenu,
  buildLogoSetMenu,
  buildLogoSelectionKeyboard,
  buildLogoPositionKeyboard,
  buildLogoSizeKeyboard,
  buildLogoOpacityKeyboard,
  buildLogoScaleModeKeyboard,
  buildLogoBlendModeKeyboard,
  buildLogoEffectsKeyboard,

  // Validation
  validateLogoSetting,

  // Google Sheets
  formatLogoForSheets,
  parseLogoFromSheets,

  // Cloudinary
  buildLogoLayer
};
