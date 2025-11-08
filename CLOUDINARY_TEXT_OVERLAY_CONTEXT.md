# Cloudinary Text Overlay - Context for Claude Code

## 🎯 Project Goal
เพิ่มฟีเจอร์ **Text Overlay** ใน n8n workflow ที่สร้างรูปภาพโฆษณาผ่าน Fal.AI แล้วส่งขึ้น Facebook

## 📊 Current System (ที่มีอยู่แล้ว)

### Main Workflow: `telegram_workflow` (QvgQdZ81AemlcpxE)
- Telegram Trigger → รับรูป/ข้อความจาก user
- Switch routing → เลือกระหว่าง "with template" หรือ "no template"
- Call sub-workflows → สร้างรูปผ่าน Fal.AI

### Sub-Workflow 1: `create_image_no_templete` (rbs62NZXnwP3FtPq)
- 36 nodes
- Analyze Product Image (OpenAI Vision)
- Generate Ad Prompt (AI Agent)
- Generate Image (Fal.AI)
- Generate Caption (AI Agent)
- Publish to Facebook

### Sub-Workflow 2: `create_image_with_templete` (FX17QqYlrta6GyaA)
- 35 nodes
- ใช้ Google Sheets templates
- Similar flow to no_templete
- มี Google Sheets integration

## 🎨 What We're Adding

### New Feature: Text Overlay using Cloudinary
**Insert Point:** หลัง "Generate Image (Fal.AI)" ก่อน "Generate Caption"

```
Fal.AI Image Generated
    ↓
User Approves Image
    ↓
[NEW] Ask: "ต้องการใส่ข้อความบนรูปไหม?"
    ↓
[NEW] If Yes:
    - Load text config from Google Sheets
    - Upload image to Cloudinary
    - Apply text overlay transformation
    - Preview with Telegram
    - User approve/edit loop
    ↓
Continue to Caption Generation
```

## 📋 Data Sources

### Google Sheets: `prompt_create_image__2_.xlsx`
**Existing sheets:**
- `job` - Job queue
- `templete` - Template configurations
- `templete_choice` - Template options
- 8 template-specific sheets (Success Story, Community Moments, etc.)

**New sheet added:**
- `text_overlay_config` - Text styling configurations (16 templates)

### Cloudinary Resources
**JavaScript Code:** `Enhanced_Cloudinary_URL_Builder.js`
- Function to build Cloudinary transformation URLs
- Supports: text layers, stroke, shadow, arc, background
- Input: config object + text strings
- Output: complete Cloudinary URL

## 🔧 Technical Requirements

### Cloudinary API
```javascript
// Upload image
POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
Body: { file: base64_or_url }
Response: { public_id, url, secure_url }

// Transform URL format
https://res.cloudinary.com/{cloud_name}/image/upload/
  w_1080,h_1080,c_fill/
  l_text:{font}_{size}_{weight}:{encoded_text},
  co_rgb:{color},
  e_outline:{stroke_width},
  g_{position},
  y_{offset}/
  {public_id}.jpg
```

### Text Overlay Config Structure (from Google Sheets)
```javascript
{
  template_id: "success_story",
  position: "north",
  font_size: 80,
  font_family: "Mitr",
  color: "#FFD700",
  stroke_enabled: true,
  stroke_color: "#3B5998",
  stroke_width: 5,
  shadow_enabled: true,
  shadow_strength: 50,
  arc: 0,
  bg_enabled: false,
  bg_color: "#000000",
  bg_opacity: 80,
  x_offset: 0,
  y_offset: 50,
  max_width: 800
}
```

## 🎯 Your Mission (Claude Code)

### Task 1: Create Sub-Workflow JSON
**Workflow Name:** `text_overlay_processor`

**Required Nodes (5 nodes):**
1. **Execute Workflow Trigger** - รับ input จาก parent workflow
2. **Load_Text_Config** - Google Sheets node อ่าน text_overlay_config
3. **Build_Cloudinary_URL** - Code node สร้าง transformation URL
4. **Apply_Text_Overlay** - HTTP Request ไป Cloudinary
5. **Return_Result** - ส่งผลลัพธ์กลับ parent workflow

### Task 2: Write JavaScript Code for Node #3

**Input (from $json):**
```javascript
{
  image_url: "https://fal.ai/output/image.jpg",
  text_content: "โปรโมชั่นพิเศษ!",
  template_id: "flash_sale",
  text_config: { /* from Google Sheets */ }
}
```

**Required Output:**
```javascript
{
  cloudinary_url: "https://res.cloudinary.com/...",
  preview_url: "https://res.cloudinary.com/.../w_400/...",
  public_id: "abc123xyz",
  transformation: "l_text:Mitr_80_bold:...",
  status: "success"
}
```

**Code Requirements:**
- ใช้ logic จาก `Enhanced_Cloudinary_URL_Builder.js`
- รองรับ Thai fonts (Mitr, Sarabun)
- Encode Thai text ให้ถูกต้อง (encodeURIComponent)
- Support multiple text layers (text1, text2, text3)
- Generate preview URL (smaller size for Telegram)

### Task 3: Create Test Data
สร้างไฟล์ JSON ตัวอย่างสำหรับ test:
- Sample text_config (3 templates)
- Sample input data
- Expected output URLs

## 📂 Files You'll Create

1. **`text_overlay_processor.json`** - Complete n8n workflow
2. **`cloudinary_url_builder_n8n.js`** - JavaScript for Code node
3. **`test_data.json`** - Test cases
4. **`IMPLEMENTATION_NOTES.md`** - การใช้งานและ troubleshooting

## ⚠️ Important Notes

### What You CAN do (without n8n MCP):
- ✅ Write JavaScript code for n8n Code nodes
- ✅ Create workflow JSON manually (valid structure)
- ✅ Test Cloudinary API with curl/node
- ✅ Generate test data
- ✅ Write documentation

### What You CANNOT do (needs n8n MCP):
- ❌ Deploy workflow to n8n instance
- ❌ Validate workflow with n8n API
- ❌ Test workflow execution in n8n
- ❌ Update existing workflows

**Solution:** 
คุณสร้าง workflow JSON และ code → ส่งกลับมา → Claude.ai (with MCP) จะ deploy และ validate

## 🚀 Success Criteria

1. ✅ Workflow JSON valid (ไม่มี syntax error)
2. ✅ JavaScript code ทำงานได้ (test locally ได้)
3. ✅ Cloudinary URLs ถูกต้อง (format ตรง spec)
4. ✅ รองรับ Thai text (UTF-8 encoding)
5. ✅ มี error handling (try-catch)
6. ✅ มี documentation ครบ

## 📞 Contact Points

**ถ้าติดปัญหา:**
- Cloudinary URL format → ดูใน `Enhanced_Cloudinary_URL_Builder.js`
- n8n node structure → ดูใน `WRD_admin_chatbot_v3_working.json`
- Text config → ดู `text_overlay_config.xlsx`

**ถ้าไม่แน่ใจ:**
- สร้าง workflow มาให้ดูก่อน
- Claude.ai จะ validate และแนะนำปรับปรุง
- ไม่ต้องกังวลถ้าไม่สมบูรณ์ 100%

---

**Created:** 2025-11-08  
**Project:** Cremo Ice Cream - Social Media Automation  
**Phase:** Text Overlay Integration  
**Status:** Ready for Claude Code Implementation
