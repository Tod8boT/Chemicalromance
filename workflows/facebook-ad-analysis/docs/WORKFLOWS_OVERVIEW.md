# CREMO Facebook Ad Workflows - Documentation

**Project:** CREMO Ice Cream Franchise Marketing Intelligence
**Status:** ✅ Production Ready
**Last Updated:** 2025-11-08

---

## 📋 Workflows Overview

| Workflow | Purpose | Status | Input | Output |
|----------|---------|--------|-------|--------|
| [APIFY Facebook Ad Library Scraper](#1-apify-facebook-ad-library-scraper) | ดึงข้อมูลคู่แข่ง (Pages, Posts, Ads) | ✅ Active | Facebook URL via Chat | n8n Data Table + Google Sheets |
| [AI Facebook Ad Spy Tool](#2-ai-facebook-ad-spy-tool) | วิเคราะห์โฆษณาด้วย AI | ✅ Active | Apify Dataset | Google Sheets (analyzed ads) |
| [Facebook Ad Analysis & A/B Testing](#3-facebook-ad-analysis--ab-testing) | สร้าง A/B test recommendations | 🆕 New | Google Sheets | Analysis + Test Queue |

---

## 1. APIFY Facebook Ad Library Scraper

### 🎯 Goal
ดึงข้อมูลคู่แข่งจาก Facebook โดยอัตโนมัติ เก็บข้อมูลหลายชั้น: Page → Posts → Ads

### 🔄 Workflow Flow
```
Chat Trigger (input Facebook URL)
    ↓
Facebook Pages Scraper (Apify)
    ↓
├─→ Get Page Data (followers, likes, rating)
└─→ Price Sheet Tracking
    ↓
Insert to Data Table → Merge
    ↓
[Parallel Processing]
├─→ Facebook Posts Scraper (Apify)
│       ↓
│   Get Post Data (engagement, views)
│       ↓
│   Summarize (max likes/views)
│
└─→ Facebook Ads Scraper (Apify)
        ↓
    Get Ads Data (format, CTA, copy)
        ↓
    Count Active Ads
        ↓
Merge All → Update Data Table → Telegram Notification
```

### 📊 Data Captured

**Page Level:**
```
- page_name, facebookUrl, page_id
- likes, followers, rating
- categories, phone, address
- creation_date, is_active
```

**Post Level:**
```
- postId, time_post, text
- likes, shares, comments, viewsCount
- media type, link
```

**Ads Level:**
```
- adArchiveID, displayFormat
- ctaText, ctaType
- ad_body_text, isActive
- startDate, endDate
- images/videos URLs
```

### 🗄️ Storage
- **Primary:** n8n Data Tables
  - `page_list` - ข้อมูลเพจ
  - `ads_page_in_list` - รายการโฆษณา
  - `post_page_data` - ข้อมูลโพสต์
- **Tracking:** Google Sheets (price usage)
- **Notification:** Telegram

### ⚙️ Key Nodes
| Node | Type | Purpose |
|------|------|---------|
| When chat message received | Chat Trigger | รับ Facebook URL |
| Facebook Pages Scraper | Apify | ดึงข้อมูลเพจ |
| Facebook Posts Scraper | Apify | ดึงโพสต์ล่าสุด (10 posts) |
| Facebook Ads Scraper | Apify | ดึงโฆษณา (10 ads) |
| Summarize | Built-in | หา max engagement |
| Insert row / Upsert row | Data Table | บันทึกข้อมูล |

### 🔑 Credentials Required
- Apify API (3 accounts: linemind, todxongdur, tripletreeandyun)
- Google Sheets OAuth2
- Telegram API

### 📈 Success Metrics
- ✅ ดึงข้อมูลได้ครบ 3 ชั้น (Page, Posts, Ads)
- ✅ เก็บลง Data Table สำเร็จ
- ✅ ส่ง Telegram notification

---

## 2. AI Facebook Ad Spy Tool

### 🎯 Goal
วิเคราะห์โฆษณาคู่แข่งด้วย AI (GPT-4o, Gemini 2.0) แล้วสร้าง insights + rewritten copy

### 🔄 Workflow Flow
```
Get Dataset Items (from Apify)
    ↓
Check Operation Status
    ↓
[Split by Ad Type]
├─→ VIDEO Ads
│   ├─→ Download Video
│   ├─→ Upload to Google Drive
│   ├─→ Redownload (get proper format)
│   ├─→ Upload to Gemini (resumable upload)
│   └─→ Analyze Video with Gemini
│
├─→ IMAGE Ads
│   ├─→ Analyze Image (GPT-4o Vision)
│   └─→ Output Summary (GPT-4.1)
│
└─→ TEXT Ads
    └─→ Output Summary (GPT-4.1)
    ↓
Save to Google Sheets
```

### 🤖 AI Processing

**For Videos (Gemini 2.0 Flash):**
```
1. Download video
2. Upload to Google Drive (temporary)
3. Send to Gemini API (file upload)
4. Get visual + audio description
```

**For Images (GPT-4o):**
```
1. Analyze image with Vision API
2. Get comprehensive description
3. Generate summary + rewritten copy
```

**For Text (GPT-4.1):**
```
1. Parse ad text
2. Generate summary
3. Rewrite copy with strategic improvements
```

### 📊 Output Schema
```json
{
  "ad_archive_id": "string",
  "page_id": "string",
  "page_name": "string",
  "page_url": "string",
  "type": "video|image|text",
  "date_added": "ISO8601",
  "summary": "AI analysis",
  "rewritten_ad_copy": "improved version",
  "image_prompt": "description for images",
  "video_prompt": "description for videos"
}
```

### 🗄️ Storage
- **Output:** Google Sheets (`Facebook Ad Library Scraper`)
- **Temporary:** Google Drive (videos only)

### ⚙️ Key Nodes
| Node | Type | Purpose |
|------|------|---------|
| Get dataset items | Apify | ดึงข้อมูลจาก dataset |
| Loop Over [Type] Ads | Split in Batches | แยกประเภทโฆษณา |
| Analyze Image | OpenAI Vision | วิเคราะห์รูปภาพ |
| Analyze Video | Gemini | วิเคราะห์วิดีโอ |
| Output Summary | GPT-4.1 | สรุปและเขียนใหม่ |
| Wait (1-30s) | Built-in | Rate limiting |

### 🔑 Credentials Required
- Apify API
- Google Drive OAuth2
- Google Sheets OAuth2
- OpenAI API (GPT-4o, GPT-4.1)
- Gemini API (with file upload)

### 📈 Success Metrics
- ✅ วิเคราะห์ได้ทั้ง 3 ประเภท (Video, Image, Text)
- ✅ AI summary ครบถ้วน
- ✅ Rewritten copy มีคุณภาพ

### ⚠️ Rate Limits
- Gemini: Wait 1s between requests
- OpenAI: Batch processing with waits
- Google Drive: Upload limits

---

## 3. Facebook Ad Analysis & A/B Testing

### 🎯 Goal
รวบรวมข้อมูลคู่แข่ง + Templates + Market Intelligence → AI วิเคราะห์ → สร้าง A/B test recommendations

### 🔄 Workflow Flow
```
Manual Trigger (Test workflow button)
    ↓
[Parallel Read]
├─→ Read Competitor Data (from Sheet)
├─→ Read CREMO Templates (from Sheet)
└─→ Read Market Intelligence (from Sheet)
    ↓
[Set Nodes - จัดรูปแบบข้อมูล]
├─→ Set Competitor
├─→ Set Templates
└─→ Set Intel
    ↓
Merge Data (combine by position)
    ↓
AI Analysis (GPT-4o)
├─ System: "Facebook Ads strategist"
└─ User: Send all 3 data sources
    ↓
Parse AI Response (handle errors)
    ↓
[Split Output]
├─→ Save Analysis Summary
│   (performance_gap, insights, regional_focus)
└─→ Split Tests → Save A/B Tests
    (test_id, template, image_prompt, ad_copy)
```

### 📊 Input Data Sources

**1. Competitor_Data (from workflows 1 & 2):**
```
page_name, page_likes, display_format
cta_type, ad_body_text
likes, shares, comments, viewsCount
```

**2. CREMO_Templates:**
```
Template_Name, Category
AI_Instructions, Prompt_Template
Primary_Message, Status
```

**3. Market_Intelligence:**
```
Analysis_ID, Data_Type
Key_Insights (trends, regional preferences)
Performance_Metrics, Summary
```

### 🤖 AI Analysis Output
```json
{
  "analysis": {
    "performance_gap": "ช่องว่างระหว่างเรากับคู่แข่ง",
    "key_insights": ["insight 1", "insight 2"],
    "opportunities": ["opportunity 1", "opportunity 2"]
  },
  "recommendations": {
    "template_matches": [
      {"template": "Success Story", "reason": "เหมาะกับ..."}
    ],
    "regional_focus": "ภาคใต้",
    "tone_style": "warm, community-focused"
  },
  "ab_tests": [
    {
      "test_id": "A1",
      "variation": "Success Story - Golden Hour",
      "template": "Success Story",
      "image_prompt": "A photorealistic image...",
      "ad_copy": "สนใจลงตู้ไอศกรีม...",
      "cta": "สนใจทักเลย",
      "expected_impact": "+30% engagement"
    }
  ]
}
```

### 📊 Output Sheets

**Sheet: Analysis_Results**
```
timestamp | performance_gap | key_insights | opportunities | regional_focus | ab_test_count
```

**Sheet: AB_Test_Queue**
```
timestamp | test_id | template | variation | image_prompt | ad_copy | cta | expected_impact | status
```

### ⚙️ Key Nodes
| Node | Type | Purpose |
|------|------|---------|
| Manual Trigger | Trigger | คลิกทดสอบ |
| Read Competitor Data | Google Sheets | อ่านข้อมูลคู่แข่ง |
| Read Templates | Google Sheets | อ่าน CREMO templates |
| Read Market Intel | Google Sheets | อ่าน intelligence |
| Set [Type] | Set | จัดรูปแบบข้อมูล |
| Merge Data | Merge | รวมข้อมูลทั้ง 3 |
| AI Analysis | OpenAI | วิเคราะห์ด้วย GPT-4o |
| Parse Response | Code | จัดการ JSON + errors |
| Split Tests | Split Out | แยก A/B tests |
| Save Analysis/Tests | Google Sheets | บันทึกผลลัพธ์ |

### 🔑 Credentials Required
- Google Sheets OAuth2 (5 nodes)
- OpenAI API (GPT-4o)

### 📈 Success Metrics
- ✅ อ่านข้อมูลครบทั้ง 3 sources
- ✅ AI response เป็น valid JSON
- ✅ สร้าง A/B tests 3-5 รูปแบบ
- ✅ บันทึกลง Google Sheets สำเร็จ

### 🎯 Business Value
⏱️ **Time Saved:** 2-3 hours/week (manual analysis)
💡 **Insights:** Data-driven A/B test ideas
🚀 **Impact:** Ready-to-use prompts + ad copy

---

## 🔗 Workflow Dependencies

```
┌─────────────────────────────────────┐
│  APIFY Facebook Ad Library Scraper  │ (1)
│  Output: Competitor Data            │
└──────────────┬──────────────────────┘
               ↓
┌──────────────┴──────────────────────┐
│  AI Facebook Ad Spy Tool            │ (2)
│  Input: Apify Dataset               │
│  Output: AI-analyzed Ads            │
└──────────────┬──────────────────────┘
               ↓
               │ (Export to Google Sheets)
               ↓
┌──────────────┴──────────────────────┐
│  Facebook Ad Analysis & A/B Testing │ (3)
│  Input: Sheets (1+2) + Templates    │
│  Output: A/B Test Recommendations   │
└─────────────────────────────────────┘
```

---

## 📦 Google Sheets Structure

### Required Sheets

**Sheet: `Competitor_Data`** (populated from workflows 1 & 2)
```
Headers: page_name | page_likes | display_format | cta_type | ad_body_text |
         likes | shares | comments | viewsCount | collation_count
```

**Sheet: `CREMO_Templates`** (static data)
```
Source: 🎨 CREMO Template Master CSV
Headers: Template_Name | AI_Instructions | Category | Primary_Message |
         Prompt_Template | Status
```

**Sheet: `Market_Intelligence`** (static data)
```
Source: 📈 CREMO Market Intelligence CSV
Headers: Analysis_ID | Data_Type | Key_Insights | Source | Status | Summary
```

**Sheet: `Analysis_Results`** (workflow 3 output)
```
Headers: timestamp | performance_gap | key_insights | opportunities |
         regional_focus | ab_test_count
```

**Sheet: `AB_Test_Queue`** (workflow 3 output)
```
Headers: timestamp | test_id | template | variation | image_prompt |
         ad_copy | cta | expected_impact | status
```

---

## 🔧 Setup Instructions

### 1. Run Workflows in Order

**Step 1:** Run `APIFY Facebook Ad Library Scraper`
- Input: Competitor Facebook page URLs
- Output: Data Tables populated

**Step 2:** Run `AI Facebook Ad Spy Tool`
- Automatically processes Apify datasets
- Output: Analyzed ads in Google Sheets

**Step 3:** Export to `Competitor_Data` sheet
- Manually or via n8n node
- Combine data from workflows 1 & 2

**Step 4:** Run `Facebook Ad Analysis & A/B Testing`
- Reads from Google Sheets
- Generates recommendations

### 2. Required Credentials

**Apify:**
- 3 accounts for rate limiting
- API tokens stored in n8n credentials

**Google:**
- Google Sheets OAuth2
- Google Drive OAuth2 (for video processing)

**AI Services:**
- OpenAI API (GPT-4o, GPT-4.1, Vision)
- Google Gemini API (with file upload access)

**Notifications:**
- Telegram Bot API

### 3. Data Tables (n8n)
```
Create these tables in n8n:
- page_list
- ads_page_in_list
- post_page_data
```

---

## 📊 Data Flow Summary

```
┌─────────────┐
│ Competitors │
│ FB Pages    │
└──────┬──────┘
       │
       ↓ (Workflow 1: Scrape)
┌──────┴──────────────────┐
│ Data Tables + Sheets    │
│ - Pages, Posts, Ads     │
└──────┬──────────────────┘
       │
       ↓ (Workflow 2: AI Analysis)
┌──────┴──────────────────┐
│ Analyzed Ads            │
│ - Summary, Prompts      │
└──────┬──────────────────┘
       │
       ↓ (Export + Add Templates/Intel)
┌──────┴──────────────────┐
│ Google Sheets           │
│ - Competitor_Data       │
│ - CREMO_Templates       │
│ - Market_Intelligence   │
└──────┬──────────────────┘
       │
       ↓ (Workflow 3: Strategic Analysis)
┌──────┴──────────────────┐
│ A/B Test Queue          │
│ - 3-5 test ideas        │
│ - Ready-to-use prompts  │
│ - Strategic insights    │
└─────────────────────────┘
```

---

## 💡 Best Practices

### Running Workflows
1. **Workflow 1:** Run daily for competitor monitoring
2. **Workflow 2:** Run after workflow 1 completes
3. **Workflow 3:** Run weekly for strategic planning

### Data Quality
- ✅ Clean duplicate entries in Competitor_Data
- ✅ Update Templates as new categories emerge
- ✅ Add Market Intelligence findings regularly

### Cost Optimization
- 💰 Use Apify credits wisely (3 accounts for rotation)
- 💰 Batch AI requests to minimize API calls
- 💰 Set result limits (10 posts, 10 ads per page)

### Monitoring
- 📊 Check Telegram notifications for workflow completion
- 📊 Review Google Sheets for data quality
- 📊 Monitor Apify usage dashboard

---

## 🚀 Next Steps

### Enhancements
- [ ] Add own page data (Facebook Graph API)
- [ ] Automate Competitor_Data population
- [ ] Add scheduled triggers
- [ ] Implement performance tracking for tested ads
- [ ] Create dashboard for insights visualization

### Integration
- [ ] Connect to image generation workflows
- [ ] Link to Facebook Ads API for direct posting
- [ ] Add Notion integration for campaign planning

---

## 📞 Support

**Documentation:** See individual README files
**Issues:** Check n8n execution logs
**Questions:** Review QUICK_START.md and SETUP_GUIDE.md

---

**Documentation Version:** 1.0.0
**Last Updated:** 2025-11-08
**Maintained By:** Claude Code
