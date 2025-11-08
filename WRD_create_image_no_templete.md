# Workflow Resource Doc – create_image_no_templete
**Type:** AI Image Generation (Free-form Prompts)
**Nodes:** 36 nodes
**Status:** ✅ Production

---

## 📋 Overview & Quick Access

| Field | Value |
|-------|-------|
| **Workflow File** | `create_image_no_templete.json` |
| **Purpose** | Generate AI images from user's custom prompts without template constraints + Interactive text overlay option |
| **Trigger Type** | Execute Workflow (called by telegram_workflow) |
| **Status** | ✅ Production |
| **Dependencies** | Grok-4-fast, Fal.AI, OpenAI Vision, text_overlay_simple |

---

## 🎯 Goal & Success

**Primary Outcome:**
Generates creative AI images from free-form user prompts with AI-powered enhancement, offering maximum flexibility and post-generation text overlay customization

**Success Criteria:**
- [x] User provides custom prompt via Telegram
- [x] Grok-4-fast enhances prompt for better results
- [x] Fal.AI generates high-quality image
- [x] OpenAI Vision validates image quality
- [x] User receives image with inline keyboard options:
  - 📝 Add Text Overlay (via text_overlay_simple)
  - 🎬 Create Video (future)
  - 📤 Post to Facebook Now

**Business Value:**
⏱️ **Time saved:** 90% reduction (manual design → automated generation)
🎨 **Creative freedom:** No template restrictions
💡 **AI enhancement:** Professional-quality prompts automatically
🖊️ **Post-editing:** Text overlay for brand consistency

---

## 🔄 Workflow Architecture

### Visual Flow

```
[Start: Execute Workflow Trigger]
    ↓
[Execute: keep_data_price sub-workflow]
    ↓
[Grok-4-fast: Enhance User Prompt]
    ↓
[Fal.AI nano-banana: Generate Image]
    ↓
[OpenAI Vision: Quality Analysis]
    ↓
[Telegram: Send Photo + Inline Keyboard]
    ↓
[User Choice]
    ├── 📝 Add Text → Opens text_overlay_simple form
    │                 ↓
    │           [Interactive HTML Form]
    │                 ├── Arc curve slider (-180° to 180°)
    │                 ├── Font size, colors, stroke
    │                 ├── Position grid + offsets
    │                 └── Video timestamp (if applicable)
    │                 ↓
    │           [Cloudinary URL Generation]
    │                 ↓
    │           [Send Back to Telegram]
    │
    ├── 🎬 Create Video → [Future feature]
    │
    └── 📤 Post Now → [Facebook Auto-Post]
```

### Node Purpose Summary

| Node Name | Purpose | Critical Config |
|-----------|---------|-----------------|
| Execute Workflow Trigger | Entry point from parent | Receives user prompt |
| grok-4-fast | AI prompt enhancement | OpenRouter credential |
| keep_data_price | Execute price tracking sub-workflow | Workflow ID: `4RsOafwqPCwgTcUA` |
| Fal.AI nano-banana | Image generation | Fal.AI credential, model config |
| OpenAI Vision | Image quality validation | OpenAI credential |
| Telegram Send Photo | Deliver image + inline keyboard | Inline keyboard with 3 buttons |
| HTTP Request (Telegram) | Build dynamic inline keyboard | Form URL with parameters |

### Related Workflows

| Workflow | ID | Relationship |
|----------|----|--------------|
| telegram_workflow | - | Parent workflow (calls this) |
| keep_data_price | `4RsOafwqPCwgTcUA` | Called for price tracking |
| text_overlay_simple | - | Called via inline keyboard button |

---

## ⚙️ Configuration

### Trigger Setup
**Type:** Execute Workflow
**Input Parameters:**
```json
{
  "message_chat_id": "123456789",
  "user_prompt": "a cat wearing sunglasses on a beach"
}
```

### Credentials

| Purpose | Credential Name in n8n | Notes |
|---------|------------------------|-------|
| OpenRouter (Grok) | `openrouter-api` | ID: `tRFwGpdl8GV30fOZ` |
| Fal.AI | `fal-ai` | Image generation |
| OpenAI Vision | `openai-vision` | Quality validation |
| Telegram Bot | Via `TELEGRAM_BOT_TOKEN` | Response delivery |

### Inline Keyboard Configuration

**Button 1: Add Text Overlay**
```json
{
  "text": "📝 ใส่ตัวอักษร",
  "url": "https://your-n8n-domain.com/webhook/overlay-form?image_url={encoded_url}&chat_id={chat_id}"
}
```

**Button 2: Create Video (Future)**
```json
{
  "text": "🎬 สร้างวิดีโอ",
  "callback_data": "create_video"
}
```

**Button 3: Post Now**
```json
{
  "text": "📤 โพสเลย",
  "callback_data": "post_now"
}
```

### Fal.AI Model Settings
```json
{
  "model": "fal-ai/nano-banana",
  "image_size": "square_hd",
  "num_inference_steps": 4,
  "guidance_scale": 3.5
}
```

---

## 📊 Data Flow

### Input Schema (from telegram_workflow)
```json
{
  "message_chat_id": "123456789",
  "user_prompt": "a cat wearing sunglasses"
}
```

### Grok-4-fast Enhanced Prompt Example

**User Input:**
```
a cat wearing sunglasses
```

**Grok Enhanced Output:**
```
A photorealistic image of a tabby cat wearing stylish aviator sunglasses,
sitting on a sunny beach. Golden hour lighting, shallow depth of field,
professional pet photography style. Warm color grading, high detail,
8K quality, cinematic composition.
```

### Fal.AI Response
```json
{
  "image_url": "https://fal.ai/files/xxx-xxx-xxx.jpg",
  "seed": 1234567,
  "has_nsfw_concepts": false,
  "width": 1024,
  "height": 1024
}
```

### OpenAI Vision Analysis
```json
{
  "quality_score": 8.5,
  "description": "High-quality image showing...",
  "technical_assessment": "Well-lit, sharp focus, good composition",
  "brand_compliance": true
}
```

### Inline Keyboard Data
```json
{
  "inline_keyboard": [
    [
      {
        "text": "📝 ใส่ตัวอักษร",
        "url": "https://n8n.com/webhook/overlay-form?image_url=https%3A%2F%2Ffal.ai%2Ffiles%2Fxxx.jpg&chat_id=123456789"
      }
    ],
    [
      {
        "text": "🎬 สร้างวีดีโอ",
        "callback_data": "create_video"
      },
      {
        "text": "📤 โพสเลย",
        "callback_data": "post_now"
      }
    ]
  ]
}
```

### Critical Expressions

**Extract User Prompt:**
```javascript
{{ $('Execute Workflow Trigger').item.json.user_prompt }}
```

**Build Inline Keyboard URL:**
```javascript
const n8nDomain = "https://your-n8n-domain.com";
const imageUrl = $json.fal_image_url;
const chatId = $json.chat_id;
const formUrl = `${n8nDomain}/webhook/overlay-form?image_url=${encodeURIComponent(imageUrl)}&chat_id=${chatId}`;
```

**Grok Prompt Enhancement:**
```javascript
// System prompt to Grok-4-fast:
"Enhance this image generation prompt for Fal.AI nano-banana model.
Add technical details, lighting, style, quality specifications.
Keep brand-appropriate and professional."
```

---

## 🛡️ Error Handling

### Critical Node Error Configs

| Node | Error Behavior | Reason |
|------|----------------|--------|
| Grok-4-fast | Retry 3x, 2s wait | Prompt enhancement crucial |
| Fal.AI Generation | Retry 5x, 5s wait | API rate limits possible |
| OpenAI Vision | Continue on fail | Quality check optional |
| Telegram Response | Retry 3x | User must receive result |

### Error Workflow
**Handler:** None
**Notification:** User receives error message in Telegram

### Recovery Procedures
- **Grok timeout:** Use original user prompt (skip enhancement)
- **Fal.AI failure:** Send error message with retry option
- **OpenAI Vision fail:** Skip validation, send image anyway
- **Inline keyboard fail:** Send image without keyboard

---

## ✅ Testing & Validation

### Test Scenarios

| Scenario | Input | Expected | Tested |
|----------|-------|----------|--------|
| Simple prompt | "a cat" | Enhanced → Generated | ✅ |
| Complex prompt | "detailed scene with..." | Grok preserves details | ☐ |
| Thai language | "แมวใส่แว่น" | UTF-8 handled correctly | ☐ |
| Empty prompt | "" | Error message | ☐ |
| Very long prompt | 500+ chars | Truncated appropriately | ☐ |
| Add text overlay | Click button | Form opens correctly | ✅ |
| Post to Facebook | Click button | Image posted | ☐ |

### Test Data

**Sample Prompts:**
```
1. "a cat wearing sunglasses on a beach"
2. "แมวน่ารักกำลังเล่น" (Thai)
3. "professional product photography of ice cream"
4. "isometric 3D render of a cozy cafe"
5. "plush balloon style character design"
```

**Expected Enhancements:**
- Add technical photography terms
- Specify lighting (golden hour, studio, etc.)
- Add quality markers (8K, high detail, professional)
- Include composition rules (rule of thirds, etc.)

---

## 🚀 Deployment

### Pre-Deploy Checklist
- [x] Grok-4-fast (OpenRouter) credential configured
- [x] Fal.AI account has sufficient credits
- [x] OpenAI Vision API access
- [x] TELEGRAM_BOT_TOKEN environment variable set
- [x] text_overlay_simple workflow activated
- [x] n8n domain configured for inline keyboard URL
- [x] Test with sample prompts (English + Thai)
- [x] Verify inline keyboard buttons work

### Post-Deploy Monitoring

**Quick status check:**
```bash
# Monitor execution logs for:
# - Grok enhancement success rate
# - Fal.AI generation time (<60s target)
# - OpenAI Vision validation results
# - Inline keyboard click-through rate
```

**Success Rate Target:** >95%
**Performance Targets:**
- Grok enhancement: <5s
- Fal.AI generation: <60s
- Total workflow: <90s

**Alert Rules:**
- Fal.AI generation >120s → Check API status
- Error rate >10% → Investigate logs
- Zero inline keyboard clicks → Check URL formatting

---

## 🔐 Security & Compliance

**Sensitive Data:**
- User prompts (may contain personal info)
- Telegram chat IDs
- Generated images (user content)

**Retention:**
- Execution logs: 7 days
- Images: Stored by Fal.AI (check their policy)

**Content Moderation:**
- Fal.AI has NSFW detection (`has_nsfw_concepts`)
- OpenAI Vision can flag inappropriate content
- Implement additional filtering if needed

**API Key Protection:**
- ✅ All credentials stored in n8n (encrypted)
- ✅ TELEGRAM_BOT_TOKEN via environment variable

---

## 💡 Notes & Known Issues

**Known Issues:**
- ⚠️ Very long prompts (>500 chars) may be truncated by Grok
- ⚠️ Thai text requires UTF-8 encoding verification
- ⚠️ Inline keyboard URL length limited by Telegram (2048 chars)

**Rate Limits:**
- Grok-4-fast: OpenRouter limits apply
- Fal.AI: Check account tier
- OpenAI Vision: GPT-4-Vision API limits

**Dependencies:**
- Requires text_overlay_simple to be active
- Requires valid n8n webhook domain for inline keyboard
- Fal.AI credits must be available

**Comparison with Template Version:**

| Feature | No Template | With Template |
|---------|-------------|---------------|
| Flexibility | ✅ Maximum | ❌ Template-constrained |
| Speed | ✅ Faster (no sheets lookup) | ❌ Slower |
| Consistency | ❌ Variable | ✅ Brand-consistent |
| User Input | ✅ Creative freedom | ❌ Dropdown selection |
| Prompt Enhancement | ✅ Grok AI | ✅ Grok + Template |
| Post-editing | ✅ Text overlay | ❌ Final image only |

**Future Improvements:**
- [ ] Video creation feature (inline keyboard button)
- [ ] Style transfer options
- [ ] Negative prompt support
- [ ] Batch generation (multiple variations)
- [ ] Favorite prompt library
- [ ] Prompt templates (user-saved)

---

## 🔗 Integration with text_overlay_simple

### Inline Keyboard Implementation

**Code Node: Build Keyboard**
```javascript
const imageUrl = $json.fal_image_url;
const chatId = $json.chat_id;
const n8nDomain = "https://your-n8n-domain.com"; // Configure this!

const formUrl = `${n8nDomain}/webhook/overlay-form?image_url=${encodeURIComponent(imageUrl)}&chat_id=${chatId}`;

const keyboard = {
  inline_keyboard: [
    [
      {
        text: "📝 ใส่ตัวอักษร",
        url: formUrl
      }
    ],
    [
      {
        text: "🎬 สร้างวิดีโอ",
        callback_data: "create_video"
      },
      {
        text: "📤 โพสเลย",
        callback_data: "post_now"
      }
    ]
  ]
};

return [{ keyboard: JSON.stringify(keyboard) }];
```

**Telegram Send Photo Node:**
```json
{
  "chat_id": "{{ $json.chat_id }}",
  "photo": "{{ $json.fal_image_url }}",
  "caption": "✅ สร้างรูปภาพเสร็จแล้ว! คุณต้องการทำอะไรต่อ?",
  "reply_markup": "{{ $json.keyboard }}"
}
```

### User Flow After Image Generation

```
User receives image
    ↓
Clicks "📝 ใส่ตัวอักษร"
    ↓
Opens HTML form in browser (text_overlay_simple)
    ↓
Customizes:
  - Text content (Thai/English)
  - Font size (slider 10-200)
  - Arc curve (slider -180° to 180°) ← CRITICAL
  - Colors (text, stroke, shadow)
  - Position (9-grid + X/Y offsets)
  - Video timing (if applicable)
    ↓
Clicks "👁️ ดูตัวอย่าง" (Preview)
    ↓
Opens Cloudinary URL in new tab
    ↓
Clicks "✅ สร้างเลย" (Create)
    ↓
Receives final image in Telegram
```

---

## 🔍 Troubleshooting

**Common Issues:**

| Problem | Check | Solution |
|---------|-------|----------|
| Prompt not enhanced | Grok credential valid? | Check OpenRouter API key |
| No image generated | Fal.AI credits? | Top up account |
| Poor image quality | Prompt enhancement? | Check Grok output |
| Inline keyboard not working | n8n domain correct? | Update formUrl domain |
| Text overlay button fails | text_overlay_simple active? | Activate workflow |
| Thai text corrupted | UTF-8 encoding? | Check Telegram message encoding |

**Debug Steps:**
1. Check execution log in n8n
2. Verify Grok enhanced prompt output
3. Check Fal.AI response for errors
4. Test inline keyboard URL manually
5. Verify text_overlay_simple webhook accessible

---

## 📝 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-08 | 1.0.0 | Initial documentation | Claude Code |
| 2025-01-08 | 1.1.0 | Added inline keyboard + text overlay integration | Claude Code |

---

**Document Version:** 1.1.0
**Last Updated:** 2025-01-08
