# Text Overlay Complete Guide

## Overview

Complete guide for WF2 Cloudinary Code Generator - Text overlays for CREMO marketing.

## Features

### Text Layers (3 Simultaneous)
- **text1**: Main headline (e.g., "CREMO ไอศกรีมสด")
- **text2**: Sub-headline (e.g., "เริ่มต้นเพียง 2500 บาท")
- **text3**: Call-to-action (e.g., "สั่งเลย!")

### Styling Options

**Fonts (Thai Support):**
- Mitr (recommended) - Modern, clean
- Sarabun - Professional
- Kanit - Bold
- Prompt - Friendly
- Anuphan - Elegant

**Effects:**
- **Stroke:** Border around text (2-10px)
- **Shadow:** Drop shadow (strength 20-80)
- **Arc Curve:** Curve text (-180° to 180°)
- **Background:** Semi-transparent box (opacity 0-100%)

**Positioning (9-Grid):**
```
[NW]  [N]  [NE]
[W]   [C]  [E]
[SW]  [S]  [SE]
```

## Cloudinary Syntax

### Basic Text Layer
```
l_text:Mitr_80_bold:ลด%2070%25,co_rgb:FF0000,fl_layer_apply,g_north
```

### With Stroke and Shadow
```
l_text:Mitr_80_bold:CREMO,co_rgb:FFFFFF,bo_3px_solid_rgb:000000,e_shadow:40,fl_layer_apply,g_north,y_50
```

### With Arc Curve
```
l_text:Mitr_60_normal:เริ่มต้น%202500,co_rgb:FFD700,e_distort:arc:30,fl_layer_apply,g_center
```

## Google Sheets Schema

```csv
user_id,template_id,text_layer,text_content,font_family,font_size,font_weight,color,position,x_offset,y_offset,max_width,stroke_enabled,stroke_color,stroke_width,shadow_enabled,shadow_strength,arc_angle,background_enabled,background_color,background_opacity,align,status,notes
123456,TEMP_001,text1,CREMO ไอศกรีมสด,Mitr,80,bold,FFFFFF,north,0,50,800,TRUE,000000,3,TRUE,40,0,FALSE,000000,80,center,active,Main headline
```

## Use Cases

### Case 1: Flash Sale Banner
```javascript
text1: "ลด 70%" (red, 100px, top, stroke)
text2: "วันนี้เท่านั้น!" (yellow, 60px, center, shadow)
text3: "สั่งเลย!" (white, 50px, bottom, background box)
```

### Case 2: Product Launch
```javascript
text1: "CREMO NEW!" (curved, 80px, arc +30°)
text2: "ตู้ไอติม รุ่นใหม่" (70px, stroke + shadow)
text3: "เริ่มต้น 25,000 บาท" (white on black bg, bottom-right)
```

## Best Practices

1. **Thai Font:** Always use Mitr, Sarabun, or Kanit
2. **Contrast:** White text on dark images, dark text on light images
3. **Stroke:** Use stroke for better readability
4. **Arc Angle:** -30° to +30° for subtle curves
5. **File Size:** Keep URLs under 4000 chars

## Integration

### With Logo Layers (WF3)
```javascript
const { buildTextLayer } = require('./code/cloudinary_url_builder.js');
const { buildLogoLayer } = require('../../WF3_LOGO_PLACEMENT/code/logo_controller.js');

const url = baseUrl + textLayer + '/' + logoLayer + '/image.jpg';
```

### With Video Timing (WF5)
```javascript
// Add so_/eo_ for video timing
const timedLayer = textLayer + ',so_5.0,eo_10.0';
```

## Troubleshooting

**Thai text not showing:**
- Use Thai-compatible font (Mitr, Sarabun, Kanit)
- Check URL encoding: spaces should be %20

**URL too long:**
- Shorten text content
- Reduce number of effects
- Use shorter font names

**Preview not loading:**
- Verify Cloudinary cloud name
- Check base image URL accessibility
- Validate URL format

---

**Documentation Version:** 1.0.0
**Last Updated:** November 10, 2025
