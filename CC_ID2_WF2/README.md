# WF2: Cloudinary Code Generator

## Overview

Generate Cloudinary transformation URLs with text overlays from Google Sheets settings via Telegram bot interface.

**Phase:** 1 - Foundation
**Status:** ✅ Production Ready
**Author:** CC_ID2

---

## Features

- 📝 3 text layers simultaneously
- 🎨 Full styling (font, color, size, weight)
- 🌀 Arc curve support (-180° to 180°)
- 🔲 Stroke/outline effects
- 🌑 Shadow effects
- 📦 Background box with opacity
- 📍 9-grid positioning + pixel offset
- 🇹🇭 Thai text encoding support
- 👁️ Live preview generation
- ✅ URL validation

---

## Quick Start

### 1. Import n8n Workflow

```bash
# Import the workflow JSON
n8n import:workflow --input=./workflows/Text_Settings_Control.json
```

### 2. Configure Credentials

In n8n, add:
- **Telegram Bot Token** (from @BotFather)
- **Google Sheets OAuth2** (service account or OAuth)

### 3. Setup Google Sheet

Create a sheet named `text_settings` with columns:
```
user_id, template_id, text_layer, text_content, font_family, font_size,
font_weight, color, position, x_offset, y_offset, max_width, stroke_enabled,
stroke_color, stroke_width, shadow_enabled, shadow_strength, arc_angle,
background_enabled, background_color, background_opacity, align, status, notes
```

### 4. Start Using

In Telegram, send:
```
/text_settings   # Open settings menu
/preview         # Generate preview
/save            # Save settings
```

---

## File Structure

```
CC_ID2_WF2/
├── workflows/
│   └── Text_Settings_Control.json    # n8n workflow (12 nodes)
├── code/
│   └── cloudinary_url_builder.js     # URL builder with exports
├── templates/
│   └── Text_Overlay_Settings_Template.csv
├── docs/
│   └── TEXT_OVERLAY_GUIDE.md         # Complete guide
└── README.md                          # This file
```

---

## Usage Example

**Telegram Interaction:**
```
User: /text_settings
Bot: ✨ Text Overlay Settings
     [Edit Text] [Position]
     [Font Style] [Effects]
     [Preview] [Save]

User: [Clicks "Edit Text"]
Bot: 📝 Enter text for Layer 1:

User: CREMO ไอศกรีมสด
Bot: ✅ Text updated!

User: [Clicks "Position"]
Bot: Select position:
     [↖️ Top Left] [⬆️ Top] [↗️ Top Right]
     [⬅️ Left] [🎯 Center] [➡️ Right]
     [↙️ Bottom Left] [⬇️ Bottom] [↘️ Bottom Right]

User: [Clicks "⬆️ Top"]
Bot: ✅ Position set to north!

User: /preview
Bot: [Sends preview image]
     👁️ Preview
     This is how your text overlay will look.
```

**Generated URL:**
```
https://res.cloudinary.com/dz3cmaxnc/image/upload/w_1080,h_1080,c_fill/
l_text:Mitr_80_bold:CREMO%20ไอศกรีมสด,co_rgb:FFFFFF,w_800,c_fit,
bo_3px_solid_rgb:000000,e_shadow:40,fl_layer_apply,g_north,y_50/
f_auto,q_auto/sample_product.jpg
```

---

## Integration with Other Workflows

### Import as Module

```javascript
// In another n8n workflow or Node.js script
const { buildTextLayer, buildCloudinaryURL } = require('./code/cloudinary_url_builder.js');

// Build text layer
const textSettings = {
  text_content: 'ลด 70%',
  font_family: 'Mitr',
  font_size: 80,
  font_weight: 'bold',
  color: 'FF0000',
  position: 'north',
  stroke_enabled: true,
  stroke_color: '000000',
  stroke_width: 3
};

const layer = buildTextLayer(textSettings);
// Output: l_text:Mitr_80_bold:ลด%2070%25,co_rgb:FF0000,w_800,c_fit,bo_3px_solid_rgb:000000,fl_layer_apply,g_north
```

### Combine with CC_ID1's Logo Layers

```javascript
const { buildLogoLayer } = require('../../WF3_LOGO_PLACEMENT/code/logo_controller.js');
const { buildTextLayer } = require('./code/cloudinary_url_builder.js');

// Build complete URL with text + logos
const textLayer = buildTextLayer(textSettings);
const logoLayer = buildLogoLayer(logoSettings);

const finalUrl = `https://res.cloudinary.com/dz3cmaxnc/image/upload/`
  + `${textLayer}/${logoLayer}/product.jpg`;
```

---

## Settings Reference

### Font Families (Thai Support)
- **Mitr** - Modern, clean (recommended)
- **Sarabun** - Professional, readable
- **Kanit** - Bold, impactful
- **Prompt** - Friendly, approachable
- **Anuphan** - Elegant, refined
- **Bai Jamjuree** - Stylish, contemporary

### Positions (9-Grid)
- `north_west`, `north`, `north_east`
- `west`, `center`, `east`
- `south_west`, `south`, `south_east`

### Effects
- **Stroke:** `stroke_enabled=TRUE`, `stroke_width=2-10`, `stroke_color=HEX`
- **Shadow:** `shadow_enabled=TRUE`, `shadow_strength=20-80`
- **Arc Curve:** `arc_angle=-180 to 180` (negative = curve down, positive = curve up)
- **Background:** `background_enabled=TRUE`, `background_opacity=0-100`

---

## Troubleshooting

### URL Too Long
- Reduce text content
- Use shorter font names
- Disable unnecessary effects

### Thai Text Not Showing
- Ensure font supports Thai (Mitr, Sarabun, Kanit)
- Check encoding: text should be URL-encoded automatically

### Preview Not Generating
- Check Cloudinary credentials
- Verify base image URL is accessible
- Check Google Sheets format matches template

---

## Documentation

See [TEXT_OVERLAY_GUIDE.md](./docs/TEXT_OVERLAY_GUIDE.md) for:
- Complete API reference
- Advanced use cases
- Cloudinary transformation syntax
- Best practices

---

## Support

**Issues:** Open issue in repository
**Integration Help:** See ID_Talk.md for CC_ID1 integration points
**Cloudinary Docs:** https://cloudinary.com/documentation/image_transformations

---

**Last Updated:** November 10, 2025
**Version:** 1.0.0
