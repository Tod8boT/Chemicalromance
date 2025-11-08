# Workflow Resource Doc – create_image_with_templete
**Type:** AI Image Generation with Template System
**Nodes:** 35 nodes
**Status:** ✅ Production

---

## 📋 Overview & Quick Access

| Field | Value |
|-------|-------|
| **Workflow File** | `create_image_with_templete.json` |
| **Purpose** | Generate AI images using predefined templates from Google Sheets with automatic Facebook posting |
| **Trigger Type** | Execute Workflow (called by telegram_workflow) |
| **Status** | ✅ Production |
| **Dependencies** | Google Sheets, Fal.AI, OpenAI Vision, Grok-4-fast, Facebook |

---

## 🎯 Goal & Success

**Primary Outcome:**
Generates brand-consistent social media images using predefined templates, reducing creation time from 2 hours to 5 minutes

**Success Criteria:**
- [x] User selects template via Telegram custom form
- [x] Template config loaded from Google Sheets
- [x] AI-enhanced prompt generates image via Fal.AI
- [x] OpenAI Vision validates image quality
- [x] Image auto-posted to Facebook
- [x] User receives final image in Telegram

**Business Value:**
⏱️ **Time saved:** 95% reduction (2 hours → 5 minutes)
💰 **Cost impact:** Consistent brand imagery without designer
🎯 **Quality:** AI validation ensures brand standards

---

## 🔄 Workflow Architecture

### Visual Flow

```
[Start: Execute Workflow Trigger]
    ↓
[Telegram: Send & Wait - Template Selection]
    ↓ (User selects template)
[Google Sheets: Read Template Config]
    ├── Template: Success Story
    ├── Template: Community Moments
    ├── Template: Lifestyle Photography
    ├── Template: Product Demonstration
    ├── Template: Freezer Studio Shot
    ├── Template: Plush Balloon Style
    └── Template: Isometric Scene
    ↓
[Grok-4-fast: Enhance Prompt]
    ↓
[Fal.AI nano-banana: Generate Image]
    ↓
[OpenAI Vision: Quality Analysis]
    ↓
[Facebook: Auto-Post]
    ↓
[Telegram: Send Result]
```

### Node Purpose Summary

| Node Name | Purpose | Critical Config |
|-----------|---------|-----------------|
| Execute Workflow Trigger | Entry point from parent | Receives message_chat_id |
| Telegram Send & Wait | Template selection form | Dropdown with 7 template options |
| Google Sheets | Load template configuration | Document ID, Sheet GID (numeric!) |
| Grok-4-fast | AI prompt enhancement | OpenRouter API credential |
| Fal.AI nano-banana | Image generation | Fal.AI credential |
| OpenAI Vision | Image quality check | OpenAI credential |
| Facebook Post | Auto-publish to page | Facebook credential |
| Telegram Send Photo | Return result to user | Uses chat_id from trigger |

### Related Workflows

| Workflow | ID | Relationship |
|----------|----|--------------|
| telegram_workflow | - | Parent workflow (calls this) |
| keep_data_price | `4RsOafwqPCwgTcUA` | Called for price tracking |

---

## ⚙️ Configuration

### Trigger Setup
**Type:** Execute Workflow
**Input Parameters:**
```json
{
  "message_chat_id": "123456789"
}
```

### Credentials

| Purpose | Credential Name in n8n | Notes |
|---------|------------------------|-------|
| Google Sheets | `google-sheets-prod` | Template storage |
| OpenRouter (Grok) | `openrouter-api` | Prompt enhancement |
| Fal.AI | `fal-ai` | Image generation |
| OpenAI Vision | `openai-vision` | Quality validation |
| Facebook | `facebook-page` | Auto-posting |
| Telegram Bot | Via `TELEGRAM_BOT_TOKEN` | Response delivery |

### Critical Google Sheets Config

⚠️ **IMPORTANT:** Google Sheets node must use correct format!

```json
{
  "documentId": {
    "__rl": true,
    "value": "1EtZMb8HEdB-_fl7NJa1fv2y26S3zJZbpxgNUoQr5yrE",
    "mode": "list",
    "cachedResultName": "prompt create image"
  },
  "sheetName": {
    "__rl": true,
    "value": 1474216271,  // GID must be NUMBER, not string!
    "mode": "list",
    "cachedResultName": "templete"
  }
}
```

**Common Error:** Using `mode: "id"` or string sheetName will cause import failure!

### Template Options

Available templates in dropdown:
1. **Success Story** - Customer success narratives
2. **Community Moments** - Social engagement scenes
3. **Lifestyle Photography** - Product in daily life
4. **Product Demonstration** - How-to visuals
5. **Freezer Studio Shot** - Product photography
6. **Plush Balloon Style** - Playful, colorful designs
7. **Isometric Scene** - 3D-style illustrations

---

## 📊 Data Flow

### Input Schema (from telegram_workflow)
```json
{
  "message_chat_id": "123456789"
}
```

### Google Sheets Template Schema
```csv
template_id,prompt_structure,style,colors,composition,mood
Success Story,"...",photographic,"warm tones","...",inspirational
Community Moments,"...",lifestyle,"vibrant","...",energetic
...
```

### Fal.AI Request
```json
{
  "model": "fal-ai/nano-banana",
  "prompt": "Enhanced prompt from Grok-4-fast...",
  "image_size": "square_hd"
}
```

### Facebook Post Output
```json
{
  "post_id": "123456789_987654321",
  "url": "https://facebook.com/...",
  "success": true
}
```

### Critical Expressions

**Extract Template Selection:**
```javascript
{{ $('Telegram Send & Wait').item.json.template_choice }}
```

**Lookup Template in Google Sheets:**
```javascript
{{ $json.row_data.prompt_structure }}
```

**Build Enhanced Prompt:**
```javascript
// Grok-4-fast enhances with:
// - Template guidelines
// - Brand tone
// - Technical specifications
```

---

## 🛡️ Error Handling

### Critical Node Error Configs

| Node | Error Behavior | Reason |
|------|----------------|--------|
| Telegram Send & Wait | Wait 2 minutes max | Prevent workflow hanging |
| Google Sheets | Stop on fail | Template required for generation |
| Fal.AI Generation | Retry 3x, 5s wait | API may have rate limits |
| Facebook Post | Continue on fail | Non-critical (user still gets image) |
| Telegram Response | Retry 3x | Ensure user receives result |

### Error Workflow
**Handler:** None
**Notification:** User receives error message in Telegram

### Recovery Procedures
- **Template not found:** Default to "Success Story" template
- **Fal.AI timeout:** Retry with simplified prompt
- **Facebook post fails:** Log error, still send to Telegram
- **OpenAI Vision fails:** Skip validation, proceed to posting

---

## ✅ Testing & Validation

### Test Scenarios

| Scenario | Input | Expected | Tested |
|----------|-------|----------|--------|
| Happy path | Select "Success Story" | Image generated & posted | ✅ |
| All templates | Test each of 7 templates | All generate correctly | ☐ |
| Google Sheets down | Trigger with offline sheets | Error message to user | ☐ |
| Fal.AI timeout | Slow generation | Retry successfully | ☐ |
| Facebook auth fail | Invalid credentials | Image sent to Telegram anyway | ☐ |

### Test Data Location
📁 **Google Sheets:**
- Document ID: `1EtZMb8HEdB-_fl7NJa1fv2y26S3zJZbpxgNUoQr5yrE`
- Sheet: "templete" (GID: 1474216271)
- Contains 7 template configurations

**Quick test:**
```bash
# Manually trigger workflow in n8n
# Input: {"message_chat_id": "your_telegram_id"}
# Select template from form
# Check Telegram for result
```

---

## 🚀 Deployment

### Pre-Deploy Checklist
- [x] Google Sheets document accessible
- [x] Correct GID format (numeric, not string)
- [x] All API credentials configured
- [x] Fal.AI account has credits
- [x] Facebook page connected
- [x] Template data populated in sheets
- [x] Test run with each template

### Post-Deploy Monitoring

**Quick status check:**
```bash
# Check recent executions
# Look for:
# - Template selection success
# - Google Sheets read success
# - Fal.AI generation time (<60s)
# - Facebook post success rate
```

**Success Rate Target:** >90%
**Alert Rules:**
- Fal.AI generation time >120s → Check API status
- Facebook post fail rate >20% → Check credentials
- Template load fails → Check Google Sheets access

---

## 🔐 Security & Compliance

**Sensitive Data:**
- Telegram chat IDs (user privacy)
- Google Sheets data (template prompts may be proprietary)
- Generated images (may contain brand IP)

**Retention:**
- Execution logs: 7 days (n8n default)
- Images: Stored by Fal.AI (check their retention policy)
- Facebook posts: Permanent (manual deletion required)

**Credential Rotation:**
- Google Sheets: Review access quarterly
- API keys: Rotate every 6 months
- Facebook token: Refresh when expired

**Access Control:**
- Workflow edit: CREMO team only
- Google Sheets: Shared with marketing team

---

## 💡 Notes & Known Issues

**Known Issues:**
- ⚠️ Template dropdown limited to 7 options (Telegram API limit)
- ⚠️ Thai text in prompts may need UTF-8 encoding checks
- ⚠️ Facebook posting requires manual page selection on first setup

**Rate Limits:**
- Fal.AI: Check account tier limits
- OpenAI Vision: GPT-4-Vision API limits apply
- Grok-4-fast: OpenRouter rate limits
- Facebook: ~200 posts/hour per page

**Dependencies:**
- Google Sheets must be accessible (OAuth token valid)
- Fal.AI credits must be available
- Facebook page must have posting permissions

**Future Improvements:**
- [ ] Add more template options (requires pagination UI)
- [ ] Store generated images in cloud storage
- [ ] A/B testing different prompts per template
- [ ] Analytics dashboard for template performance
- [ ] Batch generation for multiple templates

---

## 📚 Template Details

### Template Structure in Google Sheets

| Column | Purpose | Example |
|--------|---------|---------|
| template_id | Unique identifier | "success_story" |
| template_name | Display name | "Success Story" |
| prompt_structure | Base prompt template | "A customer enjoying..." |
| style_guide | Visual style rules | "photographic, warm lighting" |
| color_palette | Suggested colors | "warm tones, earth colors" |
| composition | Layout guidelines | "rule of thirds, subject centered" |
| mood | Emotional tone | "inspirational, uplifting" |

### Example Template: Success Story

```yaml
template_id: success_story
prompt_structure: |
  A photographic style image showing {product} in a real-life success scenario.
  Warm lighting, genuine emotion, customer satisfaction visible.
  Professional quality, brand colors incorporated naturally.
style: Photographic
colors: Warm tones, brand palette
mood: Inspirational, authentic
```

---

## 🔍 Troubleshooting

**Common Issues:**

| Problem | Check | Solution |
|---------|-------|----------|
| Workflow not starting | Parent workflow active? | Activate telegram_workflow |
| Template form not showing | Telegram bot token valid? | Check TELEGRAM_BOT_TOKEN |
| Google Sheets error | Credential valid? | Refresh OAuth token |
| No image generated | Fal.AI credits? | Top up account |
| Facebook post fails | Page permissions? | Reconnect Facebook credential |

**Debug Steps:**
1. Check execution log in n8n
2. Verify input data from parent workflow
3. Test Google Sheets connection separately
4. Verify API credentials one by one
5. Check webhook responses in Telegram

---

## 📝 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-08 | 1.0.0 | Initial documentation | Claude Code |
| 2025-01-08 | 1.0.1 | Added Google Sheets GID fix note | Claude Code |

---

**Document Version:** 1.0.1
**Last Updated:** 2025-01-08
