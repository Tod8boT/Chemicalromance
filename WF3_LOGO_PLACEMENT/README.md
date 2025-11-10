# 🖼️ WF3: Logo Placement System

**Complete logo overlay system for Cloudinary images and videos**

[![Phase](https://img.shields.io/badge/Phase-3-blue)]()
[![Status](https://img.shields.io/badge/Status-Ready-green)]()
[![Integration](https://img.shields.io/badge/Integration-Telegram%20%2B%20Cloudinary-orange)]()

---

## 🎯 Overview

WF3 provides a Telegram-based interface for adding logos and watermarks to images/videos using Cloudinary transformations. Support for 3 logo sets with full control over positioning, sizing, opacity, blend modes, and effects.

## ✨ Key Features

- 📦 **6 Preset Logos** (CREMO logos, social icons, custom)
- 🎯 **9-Grid Positioning** + pixel-perfect offset (-500 to +500px)
- 📏 **Flexible Sizing** (10-2000px or auto-height)
- 👻 **Opacity Control** (0-100%)
- 🔧 **4 Scale Modes** (fit, scale, fill, pad)
- 🎨 **6 Blend Modes** (normal, multiply, screen, overlay, soft light, hard light)
- ✨ **5 Effects** (shadows, borders, glow)
- 💾 **Google Sheets Storage**
- 🌐 **Cloudinary Integration**

## 📂 File Structure

```
WF3_LOGO_PLACEMENT/
├── workflows/
│   └── Logo_Placement_Control.json       # n8n workflow (10 nodes)
├── code/
│   └── logo_controller.js                # Helper functions (700+ lines)
├── templates/
│   └── Logo_Settings_GoogleSheet_Template.csv  # Sample data
├── docs/
│   └── LOGO_PLACEMENT_GUIDE.md           # Complete documentation
└── README.md                             # This file
```

## 🚀 Quick Start

### 1. Import to n8n

```bash
# Import workflow
n8n import:workflow --input=workflows/Logo_Placement_Control.json
```

### 2. Setup Google Sheets

Create sheet with columns:
```
user_id | logo_set | setting_type | value | updated_at
```

### 3. Upload Preset Logos to Cloudinary

Required public IDs:
- `cremo_logo_main`
- `cremo_watermark`
- `cremo_badge`
- `facebook_icon`
- `line_icon`

### 4. Configure Credentials

- Telegram Bot API
- Google Sheets OAuth2

### 5. Test

```
/logo → Shows logo placement menu
```

## 💡 Use Cases

### 🏢 Product Branding
Add CREMO logo to all product photos (bottom-right, 200px, 80% opacity, shadow)

### 💧 Watermark Protection
Large centered watermark (400px, 20% opacity, soft light blend)

### 📘 Social Media Badges
Facebook + LINE icons (top corners, 80px, white borders)

### 🎨 Multi-Brand Campaign
CREMO + partner logos + campaign badge (3 logo sets)

### 🎬 Video Branding
Persistent logo throughout video (top-right, 100px, 60% opacity)

## 📊 Logo Settings Schema

| Setting | Type | Range | Default |
|---------|------|-------|---------|
| logo_id | string | Cloudinary ID | '' |
| position | string | 9 positions | south_east |
| width | number | 10-2000px | 150 |
| height | string | number or "auto" | auto |
| opacity | number | 0-100% | 100 |
| x_offset | number | -500 to +500px | 20 |
| y_offset | number | -500 to +500px | 20 |
| scale_mode | string | fit/scale/fill/pad | fit |
| blend_mode | string | 6 options | normal |
| effect | string | 6 options | none |

## 🌐 Cloudinary Transformation

### Single Logo Example:
```
l_cremo_logo_main,w_200,c_fit,o_80/e_shadow:50/fl_layer_apply,g_south_east,x_20,y_20
```

### Multiple Logos Example:
```
l_cremo_logo_main,w_200,c_fit,o_80/e_shadow:50/fl_layer_apply,g_south_east,x_20,y_20/
l_cremo_watermark,w_400,c_fit,o_20,e_soft_light,fl_layer_apply,g_center/
l_facebook_icon,w_80,c_fit/bo_3px_solid_rgb:FFFFFF/fl_layer_apply,g_north_west,x_15,y_15
```

## 🔗 Integration with WF5

Combine logo placement with video text overlays:

```javascript
const { buildLogoLayer } = require('../WF3_LOGO_PLACEMENT/code/logo_controller.js');

const logoLayer = buildLogoLayer(logoSettings);
const finalUrl = `${baseUrl}/${textLayer}/${logoLayer}/${videoId}`;
```

## 📱 Telegram User Flow

```
/logo
  → [Logo Set 1] [Logo Set 2] [Logo Set 3]
  → [Select Logo] → Choose from presets
  → [Position] → 9-grid selector
  → [Size] → 50px to 400px + custom
  → [Opacity] → 100% to 20% + custom
  → [Scale Mode] → fit/scale/fill/pad
  → [Blend Mode] → 6 creative options
  → [Effects] → shadow/border/glow
  → [Preview] → See current settings
```

## 📚 Documentation

See [LOGO_PLACEMENT_GUIDE.md](docs/LOGO_PLACEMENT_GUIDE.md) for:
- Complete feature documentation
- Installation guide
- User flow examples
- Cloudinary transformation syntax
- Google Sheets integration
- Use cases and best practices
- Troubleshooting

## 🎯 Best Practices

✅ **DO:**
- Use consistent positions across similar content
- Maintain 60-100% opacity for logos, 10-30% for watermarks
- Add subtle shadows for visibility
- Test on different backgrounds
- Keep logos < 30% of image width

❌ **DON'T:**
- Cover important content
- Use more than 3 logos per image
- Make logos too large
- Use very low opacity for branding
- Forget mobile testing

## 🔧 Technical Stack

- **n8n** - Workflow automation
- **Telegram Bot API** - User interface
- **Google Sheets** - Data storage
- **Cloudinary** - Image/video transformation
- **Node.js** - Helper functions

## 📦 Dependencies

```json
{
  "n8n": "^1.0.0",
  "telegram-bot-api": "^6.0.0",
  "google-sheets-api": "^4.0.0",
  "cloudinary": "^1.40.0"
}
```

## 🆘 Troubleshooting

**Logo not appearing?**
- Check logo_id in Cloudinary
- Verify opacity is not 0%
- Ensure position is set

**Logo too large/small?**
- Adjust width setting
- Try different scale_mode
- Check original dimensions

**Effects not showing?**
- Verify Cloudinary syntax
- Check blend mode compatibility
- Try different effect values

## 📞 Support

For issues or questions:
- Check [LOGO_PLACEMENT_GUIDE.md](docs/LOGO_PLACEMENT_GUIDE.md)
- Review [Cloudinary Docs](https://cloudinary.com/documentation)
- Contact CC_ID1 team

## 📄 License

Internal use only - CREMO Project

---

**Created by:** CC_ID1
**Phase:** 3
**Date:** November 10, 2025
**Version:** 1.0

**Related Workflows:**
- WF1: Telegram Text Control Interface (Phase 1)
- WF5: Video Text Overlay System (Phase 4)
