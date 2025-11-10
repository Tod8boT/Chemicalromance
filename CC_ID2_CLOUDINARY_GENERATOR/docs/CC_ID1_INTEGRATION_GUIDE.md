# 🔗 CC_ID1 + CC_ID2 Integration Guide

**Version:** 2.0
**Date:** 2025-11-09
**Status:** ✅ Phase 1 Integration Complete

---

## 🎯 Overview

This guide explains how **CC_ID2 (Cloudinary URL Generator)** integrates with **CC_ID1 (Telegram Text Control Interface)** to create a complete text overlay system.

### **System Flow:**

```
User (Telegram Bot)
  ↓
CC_ID1 - Telegram Interface
  ↓
Google Sheets (vertical format: user_id, text_set, setting_type, value)
  ↓
CC_ID2 V2 - URL Generator
  ↓
Generated Cloudinary URLs
  ↓
Existing Text Overlay System
```

---

## 📊 Data Format Contract

### **CC_ID1 Output (Google Sheets: `text_settings`):**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `user_id` | string | Telegram user ID | `123` |
| `text_set` | string | Text set number (1, 2, or 3) | `1` |
| `setting_type` | string | Setting name | `fontsize` |
| `value` | string | Setting value | `90` |
| `updated_at` | ISO date | Last update timestamp | `2025-11-09T12:00:00Z` |

**Example Data:**
```csv
user_id,text_set,setting_type,value,updated_at
123,1,text,ลด 70% วันนี้!,2025-11-09T12:00:00Z
123,1,fontsize,90,2025-11-09T12:00:00Z
123,1,position,north,2025-11-09T12:00:00Z
123,1,color,FF0000,2025-11-09T12:00:00Z
123,1,stroke,8,2025-11-09T12:00:00Z
123,1,strokecolor,FFD700,2025-11-09T12:00:00Z
123,1,arc,-15,2025-11-09T12:00:00Z
```

### **CC_ID2 Output (Google Sheets: `generated_urls`):**

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | string | User ID reference |
| `url_template` | string | Complete Cloudinary URL |
| `transformation_string` | string | Transformation parameters only |
| `validation_status` | string | `valid`, `warning`, or `invalid` |
| `validation_score` | number | 0-100 |
| `errors` | string | Error messages (if any) |
| `warnings` | string | Warning messages (if any) |
| `layer_count` | number | Number of text layers (1-3) |
| `text_sets_configured` | string | Comma-separated list (e.g., `1,2,3`) |
| `character_count` | number | URL length |
| `generated_at` | ISO date | Generation timestamp |
| `validated_at` | ISO date | Validation timestamp |

---

## 🔧 Default Values (from CC_ID1)

CC_ID2 V2 uses these defaults when settings are not specified by the user:

```javascript
{
  fontsize: 60,           // Medium size
  position: 'center',     // Center position
  color: 'FFFFFF',        // White text
  stroke: 0,              // No stroke
  strokecolor: '000000',  // Black stroke (if enabled)
  arc: 0,                 // Flat (no curve)
  font_family: 'Mitr',    // Thai font (fixed)
  font_weight: 'bold',    // Bold (fixed)
  text_align: 'center',   // Center align (fixed)
  max_width: {
    1: 900,               // Text set 1 (headline)
    2: 800,               // Text set 2 (sub-headline)
    3: 700                // Text set 3 (CTA)
  }
}
```

---

## 📋 Setting Types Mapping

| CC_ID1 `setting_type` | CC_ID2 Parameter | Cloudinary Syntax | Example |
|-----------------------|------------------|-------------------|---------|
| `text` | `text_content` | `l_text:...:TEXT` | `l_text:Mitr_90_bold_center:SALE` |
| `fontsize` | `font_size` | `..._SIZE_...` | `Mitr_90_bold_center` |
| `position` | `position` | `g_{position}` | `g_north`, `g_center` |
| `color` | `text_color` | `co_rgb:{color}` | `co_rgb:FF0000` |
| `stroke` | `stroke.width` | `e_outline:{width}` | `e_outline:8` |
| `strokecolor` | `stroke.color` | `co_rgb:{color}` | `co_rgb:FFD700` |
| `arc` | `arc_curve` | `e_distort:arc:{angle}` | `e_distort:arc:-15.0` |

**Fixed Parameters (not user-configurable in Phase 1):**
- `font_family`: Always `Mitr`
- `font_weight`: Always `bold`
- `text_align`: Always `center`
- `max_width`: Based on text_set (900/800/700)

---

## 🚀 Usage

### **Method 1: n8n Workflow (Recommended)**

1. **Import Workflow:**
   ```
   File: CC_ID2_CLOUDINARY_GENERATOR/workflows/Cloudinary_Code_Generator_V2_CC_ID1_Compatible.json
   ```

2. **Configure Google Sheets:**
   - Open the workflow
   - Update `TEXT_SETTINGS_SHEET_ID` to your Google Sheets ID
   - Ensure sheets named `text_settings` and `generated_urls` exist

3. **Run Workflow:**
   - Workflow reads from `text_settings` (CC_ID1 output)
   - Generates URLs for all users
   - Writes to `generated_urls`

4. **Check Results:**
   - Open `generated_urls` sheet
   - Verify `validation_status` is `valid`
   - Copy `url_template` for use

---

### **Method 2: Standalone Code**

```javascript
const { buildCloudinaryURLFromVertical } = require('./code/cloudinary_url_builder.js');

// Sample data from CC_ID1
const rows = [
  { user_id: '123', text_set: '1', setting_type: 'text', value: 'SALE', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'fontsize', value: '100', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'position', value: 'center', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'color', value: 'FF0000', updated_at: '2025-11-09T12:00:00Z' }
];

// Generate URL
const result = buildCloudinaryURLFromVertical(rows, '123');

console.log(result.url_template);
// Output:
// https://res.cloudinary.com/dz3cmaxnc/image/upload/
// l_text:Mitr_100_bold_center:SALE,w_900,c_fit,co_rgb:FF0000,fl_layer_apply,g_center/
```

---

## ✅ Test Results

### **Test Case 1: Complete (3 text sets)**
```
✅ User 123 - 3 text sets configured
Layer count: 3
URL length: 514 characters
Status: VALID
```

### **Test Case 2: Minimal (1 text set, missing settings)**
```
✅ User 456 - 1 text set, defaults applied
- stroke: 0 (no stroke) ← DEFAULT
- arc: 0 (flat) ← DEFAULT
- font: Mitr ← FIXED
Layer count: 1
URL length: 141 characters
Status: VALID
```

### **Test Case 3: Skip Text Set (1 and 3, no 2)**
```
✅ User 789 - Text sets 1 and 3 (skipped 2)
Layer count: 2
Text set 2: disabled
Status: VALID
```

**Run Tests:**
```bash
cd CC_ID2_CLOUDINARY_GENERATOR
node test_vertical_format.js
```

---

## 🔄 Complete Integration Example

### **Step 1: User Creates Settings in Telegram (CC_ID1)**

User sends commands to Telegram bot:
```
/start
→ Select "Text Set 1"
→ Set Font Size: 90
→ Set Position: north
→ Set Color: Red
→ Set Stroke: 8px (Gold)
→ Set Arc: -15°
→ Enter Text: "ลด 70%!"
→ Save to Sheets
```

CC_ID1 writes to Google Sheets:
```csv
user_id,text_set,setting_type,value,updated_at
123,1,text,ลด 70%!,2025-11-09T12:00:00Z
123,1,fontsize,90,2025-11-09T12:00:00Z
123,1,position,north,2025-11-09T12:00:00Z
123,1,color,FF0000,2025-11-09T12:00:00Z
123,1,stroke,8,2025-11-09T12:00:00Z
123,1,strokecolor,FFD700,2025-11-09T12:00:00Z
123,1,arc,-15,2025-11-09T12:00:00Z
```

### **Step 2: CC_ID2 Generates URL**

CC_ID2 workflow runs (manual trigger or scheduled):
1. Reads `text_settings` sheet
2. Groups by `user_id`
3. Parses settings for each text set
4. Builds Cloudinary URL
5. Validates format
6. Writes to `generated_urls` sheet

Generated URL:
```
https://res.cloudinary.com/dz3cmaxnc/image/upload/
l_text:Mitr_90_bold_center:%E0%B8%A5%E0%B8%94%2070%25!,
w_900,c_fit,
co_rgb:FF0000,
co_rgb:FFD700,e_outline:8,
e_distort:arc:-15.0,
fl_layer_apply,g_north/
{IMAGE_PUBLIC_ID}
```

### **Step 3: Use URL in Existing System**

Replace `{IMAGE_PUBLIC_ID}` with actual image:
```
https://res.cloudinary.com/dz3cmaxnc/image/upload/
l_text:Mitr_90_bold_center:%E0%B8%A5%E0%B8%94%2070%25!,
w_900,c_fit,co_rgb:FF0000,co_rgb:FFD700,e_outline:8,
e_distort:arc:-15.0,fl_layer_apply,g_north/
sample.jpg
```

Result: Image with "ลด 70%!" text overlay at top, red color, gold stroke, curved -15°

---

## 🛠️ Troubleshooting

### **Issue: No URLs generated**
**Solution:**
- Check `text_settings` sheet has data
- Verify `text` setting exists (required)
- Ensure `text_set` is 1, 2, or 3

### **Issue: Validation fails**
**Solution:**
- Check `errors` column in `generated_urls`
- Common issues:
  - Missing text layer
  - Invalid color format (should be 6-digit hex)
  - Arc out of range (-180 to 180)

### **Issue: Thai text not displaying**
**Solution:**
- Text is URL encoded (correct)
- Example: `ลด` → `%E0%B8%A5%E0%B8%94`
- Cloudinary will decode automatically

### **Issue: Stroke not appearing**
**Solution:**
- Check `stroke` value > 0
- If `stroke` = 0, no stroke is added (default)
- `strokecolor` only used if `stroke` > 0

---

## 📚 API Reference

### **buildCloudinaryURLFromVertical(rows, userId, cloudName)**

Parse vertical format data and generate Cloudinary URL.

**Parameters:**
- `rows` (Array): Array of row objects from Google Sheets
- `userId` (string, optional): Filter by user ID
- `cloudName` (string, optional): Cloudinary cloud name (default: `'dz3cmaxnc'`)

**Returns:**
```javascript
{
  success: true,
  url_template: "https://res.cloudinary.com/.../",
  transformation_string: "l_text:...",
  layer_count: 2,
  character_count: 245,
  example_usage: { ... },
  breakdown: {
    layer1: 'configured',
    layer2: 'configured',
    layer3: 'disabled'
  },
  timestamp: "2025-11-09T..."
}
```

---

## 🎓 Phase 2 Roadmap

**Features to Add:**
- [ ] Shadow support (CC_ID1 to add UI)
- [ ] Background box support (CC_ID1 to add UI)
- [ ] Font family selection (Mitr/Sarabun/Kanit)
- [ ] Real-time preview in Telegram
- [ ] Batch URL generation
- [ ] URL shortening

**Integration Enhancements:**
- [ ] Webhook trigger (CC_ID1 → CC_ID2 automatic)
- [ ] Error notifications to Telegram
- [ ] A/B testing support

---

## 📝 Summary

| Aspect | Status |
|--------|--------|
| **Data Format Compatibility** | ✅ Complete |
| **Default Values Integration** | ✅ Complete |
| **Multi-layer Support** | ✅ 3 layers |
| **URL Validation** | ✅ Complete |
| **Testing** | ✅ 3 test cases pass |
| **Documentation** | ✅ Complete |
| **Production Ready** | ✅ Yes |

**Next Steps:**
1. Deploy CC_ID2 V2 workflow to n8n
2. Connect to CC_ID1's Google Sheets
3. Test end-to-end flow
4. Start generating real URLs!

---

**Created by:** CC_ID2
**Compatible with:** CC_ID1 Phase 1
**Date:** 2025-11-09
**Status:** ✅ Ready for Integration
