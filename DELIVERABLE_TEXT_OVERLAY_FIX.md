# CC_CREATIVE - Text Overlay Integration Project
**Team:** CC_CREATIVE  
**Priority:** P0 - CRITICAL  
**Deadline:** This Week  
**Coordinator:** Claude Sonnet 4 with n8n MCP

---

## 🎯 Project Overview

**Goal:** Fix Text Overlay workflow และ integrate กับ Main Router ให้ user สามารถเพิ่มข้อความบนภาพได้

**Current Problem:**
- Text Overlay workflow INACTIVE → user กดปุ่มแล้วเจอ 404 error
- Arc curve feature ไม่ทำงาน (brand critical)
- Main Router ไม่เชื่อมกับ Text Overlay

---

## 🔧 Technical Details

### **Text Overlay Workflow:**
- **ID:** `BrEps7QE3eBia4U4`
- **Status:** ❌ INACTIVE
- **Type:** Interactive HTML form with Cloudinary integration

### **Node Structure (8 nodes, 6 connections):**
```
GET Webhook → GitHub HTML → Replace Values → POST Webhook → Build URL → Telegram Send
```

### **Integration Point with Main Router:**
**WHERE TO CONNECT:**
- Main Router → executeWorkflow → Image Generation workflows
- Image Generation workflows → **ADD INLINE KEYBOARD** → Text Overlay webhooks

**Input Data Flow:**
```
FROM: Image generation workflow
DATA: {
  "image_url": "https://res.cloudinary.com/...",
  "chat_id": "user_chat_id"
}

TO: Text Overlay webhook
ENDPOINT: GET /webhook/overlay-form?image_url=...&chat_id=...
```

**Output Data Flow:**
```
FROM: Text Overlay form submission
DATA: {
  "position": "center",
  "font_size": 50,
  "arc_curve": 30,
  "color": "#ffdd17",
  "text": "user input text"
}

TO: Cloudinary URL builder → Final image → Telegram
```

---

## 📋 Tasks Breakdown

### **Task 1: Activate Text Overlay Workflow**
**Duration:** 1-2 hours

**Steps:**
1. Activate workflow `BrEps7QE3eBia4U4` in n8n
2. Test webhook endpoints:
   - GET `/webhook/overlay-form` 
   - POST `/webhook/overlay-submit`
3. Verify HTML form loads from GitHub
4. Test Cloudinary URL generation

**Test Commands:**
```bash
# Test GET endpoint
curl "http://n8n-server/webhook/overlay-form?image_url=test&chat_id=123"

# Test POST endpoint  
curl -X POST "http://n8n-server/webhook/overlay-submit" \
  -d "text=test&arc_curve=30&color=%23ffdd17"
```

### **Task 2: Fix Arc Curve Feature**
**Duration:** 2-3 hours

**Current Issue:** Arc curve slider ไม่ทำงาน
**Brand Requirement:** -180° to 180° range, แนะนำ 30-60°

**Fix Required:**
1. **HTML Form** - verify arc curve slider functionality
2. **Cloudinary URL** - check `e_distort:arc:{value}` parameter
3. **Mobile Support** - touch-friendly sliders

**Code Example (from scheduled posting):**
```javascript
// Working arc curve implementation:
`e_distort:arc:40.0/`

// Should be dynamic from form:
`e_distort:arc:${arcCurveValue}/`
```

### **Task 3: Add Inline Keyboard to Image Generation**
**Duration:** 1-2 hours

**WHERE TO ADD:** After image generation, before sending to user

**Inline Keyboard Code:**
```javascript
// Add to image generation workflow send message node
{
  "reply_markup": {
    "inline_keyboard": [[
      {
        "text": "➕ เพิ่มข้อความ", 
        "url": "https://n8n-server/webhook/overlay-form?image_url={{$json.cloudinary_url}}&chat_id={{$json.chat_id}}"
      }
    ]]
  }
}
```

**Input to this node:**
- `cloudinary_url`: URL ของภาพที่สร้างเสร็จ
- `chat_id`: Telegram chat ID ของ user

### **Task 4: Mobile Optimization**
**Duration:** 1 hour

**Requirements:**
- Touch-friendly sliders
- No keyboard popup on mobile
- Preview image responsive
- Easy color picker

---

## 🧪 Testing Plan

### **Test Sequence:**
1. **Standalone Test:**
   ```
   → Access form URL directly
   → Fill form and submit
   → Verify image generation
   → Check Telegram delivery
   ```

2. **Integration Test:**
   ```
   → Generate image via Main Router
   → Click "เพิ่มข้อความ" button  
   → Complete text overlay form
   → Verify final result
   ```

### **Test Data:**
```javascript
// Test form data
{
  "image_url": "https://res.cloudinary.com/dz3cmaxnc/image/upload/v1699123456/test.jpg",
  "chat_id": "123456789",
  "text": "ทดสอบข้อความภาษาไทย",
  "arc_curve": 45,
  "font_size": 60,
  "color": "#ffdd17",
  "position": "center"
}
```

---

## 🎨 Brand Requirements

### **Arc Curve Guidelines:**
- **Range:** -180° to 180°
- **Recommended:** 30° to 60° (optimal readability)
- **Brand Examples:**
  - Logo text: 40°
  - Product names: 30°
  - Promotional text: 60°

### **CREMO Colors:**
- Primary: `#ffdd17` (yellow)
- Secondary: `#17539f` (blue)  
- White: `#ffffff`
- Black: `#000000`

### **Font Requirements:**
- **Font:** Mitr (supports Thai)
- **Sizes:** 30-100px recommended
- **Effects:** Stroke outline for readability

---

## 📊 Success Criteria

### **Technical Success:**
- [ ] Text Overlay workflow ACTIVE
- [ ] Webhook endpoints responding (200 OK)
- [ ] Arc curve working (-180° to 180°)
- [ ] Mobile form responsive
- [ ] Integration with image generation complete

### **User Experience:**
- [ ] Form loads in <2 seconds
- [ ] Image preview updates in real-time
- [ ] Final image delivery in <5 seconds
- [ ] Mobile-friendly interface
- [ ] Thai text rendering correctly

### **Brand Compliance:**
- [ ] Arc curve feature working (brand critical)
- [ ] CREMO colors available in picker
- [ ] Font rendering correctly
- [ ] Stroke effects applied

---

## 🚨 Critical Notes

### **Dependencies:**
- **Cloudinary Account:** dz3cmaxnc (already configured)
- **Telegram Token:** TELEGRAM_BOT_TOKEN env variable
- **GitHub HTML:** Raw URL to form file

### **Potential Issues:**
1. **CORS Issues:** HTML form cross-origin requests
2. **Mobile Safari:** iOS slider behavior differences  
3. **Thai Encoding:** UTF-8 encoding in form submission
4. **Cloudinary Limits:** API rate limits or account limits

### **Rollback Plan:**
If integration breaks existing workflows:
1. Deactivate new inline keyboard
2. Keep Text Overlay as standalone
3. Fix issues before re-integration

---

## 📂 Deliverables

### **Files to Create/Update:**
1. **Text Overlay workflow** - activated and tested
2. **HTML form** - arc curve functionality verified
3. **Image generation workflows** - inline keyboard added
4. **Integration test results** - end-to-end verification
5. **Documentation** - user guide for text overlay feature

### **Report Format:**
```
Task Status: COMPLETE/IN PROGRESS/BLOCKED
Issues Found: [list any problems]
Test Results: [pass/fail for each test]
Next Actions: [if any follow-up needed]
```

---

## 🤝 Support

### **Questions/Issues:**
Contact coordinator via COORDINATOR/STATUS_UPDATE.md

### **Resources:**
- Text Overlay documentation: `JOB_TEXT_OVERLAY_simple_form.md`
- Main Router info: `JOB_ROUTER_main_telegram.md`
- Current scheduled posting code: [provided JSON example]

---

**Expected Timeline:** 2-3 days  
**Priority:** Fix text overlay feature ASAP - users waiting for this functionality!

---

**Ready to start! Contact coordinator when complete or if blocked.** 🚀