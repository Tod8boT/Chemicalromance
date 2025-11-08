# Text Overlay Processor - Implementation Notes

> n8n Sub-Workflow สำหรับใส่ข้อความบนรูปภาพผ่าน Cloudinary API

**Version:** 1.0.0
**Created:** 2025-11-08
**Status:** Ready for Testing

---

## 📋 สารบัญ

1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage](#usage)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Options](#advanced-options)

---

## Overview

### What It Does

Sub-workflow นี้รับรูปภาพจาก Fal.AI แล้วใส่ข้อความไทย/อังกฤษบนรูปด้วย Cloudinary transformation API

### Architecture

```
Input (from parent workflow)
    ↓
Load Text Config (Google Sheets)
    ↓
Build Cloudinary URL (JavaScript)
    ↓
Apply Text Overlay (HTTP Request)
    ↓
Return Result (with URLs)
```

### Features

- ✅ รองรับ Thai และ English fonts
- ✅ Text effects: stroke, shadow, arc, background
- ✅ Template-based styling (Google Sheets)
- ✅ Preview URL สำหรับ Telegram
- ✅ Error handling และ debugging info

---

## Installation

### 1. Import Workflow

**Via n8n UI:**
```bash
# 1. เปิด n8n
# 2. Workflows → Import from File
# 3. เลือก text_overlay_processor.json
# 4. คลิก Import
```

**Via n8n MCP (recommended):**
```bash
# ใช้ n8n MCP tool สำหรับ import
npx n8n-mcp import-workflow text_overlay_processor.json
```

### 2. Configure Credentials

**Google Sheets:**
1. ไปที่ node **Load_Text_Config**
2. คลิก **Credential to connect with**
3. เลือก Google Sheets OAuth2 credential
4. หรือสร้างใหม่:
   - Name: "Google Sheets Account"
   - Type: OAuth2
   - Authorize with Google

### 3. Set Environment Variables

```bash
# ใน n8n environment หรือ .env file
CLOUDINARY_CLOUD_NAME=dz3cmaxnc
GOOGLE_SHEETS_TEXT_CONFIG_ID=1EtZMb8HEdB-_fl7NJa1fv2y26S3zJZbpxgNUoQr5yrE
```

---

## Configuration

### Google Sheets: text_overlay_config

**Sheet Name:** `text_overlay_config`

**Required Columns (A:R):**

| Column | Field | Type | Example | Description |
|--------|-------|------|---------|-------------|
| A | template_id | string | "flash_sale" | Unique template identifier |
| B | position | string | "north" | Text position (north/south/center/east/west) |
| C | font_size | number | 90 | Font size in pixels |
| D | font_family | string | "Mitr" | Font name (Mitr, Sarabun) |
| E | color | string | "#FF0000" | Text color (hex) |
| F | stroke_enabled | boolean | TRUE | Enable text stroke |
| G | stroke_color | string | "#FFD700" | Stroke color (hex) |
| H | stroke_width | number | 8 | Stroke width in pixels |
| I | shadow_enabled | boolean | TRUE | Enable text shadow |
| J | shadow_strength | number | 70 | Shadow strength (0-100) |
| K | arc | number | -15 | Text curve angle (-360 to 360) |
| L | bg_enabled | boolean | TRUE | Enable background |
| M | bg_color | string | "#000000" | Background color (hex) |
| N | bg_opacity | number | 85 | Background opacity (0-100) |
| O | x_offset | number | 0 | Horizontal offset in pixels |
| P | y_offset | number | 30 | Vertical offset in pixels |
| Q | max_width | number | 950 | Maximum text width in pixels |

**Sample Row:**
```csv
flash_sale,north,90,Mitr,#FF0000,TRUE,#FFD700,8,TRUE,70,-15,TRUE,#FFD700,85,0,30,950
```

---

## Usage

### Call from Parent Workflow

**Using Execute Workflow node:**

```json
{
  "workflowId": {
    "__rl": true,
    "value": "text_overlay_processor",
    "mode": "name"
  },
  "workflowInputs": {
    "mappingMode": "defineBelow",
    "value": {
      "image_url": "={{ $json.images[0].url }}",
      "text_content": "ลด 70% วันนี้!",
      "template_id": "flash_sale",
      "sheet_id": "1EtZMb8HEdB-_fl7NJa1fv2y26S3zJZbpxgNUoQr5yrE",
      "cloud_name": "dz3cmaxnc"
    }
  }
}
```

### Input Parameters

```javascript
{
  image_url: "https://fal.ai/files/output.jpg",  // Required: Fal.AI image URL
  text_content: "โปรโมชั่นพิเศษ!",              // Required: Text to overlay
  template_id: "flash_sale",                    // Required: Template ID from sheets
  sheet_id: "1A2B3C4D...",                      // Required: Google Sheets ID
  cloud_name: "dz3cmaxnc"                       // Optional: Cloudinary cloud name
}
```

### Output Format

**Success:**
```javascript
{
  status: "completed",
  final_image_url: "https://res.cloudinary.com/dz3cmaxnc/image/upload/...",
  preview_url: "https://res.cloudinary.com/dz3cmaxnc/image/upload/w_400...",
  text_applied: "โปรโมชั่นพิเศษ!",
  template_used: "flash_sale",
  transformation_details: {
    base: "w_1080,h_1080,c_fill",
    text_layer: "l_text:Mitr_90_bold:...",
    image_source: "https://fal.ai/..."
  },
  original_image_url: "https://fal.ai/files/output.jpg"
}
```

**Error:**
```javascript
{
  success: false,
  error: "Config not found for template: invalid_id",
  stack: "Error: Config not found...",
  input_received: {
    image_url: "...",
    text_content: "...",
    template_id: "invalid_id",
    configs_count: 16,
    available_templates: ["flash_sale", "success_story", ...]
  }
}
```

---

## Testing

### 1. Test with Sample Data

**Use Test Data:**
```bash
# ดู test cases ใน test_data.json
cat test_data.json
```

**Manual Test in n8n:**
1. เปิด workflow **text_overlay_processor**
2. คลิก **Execute Workflow**
3. ใส่ test data:
```json
{
  "image_url": "https://fal.ai/files/test.jpg",
  "text_content": "ลด 70% วันนี้!",
  "template_id": "flash_sale",
  "sheet_id": "1EtZMb8HEdB-_fl7NJa1fv2y26S3zJZbpxgNUoQr5yrE",
  "cloud_name": "dz3cmaxnc"
}
```
4. ดูผลลัพธ์ใน Execution log

### 2. Test Cloudinary URL

**Test URL in Browser:**
```bash
# Copy cloudinary_url from output
# Paste in browser → should show image with text overlay
```

**Test with curl:**
```bash
curl -I 'https://res.cloudinary.com/dz3cmaxnc/image/upload/w_1080,h_1080,c_fill/l_text:Mitr_90_bold:%E0%B8%A5%E0%B8%94%2070%25,co_rgb:FF0000/f_auto/https%3A%2F%2Ffal.ai%2Ffiles%2Ftest.jpg'

# Should return: HTTP/2 200
```

### 3. Test Thai Text Encoding

**Expected:**
```javascript
// Input: "ลด 70%"
// Encoded: "%E0%B8%A5%E0%B8%94%2070%25"
// URL: l_text:Mitr_90_bold:%E0%B8%A5%E0%B8%94%2070%25
```

**Test:**
```bash
node -e "console.log(encodeURIComponent('ลด 70%'))"
# Output: %E0%B8%A5%E0%B8%94%2070%25
```

---

## Troubleshooting

### Issue 1: Thai Text Not Showing

**Symptoms:**
- ข้อความไทยไม่แสดง
- แสดงเป็น boxes หรือ ???

**Solutions:**
1. ✅ Check font supports Thai:
   - Use: `Mitr`, `Sarabun`, `Kanit`
   - Don't use: `Arial`, `Helvetica`

2. ✅ Check encoding:
```javascript
// In Build_Cloudinary_URL node
console.log(encodeURIComponent("ข้อความไทย"));
// Should output: %E0%B8%82%E0%B9%89%...
```

3. ✅ Test Cloudinary URL:
```bash
# Valid Thai text URL
https://res.cloudinary.com/demo/image/upload/l_text:Mitr_80:%E0%B8%97%E0%B8%94%E0%B8%AA%E0%B8%AD%E0%B8%9A/sample.jpg
```

### Issue 2: Config Not Found

**Symptoms:**
```
Error: Config not found for template: flash_sale
```

**Solutions:**
1. ✅ Check Google Sheets:
   - Sheet name = "text_overlay_config"
   - Column A has template_id
   - Row exists with matching template_id

2. ✅ Check credential:
   - Google Sheets OAuth2 authorized
   - Has read permission

3. ✅ Debug in Code node:
```javascript
// Add before findConfig()
console.log("Available templates:", allConfigs.map(c => c.json.template_id));
```

### Issue 3: Cloudinary URL Not Working

**Symptoms:**
- URL returns 404 or 400
- Image doesn't load

**Solutions:**
1. ✅ Check cloud_name:
```javascript
// Should be: dz3cmaxnc
// NOT: demo, your-cloud-name, etc.
```

2. ✅ Check image URL encoding:
```javascript
// Image URL must be URL-encoded
encodeURIComponent("https://fal.ai/files/test.jpg")
// → https%3A%2F%2Ffal.ai%2Ffiles%2Ftest.jpg
```

3. ✅ Test transformation syntax:
```bash
# Test each part separately
# 1. Base image
https://res.cloudinary.com/dz3cmaxnc/image/upload/sample.jpg

# 2. With resize
https://res.cloudinary.com/dz3cmaxnc/image/upload/w_1080,h_1080,c_fill/sample.jpg

# 3. With text
https://res.cloudinary.com/dz3cmaxnc/image/upload/l_text:Arial_80:Hello/sample.jpg
```

### Issue 4: Workflow Execution Failed

**Check Execution Logs:**
```bash
# In n8n UI
1. Go to Executions tab
2. Click failed execution
3. Check each node output
4. Look for error message
```

**Common Errors:**
- `$json is not defined` → Check previous node output
- `Cannot read property 'json'` → Check $input.first() exists
- `Network error` → Check Cloudinary/Google Sheets connectivity

---

## Advanced Options

### 1. Multiple Text Layers

**Modify Build_Cloudinary_URL to support multiple texts:**

```javascript
function buildMultipleTextLayers(texts, configs) {
  const layers = texts.map((text, i) => {
    const config = configs[i];
    return buildTextLayer(text, config);
  });
  return layers.join('/');
}

// Usage
const texts = ["Line 1", "Line 2"];
const configs = [config1, config2];
const multiLayer = buildMultipleTextLayers(texts, configs);
```

### 2. Custom Fonts

**Upload custom fonts to Cloudinary:**
```bash
# 1. Upload font file
curl -X POST https://api.cloudinary.com/v1_1/dz3cmaxnc/raw/upload \
  -F file=@MyFont.ttf \
  -F upload_preset=fonts

# 2. Use in transformation
l_text:MyFont_80:Hello
```

### 3. Dynamic Template Selection

**Auto-select template based on text length:**

```javascript
function selectTemplate(textLength) {
  if (textLength < 20) return "short_text";
  if (textLength < 50) return "medium_text";
  return "long_text";
}

const templateId = selectTemplate(textContent.length);
```

### 4. A/B Testing

**Generate multiple variations:**

```javascript
const variations = [
  { position: "north", color: "#FF0000" },
  { position: "south", color: "#00FF00" },
  { position: "center", color: "#0000FF" }
];

const urls = variations.map(variant => {
  const config = { ...baseConfig, ...variant };
  return buildCloudinaryURL(cloudName, imageUrl, buildTextLayer(text, config));
});

return urls; // Return all variations
```

---

## Performance Tips

### 1. Cache URLs
```javascript
// Store generated URLs to avoid regeneration
const cache = new Map();
const cacheKey = `${templateId}_${textContent}_${imageUrl}`;

if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}

const url = buildCloudinaryURL(...);
cache.set(cacheKey, url);
return url;
```

### 2. Optimize Image Loading

**Use f_auto for format:**
```javascript
// Cloudinary auto-selects best format (WebP, AVIF, etc.)
`${baseUrl}/f_auto,q_auto/${transformations}/...`
```

**Use lazy loading:**
```javascript
// For preview URLs
`${baseUrl}/w_400,f_auto,q_auto:low/${transformations}/...`
```

---

## API Reference

### Cloudinary Transformation Parameters

**Text Layer:**
- `l_text:Font_Size_Weight:Text` - Text layer
- `co_rgb:RRGGBB` - Text color
- `bo_Npx_solid_rgb:RRGGBB` - Border/stroke
- `e_shadow:N` - Shadow effect
- `a_N` - Arc/curve angle
- `b_rgb:RRGGBB,o_N` - Background with opacity
- `fl_layer_apply,g_position` - Apply layer at position
- `x_N,y_N` - Offset coordinates
- `w_N` - Max width

**Positions:**
- `north`, `south`, `east`, `west`
- `center`
- `north_east`, `north_west`, `south_east`, `south_west`

**Full Documentation:**
- [Cloudinary Text Overlays](https://cloudinary.com/documentation/layers#text_layer_options)
- [Transformation Reference](https://cloudinary.com/documentation/transformation_reference)

---

## Resources

### Documentation
- [Cloudinary Text Overlay Guide](https://cloudinary.com/blog/image-text-overlay-generator-react)
- [n8n Code Node Docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/)
- [Google Sheets Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/)

### Tools
- [Cloudinary Demo](https://demo.cloudinary.com/cloudydesk/text-overlay/)
- [URL Encoder](https://www.urlencoder.org/)
- [Thai Font Checker](https://fonts.google.com/?subset=thai)

### Support
- GitHub Issues: [Tod8boT/Chemicalromance](https://github.com/Tod8boT/Chemicalromance/issues)
- n8n Community: [community.n8n.io](https://community.n8n.io)

---

## Changelog

### v1.0.0 (2025-11-08)
- 🎉 Initial release
- ✅ 5-node workflow structure
- ✅ Thai text support (Mitr, Sarabun fonts)
- ✅ Text effects: stroke, shadow, arc, background
- ✅ Template-based configuration
- ✅ Error handling and debugging
- ✅ Test data and documentation

---

**Created by:** Claude Code
**License:** MIT
**Status:** Production Ready
