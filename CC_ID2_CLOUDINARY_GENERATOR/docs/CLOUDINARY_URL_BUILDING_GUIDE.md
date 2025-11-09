# 🎯 CC_ID2: CLOUDINARY URL BUILDING GUIDE

**Role:** CC_ID2 - Cloudinary Code Generator
**Mission:** อ่าน Google Sheets → สร้าง Cloudinary transformation URLs
**Phase:** Phase 1 - Foundation Learning

---

## 📋 Overview

CC_ID2 focuses on **technical URL building** and **parameter mapping** from Google Sheets data to Cloudinary transformation syntax.

**What CC_ID2 Does:**
- ✅ Read text settings from Google Sheets
- ✅ Map settings to Cloudinary parameters
- ✅ Build complete transformation URLs
- ✅ Validate URL format
- ✅ Support 3 text layers

**What CC_ID2 Does NOT Do:**
- ❌ Image processing
- ❌ Text rendering
- ❌ Telegram integration
- ❌ Image generation

---

## 🏗️ Architecture

```
Google Sheets (Text Settings)
    ↓
Parameter Mapper (Settings → Cloudinary params)
    ↓
URL Builder (Build transformation string)
    ↓
URL Validator (Check format)
    ↓
Google Sheets (Generated URLs)
```

---

## 📊 Google Sheet Structure

### **Sheet 1: text_settings** (Input)

**Columns:**

**Text Layer 1 (Required):**
- `id` - Row identifier
- `text1_content` - Text content
- `text1_font` - Font family (Mitr, Sarabun, Arial)
- `text1_size` - Font size (30-150)
- `text1_weight` - Font weight (normal, bold)
- `text1_align` - Text align (center, left, right)
- `text1_color` - Text color (#RRGGBB)
- `text1_position` - Position (north, south, center, etc.)
- `text1_x` - X offset (-500 to 500)
- `text1_y` - Y offset (-500 to 500)
- `text1_max_width` - Max width (100-1000)
- `text1_stroke` - Stroke enabled (true/false)
- `text1_stroke_color` - Stroke color (#RRGGBB)
- `text1_stroke_width` - Stroke width (1-20)
- `text1_shadow` - Shadow enabled (true/false)
- `text1_shadow_strength` - Shadow strength (10-100)
- `text1_arc` - Arc curve (-180 to 180)
- `text1_bg` - Background enabled (true/false)
- `text1_bg_color` - Background color (#RRGGBB)
- `text1_bg_opacity` - Background opacity (0-100)

**Text Layer 2 (Optional):**
- `text2_enabled` - Enable layer 2 (true/false)
- `text2_content` - Text content
- `text2_font` - Font family
- `text2_size` - Font size
- ... (same pattern as layer 1)

**Text Layer 3 (Optional):**
- `text3_enabled` - Enable layer 3 (true/false)
- `text3_content` - Text content
- ... (same pattern as layer 1)

### **Sheet 2: generated_urls** (Output)

**Columns:**
- `row_id` - Reference to text_settings id
- `url_template` - Complete Cloudinary URL template
- `transformation_string` - Transformation part only
- `validation_status` - Status (valid, invalid, warning)
- `validation_score` - Score (0-100)
- `errors` - Error messages
- `warnings` - Warning messages
- `layer_count` - Number of text layers (1-3)
- `generated_at` - Timestamp

---

## 🔧 Parameter Mapping

### **1. Text Layer Syntax**

**Input:**
```
text1_content = "CREMO ICE CREAM"
text1_font = "Mitr"
text1_size = 90
text1_weight = "bold"
text1_align = "center"
```

**Output:**
```
l_text:Mitr_90_bold_center:CREMO%20ICE%20CREAM
```

**Format:** `l_text:{font}_{size}_{weight}_{align}:{encoded_text}`

---

### **2. Color Mapping**

**Input:**
```
text1_color = "#FFD700"
```

**Output:**
```
co_rgb:FFD700
```

**Format:** `co_rgb:{RRGGBB}` (remove # sign)

---

### **3. Stroke Mapping**

**Input:**
```
text1_stroke = true
text1_stroke_color = "#000000"
text1_stroke_width = 5
```

**Output:**
```
co_rgb:000000,e_outline:5
```

**Format:** `co_rgb:{color},e_outline:{width}`

---

### **4. Shadow Mapping**

**Input:**
```
text1_shadow = true
text1_shadow_strength = 50
```

**Output:**
```
e_shadow:50
```

**Format:** `e_shadow:{strength}`

---

### **5. Arc Curve Mapping**

**Input:**
```
text1_arc = 60
```

**Output:**
```
e_distort:arc:60.0
```

**Format:** `e_distort:arc:{angle}` (1 decimal place)
**Range:** -180° to 180°

---

### **6. Background Mapping**

**Input:**
```
text1_bg = true
text1_bg_color = "#000000"
text1_bg_opacity = 80
```

**Output:**
```
b_rgb:000000,o_80
```

**Format:** `b_rgb:{color},o_{opacity}`

---

### **7. Position Mapping**

**Input:**
```
text1_position = "north"
text1_x = 0
text1_y = 50
```

**Output:**
```
fl_layer_apply,g_north,y_50
```

**Format:** `fl_layer_apply,g_{position}[,x_{x}][,y_{y}]`

**Positions:**
- `north`, `south`, `east`, `west`
- `center`
- `north_east`, `north_west`, `south_east`, `south_west`

---

## 🎨 Complete URL Examples

### **Example 1: Single Layer**

**Input Settings:**
```csv
id,text1_content,text1_font,text1_size,text1_color,text1_position,text1_arc
1,FLASH SALE,Mitr,100,#FFD700,center,0
```

**Generated URL:**
```
https://res.cloudinary.com/dz3cmaxnc/image/upload/
l_text:Mitr_100_bold_center:FLASH%20SALE,
w_900,c_fit,
co_rgb:FFD700,
fl_layer_apply,g_center/
{IMAGE_PUBLIC_ID}
```

---

### **Example 2: Multi-Layer with Arc Curve**

**Input Settings:**
```csv
id,text1_content,text1_font,text1_size,text1_color,text1_arc,text2_enabled,text2_content,text2_font,text2_size,text2_color
2,CREMO,Mitr,90,#FFD700,60,true,Premium Quality,Sarabun,50,#FFFFFF
```

**Generated URL:**
```
https://res.cloudinary.com/dz3cmaxnc/image/upload/
l_text:Mitr_90_bold_center:CREMO,
w_900,c_fit,
co_rgb:FFD700,
e_distort:arc:60.0,
fl_layer_apply,g_north,y_50/
l_text:Sarabun_50_normal_center:Premium%20Quality,
w_800,c_fit,
co_rgb:FFFFFF,
fl_layer_apply,g_center/
{IMAGE_PUBLIC_ID}
```

---

### **Example 3: Full Features**

**Input Settings:**
```csv
id,text1_content,text1_font,text1_size,text1_color,text1_stroke,text1_stroke_color,text1_stroke_width,text1_shadow,text1_shadow_strength,text1_arc,text1_bg,text1_bg_color,text1_bg_opacity
3,โปรโมชั่นพิเศษ,Mitr,80,#FF0000,true,#FFFFFF,8,true,60,45,true,#FFFF00,90
```

**Generated URL:**
```
https://res.cloudinary.com/dz3cmaxnc/image/upload/
l_text:Mitr_80_bold_center:โปรโมชั่นพิเศษ,
w_900,c_fit,
co_rgb:FF0000,
co_rgb:FFFFFF,e_outline:8,
e_shadow:60,
e_distort:arc:45.0,
b_rgb:FFFF00,o_90,
fl_layer_apply,g_north,y_100/
{IMAGE_PUBLIC_ID}
```

---

## ✅ URL Validation Rules

### **Required Components:**
1. ✅ Cloudinary domain: `res.cloudinary.com/{cloud_name}`
2. ✅ Upload path: `/image/upload/`
3. ✅ Text layer: `l_text:...`
4. ✅ Layer apply: `fl_layer_apply`

### **Format Checks:**
1. ✅ Text layer syntax: `l_text:{font}_{size}_{weight}_{align}:{text}`
2. ✅ Color format: `co_rgb:{6-digit-hex}`
3. ✅ Properly encoded: No spaces, Thai text encoded
4. ✅ Character limit: < 2000 characters

### **Validation Scoring:**
- **100%** - All checks passed
- **80%** - Passed with warnings
- **0%** - Has errors

---

## 🚀 Usage

### **Method 1: n8n Workflow**

1. **Import workflow:**
   ```
   File: CC_ID2_CLOUDINARY_GENERATOR/workflows/Cloudinary_Code_Generator.json
   ```

2. **Configure Google Sheets:**
   - Create new Google Sheet
   - Import template: `Cloudinary_Parameters_GoogleSheet_Template.csv`
   - Get Sheet ID
   - Update workflow Sheet ID

3. **Run workflow:**
   - Add text settings to `text_settings` sheet
   - Execute workflow
   - Check `generated_urls` sheet for results

---

### **Method 2: Standalone Code**

```javascript
const { buildCloudinaryURL } = require('./code/cloudinary_url_builder.js');

const settings = {
  text1: {
    text_content: 'CREMO ICE CREAM',
    font_family: 'Mitr',
    font_size: 90,
    text_color: '#FFD700',
    arc_curve: 60,
    position: 'north',
    y_offset: 50
  }
};

const result = buildCloudinaryURL(settings);
console.log(result.url_template);
```

---

## 📚 Learning Objectives (Phase 1)

### **CC_ID2 Learns:**
1. ✅ Cloudinary transformation syntax
2. ✅ Parameter mapping techniques
3. ✅ URL structure and format
4. ✅ Multi-layer text overlay concepts
5. ✅ Arc curve distortion parameters
6. ✅ Google Sheets integration
7. ✅ URL validation methods

### **Skills Developed:**
- Technical URL building
- Parameter conversion
- Data structure mapping
- Format validation
- Code modularization

---

## 🔗 Integration (Phase 2)

After Phase 1, CC_ID2's URL generator will integrate with:
- CC_ID1's Telegram interface (provides user-friendly settings input)
- Existing text overlay system (uses generated URLs for rendering)

**Flow:**
```
User (Telegram)
  → CC_ID1 Interface (collect settings)
  → Google Sheets (store settings)
  → CC_ID2 Generator (create URLs)
  → Existing System (render text overlay)
```

---

## 🐛 Troubleshooting

### **Issue: URL not working**
**Solution:**
1. Check validation status in `generated_urls` sheet
2. Fix any errors reported
3. Ensure text is properly URL encoded

### **Issue: Text not appearing**
**Solution:**
1. Verify `text_content` is not empty
2. Check `layer_apply` parameter exists
3. Ensure position is valid

### **Issue: Arc curve not working**
**Solution:**
1. Verify arc value is between -180 and 180
2. Check format: `e_distort:arc:{value}`
3. Ensure 1 decimal place precision

### **Issue: Colors wrong**
**Solution:**
1. Remove # from hex colors
2. Ensure 6-digit hex format (RRGGBB)
3. Check parameter is `co_rgb:` not `color:`

---

## 📊 Deliverables Checklist

- ✅ `Cloudinary_Code_Generator.json` - n8n workflow
- ✅ `cloudinary_url_builder.js` - Code module
- ✅ `Cloudinary_Parameters_GoogleSheet_Template.csv` - Template
- ✅ `CLOUDINARY_URL_BUILDING_GUIDE.md` - This guide

---

## 🎯 Success Criteria

**Phase 1 Complete When:**
1. ✅ Can read text settings from Google Sheets
2. ✅ Can map all parameters correctly
3. ✅ Can build valid Cloudinary URLs
4. ✅ Can support 3 text layers
5. ✅ Can validate URL format
6. ✅ Understand Cloudinary transformation syntax

---

**CC_ID2 Status:** ✅ Ready for Phase 1 Completion
**Next Step:** Integrate with CC_ID1 in Phase 2
**Created:** 2025-11-09
