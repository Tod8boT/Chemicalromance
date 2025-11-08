# Task Specification for Claude Code

## 🎯 Mission Brief
สร้าง n8n sub-workflow ชื่อ `text_overlay_processor` พร้อม JavaScript code สำหรับใส่ข้อความบนรูปผ่าน Cloudinary API

---

## 📋 Task 1: Create Workflow JSON

### Workflow Metadata
```json
{
  "name": "text_overlay_processor",
  "nodes": [...],
  "connections": {...},
  "active": false,
  "settings": {
    "executionOrder": "v1"
  }
}
```

### Node 1: Execute Workflow Trigger
```json
{
  "id": "trigger-1",
  "name": "Start",
  "type": "n8n-nodes-base.executeWorkflowTrigger",
  "typeVersion": 1.1,
  "position": [240, 300],
  "parameters": {}
}
```

**Expected Input:**
```javascript
{
  image_url: "https://fal.ai/files/output.jpg",
  text_content: "โปรโมชั่นพิเศษ!",
  template_id: "flash_sale",
  sheet_id: "1A2B3C4D5E6F...",
  cloud_name: "dz3cmaxnc"
}
```

---

### Node 2: Load Text Config (Google Sheets)
```json
{
  "id": "sheets-1",
  "name": "Load_Text_Config",
  "type": "n8n-nodes-base.googleSheets",
  "typeVersion": 4.5,
  "position": [460, 300],
  "parameters": {
    "operation": "read",
    "sheetName": "text_overlay_config",
    "documentId": "={{ $json.sheet_id }}",
    "options": {
      "range": "A:R"
    }
  },
  "credentials": {
    "googleSheetsOAuth2Api": {
      "id": "xxx",
      "name": "Google Sheets Account"
    }
  }
}
```

**Expected Output:**
```javascript
[
  {
    template_id: "flash_sale",
    position: "north",
    font_size: 90,
    font_family: "Mitr",
    color: "#FF0000",
    stroke_enabled: true,
    stroke_color: "#FFD700",
    stroke_width: 8,
    shadow_enabled: true,
    shadow_strength: 70,
    arc: -15,
    bg_enabled: true,
    bg_color: "#FFD700",
    bg_opacity: 85,
    x_offset: 0,
    y_offset: 30,
    max_width: 950
  },
  // ... more templates
]
```

---

### Node 3: Build Cloudinary URL (Code Node)

**This is YOUR main task - write complete JavaScript code**

```json
{
  "id": "code-1",
  "name": "Build_Cloudinary_URL",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [680, 300],
  "parameters": {
    "mode": "runOnceForAllItems",
    "jsCode": "// YOUR CODE HERE - see specifications below"
  }
}
```

#### Code Specifications:

**Input Variables (from previous nodes):**
```javascript
// From Execute Workflow Trigger
const imageUrl = $input.first().json.image_url;
const textContent = $input.first().json.text_content;
const templateId = $input.first().json.template_id;
const cloudName = $input.first().json.cloud_name;

// From Google Sheets (all rows)
const allConfigs = $input.all();
```

**Required Functions:**

1. **findConfig(templateId)** - หา config ที่ตรงกับ template_id
```javascript
function findConfig(templateId, configs) {
  return configs.find(c => c.template_id === templateId);
}
```

2. **encodeThaiText(text)** - Encode Thai text สำหรับ URL
```javascript
function encodeThaiText(text) {
  // Must handle Thai characters correctly
  return encodeURIComponent(text);
}
```

3. **buildTextLayer(text, config)** - สร้าง text transformation layer
```javascript
function buildTextLayer(text, config) {
  // Format: l_text:{font}_{size}_{weight}:{encoded_text}
  // Add: color, stroke, shadow, position
  // Return: complete layer string
}
```

4. **buildCloudinaryURL(cloudName, publicId, transformations)** - สร้าง final URL
```javascript
function buildCloudinaryURL(cloudName, publicId, transformations) {
  // Format: https://res.cloudinary.com/{cloud}/image/upload/{transforms}/{id}.jpg
}
```

**Required Output Format:**
```javascript
return [{
  success: true,
  cloudinary_url: "https://res.cloudinary.com/dz3cmaxnc/image/upload/w_1080,h_1080,c_fill/l_text:Mitr_90_bold:%E0%B9%82%E0%B8%9B%E0%B8%A3...,co_rgb:FF0000,e_outline:8/fl_layer_apply,g_north,y_30/sample.jpg",
  preview_url: "https://res.cloudinary.com/dz3cmaxnc/image/upload/w_400,h_400,c_fill/l_text:Mitr_90_bold:%E0%B9%82%E0%B8%9B...,co_rgb:FF0000,e_outline:8/fl_layer_apply,g_north,y_30/sample.jpg",
  transformation_breakdown: {
    base: "w_1080,h_1080,c_fill",
    text_layer: "l_text:Mitr_90_bold:...",
    text_color: "co_rgb:FF0000",
    text_stroke: "e_outline:8",
    text_position: "fl_layer_apply,g_north,y_30"
  },
  config_used: {
    template_id: "flash_sale",
    font_size: 90,
    position: "north"
  }
}];
```

**Error Handling:**
```javascript
try {
  // Your code
  return [{ success: true, ... }];
} catch (error) {
  return [{
    success: false,
    error: error.message,
    input_received: {
      image_url: imageUrl,
      text_content: textContent,
      template_id: templateId
    }
  }];
}
```

---

### Node 4: Upload & Transform (HTTP Request)

```json
{
  "id": "http-1",
  "name": "Apply_Text_Overlay",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [900, 300],
  "parameters": {
    "method": "GET",
    "url": "={{ $json.cloudinary_url }}",
    "options": {
      "timeout": 30000
    }
  }
}
```

**Notes:**
- Cloudinary transformation URL คือ GET request
- ไม่ต้อง upload ถ้าใช้ URL จาก Fal.AI ตรงๆ
- แต่ถ้าต้องการ upload ก่อน ต้อง POST ไป `/image/upload` endpoint

---

### Node 5: Return Result

```json
{
  "id": "code-2",
  "name": "Prepare_Return",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [1120, 300],
  "parameters": {
    "jsCode": "return [{\n  status: 'completed',\n  final_image_url: $json.cloudinary_url,\n  preview_url: $json.preview_url,\n  text_applied: $input.first().json.text_content,\n  template_used: $input.first().json.template_id\n}];"
  }
}
```

---

### Connections:
```json
{
  "Start": {
    "main": [[{"node": "Load_Text_Config", "type": "main", "index": 0}]]
  },
  "Load_Text_Config": {
    "main": [[{"node": "Build_Cloudinary_URL", "type": "main", "index": 0}]]
  },
  "Build_Cloudinary_URL": {
    "main": [[{"node": "Apply_Text_Overlay", "type": "main", "index": 0}]]
  },
  "Apply_Text_Overlay": {
    "main": [[{"node": "Prepare_Return", "type": "main", "index": 0}]]
  }
}
```

---

## 📋 Task 2: Write Complete JavaScript Code

**File:** `cloudinary_url_builder_n8n.js`

**Template to follow:**
```javascript
// ===== Cloudinary URL Builder for n8n Code Node =====
// Based on: Enhanced_Cloudinary_URL_Builder.js
// Purpose: Build text overlay transformation URLs

// === INPUT VARIABLES ===
const imageUrl = $input.first().json.image_url;
const textContent = $input.first().json.text_content;
const templateId = $input.first().json.template_id;
const cloudName = $input.first().json.cloud_name || "dz3cmaxnc";

// Get all text configs from Google Sheets
const allConfigs = $input.all();

// === HELPER FUNCTIONS ===

function findConfig(templateId, configs) {
  // TODO: Find matching config
}

function encodeThaiText(text) {
  // TODO: Properly encode Thai text for URL
}

function buildTextLayer(text, config) {
  // TODO: Build complete text layer transformation
  // Include: font, size, color, stroke, shadow, position
}

function buildCloudinaryURL(cloudName, imageId, transformations) {
  // TODO: Assemble final URL
}

// === MAIN LOGIC ===

try {
  // 1. Find config
  const config = findConfig(templateId, allConfigs);
  
  if (!config) {
    throw new Error(`Config not found for template: ${templateId}`);
  }
  
  // 2. Extract image ID from Fal.AI URL
  const imageId = extractImageId(imageUrl);
  
  // 3. Build text layer
  const textLayer = buildTextLayer(textContent, config);
  
  // 4. Build complete URL
  const cloudinaryUrl = buildCloudinaryURL(cloudName, imageId, textLayer);
  
  // 5. Build preview URL (smaller size)
  const previewUrl = buildCloudinaryURL(cloudName, imageId, `w_400,h_400,c_fill/${textLayer}`);
  
  // 6. Return result
  return [{
    success: true,
    cloudinary_url: cloudinaryUrl,
    preview_url: previewUrl,
    transformation_breakdown: {
      base: "w_1080,h_1080,c_fill",
      text_layer: textLayer
    },
    config_used: {
      template_id: config.template_id,
      font_size: config.font_size,
      position: config.position
    }
  }];
  
} catch (error) {
  return [{
    success: false,
    error: error.message,
    stack: error.stack,
    input_received: {
      image_url: imageUrl,
      text_content: textContent,
      template_id: templateId,
      cloud_name: cloudName
    }
  }];
}
```

**Your Task:**
1. Complete all `// TODO:` sections
2. Implement proper Thai text encoding
3. Handle all config parameters (stroke, shadow, arc, background)
4. Add proper error handling
5. Test with sample data

---

## 📋 Task 3: Create Test Data

**File:** `test_data.json`

```json
{
  "test_case_1": {
    "name": "Flash Sale - Thai Text",
    "input": {
      "image_url": "https://fal.ai/files/zebra/test123.jpg",
      "text_content": "ลด 70% วันนี้!",
      "template_id": "flash_sale",
      "cloud_name": "dz3cmaxnc",
      "sheet_id": "test123"
    },
    "expected_config": {
      "template_id": "flash_sale",
      "position": "north",
      "font_size": 90,
      "color": "#FF0000",
      "stroke_color": "#FFD700"
    },
    "expected_output_contains": [
      "res.cloudinary.com",
      "w_1080,h_1080",
      "l_text:Mitr_90",
      "co_rgb:FF0000",
      "e_outline:8"
    ]
  },
  "test_case_2": {
    "name": "Success Story - English Text",
    "input": {
      "image_url": "https://fal.ai/files/test456.jpg",
      "text_content": "Amazing Results!",
      "template_id": "success_story",
      "cloud_name": "dz3cmaxnc"
    },
    "expected_output_contains": [
      "l_text:Mitr_80",
      "co_rgb:FFD700",
      "g_north"
    ]
  },
  "test_case_3": {
    "name": "Error Case - Invalid Template",
    "input": {
      "image_url": "https://fal.ai/files/test789.jpg",
      "text_content": "Test",
      "template_id": "invalid_template_id",
      "cloud_name": "dz3cmaxnc"
    },
    "expected_error": true,
    "expected_error_message": "Config not found"
  }
}
```

---

## 📋 Task 4: Documentation

**File:** `IMPLEMENTATION_NOTES.md`

### Section 1: How to Use

```markdown
# Text Overlay Processor - Implementation Notes

## Installation

1. Import `text_overlay_processor.json` into n8n
2. Configure Google Sheets credentials
3. Set Cloudinary cloud_name in environment variables

## Testing

```javascript
// Test input data
{
  image_url: "https://example.com/image.jpg",
  text_content: "โปรโมชั่น 50%",
  template_id: "flash_sale",
  sheet_id: "YOUR_SHEET_ID",
  cloud_name: "YOUR_CLOUD_NAME"
}
```

## Troubleshooting

### Thai Text Not Showing
- Check: encodeURIComponent properly applied
- Check: Font supports Thai (Mitr, Sarabun)

### Cloudinary URL Not Working
- Check: cloud_name correct
- Check: transformation syntax valid
- Test: URL in browser directly
```

---

## ✅ Deliverables Checklist

- [ ] `text_overlay_processor.json` - Complete workflow
- [ ] `cloudinary_url_builder_n8n.js` - JavaScript code
- [ ] `test_data.json` - Test cases
- [ ] `IMPLEMENTATION_NOTES.md` - Documentation

---

## 🎯 Success Criteria

1. **Workflow JSON:**
   - Valid n8n format
   - All 5 nodes configured
   - Proper connections
   - No syntax errors

2. **JavaScript Code:**
   - Handles Thai text correctly
   - All config parameters supported
   - Proper error handling
   - Returns expected format

3. **Test Data:**
   - At least 3 test cases
   - Covers success and error scenarios
   - Includes Thai and English text

4. **Documentation:**
   - Clear installation steps
   - Usage examples
   - Troubleshooting guide

---

## 📞 Questions?

**If stuck:**
- Check `Enhanced_Cloudinary_URL_Builder.js` for reference
- Check `text_overlay_config.xlsx` for config structure
- Ask for clarification on specific parts

**Ready to start?**
- Begin with the JavaScript code (Task 2)
- Test locally with Node.js
- Then wrap in workflow JSON (Task 1)

---

**Good luck! 🚀**
