# 🖼️ WF3: Logo Placement System Guide

**CC_ID1 - Phase 3**
Complete logo overlay system for Cloudinary images and videos

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [User Flow](#user-flow)
5. [Logo Settings](#logo-settings)
6. [Cloudinary Transformation](#cloudinary-transformation)
7. [Google Sheets Integration](#google-sheets-integration)
8. [Preset Logos](#preset-logos)
9. [Use Cases](#use-cases)
10. [Technical Details](#technical-details)

---

## 🎯 Overview

**WF3: Logo Placement System** allows users to add logos/watermarks to images and videos via Telegram interface. Settings are saved to Google Sheets and can be used to generate Cloudinary transformation URLs.

### Key Capabilities:

- ✅ **3 Logo Sets** - Support up to 3 different logos per image/video
- ✅ **Preset Logos** - Choose from CREMO logos, social icons, or custom uploads
- ✅ **Full Position Control** - 9-grid positioning + pixel offset
- ✅ **Size & Opacity** - Adjust logo size (10-2000px) and transparency (0-100%)
- ✅ **Advanced Styling** - Scale modes, blend modes, effects (shadow, border, glow)
- ✅ **Google Sheets Storage** - All settings saved in vertical format
- ✅ **Cloudinary Ready** - Generate transformation URLs directly

---

## 🚀 Features

### 1. **Logo Selection**
Choose from preset logos or upload custom:
- 🏢 CREMO Logo (Main) - 200px default
- 💧 CREMO Watermark - 150px default
- 🏅 CREMO Badge - 100px default
- 📘 Facebook Icon - 80px default
- 💚 LINE Icon - 80px default
- 📁 Custom Upload - 150px default

### 2. **Position Control**
**9-Grid Positions:**
```
↖️ north_west    ⬆️ north       ↗️ north_east
⬅️ west          🎯 center      ➡️ east
↙️ south_west    ⬇️ south       ↘️ south_east
```

**Pixel Offset:**
- X Offset: -500 to +500px
- Y Offset: -500 to +500px

### 3. **Size Options**
- Tiny: 50px
- Small: 100px
- Medium: 150px
- Large: 200px
- X-Large: 300px
- XX-Large: 400px
- Custom: 10-2000px

### 4. **Opacity Levels**
- 100% (Opaque)
- 90%, 80%, 70%, 60%, 50%
- 40%, 30%, 20%
- Custom: 0-100%

### 5. **Scale Modes**
- **Fit** - Keep aspect ratio (recommended)
- **Scale** - Exact size (may distort)
- **Fill** - Fill dimensions (may crop)
- **Pad** - Add padding to fit

### 6. **Blend Modes**
- ◽ Normal - Standard overlay
- ✖️ Multiply - Darker blending
- ☀️ Screen - Lighter blending
- 🎨 Overlay - Contrast blend
- 🌟 Soft Light - Subtle lighting
- 🔦 Hard Light - Strong lighting

### 7. **Effects**
- ❌ No Effect
- 🌑 Shadow (Light) - Subtle drop shadow
- 🌚 Shadow (Dark) - Strong drop shadow
- 🔲 Border (White) - 3px white border
- ⬛ Border (Black) - 3px black border
- 💫 Glow - Outer glow effect

---

## 📦 Installation

### Step 1: Import Workflow to n8n

1. Copy `WF3_LOGO_PLACEMENT/workflows/Logo_Placement_Control.json`
2. In n8n: **Workflows** → **Import from File**
3. Update credentials:
   - Telegram Bot API
   - Google Sheets OAuth2

### Step 2: Setup Google Sheets

1. Create new spreadsheet
2. Create sheet named **"Logo_Settings"**
3. Add header row:
   ```
   user_id | logo_set | setting_type | value | updated_at
   ```
4. Copy spreadsheet ID
5. Update in workflow nodes:
   - "Save to Google Sheets"
   - "Load Logo Settings"

### Step 3: Upload Preset Logos to Cloudinary

Upload logos with public IDs:
- `cremo_logo_main`
- `cremo_watermark`
- `cremo_badge`
- `facebook_icon`
- `line_icon`

Or update `PRESET_LOGOS` in `logo_controller.js` with your IDs.

### Step 4: Activate Workflow

1. Test with `/logo` command in Telegram
2. Verify settings save to Google Sheets
3. Test preview functionality

---

## 👤 User Flow

### Main Flow:

```
User: /logo
Bot: 🖼️ Logo Placement System
     [🖼️ Logo Set 1] [🖼️ Logo Set 2] [🖼️ Logo Set 3]
     [👁️ Preview All] [💾 Save to Sheets]

User: Clicks "🖼️ Logo Set 1"
Bot: 🖼️ Logo Set 1 Settings
     [📦 Select Logo]
     [📍 Position] [📏 Size]
     [👻 Opacity] [📐 Offset]
     [🔧 Scale Mode] [🎨 Blend Mode]
     [✨ Effects]
     [👁️ Preview This Logo]

User: Clicks "📦 Select Logo"
Bot: 📦 เลือก Logo สำหรับ Set 1:
     [🏢 CREMO Logo] [💧 CREMO Watermark]
     [🏅 CREMO Badge]
     [📘 Facebook] [💚 LINE]
     [📁 Custom Upload]

User: Clicks "🏢 CREMO Logo"
Bot: ✅ เลือก 🏢 CREMO Logo (Main) แล้ว!
     → Saves to Google Sheets automatically

User: Clicks "📍 Position"
Bot: Shows 9-grid position selector

User: Clicks "↘️ Bottom-Right"
Bot: ✅ ตั้งตำแหน่งเป็น south_east แล้ว!
     → Saves to Google Sheets

User: Clicks "👻 Opacity"
Bot: Shows opacity options (100%, 90%, 80%...)

User: Clicks "80%"
Bot: ✅ ตั้งความโปร่งใสเป็น 80% แล้ว!
     → Saves to Google Sheets
```

### Preview Flow:

```
User: Clicks "👁️ Preview This Logo"
Bot: 🖼️ Logo Set 1

     📦 Logo: CREMO Logo (Main)
     📍 Position: south_east
     📏 Size: 200px × auto
     👻 Opacity: 80%
     📐 Offset: X=20px, Y=20px
     🔧 Scale Mode: fit
     🎨 Blend: normal
     ✨ Effect: shadow_light

     🕒 Updated: 10/11/2025, 17:00:00
```

---

## ⚙️ Logo Settings

### Complete Settings Schema:

| Setting | Type | Range/Options | Default |
|---------|------|---------------|---------|
| `logo_id` | string | Cloudinary public_id | '' |
| `position` | string | north, south, east, west, center, north_east, north_west, south_east, south_west | south_east |
| `width` | number/string | 10-2000 or "auto" | 150 |
| `height` | number/string | 10-2000 or "auto" | auto |
| `opacity` | number | 0-100 | 100 |
| `x_offset` | number | -500 to 500 | 20 |
| `y_offset` | number | -500 to 500 | 20 |
| `scale_mode` | string | fit, scale, fill, pad | fit |
| `blend_mode` | string | normal, multiply, screen, overlay, soft_light, hard_light | normal |
| `effect` | string | none, shadow_light, shadow_dark, border_white, border_black, glow | none |

---

## 🌐 Cloudinary Transformation

### Logo Layer Syntax:

**Basic Logo:**
```
l_cremo_logo_main,w_200,c_fit,fl_layer_apply,g_south_east,x_20,y_20
```

**Logo with Opacity:**
```
l_cremo_watermark,w_300,c_fit,o_30,fl_layer_apply,g_center
```

**Logo with Shadow:**
```
l_cremo_logo_main,w_200,c_fit/e_shadow:50/fl_layer_apply,g_south_east,x_20,y_20
```

**Logo with Border:**
```
l_facebook_icon,w_80,c_fit/bo_3px_solid_rgb:FFFFFF/fl_layer_apply,g_north_west,x_15,y_15
```

**Logo with Glow:**
```
l_cremo_badge,w_100,c_fit/e_outline:outer:15:200/fl_layer_apply,g_center
```

**Logo with Blend Mode:**
```
l_cremo_watermark,w_300,c_fit,o_30,e_soft_light,fl_layer_apply,g_center
```

### Multiple Logos Example:

```
https://res.cloudinary.com/your-cloud/image/upload/
  l_cremo_logo_main,w_200,c_fit,o_80/e_shadow:50/fl_layer_apply,g_south_east,x_20,y_20/
  l_cremo_watermark,w_400,c_fit,o_20,e_soft_light,fl_layer_apply,g_center/
  l_facebook_icon,w_80,c_fit/bo_3px_solid_rgb:FFFFFF/fl_layer_apply,g_north_west,x_15,y_15/
  your_image.jpg
```

This creates:
- **Logo Set 1:** CREMO logo (bottom-right, 200px, 80% opacity, shadow)
- **Logo Set 2:** Watermark (center, 400px, 20% opacity, soft light blend)
- **Logo Set 3:** Facebook icon (top-left, 80px, white border)

---

## 📊 Google Sheets Integration

### Data Format (Vertical):

```csv
user_id,logo_set,setting_type,value,updated_at
123456,1,logo_id,cremo_logo_main,2025-11-10T10:00:00Z
123456,1,position,south_east,2025-11-10T10:00:00Z
123456,1,width,200,2025-11-10T10:00:00Z
123456,1,height,auto,2025-11-10T10:00:00Z
123456,1,opacity,80,2025-11-10T10:00:00Z
123456,1,x_offset,20,2025-11-10T10:00:00Z
123456,1,y_offset,20,2025-11-10T10:00:00Z
123456,1,scale_mode,fit,2025-11-10T10:00:00Z
123456,1,blend_mode,normal,2025-11-10T10:00:00Z
123456,1,effect,shadow_light,2025-11-10T10:00:00Z
```

### Reading Settings:

Use `parseLogoFromSheets(rows, logoSetNum)` function:

```javascript
const { parseLogoFromSheets } = require('./logo_controller.js');

// Load all rows from Google Sheets
const rows = await googleSheets.getRows();

// Parse Logo Set 1
const logo1 = parseLogoFromSheets(rows, 1);

// Returns:
{
  logoSetNum: 1,
  logoId: 'cremo_logo_main',
  position: 'south_east',
  width: 200,
  height: 'auto',
  opacity: 80,
  xOffset: 20,
  yOffset: 20,
  scaleMode: 'fit',
  blendMode: 'normal',
  effect: 'shadow_light'
}
```

### Building Cloudinary Layer:

Use `buildLogoLayer(logoSettings)` function:

```javascript
const { buildLogoLayer } = require('./logo_controller.js');

const logoSettings = {
  logoId: 'cremo_logo_main',
  position: 'south_east',
  width: 200,
  height: 'auto',
  opacity: 80,
  xOffset: 20,
  yOffset: 20,
  scaleMode: 'fit',
  blendMode: 'normal',
  effect: 'shadow_light'
};

const layer = buildLogoLayer(logoSettings);
// Returns: "l_cremo_logo_main,w_200,c_fit,o_80/e_shadow:50/fl_layer_apply,g_south_east,x_20,y_20"
```

---

## 🏷️ Preset Logos

### Available Presets:

```javascript
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
```

### Adding New Preset Logos:

1. Upload logo to Cloudinary
2. Note the public_id (e.g., `my_new_logo`)
3. Add to `PRESET_LOGOS` in `logo_controller.js`:

```javascript
my_new_logo: {
  id: 'my_new_logo',
  name: 'My New Logo',
  emoji: '🎨',
  default_width: 150
}
```

4. Restart n8n workflow

---

## 💡 Use Cases

### Use Case 1: Product Branding
**Scenario:** Add CREMO logo to all product photos

**Settings:**
- Logo: CREMO Logo (Main)
- Position: Bottom-right
- Size: 200px
- Opacity: 80%
- Effect: Shadow (Light)

**Result:** Professional branding on every product image

---

### Use Case 2: Watermark Protection
**Scenario:** Prevent image theft with large watermark

**Settings:**
- Logo: CREMO Watermark
- Position: Center
- Size: 400px
- Opacity: 20%
- Blend Mode: Soft Light

**Result:** Subtle but effective watermark across entire image

---

### Use Case 3: Social Media Badge
**Scenario:** Add Facebook/LINE icons for social proof

**Settings:**
- Logo Set 1: Facebook Icon (top-left, 80px, border)
- Logo Set 2: LINE Icon (top-right, 80px, border)

**Result:** Social media badges on promotional images

---

### Use Case 4: Multi-Brand Campaign
**Scenario:** Show CREMO + partner brand

**Settings:**
- Logo Set 1: CREMO Logo (bottom-right, 150px)
- Logo Set 2: Partner Logo (bottom-left, 150px)
- Logo Set 3: Campaign Badge (top-center, 100px)

**Result:** Co-branded marketing materials

---

### Use Case 5: Video Branding
**Scenario:** Add persistent logo throughout video

**Settings:**
- Logo: CREMO Badge
- Position: Top-right
- Size: 100px
- Opacity: 60%
- Effect: None (clean look)

**Result:** Professional video branding without distraction

---

## 🔧 Technical Details

### File Structure:

```
WF3_LOGO_PLACEMENT/
├── workflows/
│   └── Logo_Placement_Control.json (10 nodes, 9 connections)
├── code/
│   └── logo_controller.js (700+ lines, 25+ functions)
├── templates/
│   └── Logo_Settings_GoogleSheet_Template.csv (Sample data)
└── docs/
    └── LOGO_PLACEMENT_GUIDE.md (This file)
```

### Workflow Nodes:

1. **Telegram Trigger** - Receives messages and callbacks
2. **Is Message?** - Routes message vs callback
3. **Handle Command** - Processes `/logo` command
4. **Handle Callback Query** - Processes button clicks
5. **Need to Save?** - Checks if settings need saving
6. **Save to Google Sheets** - appendOrUpdate operation
7. **Send Message** - Sends new messages
8. **Edit Message** - Updates existing messages
9. **Load Logo Settings** - Reads from Google Sheets
10. **Format Preview** - Formats settings for display

### Key Functions in `logo_controller.js`:

**Keyboard Builders:**
- `buildLogoMainMenu()` - Main menu
- `buildLogoSetMenu(logoSetNum)` - Logo set settings
- `buildLogoSelectionKeyboard(logoSetNum)` - Logo picker
- `buildLogoPositionKeyboard(logoSetNum)` - 9-grid position
- `buildLogoSizeKeyboard(logoSetNum)` - Size options
- `buildLogoOpacityKeyboard(logoSetNum)` - Opacity levels
- `buildLogoScaleModeKeyboard(logoSetNum)` - Scale modes
- `buildLogoBlendModeKeyboard(logoSetNum)` - Blend modes
- `buildLogoEffectsKeyboard(logoSetNum)` - Effects

**Validation:**
- `validateLogoSetting(settingType, value)` - Validates all settings

**Google Sheets:**
- `formatLogoForSheets(userId, logoSetNum, settingType, value)` - Format for save
- `parseLogoFromSheets(rows, logoSetNum)` - Parse from sheets

**Cloudinary:**
- `buildLogoLayer(logoSettings)` - Generate transformation string

### Integration with Other Workflows:

**WF5 (Video Text Overlay)** can be extended to include logos:

```javascript
// In WF5 URL builder
const { buildLogoLayer } = require('../WF3_LOGO_PLACEMENT/code/logo_controller.js');

// Load logo settings from Google Sheets
const logoSettings = parseLogoFromSheets(allRows, 1);

// Build logo layer
const logoLayer = buildLogoLayer(logoSettings);

// Combine with text layers
const finalUrl = `${baseUrl}/${textLayer1}/${textLayer2}/${logoLayer}/${imageId}`;
```

---

## 📝 Notes

### Important Considerations:

1. **Logo File Formats:**
   - PNG with transparency recommended
   - SVG supported
   - JPG works but no transparency

2. **Performance:**
   - Smaller logos (< 300px) load faster
   - Use appropriate opacity for watermarks
   - Blend modes may increase processing time

3. **Mobile Optimization:**
   - Test logo sizes on mobile screens
   - Consider responsive sizing (% based)
   - Offset may need adjustment for different aspect ratios

4. **Brand Guidelines:**
   - Maintain minimum logo sizes
   - Respect clear space requirements
   - Use approved color variations only

5. **Cloudinary Limits:**
   - Free tier: 25GB storage, 25GB bandwidth/month
   - Check transformation limits for your plan
   - Consider caching for frequently used combinations

---

## 🎓 Best Practices

### Logo Placement:

✅ **DO:**
- Use consistent positions across similar content
- Maintain appropriate opacity (60-100% for logos, 10-30% for watermarks)
- Add subtle shadows for better visibility
- Test on light and dark backgrounds
- Keep logos proportional to image size

❌ **DON'T:**
- Cover important content with logos
- Use too many logos (max 2-3 per image)
- Make logos too large (> 30% of image width)
- Use very low opacity (< 10%) for branding logos
- Forget to test on different screen sizes

### Settings Organization:

- **Logo Set 1:** Primary branding (company logo)
- **Logo Set 2:** Secondary element (watermark, partner logo)
- **Logo Set 3:** Additional badges (social icons, awards)

---

## 🆘 Troubleshooting

### Logo Not Appearing:

1. Check logo_id is correct in Cloudinary
2. Verify logo was uploaded to correct cloud
3. Check opacity is not 0%
4. Ensure position is set

### Logo Too Large/Small:

1. Adjust width setting
2. Try different scale_mode (fit vs scale)
3. Check logo original dimensions
4. Consider using percentage-based sizing

### Logo Quality Issues:

1. Upload higher resolution logo to Cloudinary
2. Use PNG format for transparency
3. Avoid excessive scaling (> 200% original size)
4. Check Cloudinary quality settings

### Effects Not Showing:

1. Verify effect syntax in Cloudinary docs
2. Check if effect is supported for logo type
3. Try different effect values
4. Some effects may not work with certain blend modes

---

## 📚 Additional Resources

- [Cloudinary Image Overlays Documentation](https://cloudinary.com/documentation/image_transformations#image_and_text_overlays)
- [Cloudinary Layer Transformations](https://cloudinary.com/documentation/layers)
- [Blend Modes Reference](https://cloudinary.com/documentation/image_transformation_reference#e_effect)
- [n8n Google Sheets Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

## ✅ Summary

**WF3: Logo Placement System** provides:

- 🖼️ **3 Logo Sets** per user
- 📦 **6 Preset Logos** + custom upload support
- 📍 **9 Position Options** + pixel-perfect offset
- 📏 **Flexible Sizing** (10-2000px or auto)
- 👻 **Opacity Control** (0-100%)
- 🔧 **4 Scale Modes** (fit, scale, fill, pad)
- 🎨 **6 Blend Modes** for creative effects
- ✨ **5 Effect Types** (shadows, borders, glow)
- 💾 **Google Sheets Storage** (vertical format)
- 🌐 **Cloudinary Integration** (transformation URLs)
- 📱 **Telegram Interface** (inline keyboards)

Perfect for product branding, watermark protection, social media badges, and multi-brand campaigns!

---

**Created by:** CC_ID1
**Phase:** 3
**Date:** November 10, 2025
**Version:** 1.0
