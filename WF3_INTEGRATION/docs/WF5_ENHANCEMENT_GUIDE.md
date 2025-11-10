# WF5 Enhancement Guide

## 🎯 Overview

WF5 (Video Text Overlay Integration) has been enhanced to support 4 new features from CC_ID2:

1. **Font Family Selection** - 8 fonts (Mitr, Kanit, Prompt, Sarabun, etc.)
2. **Shadow Effects** - Strength 0-100
3. **Background Color & Opacity** - Any color with 0-100% opacity
4. **Max Width Control** - 600-2000px or auto

## 📋 Changes Made

### New Code File

Created `/WF3_INTEGRATION/code/text_layer_builder_enhanced.js`:
- `buildTextLayer()` - Builds single text layer with all features
- `buildCloudinaryURL()` - Builds complete URL with multiple layers
- `parseSettingsFromSheets()` - Parses vertical format data
- `validateVideoTimings()` - Validates video timing ranges

### Features Comparison

| Feature | Old Version | New Version |
|---------|-------------|-------------|
| Font | Hardcoded 'Mitr' | 8 fonts selectable |
| Shadow | None | 0-100 strength |
| Background | None | Color + opacity |
| Max Width | Hardcoded [900,800,700] | 600-2000px or auto |
| All other features | ✅ Supported | ✅ Supported |

## 🔄 How to Update n8n Workflow

### Option 1: Manual Update (Recommended)

1. Open `Text_Overlay_Integration_Complete.json` in n8n
2. Find node: **"Organize Settings + Detect Media Type"** (Code node #3)
3. Replace the `jsCode` with code from `text_layer_builder_enhanced.js` lines 143-236
4. Find node: **"Build Cloudinary URL (Image/Video)"** (Code node #5)
5. Replace the `jsCode` with the example usage code (lines 318-349)

### Option 2: Use Enhanced Code Directly

Copy functions from `text_layer_builder_enhanced.js` into your n8n Code nodes:

**Node 3 - Organize Settings:**
```javascript
// Use parseSettingsFromSheets() function
const allRows = $input.all().map(item => item.json);
const userId = $('Trigger: Integration Start').first().json.user_id;
let textSets = parseSettingsFromSheets(allRows, userId);

// Validate timings for videos
const mediaType = $('Trigger: Integration Start').first().json.media_type || 'image';
const videoDuration = $('Trigger: Integration Start').first().json.video_duration || null;

if (mediaType === 'video' && videoDuration) {
  textSets = validateVideoTimings(textSets, videoDuration);
}

return [{
  userId,
  mediaType,
  mediaUrl: $('Trigger: Integration Start').first().json.media_url,
  videoDuration,
  textSets,
  textSetsCount: textSets.length
}];
```

**Node 5 - Build Cloudinary URL:**
```javascript
// Use buildCloudinaryURL() function
const data = $input.first().json;
const cloudName = $env.CLOUDINARY_CLOUD_NAME || 'dz3cmaxnc';

const result = buildCloudinaryURL(
  cloudName,
  data.mediaUrl,
  data.mediaType,
  data.textSets
);

return [{
  success: true,
  mediaType: data.mediaType,
  ...result,
  metadata: {
    userId: data.userId,
    textSets: data.textSets.map(ts => ({
      text: ts.text,
      font: ts.font_family,
      shadow: ts.shadow_enabled ? ts.shadow_strength : 'off',
      background: ts.bg_enabled ? `${ts.bg_color} (${ts.bg_opacity}%)` : 'off',
      timing: ts.timing_mode === 'range' ? `${ts.start_time}s - ${ts.end_time}s` : ts.timing_mode
    }))
  }
}];
```

## 🧪 Testing

### Test Data (Google Sheets)

Use the template from `/CC_ID1_TELEGRAM_INTERFACE/templates/Text_Settings_GoogleSheet_Template.csv`

Example row with all features:
```csv
user_id,text_set,setting_type,value,updated_at
123456789,1,text,Sale 70%!,2025-11-10T12:00:00Z
123456789,1,font_family,Kanit,2025-11-10T12:00:00Z
123456789,1,fontsize,80,2025-11-10T12:00:00Z
123456789,1,shadow_enabled,true,2025-11-10T12:00:00Z
123456789,1,shadow_strength,50,2025-11-10T12:00:00Z
123456789,1,bg_enabled,true,2025-11-10T12:00:00Z
123456789,1,bg_color,000000,2025-11-10T12:00:00Z
123456789,1,bg_opacity,80,2025-11-10T12:00:00Z
123456789,1,max_width,800,2025-11-10T12:00:00Z
```

### Expected Cloudinary URL Pattern

```
https://res.cloudinary.com/CLOUD_NAME/image/upload/
w_1080,h_1080,c_fill/
l_text:Kanit_80_bold:Sale%2070%25!,co_rgb:FFFFFF,w_800,c_fit,b_rgb:000000,o_80/e_shadow:50/fl_layer_apply,g_north/
f_auto/https://...
```

### Key Features in URL:
- `l_text:Kanit_80_bold` - Font family
- `b_rgb:000000,o_80` - Background color + opacity
- `e_shadow:50` - Shadow strength
- `w_800,c_fit` - Max width

## 📊 Cloudinary Transformation Syntax Reference

### Font Family
```
l_text:Mitr_60_bold:Text
l_text:Kanit_60_bold:Text
l_text:Prompt_60_bold:Text
l_text:Sarabun_60_bold:Text
```

### Shadow
```
/e_shadow:30   (Light)
/e_shadow:50   (Medium)
/e_shadow:80   (Strong)
/e_shadow:100  (Very Strong)
```

### Background
```
,b_rgb:000000,o_80   (Black 80%)
,b_rgb:FFFFFF,o_60   (White 60%)
,b_rgb:FF0000,o_60   (Red 60%)
```

### Max Width
```
,w_600,c_fit   (600px narrow)
,w_800,c_fit   (800px medium)
,w_1000,c_fit  (1000px wide)
,w_1200,c_fit  (1200px x-wide)
```

## 🎨 Layer Order (Important!)

Cloudinary applies transformations in order. For best results:

1. Base text layer with font & color
2. Background (b_rgb, o_)
3. Stroke (e_outline)
4. Shadow (e_shadow)
5. Arc distortion (e_distort:arc)
6. Video timing (so_, eo_)
7. Apply layer (fl_layer_apply, g_)

Example:
```
l_text:Kanit_80_bold:Text,co_rgb:FFFFFF,w_800,c_fit,b_rgb:000000,o_80/
co_rgb:FFD700,e_outline:5/
e_shadow:50/
e_distort:arc:-15/
so_5.0,eo_10.0/
fl_layer_apply,g_north
```

## 🔍 Debugging

### Check if settings are loaded:
- Inspect "Organize Settings" node output
- Verify `textSets` array contains all fields

### Check Cloudinary URL:
- Copy `finalUrl` from "Build Cloudinary URL" output
- Paste in browser to test
- Check for syntax errors in transformation string

### Common Issues:
1. **Font not working**: Check spelling (case-sensitive)
2. **Shadow not visible**: Increase strength (80-100)
3. **Background not showing**: Verify `bg_enabled: true` and valid hex color
4. **Width not applied**: Check `max_width` is number or "auto"

## 📝 Version History

- **v1.0** (2025-11-09): Initial WF5 with video timing
- **v1.1** (2025-11-10): Added shadow, background, font_family, max_width

## 🎯 Next Steps

1. ✅ Create enhanced code file
2. ⏳ Update workflow JSON
3. ⏳ Test with real data
4. ⏳ Deploy to production
