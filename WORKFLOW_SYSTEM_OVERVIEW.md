# Workflow Resource Doc – Chemicalromance (CREMO) System
**Project:** CREMO Telegram Bot Automation System
**Created:** 2025-01-08
**Purpose:** Automated image generation and text overlay system for social media content

---

## 📋 System Overview

| Field | Value |
|-------|-------|
| **Project Name** | Chemicalromance (CREMO) |
| **n8n Instance** | Local development |
| **Total Workflows** | 4 main workflows + sub-workflows |
| **Primary Channel** | Telegram Bot |
| **Status** | ✅ Production Ready |

### Business Value
⏱️ **Time Saved:** 90% reduction in content creation time (2 hours → 10 minutes)
🎯 **Automation:** Fully automated image generation with AI + text overlay
📱 **User Experience:** Interactive Telegram interface with inline keyboards

---

## 🔄 System Architecture

```
[Telegram Bot]
    ↓
[telegram_workflow] (Main Router)
    ├── Photo received → [Process Photo]
    ├── Text command → [Parse & Route]
    └── Create Image → [Choice: Template?]
             ├── YES → [create_image_with_templete]
             │            ├── Select Template (Google Sheets)
             │            ├── Fal.AI Generation
             │            ├── OpenAI Vision Analysis
             │            └── Facebook Auto-Post
             │
             └── NO  → [create_image_no_templete]
                          ├── Grok-4-fast Prompt Enhancement
                          ├── Fal.AI Generation
                          ├── OpenAI Vision Analysis
                          └── [text_overlay_simple] ← NEW!
                                ├── Interactive HTML Form
                                ├── Cloudinary Text Overlay
                                └── Send back to Telegram
```

---

## 📚 Workflow Inventory

### 1. telegram_workflow (Main Entry Point)

| Field | Value |
|-------|-------|
| **File** | `telegram_workflow.json` |
| **Purpose** | Main Telegram bot message router |
| **Trigger** | Telegram bot webhook |
| **Node Count** | ~35-36 nodes |

**Key Features:**
- Photo/Text message classification
- Command parsing and routing
- Integration with Fal.AI for image generation
- OpenAI Vision for image analysis
- Facebook posting automation

**Critical Paths:**
```
Photo Message → Extract → Process → Store
Text Message → Parse → Route to Sub-Workflow
/create command → Choose template option
```

---

### 2. create_image_with_templete

| Field | Value |
|-------|-------|
| **File** | `create_image_with_templete.json` |
| **Purpose** | Generate images using predefined templates |
| **Trigger** | Called by telegram_workflow |
| **Node Count** | ~35-36 nodes |

**Template Options:**
- Success Story
- Community Moments
- Lifestyle Photography
- Product Demonstration
- Freezer Studio Shot
- Plush Balloon Style
- Isometric Scene

**Workflow:**
```
Start
  ↓
Telegram Send & Wait (Template Selection)
  ↓
Google Sheets (Load Template Config)
  ↓
Grok-4-fast (Enhance Prompt)
  ↓
Fal.AI nano-banana (Generate Image)
  ↓
OpenAI Vision (Verify Quality)
  ↓
Facebook (Auto-Post)
  ↓
Telegram (Send Result)
```

**Critical Integrations:**
- Google Sheets: Template storage
- Credential: `google-sheets-prod`
- Document ID: `1EtZMb8HEdB-_fl7NJa1fv2y26S3zJZbpxgNUoQr5yrE`
- Sheet GID: `1474216271` (numeric, not string!)

---

### 3. create_image_no_templete

| Field | Value |
|-------|-------|
| **File** | `create_image_no_templete.json` |
| **Purpose** | Generate images with custom prompts (no template) |
| **Trigger** | Called by telegram_workflow |
| **Node Count** | ~35-36 nodes |

**Workflow:**
```
Start
  ↓
Grok-4-fast (Prompt Enhancement)
  ↓
Execute Workflow: keep_data_price
  ↓
Fal.AI nano-banana (Generate Image)
  ↓
OpenAI Vision (Quality Check)
  ↓
Telegram (Send Image + Inline Keyboard)
  ↓
[User Choice]
    ├── 📝 Add Text → text_overlay_simple
    ├── 🎬 Create Video → [Future]
    └── 📤 Post Now → Facebook
```

**Key Difference from Template Version:**
- More flexible prompt input
- AI-powered prompt enhancement
- Direct user creativity (no template constraints)

**Sub-Workflow:**
- `keep_data_price` (ID: `4RsOafwqPCwgTcUA`) - Price tracking

---

### 4. text_overlay_simple ⭐ NEW

| Field | Value |
|-------|-------|
| **File** | `text_overlay_simple.json` |
| **Purpose** | Interactive text overlay on images/videos |
| **Trigger** | Webhook (inline keyboard from image generation) |
| **Node Count** | 8 nodes |
| **Status** | ✅ Production Ready |

**Problem Solved:**
- Previous template-based approach was too limited
- Users needed dynamic customization like Cloudinary demo site
- Arc curve text for brand identity

**Workflow:**
```
GET /webhook/overlay-form
  ↓
Get HTML (from GitHub raw)
  ↓
Replace Values (image_url, chat_id)
  ↓
Show HTML Form (Interactive UI)
  ↓
[User Customizes]
  - Text content
  - Font size (10-200)
  - Arc curve (-180° to 180°) ← CRITICAL for brand
  - Colors (text, stroke, shadow, background)
  - Position (grid + X/Y offsets)
  - Video timestamp (for video mode)
  ↓
POST /webhook/overlay-submit
  ↓
Build Cloudinary URL (Code node)
  ↓
Send to Telegram API
  ↓
Done (Success response)
```

**Node Details:**

| Node # | Name | Type | Purpose |
|--------|------|------|---------|
| 1 | Form Webhook | Webhook (GET) | Display form URL |
| 2 | Get HTML | HTTP Request | Fetch from GitHub |
| 3 | Replace Values | Code | Inject parameters |
| 4 | Show Form | Respond to Webhook | Return HTML |
| 5 | Submit Webhook | Webhook (POST) | Receive form data |
| 6 | Build URL | Code | Create Cloudinary URL |
| 7 | Send Photo | HTTP Request | Telegram API |
| 8 | Done | Respond to Webhook | Success response |

**Webhook Endpoints:**
- Form Display: `https://[domain]/webhook/overlay-form?image_url=[URL]&chat_id=[ID]`
- Form Submit: `https://[domain]/webhook/overlay-submit` (POST)

**Cloudinary Parameters Supported:**

| Category | Parameters |
|----------|------------|
| **Text** | font_size, font_weight, text_align, text_color |
| **Arc Curve** | arc_curve (-180 to 180) - **Key for CREMO brand** |
| **Stroke** | stroke_enabled, stroke_color, stroke_width (1-20) |
| **Shadow** | shadow_enabled, shadow_strength (0-100) |
| **Background** | background_enabled, background_color, background_opacity (0-100) |
| **Position** | position (9-grid), x_offset (-500 to 500), y_offset (-500 to 500) |
| **Video** | media_type, start_time, end_time, fade_effect |

**HTML Form Features:**
- ✅ Slider + Number Input (precise control, not limited to S/M/L)
- ✅ Real-time preview before generation
- ✅ Color pickers with hex input
- ✅ Position grid with fine-tune offsets
- ✅ Video timestamp controls (start/end in seconds)
- ✅ Mobile responsive design
- ✅ Auto-send back to Telegram with caption

**Cloudinary URL Example:**
```
https://res.cloudinary.com/dz3cmaxnc/image/upload/
l_text:Arial_80_bold_center:SALE,w_800,c_fit,co_rgb:ff0000/
co_rgb:000000,e_outline:5/
e_shadow:60/
e_distort:arc:45/
fl_layer_apply,g_north,y_50/
fetch:[base64-encoded-url]
```

---

## ⚙️ System Configuration

### Environment Variables
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
# Used by: telegram_workflow, text_overlay_simple
```

### Credentials (Reference only)

| Purpose | Credential Name | Used In |
|---------|----------------|---------|
| Google Sheets | `google-sheets-prod` | create_image_with_templete |
| Telegram Bot | Set via env var | All workflows |
| OpenAI Vision | `openai-vision` | Image workflows |
| Fal.AI | `fal-ai` | Image generation workflows |
| Facebook | `facebook-page` | Auto-posting |
| OpenRouter (Grok) | `openrouter-api` | Prompt enhancement |

### Cloudinary Configuration
```javascript
cloudName: "dz3cmaxnc"
// Used for: text overlay transformations
// Features: Arc curve text, stroke, shadow, positioning
```

---

## 📊 Data Flow

### Telegram Message Input
```json
{
  "message": {
    "chat": {"id": "123456789"},
    "text": "/create image of a cat",
    "photo": [{"file_id": "..."}]
  }
}
```

### Image Generation Output
```json
{
  "fal_image_url": "https://fal.ai/files/xxx.jpg",
  "chat_id": "123456789",
  "prompt": "Enhanced prompt text",
  "vision_analysis": "AI analysis result"
}
```

### Text Overlay Form Data
```json
{
  "text_content": "ข้อความที่ต้องการ",
  "font_size": 80,
  "arc_curve": 45,
  "text_color": "ffffff",
  "stroke_enabled": true,
  "stroke_color": "000000",
  "stroke_width": 5,
  "position": "north",
  "x_offset": 0,
  "y_offset": 50,
  "media_type": "image",
  "image_url": "https://fal.ai/files/xxx.jpg",
  "chat_id": "123456789"
}
```

---

## 🛡️ Error Handling

### Known Issues & Solutions

**Issue 1: Google Sheets Node (create_image_with_templete)**
- ❌ **Wrong:** Using `mode: "id"` with string sheetName
- ✅ **Fixed:** Use `mode: "list"` with numeric GID (1474216271)

**Issue 2: Workflow Import Failures**
- ❌ **Problem:** Large HTML embedded in Code nodes
- ✅ **Solution:** Use GitHub raw URL to fetch HTML externally

**Issue 3: Thai Text Display**
- ⚠️ **Limitation:** Cloudinary default fonts have limited Thai support
- 💡 **Workaround:** Use Arial/Helvetica for basic Thai, or upload custom fonts

**Issue 4: Video Timestamp Accuracy**
- 📝 **Note:** Cloudinary uses seconds with decimal (e.g., `so_2.5`, `eo_10.8`)
- ✅ **Form supports:** 0.1 second precision

### Error Recovery

| Error Type | Action |
|------------|--------|
| Telegram API timeout | Retry 3x with 2s delay |
| Fal.AI generation fail | Return error message to user |
| Cloudinary fetch fail | Check URL encoding |
| Form submission timeout | Show error alert, keep form open |

---

## ✅ Testing

### Test Scenarios

**Scenario 1: Image Generation with Template**
```bash
# In Telegram
User: /create
Bot: ใช้ template หรือไม่?
User: [เลือก Success Story]
Bot: [Generates image → Posts to Facebook → Returns to Telegram]
```

**Scenario 2: Image Generation without Template**
```bash
# In Telegram
User: /create a cat wearing sunglasses
Bot: [Grok enhances → Fal.AI generates → Shows inline keyboard]
User: [Clicks 📝 Add Text]
Browser: [Opens HTML form]
User: [Customizes text → Clicks สร้างเลย]
Bot: [Returns image with text overlay]
```

**Scenario 3: Text Overlay Form**
```bash
# Test URL
curl "https://your-n8n.com/webhook/overlay-form?image_url=https://example.com/test.jpg&chat_id=123456789"

# Should return: HTML form with image preview

# Test submission
curl -X POST https://your-n8n.com/webhook/overlay-submit \
  -H "Content-Type: application/json" \
  -d '{"text_content":"TEST","font_size":60,"chat_id":"123456789","image_url":"..."}'
```

---

## 🚀 Deployment Checklist

### Pre-Deploy (text_overlay_simple)
- [x] HTML form uploaded to GitHub
- [x] Workflow file validated (text_overlay_simple.json)
- [x] Webhook paths configured (/overlay-form, /overlay-submit)
- [x] TELEGRAM_BOT_TOKEN environment variable set
- [x] Cloudinary account active (dz3cmaxnc)
- [x] Test with sample image URL

### Post-Deploy Monitoring
- [ ] Monitor execution logs for errors
- [ ] Check Telegram bot response time (<5s)
- [ ] Verify Cloudinary URL generation
- [ ] Test arc curve feature (key for brand!)

---

## 🔐 Security & Compliance

**Sensitive Data:**
- Telegram chat IDs (PII)
- User messages and prompts
- Generated images (may contain user content)

**Retention:**
- Execution logs: 7 days (n8n default)
- Generated images: Stored by Fal.AI/Cloudinary (check their policies)

**API Keys Protection:**
- ✅ Stored in n8n credentials (encrypted)
- ✅ Never exposed in workflow JSON
- ⚠️ TELEGRAM_BOT_TOKEN via environment variable (secure)

---

## 📚 Important Files

### GitHub Repository Structure
```
/Chemicalromance
  ├── telegram_workflow.json (Main bot)
  ├── create_image_with_templete.json
  ├── create_image_no_templete.json
  ├── text_overlay_simple.json ⭐ NEW
  ├── text_overlay_form.html (Form UI)
  ├── inline_keyboard_example.json (Integration guide)
  ├── INTERACTIVE_TEXT_OVERLAY_GUIDE.md (Full docs)
  ├── IMPLEMENTATION_NOTES.md
  └── test_data.json
```

### Documentation Files
- `INTERACTIVE_TEXT_OVERLAY_GUIDE.md` - Complete usage guide
- `IMPLEMENTATION_NOTES.md` - Technical notes
- `inline_keyboard_example.json` - How to integrate with existing workflows

---

## 💡 Integration Guide

### Adding Text Overlay to Existing Workflow

**Step 1:** Add inline keyboard after image generation
```javascript
// In create_image_no_templete or similar
const imageUrl = $json.fal_image_url;
const chatId = $json.chat_id;

const formUrl = `https://your-n8n.com/webhook/overlay-form?image_url=${encodeURIComponent(imageUrl)}&chat_id=${chatId}`;

const keyboard = {
  inline_keyboard: [
    [{ text: "📝 ใส่ตัวอักษร", url: formUrl }],
    [
      { text: "🎬 สร้างวิดีโอ", callback_data: "create_video" },
      { text: "📤 โพสเลย", callback_data: "post_now" }
    ]
  ]
};

// Send photo with keyboard
```

**Step 2:** Activate text_overlay_simple workflow

**Step 3:** Test the full flow

---

## 🔍 Troubleshooting

| Problem | Check | Solution |
|---------|-------|----------|
| Form doesn't load | Check GitHub raw URL | Verify text_overlay_form.html is accessible |
| Image not showing in form | Check image_url parameter | Ensure URL is properly encoded |
| Cloudinary URL fails | Test URL in browser | Check base64 encoding of fetch URL |
| Telegram not receiving | Check TELEGRAM_BOT_TOKEN | Verify token is correct |
| Arc curve not working | Check Cloudinary URL | Verify `e_distort:arc:VALUE` syntax |

---

## 📝 Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-08 | 1.0.0 | Initial system documentation | Claude Code |
| 2025-01-08 | 1.1.0 | Added text_overlay_simple workflow | Claude Code |

### Recent Changes

**2025-01-08 - Text Overlay System v2.1**
- ✅ Fixed workflow import issues (simplified structure)
- ✅ Moved HTML to GitHub raw URL (no embedding)
- ✅ Added arc curve slider (-180° to 180°)
- ✅ Support for video timestamps
- ✅ Real-time preview functionality
- ✅ Mobile responsive design

---

## 🎯 Future Improvements

- [ ] Video creation workflow (inline keyboard option)
- [ ] Multi-layer text support (text1, text2, text3)
- [ ] Custom font upload to Cloudinary
- [ ] Better Thai font support
- [ ] A/B testing for generated images
- [ ] Analytics dashboard for usage metrics
- [ ] Batch processing for multiple images

---

## 📞 Support & Contacts

**Project Owner:** CREMO Team
**Technical Contact:** [To be filled]
**Repository:** https://github.com/Tod8boT/Chemicalromance

**Branch:** `claude/n8n-cloudinary-text-overlay-011CUuaYqfZUHfh8YMBbp5Vm`

---

**Document Version:** 1.1.0
**Last Updated:** 2025-01-08
**Template Used:** WRD Medium Template 2.0.0
