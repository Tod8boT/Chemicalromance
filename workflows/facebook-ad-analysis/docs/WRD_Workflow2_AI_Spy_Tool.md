# Workflow Resource Doc: AI Facebook Ad Spy Tool

---

## 📋 Overview & Quick Access

| Field | Value |
|-------|-------|
| **Workflow ID** | N/A (Import from file) |
| **File** | `reference-workflows/ai-spy-tool.json` |
| **Purpose** | AI-powered analysis of competitor Facebook ads (video, image, text) with content generation |
| **Status** | ✅ Production Ready (with pinned test data) |

---

## 🎯 Goal & Success

**Primary Outcome:**  
Analyzes competitor ad creatives using AI to generate insights, rewritten ad copy, and image/video prompts for reproduction

**Success Criteria:**
- [x] Video ads analyzed with Google Gemini 2.0 Flash
- [x] Image ads analyzed with GPT-4o Vision
- [x] Text ads analyzed with GPT-4.1
- [x] All results stored in Google Sheets with actionable outputs

**Business Value:**  
⏱️ Time saved: ~15 hours/week (manual ad analysis and copywriting)  
💡 Creative insights: AI-generated prompts for designers  
📊 Competitive intelligence: Understanding what works for competitors

---

## 🔄 Workflow Architecture

### Visual Flow

```
[Manual Trigger: Download Video]
    ↓
[Switch: Display Format]
    ├─ VIDEO → [Download Video] → [Upload to Google Drive] → [Gemini 2.0 Analysis] → [GPT-4.1 Summary] → [Save to Sheets]
    ├─ IMAGE/MULTI_IMAGES → [GPT-4o Vision Analysis] → [GPT-4.1 Summary] → [Save to Sheets]
    └─ TEXT → [GPT-4.1 Text Analysis] → [Save to Sheets]
```

### Node Purpose Summary

| Node Name | Type | Purpose | Critical Config |
|-----------|------|---------|-----------------|
| Download Video | `n8n-nodes-base.manualTrigger` | Entry point with pinned ad data | Has pinData with real ad examples |
| Switch: Display Format | `n8n-nodes-base.switch` | Routes by ad type | Rules: VIDEO, IMAGE, MULTI_IMAGES, TEXT |
| HTTP Request (Video) | `n8n-nodes-base.httpRequest` | Download video file | Downloads from Facebook CDN |
| Google Drive Upload | `n8n-nodes-base.googleDrive` | Upload video for Gemini | Required for Gemini video analysis |
| Analyze Video with Gemini | `@n8n/n8n-nodes-langchain.lmChatGoogleGemini` | AI video analysis | Model: gemini-2.0-flash-exp |
| Analyze Image | `@n8n/n8n-nodes-langchain.lmChatOpenAi` | AI image analysis | Model: gpt-4o (vision) |
| GPT-4.1 Summary | `@n8n/n8n-nodes-langchain.lmChatOpenAi` | Generate summary + copy | Structured JSON output |
| Save to Sheets | `n8n-nodes-base.googleSheets` | Store analysis results | 4 columns: summary, rewritten_ad_copy, image/video_prompt |

### Related Workflows

| Workflow | ID | Relationship |
|----------|----|--------------| 
| APIFY Scraper | `reference-workflows/apify-scraper.json` | Provides source ad data |
| Facebook Ad Analysis | `workflow.json` | Consumes AI insights for A/B testing |

---

## ⚙️ Configuration

### Trigger Setup

**Type:** Manual Trigger with Pinned Data  
**Purpose:** Test/demonstrate workflow with real competitor ad data

**Pinned Data Example:**
```json
{
  "pageInfo": {
    "page": {
      "name": "ไอศครีมครีโม",
      "id": "694634120405666"
    }
  },
  "adArchiveId": "1774534643171041",
  "snapshot": {
    "displayFormat": "VIDEO",
    "ctaType": "LIKE_PAGE",
    "ctaText": "Like Page",
    "videos": [
      {
        "video_hd_url": "https://...",
        "video_sd_url": "https://..."
      }
    ]
  }
}
```

### Credentials

| Purpose | Credential Name | Notes |
|---------|----------------|-------|
| OpenAI API | `openAiApi` | GPT-4o Vision + GPT-4.1 |
| Google Gemini | `googleGeminiOAuth2Api` | Gemini 2.0 Flash for video |
| Google Drive | `googleDriveOAuth2Api` | Video upload for Gemini |
| Google Sheets | `googleSheetsOAuth2Api` | Results storage |

### Key Settings

**AI Models Used:**
1. **Google Gemini 2.0 Flash** (Video Analysis)
   - Analyzes video content, style, transitions
   - Generates detailed video prompt for reproduction
   
2. **GPT-4o Vision** (Image Analysis)  
   - Analyzes visual elements, colors, composition
   - Generates image prompt for designers

3. **GPT-4.1** (Text + Summary Generation)
   - Summarizes ad strategy
   - Rewrites ad copy in different tone
   - Creates structured JSON output

**Output Schema (Structured JSON):**
```json
{
  "summary": "Brief analysis of ad effectiveness",
  "rewrittenAdCopy": "Alternative version of the ad copy",
  "imagePrompt": "Prompt for image generation" (or empty),
  "videoPrompt": "Prompt for video creation" (or empty)
}
```

---

## 📊 Data Flow

### Input Schema (From APIFY Scraper)

```json
{
  "pageInfo": {
    "page": {
      "name": "string",
      "id": "string"
    }
  },
  "adArchiveId": "string",
  "snapshot": {
    "displayFormat": "VIDEO|IMAGE|MULTI_IMAGES|TEXT",
    "ctaType": "LIKE_PAGE|MESSAGE_PAGE|...",
    "ctaText": "string",
    "body": {
      "text": "string"
    },
    "videos": [
      {
        "video_hd_url": "string",
        "video_sd_url": "string"
      }
    ],
    "images": [
      {
        "resized_image_url": "string",
        "original_image_url": "string"
      }
    ]
  }
}
```

### Output Schema (To Google Sheets)

**Columns:**
- `summary` - AI-generated analysis (200-300 words)
- `rewritten_ad_copy` - Alternative ad copy
- `image_prompt` - For image ads (empty for video/text)
- `video_prompt` - For video ads (empty for image/text)

**Example Output:**
```json
{
  "summary": "This ad uses emotional storytelling with bright colors to attract families. The CTA 'Like Page' is soft, building brand awareness rather than direct sales.",
  "rewritten_ad_copy": "Discover delicious ice cream flavors that bring your family together. Like our page for exclusive offers!",
  "image_prompt": "Vibrant ice cream cone with colorful toppings, happy family in background, bright summer day, professional photography",
  "video_prompt": ""
}
```

### Critical Expressions

**Video URL Selection (HTTP Request):**
```javascript
{{ $json.snapshot.videos[0].video_hd_url || $json.snapshot.videos[0].video_sd_url }}
```

**Image URL Selection (GPT-4o):**
```javascript
{{ $json.snapshot.images[0].resized_image_url || $json.snapshot.images[0].original_image_url }}
```

**Ad Copy Extraction (Text Analysis):**
```javascript
{{ $json.snapshot.body.text }}
```

---

## 🛡️ Error Handling

### Known Limitations

- **Video Size Limits:** Google Drive upload may fail for videos >100MB
- **Gemini Rate Limits:** Free tier limited to 15 RPM
- **GPT-4o Vision:** Only processes first image in MULTI_IMAGES ads
- **Facebook CDN:** Video URLs may expire after 24 hours

### Error Workflow

**Handler:** None configured  
**Notifications:** Manual check of Google Sheets results

### Recovery Procedures

- **Video download fails:** Re-run after checking URL validity
- **Gemini timeout:** Retry with shorter video or use SD quality
- **GPT-4o error:** Check API credits and rate limits
- **Empty results:** Verify AI responses are valid JSON

---

## ✅ Testing & Validation

### Test Scenarios

| Scenario | Input | Expected | Tested |
|----------|-------|----------|--------|
| Video ad | Pinned data | Gemini analysis + video prompt | ✅ |
| Image ad | Single image URL | GPT-4o analysis + image prompt | ✅ |
| Multi-image ad | Multiple images | Analyzes first image only | ⚠️ |
| Text-only ad | Body text | Summary + rewritten copy | ✅ |

### Test Data Location

📁 **Pinned Data:** Embedded in workflow JSON (`pinData` section)  
📊 **Results:** Google Sheets (check each run)

**Quick test:**
```
1. Open workflow in n8n
2. Click "Execute Workflow" (uses pinned data)
3. Check Google Sheets for output
```

---

## 🚀 Deployment

### Pre-Deploy Checklist

- [x] OpenAI credential configured (GPT-4o + GPT-4.1 access)
- [x] Google Gemini credential configured
- [x] Google Drive credential configured
- [x] Google Sheets credential configured
- [x] Test with pinned data
- [ ] Replace manual trigger with Data Table reader

### Post-Deploy Monitoring

**Monitoring Schedule:** After each run  
**Success Rate Target:** >85% (AI may fail on poor quality videos)

**Check Points:**
- Google Sheets row count matches input ads
- All 4 columns have data (no empty summaries)
- Video/image prompts are actionable for designers
- Rewritten copy maintains brand voice

---

## 🔐 Security & Compliance

**Sensitive Data:** Competitor ad content (publicly available)  
**Retention:** Indefinite in Google Sheets  
**Credential Rotation:** API keys quarterly  
**Access Control:** Team members with n8n access

**Compliance Notes:** 
- Uses publicly available ad data from Facebook Ad Library
- AI analysis for competitive intelligence (legal use)
- No scraping of private/restricted content

---

## 📊 Output Data Usage

**Consumed By:**
1. **Facebook Ad Analysis** (`workflow.json`)
   - Uses `summary` for trend analysis
   - Uses `image_prompt` / `video_prompt` for A/B test generation
   - Uses `rewritten_ad_copy` for copy variations

2. **Design Team**
   - Uses prompts to create similar creative assets
   - References analysis for visual style

3. **Marketing Team**
   - Uses rewritten copy as inspiration
   - Reviews competitor strategies

**Export Method:**
- Direct read from Google Sheets
- Manual copy-paste for quick use

---

## 📚 Quick Reference

### Important Settings

| Setting | Value |
|---------|-------|
| Google Sheets ID | (Configure in workflow) |
| Video Quality | HD preferred, SD fallback |
| AI Models | Gemini 2.0 Flash, GPT-4o, GPT-4.1 |

### AI Model Costs (Approximate)

- Gemini 2.0 Flash: Free tier available
- GPT-4o Vision: $0.01 per image
- GPT-4.1: $0.01 per 1K tokens

**Estimated Cost Per Ad:**
- Video: ~$0.05 (Gemini + GPT-4.1)
- Image: ~$0.02 (GPT-4o + GPT-4.1)
- Text: ~$0.005 (GPT-4.1 only)

---

## 💡 Notes & Known Issues

**Known Issues:**
- Multi-image ads only analyze first image (limitation)
- Video upload to Google Drive can be slow (2-3 min for large files)
- Gemini may refuse to analyze ads with people's faces (policy)

**Rate Limits:**
- Gemini Free Tier: 15 requests/minute
- GPT-4o: 500 requests/minute (depends on tier)
- Google Drive Upload: No specific limit

**Dependencies:**
- Valid OpenAI API key with GPT-4o access
- Google Gemini API access
- Google Drive storage space (videos accumulate)

**Future Improvements:**
- [ ] Auto-delete videos from Drive after analysis
- [ ] Support multi-image analysis (all images)
- [ ] Add sentiment analysis to summary
- [ ] Generate multiple copy variations
- [ ] Add Cloudinary integration for image storage

---

## 🔍 Troubleshooting

**Common Issues:**

| Problem | Solution |
|---------|----------|
| Video download fails | Check URL expiry, use SD quality |
| Gemini timeout | Reduce video length or quality |
| Empty image_prompt | Verify GPT-4o Vision is enabled |
| JSON parse error | Check AI response format in debug |
| Drive upload fails | Check credential and storage space |

---

## 🎨 AI Prompt Engineering

### Video Analysis Prompt (Gemini)

```
Analyze this Facebook video ad:
- Describe visual style, colors, transitions
- Identify target audience
- Note emotional tone
- Generate a detailed video prompt for reproduction
```

### Image Analysis Prompt (GPT-4o Vision)

```
Analyze this ad image and create a detailed prompt for image generation that captures:
- Visual style and composition
- Colors and lighting
- Text/typography (if any)
- Emotional appeal
```

### Summary Generation Prompt (GPT-4.1)

```
Analyze this competitor ad and provide:
{
  "summary": "Brief strategic analysis",
  "rewrittenAdCopy": "Alternative version maintaining intent"
}
```

---

**Document Version:** 1.0.0  
**Created:** 2025-11-08  
**Status:** ✅ Production Ready (with test data)
