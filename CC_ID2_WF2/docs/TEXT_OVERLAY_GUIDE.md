# Text Overlay Complete Guide

## Overview

Complete guide for WF2 Cloudinary Code Generator v2.0 - Advanced text overlays for CREMO marketing with vertical data format, blend modes, and comprehensive validation.

**Version:** 2.0.0 (Breaking Changes - Vertical Format)
**Last Updated:** November 10, 2025

## What's New in v2.0

### Breaking Changes
- **Vertical Data Format:** Changed from horizontal (23 columns) to vertical (5 columns) format
- **Improved Maintainability:** Easier to add new settings without schema changes
- **Better Validation:** Comprehensive validation with clear error messages

### New Features
- **Blend Modes:** 6 professional blend modes (multiply, screen, overlay, soft_light, hard_light)
- **Scale Modes:** 4 scaling options (fit, scale, fill, pad)
- **Enhanced Validation:** Real-time validation for all 20+ setting types
- **Deprecated Functions:** Old horizontal format still supported via `filterSettingsByTemplate()` (deprecated)

## Features

### Text Layers (3 Simultaneous)
- **text1**: Main headline (e.g., "CREMO ไอศกรีมสด")
- **text2**: Sub-headline (e.g., "เริ่มต้นเพียง 2500 บาท")
- **text3**: Call-to-action (e.g., "สั่งเลย!")

### Styling Options

**Fonts (Thai Support):**
- **Mitr** (recommended) - Modern, clean, excellent readability
- **Sarabun** - Professional, formal business style
- **Kanit** - Bold, eye-catching headlines
- **Prompt** - Friendly, approachable messaging
- **Anuphan** - Elegant, premium branding
- **Bai Jamjuree** - Contemporary, tech-forward

**Effects:**
- **Stroke:** Border around text (1-10px width, any color)
- **Shadow:** Drop shadow (strength 10-100, subtle to dramatic)
- **Arc Curve:** Curve text along arc (-180° to 180°, unique to CC_ID2!)
- **Background:** Semi-transparent box (opacity 0-100%, any color)

**Blend Modes (NEW in v2.0):**
- **normal** - Standard overlay (default)
- **multiply** - Darker blending, great for shadows
- **screen** - Lighter blending, glowing effects
- **overlay** - High contrast, dramatic look
- **soft_light** - Subtle enhancement
- **hard_light** - Strong enhancement

**Scale Modes (NEW in v2.0):**
- **fit** - Fit within max_width, maintain aspect ratio (default)
- **scale** - Scale to exact width, may distort
- **fill** - Fill area, crop if needed
- **pad** - Add padding to fit dimensions

**Positioning (9-Grid System):**
```
[north_west]  [north]  [north_east]
[west]        [center] [east]
[south_west]  [south]  [south_east]
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

### With Arc Curve (CC_ID2 Unique Feature!)
```
l_text:Mitr_60_normal:เริ่มต้น%202500,co_rgb:FFD700,e_distort:arc:30,fl_layer_apply,g_center
```

### With Blend Mode (NEW in v2.0)
```
l_text:Kanit_70_bold:สุดคุ้ม!,co_rgb:FFD700,w_600,c_fit,e_multiply,fl_layer_apply,g_center
```

### With Scale Mode (NEW in v2.0)
```
l_text:Mitr_80_bold:CREMO,co_rgb:FFFFFF,w_800,c_scale,fl_layer_apply,g_north
```

### Complete Example (All Features)
```
l_text:Mitr_80_bold:ลด%2050%25,co_rgb:FF0000,w_700,c_fit,bo_4px_solid_rgb:FFFFFF,e_shadow:50,e_distort:arc:20,e_overlay,fl_layer_apply,g_north,y_80
```

## Data Format (Vertical Schema v2.0)

### Why Vertical Format?

**Horizontal Format Problems (v1.0):**
- 23 columns per row - difficult to read and maintain
- Adding new settings requires schema changes
- Hard to version control (one long line)

**Vertical Format Advantages (v2.0):**
- 5 columns only: `user_id, text_set, setting_type, value, updated_at`
- ~20 rows per text set (one setting per row)
- Easy to extend: just add new rows
- Better git diffs and versioning
- Follows CC_ID1's proven approach

### Vertical Format Schema

```csv
user_id,text_set,setting_type,value,updated_at
123456,1,text_content,CREMO ไอศกรีมสด,2025-11-10T10:00:00Z
123456,1,font_family,Mitr,2025-11-10T10:00:00Z
123456,1,font_size,80,2025-11-10T10:00:00Z
123456,1,font_weight,bold,2025-11-10T10:00:00Z
123456,1,color,FFFFFF,2025-11-10T10:00:00Z
123456,1,position,north,2025-11-10T10:00:00Z
123456,1,x_offset,0,2025-11-10T10:00:00Z
123456,1,y_offset,50,2025-11-10T10:00:00Z
123456,1,max_width,800,2025-11-10T10:00:00Z
123456,1,stroke_enabled,TRUE,2025-11-10T10:00:00Z
123456,1,stroke_color,000000,2025-11-10T10:00:00Z
123456,1,stroke_width,3,2025-11-10T10:00:00Z
123456,1,shadow_enabled,TRUE,2025-11-10T10:00:00Z
123456,1,shadow_strength,40,2025-11-10T10:00:00Z
123456,1,arc_angle,0,2025-11-10T10:00:00Z
123456,1,background_enabled,FALSE,2025-11-10T10:00:00Z
123456,1,blend_mode,normal,2025-11-10T10:00:00Z
123456,1,scale_mode,fit,2025-11-10T10:00:00Z
123456,1,status,active,2025-11-10T10:00:00Z
```

### All Available Settings (20 Total)

| Setting Type | Data Type | Valid Range/Values | Description |
|-------------|-----------|-------------------|-------------|
| `text_content` | string | any | Text to display |
| `font_family` | string | Mitr, Sarabun, Kanit, Prompt, Anuphan, Bai Jamjuree | Font name |
| `font_size` | integer | 10-200 | Font size in pixels |
| `font_weight` | string | normal, bold | Font weight |
| `color` | string (hex) | 000000-FFFFFF | Text color (no #) |
| `position` | string | north, south, east, west, center, north_east, north_west, south_east, south_west | Gravity position |
| `x_offset` | integer | -2000 to 2000 | Horizontal offset in pixels |
| `y_offset` | integer | -2000 to 2000 | Vertical offset in pixels |
| `max_width` | integer | 100-2000 | Maximum text width in pixels |
| `stroke_enabled` | boolean | TRUE, FALSE | Enable text stroke/border |
| `stroke_color` | string (hex) | 000000-FFFFFF | Stroke color (no #) |
| `stroke_width` | integer | 1-10 | Stroke width in pixels |
| `shadow_enabled` | boolean | TRUE, FALSE | Enable drop shadow |
| `shadow_strength` | integer | 10-100 | Shadow opacity/strength |
| `arc_angle` | integer | -180 to 180 | Arc curve angle in degrees |
| `background_enabled` | boolean | TRUE, FALSE | Enable background box |
| `background_color` | string (hex) | 000000-FFFFFF | Background color (no #) |
| `background_opacity` | integer | 0-100 | Background opacity % |
| `blend_mode` | string | normal, multiply, screen, overlay, soft_light, hard_light | Blend mode (v2.0) |
| `scale_mode` | string | fit, scale, fill, pad | Scaling mode (v2.0) |
| `status` | string | active, inactive | Enable/disable text set |

## Use Cases

### Case 1: Flash Sale Banner (Classic)

**Scenario:** Weekend flash sale promotion for CREMO ice cream

**Text Layers:**
```javascript
text1: "ลด 70%"
  - Font: Kanit 100px bold
  - Color: FF0000 (red)
  - Position: north, y_offset: 80
  - Stroke: white 4px
  - Shadow: strength 50
  - Blend: normal

text2: "วันนี้เท่านั้น!"
  - Font: Mitr 60px bold
  - Color: FFD700 (gold)
  - Position: center
  - Shadow: strength 40
  - Background: black 80% opacity
  - Blend: overlay (dramatic contrast!)

text3: "สั่งเลย!"
  - Font: Kanit 70px bold
  - Color: FFFFFF (white)
  - Position: south, y_offset: -60
  - Background: FF0000 (red) 90% opacity
  - Blend: normal
```

**Cloudinary URL:**
```
https://res.cloudinary.com/demo/image/upload/
l_text:Kanit_100_bold:ลด%2070%25,co_rgb:FF0000,bo_4px_solid_rgb:FFFFFF,e_shadow:50,fl_layer_apply,g_north,y_80/
l_text:Mitr_60_bold:วันนี้เท่านั้น!,co_rgb:FFD700,e_shadow:40,e_overlay,fl_layer_apply,g_center/
l_text:Kanit_70_bold:สั่งเลย!,co_rgb:FFFFFF,e_overlay,fl_layer_apply,g_south,y_-60/
cremo_product.jpg
```

### Case 2: Product Launch with Arc Curve (CC_ID2 Unique!)

**Scenario:** New CREMO freezer model launch

**Text Layers:**
```javascript
text1: "CREMO NEW!"
  - Font: Mitr 80px bold
  - Color: FFFFFF (white)
  - Position: north, y_offset: 100
  - Arc: +30° (curved upward!)
  - Stroke: 000000 (black) 3px
  - Blend: soft_light (subtle glow)

text2: "ตู้ไอติม รุ่นใหม่"
  - Font: Sarabun 70px bold
  - Color: 00BFFF (blue)
  - Position: center
  - Stroke: FFFFFF 2px
  - Shadow: strength 35
  - Scale mode: fit

text3: "เริ่มต้น 25,000 บาท"
  - Font: Mitr 60px normal
  - Color: FFFFFF (white)
  - Position: south_east
  - Background: 000000 85% opacity
  - Blend: normal
```

**Google Sheets Data (Vertical Format):**
```csv
user_id,text_set,setting_type,value,updated_at
789012,1,text_content,CREMO NEW!,2025-11-10T14:00:00Z
789012,1,font_family,Mitr,2025-11-10T14:00:00Z
789012,1,font_size,80,2025-11-10T14:00:00Z
789012,1,arc_angle,30,2025-11-10T14:00:00Z
789012,1,blend_mode,soft_light,2025-11-10T14:00:00Z
...
```

### Case 3: Social Media Story with Multiply Blend

**Scenario:** Instagram story with dark, moody aesthetic

**Text Layers:**
```javascript
text1: "CREMO Premium"
  - Font: Anuphan 90px bold
  - Color: FFD700 (gold)
  - Position: north
  - Blend: multiply (darker, elegant)
  - Shadow: strength 60

text2: "ไอศกรีมคุณภาพ"
  - Font: Mitr 65px normal
  - Color: FFFFFF (white)
  - Position: center
  - Arc: -15° (subtle curve)
  - Blend: screen (lighter glow)
  - Scale: fill (full width coverage)

text3: "สั่งออนไลน์ได้แล้ว"
  - Font: Prompt 55px bold
  - Color: 00FF00 (green)
  - Position: south
  - Stroke: black 2px
  - Blend: overlay (vibrant!)
```

**Why Blend Modes Matter:**
- **multiply** on text1: Creates sophisticated, magazine-quality look
- **screen** on text2: Makes text appear to glow naturally
- **overlay** on text3: CTA pops without being harsh

### Case 4: Multi-Language Event Banner

**Scenario:** Thai-English bilingual promotion

**Text Layers:**
```javascript
text1: "GRAND OPENING / เปิดใหม่"
  - Font: Bai Jamjuree 75px bold (best for mixed Thai-English)
  - Color: FF0000 (red)
  - Position: north, y_offset: 70
  - Arc: +20° (celebratory curve!)
  - Stroke: FFFFFF 4px
  - Shadow: strength 45
  - Blend: hard_light (maximum impact!)

text2: "ลด 50% วันแรก / 50% OFF FIRST DAY"
  - Font: Mitr 60px bold
  - Color: FFD700 (gold)
  - Position: center
  - Background: 000000 75% opacity
  - Scale: fit (auto-resize for long text)

text3: "📍 Central World / เซ็นทรัลเวิลด์"
  - Font: Sarabun 50px normal
  - Color: FFFFFF (white)
  - Position: south, y_offset: -50
  - Blend: normal
```

### Case 5: Seasonal Campaign with Scale Modes

**Scenario:** Summer special with background patterns

**Text Layers:**
```javascript
text1: "☀️ SUMMER SALE"
  - Font: Kanit 95px bold
  - Color: FFA500 (orange)
  - Position: north
  - Scale: scale (stretch to exact width for bold statement)
  - Max width: 1000px
  - Blend: overlay

text2: "ซื้อ 2 แถม 1"
  - Font: Mitr 80px bold
  - Color: FFFFFF (white)
  - Position: center
  - Scale: fill (crop text for tight composition)
  - Arc: +25°
  - Shadow: strength 55

text3: "ถึง 31 สิงหาคม"
  - Font: Prompt 55px normal
  - Color: FF6347 (tomato)
  - Position: south
  - Scale: pad (add padding for breathing room)
  - Background: FFFFFF 80% opacity
```

**Scale Mode Comparison:**
- **fit**: Best for varying text lengths (default, safe choice)
- **scale**: When you want exact width regardless of distortion
- **fill**: For artistic crops and tight designs
- **pad**: When you need consistent spacing

## Best Practices

### Font Selection
1. **Thai Font Mandatory:** Always use Thai-compatible fonts: Mitr, Sarabun, Kanit, Prompt, Anuphan, or Bai Jamjuree
2. **Mitr for Most Cases:** Best all-around choice - modern, clean, excellent readability
3. **Kanit for Headlines:** Bold, eye-catching, perfect for main headlines
4. **Bai Jamjuree for Mixed Text:** Best for Thai-English bilingual content
5. **Sarabun for Professional:** Formal, business-appropriate tone

### Visual Design
6. **Contrast is King:** White text on dark images, dark text on light images
7. **Stroke for Readability:** Always use stroke (2-4px) for text over complex backgrounds
8. **Shadow Depth:** Use shadow strength 30-50 for subtle depth, 60-80 for dramatic effect
9. **Background Boxes:** Use for guaranteed readability, 70-85% opacity works best

### Effects Usage
10. **Arc Curve Sweet Spot:** -30° to +30° for subtle, professional curves
11. **Extreme Arcs:** -60° to +60° for dramatic, artistic designs
12. **Blend Mode Strategy:**
    - Use **multiply** for dark, elegant aesthetics
    - Use **screen** for bright, cheerful vibes
    - Use **overlay** for high-impact CTAs
    - Use **soft_light** for subtle enhancements
    - Use **hard_light** for maximum drama
13. **Scale Mode Selection:**
    - Use **fit** (default) for safety and consistency
    - Use **scale** only when exact width is critical
    - Use **fill** for artistic designs
    - Use **pad** for consistent spacing needs

### Technical Considerations
14. **URL Length:** Keep total URL under 4000 characters to avoid errors
15. **Max Width:** Set realistic max_width (600-1000px) to prevent text overflow
16. **Offset Limits:** Keep x_offset and y_offset within ±500px for most cases
17. **Status Flag:** Use status=inactive to temporarily disable text sets without deleting data

### Performance
18. **Layer Count:** Limit to 3 text layers for optimal load times
19. **Font Preloading:** Consider preloading fonts in your app for faster rendering
20. **Caching:** Cloudinary automatically caches generated URLs - same settings = instant load

## Migration Guide (v1.0 → v2.0)

### Breaking Changes Checklist

**If you are upgrading from horizontal format (v1.0), follow these steps:**

#### Step 1: Export Your Current Data
```sql
-- Export from Google Sheets or database
SELECT * FROM text_overlay_settings WHERE user_id = '123456';
```

#### Step 2: Transform to Vertical Format
**Old Horizontal Format (1 row, 23 columns):**
```csv
user_id,template_id,text1_content,text1_font,text1_size,...
123456,TEMP_001,CREMO ไอศกรีมสด,Mitr,80,...
```

**New Vertical Format (20 rows, 5 columns):**
```csv
user_id,text_set,setting_type,value,updated_at
123456,1,text_content,CREMO ไอศกรีมสด,2025-11-10T10:00:00Z
123456,1,font_family,Mitr,2025-11-10T10:00:00Z
123456,1,font_size,80,2025-11-10T10:00:00Z
...
```

#### Step 3: Add New v2.0 Settings
Add these new rows for each text set:
```csv
123456,1,blend_mode,normal,2025-11-10T10:00:00Z
123456,1,scale_mode,fit,2025-11-10T10:00:00Z
```

#### Step 4: Update Code References
**Old code (v1.0 - DEPRECATED):**
```javascript
const settings = filterSettingsByTemplate(rows, userId, templateId);
// Warning: This function still works but is deprecated
```

**New code (v2.0 - RECOMMENDED):**
```javascript
const { parseTextFromSheets } = require('./code/cloudinary_url_builder.js');
const text1Settings = parseTextFromSheets(rows, userId, 1);
const text2Settings = parseTextFromSheets(rows, userId, 2);
const text3Settings = parseTextFromSheets(rows, userId, 3);
```

#### Step 5: Test Validation
v2.0 includes comprehensive validation. Test your data:
```javascript
const { validateTextSetting } = require('./code/cloudinary_url_builder.js');

const result = validateTextSetting('font_size', 250); // Invalid!
// Returns: { valid: false, error: 'Font size must be between 10-200px' }
```

#### Step 6: Update Google Sheets Schema
1. Create new sheet named "Text_Overlay_v2"
2. Add 5 columns: user_id, text_set, setting_type, value, updated_at
3. Copy template from `CC_ID2_WF2/templates/Text_Overlay_Settings_Vertical_Template.csv`
4. Import your transformed data
5. Update n8n workflow to read from new sheet

### Backwards Compatibility

v2.0 maintains backwards compatibility via deprecated `filterSettingsByTemplate()`:
- **Still works:** Old horizontal format data will still generate URLs
- **Console warnings:** You'll see deprecation warnings in logs
- **Migration recommended:** Plan to migrate within 3 months
- **Future removal:** v3.0 will remove horizontal format support entirely

## Integration

### With Logo Layers (WF3 - CC_ID1)
```javascript
const { buildTextLayer, buildCloudinaryURL } = require('./code/cloudinary_url_builder.js');
const { buildLogoLayer } = require('../../CC_ID1_WF3/code/logo_controller.js');

// Build complete URL with both text and logo layers
const baseUrl = 'https://res.cloudinary.com/your-cloud/image/upload/';
const textLayer1 = buildTextLayer(text1Settings);
const textLayer2 = buildTextLayer(text2Settings);
const logoLayer = buildLogoLayer(logoSettings);

const finalUrl = baseUrl + textLayer1 + '/' + textLayer2 + '/' + logoLayer + '/base_image.jpg';
```

### With Video Timing (WF5 - CC_ID1)
```javascript
// Add start offset (so_) and end offset (eo_) for video timing
const timedTextLayer1 = buildTextLayer(text1Settings) + ',so_2.0,eo_8.0';
const timedTextLayer2 = buildTextLayer(text2Settings) + ',so_5.0,eo_12.0';

// text1 appears from 2s to 8s
// text2 appears from 5s to 12s (3s overlap)
```

### With Auto Storage (WF4 - CC_ID2)
```javascript
const { autoUploadMedia } = require('../../CC_ID2_WF4/code/storage_controller.js');

// Upload base image via WF4, get Cloudinary URL
const baseImageUrl = await autoUploadMedia(telegramFileId);

// Build text overlays via WF2
const finalUrl = buildCloudinaryURL(baseImageUrl, text1Settings, text2Settings, text3Settings);
```

### n8n Workflow Integration
```javascript
// In n8n Function node:
const { parseTextFromSheets, buildTextLayer, validateTextSetting } = require('./cloudinary_url_builder.js');

// Get sheets data from previous node
const sheetsData = $input.all();
const userId = $json.user_id;

// Parse vertical format
const text1 = parseTextFromSheets(sheetsData, userId, 1);
const text2 = parseTextFromSheets(sheetsData, userId, 2);

// Validate before building
const validation = validateTextSetting('font_size', text1.font_size);
if (!validation.valid) {
  throw new Error(validation.error);
}

// Build layers
const layer1 = buildTextLayer(text1);
const layer2 = buildTextLayer(text2);

return {
  cloudinary_url: baseUrl + layer1 + '/' + layer2 + '/image.jpg',
  format_version: '2.0'
};
```

## Validation Reference

### Error Messages and Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Font size must be between 10-200px" | font_size out of range | Use 10-200px |
| "Position must be valid gravity" | Invalid position value | Use north, south, center, etc. |
| "Arc angle must be between -180° and 180°" | arc_angle out of range | Use -180 to 180 |
| "Stroke width must be between 1-10px" | stroke_width out of range | Use 1-10px |
| "Shadow strength must be between 10-100" | shadow_strength out of range | Use 10-100 |
| "Opacity must be between 0-100%" | background_opacity invalid | Use 0-100 |
| "Font family not supported" | Unknown font | Use Mitr, Sarabun, Kanit, Prompt, Anuphan, or Bai Jamjuree |
| "Blend mode not supported" | Invalid blend_mode | Use normal, multiply, screen, overlay, soft_light, or hard_light |
| "Scale mode not supported" | Invalid scale_mode | Use fit, scale, fill, or pad |
| "Hex color must be 6 characters" | Invalid color format | Use FFFFFF not #FFFFFF or fff |

### Validation Best Practices

1. **Validate on Entry:** Check values when user inputs data in Telegram
2. **Validate on Parse:** Double-check when parsing from Google Sheets
3. **Fail Gracefully:** Return clear error messages, don't crash
4. **Log Warnings:** Log validation failures for debugging
5. **Provide Defaults:** If non-critical setting is invalid, use default value

## Troubleshooting

### Common Issues

**Thai text not showing:**
- ✅ Use Thai-compatible font (Mitr, Sarabun, Kanit, Prompt, Anuphan, Bai Jamjuree)
- ✅ Check URL encoding: spaces should be %20, not +
- ✅ Verify font name spelling (case-sensitive!)
- ✅ Test with simple ASCII text first to isolate font issues

**URL too long (>4000 chars):**
- ✅ Shorten text_content (maximum efficiency)
- ✅ Reduce number of active text layers
- ✅ Disable unnecessary effects (stroke, shadow, background)
- ✅ Use shorter font names where possible
- ✅ Consider using text_set status=inactive to disable layers

**Preview not loading:**
- ✅ Verify Cloudinary cloud name in URL
- ✅ Check base image URL is accessible
- ✅ Validate URL format with validateURL() function
- ✅ Check for encoding errors (use browser dev tools)
- ✅ Verify Cloudinary account is active and not over quota

**Blend modes not working:**
- ✅ Ensure you're using v2.0 code (check version in file header)
- ✅ Verify blend_mode value is one of: multiply, screen, overlay, soft_light, hard_light
- ✅ Check that blend mode is set in Google Sheets data
- ✅ Some blend modes may not be visible on all background colors - test with different images

**Arc curve not appearing:**
- ✅ Verify arc_angle is non-zero (-180 to 180, excluding 0)
- ✅ Check that text is long enough to show curve (minimum 3-4 characters)
- ✅ Try more extreme angles (±30°) to see if curve is just subtle
- ✅ Ensure e_distort:arc: syntax is correct in generated URL

**Vertical format parsing errors:**
- ✅ Ensure text_set is integer (1, 2, or 3)
- ✅ Check setting_type values exactly match schema (case-sensitive!)
- ✅ Verify user_id matches between all rows for same user
- ✅ Check for duplicate rows (same user_id + text_set + setting_type)
- ✅ Validate updated_at is in ISO 8601 format

**Migration from v1.0 failing:**
- ✅ Check that you've added blend_mode and scale_mode rows
- ✅ Verify all 20 settings are present for each text_set
- ✅ Update code to use parseTextFromSheets() not filterSettingsByTemplate()
- ✅ Clear any caching in n8n workflow
- ✅ Check console for deprecation warnings

### Debug Mode

Enable debug mode in cloudinary_url_builder.js:
```javascript
// At top of file, set DEBUG = true
const DEBUG = true;

// You'll see console output:
// [DEBUG] Parsing text set 1 for user 123456
// [DEBUG] Found 19 settings
// [DEBUG] Validation: font_size=80 ✓
// [DEBUG] Built layer: l_text:Mitr_80_bold:CREMO...
```

### Getting Help

1. **Check validation errors first:** Run validateTextSetting() on all your data
2. **Test with template data:** Use Text_Overlay_Settings_Vertical_Template.csv
3. **Review use cases:** Compare your setup to the 5 detailed use cases above
4. **Check integration:** Verify WF2 plays well with WF3, WF4, WF5, WF6
5. **Console logs:** Enable DEBUG mode and check n8n execution logs

---

**Documentation Version:** 2.0.0 (Final)
**Code Version:** 2.0.0 (Breaking Changes)
**Last Updated:** November 10, 2025
**Author:** CC_ID2
**Integration:** Works with CC_ID1 WF3, WF5 and CC_ID2 WF4, WF6
