/**
 * Telegram Interface Controller
 *
 * Helper functions for Telegram Text Control Interface
 * CC_ID1 - Phase 1
 *
 * Purpose: ควบคุม Telegram inline keyboards และจัดการ settings
 * NO IMAGE PROCESSING - Interface only!
 */

// ===== STATE MANAGEMENT =====

/**
 * Get user's current text settings from memory or default
 * @param {string} userId - Telegram user ID
 * @param {number} textSetNum - Text set number (1, 2, or 3)
 * @returns {object} - Current settings
 */
function getUserSettings(userId, textSetNum) {
  // This would typically read from workflow execution data
  // or Google Sheets in the actual implementation

  const defaultSettings = {
    userId: userId,
    textSetNum: textSetNum,
    text: '',
    fontSize: 60,
    position: 'center',
    color: 'FFFFFF',
    strokeWidth: 0,
    strokeColor: '000000',
    arcCurve: 0,
    updatedAt: new Date().toISOString()
  };

  return defaultSettings;
}

/**
 * Format settings for display in Telegram
 * @param {object} settings - Settings object
 * @returns {string} - Formatted text
 */
function formatSettingsDisplay(settings) {
  const lines = [
    `📝 **Text Set ${settings.textSetNum}**`,
    '',
    `✏️ Text: ${settings.text || '(not set)'}`,
    `📏 Font Size: ${settings.fontSize}px`,
    `📍 Position: ${settings.position}`,
    `🎨 Color: #${settings.color}`,
    `🖍️ Stroke: ${settings.strokeWidth}px (#${settings.strokeColor})`,
    `🌀 Arc: ${settings.arcCurve}°`
  ];

  // Add timing info if set
  if (settings.timingMode === 'full') {
    lines.push(`⏱️ Timing: Full Video`);
  } else if (settings.timingMode === 'range' && settings.startTime !== null && settings.endTime !== null) {
    lines.push(`⏱️ Timing: ${settings.startTime}s - ${settings.endTime}s`);
  } else {
    lines.push(`⏱️ Timing: None (Image mode)`);
  }

  lines.push('');
  lines.push(`🕒 Updated: ${new Date(settings.updatedAt).toLocaleString('th-TH')}`);

  return lines.join('\\n');
}

/**
 * Format all 3 text sets for preview
 * @param {array} allSettings - Array of 3 settings objects
 * @returns {string} - Formatted preview
 */
function formatAllSettingsPreview(allSettings) {
  const lines = ['👁️ **Preview All Settings**', ''];

  allSettings.forEach((settings, index) => {
    lines.push(`**Text Set ${index + 1}:**`);
    lines.push(`  Text: ${settings.text || '(empty)'}`);
    lines.push(`  Size: ${settings.fontSize}px | Pos: ${settings.position}`);
    lines.push(`  Color: #${settings.color} | Stroke: ${settings.strokeWidth}px`);
    lines.push(`  Arc: ${settings.arcCurve}°`);
    lines.push('');
  });

  return lines.join('\\n');
}

// ===== INLINE KEYBOARD BUILDERS =====

/**
 * Build main menu keyboard
 * @returns {object} - Telegram inline keyboard
 */
function buildMainMenu() {
  return {
    inline_keyboard: [
      [
        { text: '📝 Text Set 1', callback_data: 'edit_text_1' },
        { text: '📝 Text Set 2', callback_data: 'edit_text_2' },
        { text: '📝 Text Set 3', callback_data: 'edit_text_3' }
      ],
      [
        { text: '👁️ Preview Settings', callback_data: 'preview_all' },
        { text: '💾 Save to Sheets', callback_data: 'save_to_sheets' }
      ],
      [
        { text: '🗑️ Clear All', callback_data: 'clear_all' },
        { text: 'ℹ️ Help', callback_data: 'help' }
      ]
    ]
  };
}

/**
 * Build text set settings menu
 * @param {number} textSetNum - Text set number
 * @returns {object} - Telegram inline keyboard
 */
function buildTextSetMenu(textSetNum) {
  return {
    inline_keyboard: [
      [
        { text: '✏️ Enter Text', callback_data: `input_text_${textSetNum}` }
      ],
      [
        { text: '📏 Font Size', callback_data: `fontsize_${textSetNum}` },
        { text: '📍 Position', callback_data: `position_${textSetNum}` }
      ],
      [
        { text: '🎨 Text Color', callback_data: `color_${textSetNum}` },
        { text: '🖍️ Stroke', callback_data: `stroke_${textSetNum}` }
      ],
      [
        { text: '🌀 Arc Curve', callback_data: `arc_${textSetNum}` }
      ],
      [
        { text: '⏱️ Timing (Video only)', callback_data: `timing_${textSetNum}` }
      ],
      [
        { text: '👁️ Preview This Set', callback_data: `preview_${textSetNum}` }
      ],
      [
        { text: '🔙 Back to Menu', callback_data: 'main_menu' }
      ]
    ]
  };
}

/**
 * Build font size selection keyboard
 * @param {number} textSetNum - Text set number
 * @returns {object} - Telegram inline keyboard
 */
function buildFontSizeKeyboard(textSetNum) {
  return {
    inline_keyboard: [
      [
        { text: 'Small (40px)', callback_data: `set_fontsize_${textSetNum}_40` },
        { text: 'Medium (60px)', callback_data: `set_fontsize_${textSetNum}_60` },
        { text: 'Large (80px)', callback_data: `set_fontsize_${textSetNum}_80` }
      ],
      [
        { text: 'X-Large (100px)', callback_data: `set_fontsize_${textSetNum}_100` },
        { text: 'XX-Large (120px)', callback_data: `set_fontsize_${textSetNum}_120` }
      ],
      [
        { text: '🔙 Back', callback_data: `edit_text_${textSetNum}` }
      ]
    ]
  };
}

/**
 * Build position grid keyboard (3x3)
 * @param {number} textSetNum - Text set number
 * @returns {object} - Telegram inline keyboard
 */
function buildPositionKeyboard(textSetNum) {
  return {
    inline_keyboard: [
      [
        { text: '↖️', callback_data: `set_position_${textSetNum}_north_west` },
        { text: '⬆️', callback_data: `set_position_${textSetNum}_north` },
        { text: '↗️', callback_data: `set_position_${textSetNum}_north_east` }
      ],
      [
        { text: '⬅️', callback_data: `set_position_${textSetNum}_west` },
        { text: '🎯', callback_data: `set_position_${textSetNum}_center` },
        { text: '➡️', callback_data: `set_position_${textSetNum}_east` }
      ],
      [
        { text: '↙️', callback_data: `set_position_${textSetNum}_south_west` },
        { text: '⬇️', callback_data: `set_position_${textSetNum}_south` },
        { text: '↘️', callback_data: `set_position_${textSetNum}_south_east` }
      ],
      [
        { text: '🔙 Back', callback_data: `edit_text_${textSetNum}` }
      ]
    ]
  };
}

/**
 * Build color selection keyboard
 * @param {number} textSetNum - Text set number
 * @returns {object} - Telegram inline keyboard
 */
function buildColorKeyboard(textSetNum) {
  return {
    inline_keyboard: [
      [
        { text: '⚪ White', callback_data: `set_color_${textSetNum}_FFFFFF` },
        { text: '⚫ Black', callback_data: `set_color_${textSetNum}_000000` },
        { text: '🔴 Red', callback_data: `set_color_${textSetNum}_FF0000` }
      ],
      [
        { text: '🔵 Blue', callback_data: `set_color_${textSetNum}_0000FF` },
        { text: '🟢 Green', callback_data: `set_color_${textSetNum}_00FF00` },
        { text: '🟡 Yellow', callback_data: `set_color_${textSetNum}_FFDD17` }
      ],
      [
        { text: '🟠 Orange', callback_data: `set_color_${textSetNum}_FF9A17` },
        { text: '🟣 Purple', callback_data: `set_color_${textSetNum}_9B59B6` },
        { text: '🟤 Brown', callback_data: `set_color_${textSetNum}_8B4513` }
      ],
      [
        { text: '💛 Cremo Yellow', callback_data: `set_color_${textSetNum}_FFDD17` },
        { text: '💙 Cremo Blue', callback_data: `set_color_${textSetNum}_17539F` }
      ],
      [
        { text: '✏️ Custom Hex', callback_data: `input_color_${textSetNum}` }
      ],
      [
        { text: '🔙 Back', callback_data: `edit_text_${textSetNum}` }
      ]
    ]
  };
}

/**
 * Build stroke settings keyboard
 * @param {number} textSetNum - Text set number
 * @returns {object} - Telegram inline keyboard
 */
function buildStrokeKeyboard(textSetNum) {
  return {
    inline_keyboard: [
      [
        { text: '❌ No Stroke', callback_data: `set_stroke_${textSetNum}_0` }
      ],
      [
        { text: 'Thin (3px)', callback_data: `set_stroke_${textSetNum}_3` },
        { text: 'Medium (5px)', callback_data: `set_stroke_${textSetNum}_5` },
        { text: 'Thick (8px)', callback_data: `set_stroke_${textSetNum}_8` }
      ],
      [
        { text: 'X-Thick (12px)', callback_data: `set_stroke_${textSetNum}_12` },
        { text: 'XX-Thick (15px)', callback_data: `set_stroke_${textSetNum}_15` }
      ],
      [
        { text: '🎨 Stroke Color', callback_data: `strokecolor_${textSetNum}` }
      ],
      [
        { text: '🔙 Back', callback_data: `edit_text_${textSetNum}` }
      ]
    ]
  };
}

/**
 * Build arc curve keyboard
 * @param {number} textSetNum - Text set number
 * @returns {object} - Telegram inline keyboard
 */
function buildArcKeyboard(textSetNum) {
  return {
    inline_keyboard: [
      [
        { text: '-180°', callback_data: `set_arc_${textSetNum}_-180` },
        { text: '-90°', callback_data: `set_arc_${textSetNum}_-90` },
        { text: '-60°', callback_data: `set_arc_${textSetNum}_-60` }
      ],
      [
        { text: '-30°', callback_data: `set_arc_${textSetNum}_-30` },
        { text: '0° (Flat)', callback_data: `set_arc_${textSetNum}_0` },
        { text: '+30°', callback_data: `set_arc_${textSetNum}_30` }
      ],
      [
        { text: '+60°', callback_data: `set_arc_${textSetNum}_60` },
        { text: '+90°', callback_data: `set_arc_${textSetNum}_90` },
        { text: '+180°', callback_data: `set_arc_${textSetNum}_180` }
      ],
      [
        { text: '✏️ Custom (-180 to 180)', callback_data: `input_arc_${textSetNum}` }
      ],
      [
        { text: '🔙 Back', callback_data: `edit_text_${textSetNum}` }
      ]
    ]
  };
}

/**
 * Build timing selection keyboard (for video only)
 * @param {number} textSetNum - Text set number
 * @returns {object} - Telegram inline keyboard
 */
function buildTimingKeyboard(textSetNum) {
  return {
    inline_keyboard: [
      [
        { text: '📺 Full Video', callback_data: `set_timing_${textSetNum}_full` }
      ],
      [
        { text: '0-5s', callback_data: `set_timing_${textSetNum}_0-5` },
        { text: '5-10s', callback_data: `set_timing_${textSetNum}_5-10` },
        { text: '10-15s', callback_data: `set_timing_${textSetNum}_10-15` }
      ],
      [
        { text: '15-20s', callback_data: `set_timing_${textSetNum}_15-20` },
        { text: '20-30s', callback_data: `set_timing_${textSetNum}_20-30` },
        { text: '30-60s', callback_data: `set_timing_${textSetNum}_30-60` }
      ],
      [
        { text: '✏️ Custom Time', callback_data: `input_timing_${textSetNum}` }
      ],
      [
        { text: '🔙 Back', callback_data: `edit_text_${textSetNum}` }
      ]
    ]
  };
}

// ===== VALIDATION =====

/**
 * Validate setting value
 * @param {string} settingType - Type of setting
 * @param {string} value - Value to validate
 * @returns {object} - { valid: boolean, error: string }
 */
function validateSetting(settingType, value) {
  switch (settingType) {
    case 'fontsize':
      const size = parseInt(value);
      if (isNaN(size) || size < 20 || size > 200) {
        return { valid: false, error: 'Font size must be 20-200px' };
      }
      return { valid: true };

    case 'position':
      const validPositions = ['north', 'south', 'east', 'west', 'center',
                             'north_east', 'north_west', 'south_east', 'south_west'];
      if (!validPositions.includes(value)) {
        return { valid: false, error: 'Invalid position' };
      }
      return { valid: true };

    case 'color':
      if (!/^[0-9A-F]{6}$/i.test(value)) {
        return { valid: false, error: 'Color must be 6-digit hex (e.g., FFFFFF)' };
      }
      return { valid: true };

    case 'stroke':
      const stroke = parseInt(value);
      if (isNaN(stroke) || stroke < 0 || stroke > 30) {
        return { valid: false, error: 'Stroke width must be 0-30px' };
      }
      return { valid: true };

    case 'arc':
      const arc = parseInt(value);
      if (isNaN(arc) || arc < -180 || arc > 180) {
        return { valid: false, error: 'Arc must be -180 to 180 degrees' };
      }
      return { valid: true };

    case 'timing_mode':
      const validModes = ['full', 'range', 'none'];
      if (!validModes.includes(value)) {
        return { valid: false, error: 'Timing mode must be full, range, or none' };
      }
      return { valid: true };

    case 'start_time':
    case 'end_time':
      const time = parseFloat(value);
      if (isNaN(time) || time < 0) {
        return { valid: false, error: 'Time must be a positive number (seconds)' };
      }
      return { valid: true };

    default:
      return { valid: true };
  }
}

// ===== GOOGLE SHEETS HELPERS =====

/**
 * Format settings for Google Sheets row
 * @param {string} userId - Telegram user ID
 * @param {number} textSetNum - Text set number
 * @param {string} settingType - Setting type
 * @param {string} value - Setting value
 * @returns {object} - Row data for Google Sheets
 */
function formatForSheets(userId, textSetNum, settingType, value) {
  return {
    user_id: userId,
    text_set: textSetNum,
    setting_type: settingType,
    value: value,
    updated_at: new Date().toISOString()
  };
}

/**
 * Parse Google Sheets data to settings object
 * @param {array} rows - Rows from Google Sheets
 * @param {number} textSetNum - Text set number to filter
 * @returns {object} - Settings object
 */
function parseFromSheets(rows, textSetNum) {
  const settings = {
    textSetNum: textSetNum,
    text: '',
    fontSize: 60,
    position: 'center',
    color: 'FFFFFF',
    strokeWidth: 0,
    strokeColor: '000000',
    arcCurve: 0,
    timingMode: 'none',
    startTime: null,
    endTime: null
  };

  rows.forEach(row => {
    if (row.text_set === textSetNum) {
      switch (row.setting_type) {
        case 'fontsize':
          settings.fontSize = parseInt(row.value);
          break;
        case 'position':
          settings.position = row.value;
          break;
        case 'color':
          settings.color = row.value;
          break;
        case 'stroke':
          settings.strokeWidth = parseInt(row.value);
          break;
        case 'strokecolor':
          settings.strokeColor = row.value;
          break;
        case 'arc':
          settings.arcCurve = parseInt(row.value);
          break;
        case 'text':
          settings.text = row.value;
          break;
        case 'timing_mode':
          settings.timingMode = row.value;
          break;
        case 'start_time':
          settings.startTime = parseFloat(row.value);
          break;
        case 'end_time':
          settings.endTime = parseFloat(row.value);
          break;
      }
    }
  });

  return settings;
}

// ===== EXPORTS =====

module.exports = {
  // State
  getUserSettings,
  formatSettingsDisplay,
  formatAllSettingsPreview,

  // Keyboards
  buildMainMenu,
  buildTextSetMenu,
  buildFontSizeKeyboard,
  buildPositionKeyboard,
  buildColorKeyboard,
  buildStrokeKeyboard,
  buildArcKeyboard,
  buildTimingKeyboard,

  // Validation
  validateSetting,

  // Google Sheets
  formatForSheets,
  parseFromSheets
};
