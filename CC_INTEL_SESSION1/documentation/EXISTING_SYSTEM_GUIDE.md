# 📚 EXISTING SYSTEM GUIDE

## ภาพรวม

เอกสารนี้วิเคราะห์ 3 workflows ที่มีอยู่แล้วในระบบ เพื่อเป็น reference สำหรับสร้าง workflows ใหม่

---

## 🔍 Workflow Analysis

### 1. APIFY Facebook Ad Library Scraper
**File:** `EGoXsM5lI8hhGNz3.json`
**ID:** EGoXsM5lI8hhGNz3
**Purpose:** Scrape Facebook pages, posts, และ ads จาก APIFY

#### Architecture
```
Chat Trigger (รับ URL จาก user)
    ↓
Facebook Pages Scraper (APIFY)
    ├→ Get Dataset
    └→ Track Price (Google Sheets)
    ↓
Data Table: Store Page Info
    ↓
Facebook Posts Scraper (APIFY)
    ├→ Get Dataset
    └→ Track Price
    ↓
Data Table: Store Posts
    ↓
Summarize (find top posts)
    ↓
Facebook Ads Scraper (APIFY)
    ├→ Get Dataset
    └→ Track Price
    ↓
Data Tables: Store Ads + Details
    ↓
Merge All Data
    ↓
Upsert to Data Table
    ↓
Telegram Notification
```

#### Key Nodes

**1. Chat Trigger**
```json
{
  "name": "When chat message received",
  "type": "@n8n/n8n-nodes-langchain.chatTrigger",
  "webhookId": "7d28ab82-c41f-4acb-8d05-b5a888a195fd"
}
```
- รับ Facebook URL จาก user
- Format: `https://facebook.com/page-name`

**2. Facebook Pages Scraper**
```json
{
  "actorId": "4Hv5RhChiaDk6iwad",
  "customBody": "{\n  \"startUrls\": [{\n    \"url\": \"{{ $json.chatInput }}\"\n  }]\n}",
  "credentials": "linemind"
}
```
- Scrapes: page details, followers, likes, rating
- Output: `facebookUrl`, `title`, `pageName`, `followers`, `likes`

**3. Facebook Posts Scraper**
```json
{
  "actorId": "KoJrdxJCTtpon81KY",
  "customBody": "{\n  \"resultsLimit\": 10,\n  \"startUrls\": [{\n    \"url\": \"{{ $('Facebook Pages Scraper database').item.json.facebookUrl }}\"\n  }]\n}",
  "credentials": "todxongdur"
}
```
- Scrapes: ล่าสุด 10 posts
- Output: `postId`, `text`, `likes`, `shares`, `comments`, `viewsCount`

**4. Facebook Ads Scraper**
```json
{
  "actorId": "JJghSZmShuco4j9gJ",
  "customBody": "{\n  \"isDetailsPerAd\": true,\n  \"resultsLimit\": 10\n}",
  "credentials": "tripletreeandyun"
}
```
- Scrapes: active ads
- Output: `adArchiveID`, `displayFormat`, `ctaText`, `snapshot`

**5. Price Tracking**
```json
{
  "operation": "append",
  "documentId": "1rAFlwhtvKQUr60soudidfkX19rHz9e2uXkfHXTxzdOY",
  "sheetName": "data",
  "columns": {
    "node": "apify",
    "price": "={{ $json.pricingInfo.pricePerUnitUsd }}",
    "used": "={{ $json.pricingInfo.pricingModel }}",
    "date": "={{$now.setZone('Asia/Bangkok').format('dd/LL/yyyy HH:mm:ss')}}"
  }
}
```
- ติดตามค่าใช้จ่าย APIFY
- บันทึกทุก execution

**6. Data Tables**
```
page_list (P0pTzknZiBQqYDY0):
  - facebookUrl
  - page_name
  - pagedetail
  - post_details
  - details_ad
  - ad_status

post_page_data (4PnmgRKeB2D19nrK):
  - facebookUrl
  - post
  - time_post
  - text
  - Reactions_post
  - like
  - viewsCount

ads_page_in_list (zxMmnilvw6jDTUyq):
  - facebookUrl
  - page_name
  - adArchiveID
  - detail_ads
  - status_ads
```

#### Patterns ที่เรียนรู้

✅ **Multi-APIFY Account Strategy**
- ใช้ 3 accounts แยกกัน (linemind, todxongdur, tripletreeandyun)
- แต่ละ account scrape คนละอย่าง → กระจาย quota

✅ **Price Tracking Pattern**
- Track ทุก APIFY call
- เก็บ: price, pricing model, timestamp
- ช่วยคำนวณ monthly costs

✅ **Merge & Summarize Pattern**
- Summarize ก่อน (หา max likes, viewsCount)
- Merge กับ full data
- Upsert กลับ data table

✅ **Data Table Structure**
- แยก tables ตามประเภทข้อมูล
- ใช้ `facebookUrl` เป็น key เชื่อม

---

### 2. AI Facebook Ad Spy Tool
**File:** `9AxbvFjt6D5PTQMn.json`
**ID:** 9AxbvFjt6D5PTQMn
**Purpose:** Analyze scraped ads ด้วย AI (GPT-4o, Gemini)

#### Architecture
```
[Input from Workflow 1: Scraped Ads]
    ↓
Loop Over Ads
    ↓
Check Media Type (Image/Video)
    ├─ Video → Download → Upload to Google Drive
    └─ Image → Continue
    ↓
OpenAI Vision Analysis (GPT-4o)
    ├─ Analyze creative
    ├─ Extract patterns
    └─ Generate recommendations
    ↓
Format Results
    ↓
Google Sheets: Save Analysis
    ↓
Optional: Gemini Video Analysis
```

#### Key Features

**1. Media Handling**
```javascript
// Check if ad has video
if ($json.snapshot.videos && $json.snapshot.videos.length > 0) {
  // Download video
  const videoUrl = $json.snapshot.videos[0].videoSdUrl;
  // Upload to Google Drive
}
```

**2. GPT-4o Vision Analysis**
```json
{
  "modelId": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "Analyze this Facebook ad creative. Identify:\n1. Visual elements\n2. Brand positioning\n3. Target audience\n4. Call-to-action effectiveness\n5. Suggested improvements"
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Ad text: {{ $json.snapshot.body.text }}\nCTA: {{ $json.snapshot.ctaText }}"
        },
        {
          "type": "image_url",
          "imageUrl": "{{ $json.snapshot.images[0].originalImageUrl }}"
        }
      ]
    }
  ],
  "options": {
    "temperature": 0.7,
    "maxTokens": 1500
  }
}
```

**3. Batch Processing**
```json
{
  "name": "Loop Over Image Ads",
  "type": "n8n-nodes-base.splitInBatches",
  "parameters": {
    "batchSize": 10
  }
}
```
- ประมวลผลทีละ 10 ads
- มี delay 1 second ระหว่าง batches
- ป้องกัน rate limiting

**4. Result Structure**
```json
{
  "ad_id": "{{ $json.adArchiveID }}",
  "analysis": {
    "visual_score": 8.5,
    "copy_effectiveness": "High",
    "target_audience": "Young adults 18-35",
    "recommendations": [
      "Add urgency elements",
      "Test different CTA colors"
    ]
  },
  "ai_model": "gpt-4o",
  "timestamp": "2025-11-09T..."
}
```

#### Patterns ที่เรียนรู้

✅ **Multi-Modal AI Analysis**
- ใช้ GPT-4o Vision สำหรับ images
- ใช้ Gemini สำหรับ videos (optional)
- แยก analysis ตาม media type

✅ **Media Asset Management**
- Download videos
- Upload to Google Drive
- เก็บ URLs for future reference

✅ **Structured AI Output**
- ใช้ `jsonOutput: true`
- กำหนด schema ที่ชัดเจน
- Validate ก่อน save

✅ **Cost Control**
- Batch processing (ลด API calls)
- Rate limiting
- Optional models (Gemini เปิดตามงบ)

---

### 3. Facebook Ad Analysis & A/B Testing
**File:** `tEOYKf88Pi5VzjSO.json`
**Purpose:** วิเคราะห์ performance และสร้าง A/B test recommendations

#### Architecture
```
Schedule Trigger (Daily 9:00)
    ↓
Parallel Data Fetch:
├─ Read Competitor Data (Google Sheets)
├─ Read CREMO Templates
├─ Read Market Intelligence
└─ Fetch Own Page Data (Facebook Graph API)
    ↓
Merge All Data
    ↓
Analyze Metrics (JavaScript)
    ├─ Calculate averages
    ├─ Find top performers
    └─ Identify gaps
    ↓
AI Strategy Analysis (GPT-4o)
    ├─ Performance gap analysis
    ├─ Template matching
    └─ A/B test recommendations
    ↓
Format Output
    ↓
├─ Save Analysis Summary
└─ Save A/B Tests to Queue
```

#### Key Nodes

**1. Schedule Trigger**
```json
{
  "parameters": {
    "rule": {
      "interval": [{
        "field": "cronExpression",
        "expression": "0 9 * * *"
      }]
    }
  }
}
```

**2. Parallel Data Fetching**
```javascript
// Node connections show parallel execution:
Schedule → [Competitor Data, Templates, Market Intel, Own Page]
```
- Fetch ทุก sources พร้อมกัน
- Merge เมื่อครบทั้งหมด

**3. Metrics Analysis**
```javascript
// Calculate competitor averages
const avgLikes = competitors.reduce((sum, c) =>
  sum + c.page_likes, 0) / competitors.length;

// Find top performers
const topPerformers = competitors
  .sort((a, b) => b.page_likes - a.page_likes)
  .slice(0, 5);

// Extract winning patterns
const formatCounts = {};
competitors.forEach(c => {
  formatCounts[c.ad_format] = (formatCounts[c.ad_format] || 0) + 1;
});
```

**4. AI Strategy Prompt**
```
You are a Facebook Ads strategist for CREMO.

Analyze:
1. Performance gaps between own page and competitors
2. Winning patterns from competitor data
3. Match with CREMO templates

Recommend:
- 3-5 A/B test variations
- Image prompts for each
- Expected impact

Output: JSON structure
```

**5. A/B Test Output**
```json
{
  "test_id": "A1",
  "variation": "Emotional appeal + urgency",
  "template": "CREMO Summer Promo",
  "image_prompt": "Ice cream cone melting...",
  "ad_copy": "Don't let summer pass...",
  "cta": "Order Now",
  "expected_impact": "+15% CTR based on competitor pattern"
}
```

#### Patterns ที่เรียนรู้

✅ **Data Aggregation Pattern**
- รวมข้อมูลจากหลาย sources
- Merge ก่อนส่ง AI
- ให้ AI ได้ holistic view

✅ **Comparative Analysis**
- Own page vs competitors
- Calculate gaps
- Identify opportunities

✅ **Template Matching**
- AI match patterns กับ templates
- เสนอ templates ที่เหมาะสม
- พร้อม customization suggestions

✅ **Actionable Output**
- ไม่ใช่แค่ insights
- สร้าง queue ของ A/B tests พร้อมรัน
- มี image prompts สำหรับสร้าง creative

---

## 🎨 Common Design Patterns

### Pattern 1: Scrape → Validate → Store → Notify
```
APIFY Scraper
    ↓
Code Node (validate data quality)
    ↓
IF Node (is valid?)
    ├─ Yes → Data Table
    │         ↓
    │       Google Sheets (backup)
    │         ↓
    │       Telegram (success)
    └─ No → Telegram (error alert)
```

### Pattern 2: Schedule → Multi-Source → Merge → AI → Output
```
Schedule Trigger
    ↓
├─ Source 1 (API)
├─ Source 2 (Google Sheets)
└─ Source 3 (Database)
    ↓
Merge Node
    ↓
AI Analysis
    ↓
├─ Store Results
└─ Send Report
```

### Pattern 3: Loop → Process → Aggregate
```
Get Items (100+ items)
    ↓
Split In Batches (10 each)
    ↓
For Each Batch:
    ├─ Process Item 1
    ├─ Process Item 2
    └─ ...
    ↓
Wait (rate limiting)
    ↓
Merge Results
    ↓
Aggregate Statistics
```

---

## 📊 Data Flow Patterns

### 1. Hierarchical Data Structure
```
Page (1)
  ├─ Posts (many)
  └─ Ads (many)
```

**Implementation:**
- Store page → get page_id
- Use page_id for posts query
- Use page_id for ads query

### 2. Pricing Data Collection
```
Every APIFY Call:
  → Extract pricingInfo
  → Append to price_sheet
  → Calculate running total
```

### 3. Multi-Table Relations
```
page_list:
  - facebookUrl (PK)

post_page_data:
  - facebookUrl (FK)

ads_page_in_list:
  - facebookUrl (FK)
```

---

## 🔧 Technical Insights

### APIFY Best Practices

1. **Account Rotation**
   ```
   Pages Scraper → Account 1
   Posts Scraper → Account 2
   Ads Scraper → Account 3
   ```

2. **Timeout Settings**
   ```json
   {
     "timeout": 300,  // Pages (fast)
     "timeout": 500   // Posts & Ads (slower)
   }
   ```

3. **Results Limiting**
   ```json
   {
     "resultsLimit": 10,  // Development
     "resultsLimit": 200  // Production
   }
   ```

### Google Sheets Optimization

1. **Batch Writes**
   ```javascript
   // ❌ Don't: Individual writes
   for (const item of items) {
     await sheets.append(item);
   }

   // ✅ Do: Batch write
   await sheets.batchAppend(items);
   ```

2. **Field Mapping**
   ```json
   {
     "columns": {
       "mappingMode": "defineBelow",
       "value": {
         "timestamp": "={{ $now.toISO() }}",
         "page_name": "={{ $json.title }}",
         "engagement": "={{ $json.likes + $json.shares }}"
       }
     }
   }
   ```

3. **Bangkok Timezone**
   ```javascript
   $now.setZone("Asia/Bangkok").format("dd/LL/yyyy HH:mm:ss")
   ```

### AI Prompt Engineering

1. **System Role Definition**
   ```
   "You are a [specific role] for [company]..."
   ```

2. **Structured Output**
   ```
   "Output format: JSON with structure {...}"
   ```

3. **Context Inclusion**
   ```
   "Based on: [templates], [market intel], [competitor data]..."
   ```

4. **Actionable Results**
   ```
   "Provide: [specific recommendations] with [expected impact]"
   ```

---

## 📈 Performance Metrics

### Workflow 1: APIFY Scraper
- **Execution Time:** 3-5 minutes
- **APIFY Cost:** $0.15-0.30 per run
- **Data Volume:** 50-200 items

### Workflow 2: AI Analysis
- **Execution Time:** 5-10 minutes
- **OpenAI Cost:** $0.50-1.00 per run
- **Analysis Output:** 10-50 insights

### Workflow 3: A/B Testing
- **Execution Time:** 2-3 minutes
- **Cost:** $0.30-0.50 per run
- **Recommendations:** 3-5 tests

---

## 🎯 Application to New Workflows

เมื่อสร้าง workflows ใหม่ ควรใช้ patterns เหล่านี้:

### Human_Campaign_Input
- ใช้: **Webhook/Chat Trigger** pattern
- ใช้: **Validation → Store** pattern
- เพิ่ม: Human-friendly interface

### Content_Stock_Generator
- ใช้: **AI Analysis** pattern
- ใช้: **Batch Processing** pattern
- เพิ่ม: Multiple AI models

### Performance_Monitor
- ใช้: **Schedule → Multi-Source → Merge** pattern
- ใช้: **Aggregate Statistics** pattern
- เพิ่ม: Alert thresholds

---

## 🚀 Next Steps

1. **Study Nodes**: ดู node configurations ใน workflows
2. **Test Locally**: ลอง execute workflows ใน n8n
3. **Modify**: แก้ parameters ดู output เปลี่ยนยังไง
4. **Adapt**: นำ patterns ไปใช้ใน workflows ใหม่

---

**ความรู้จาก existing system คือรากฐานของ workflows ใหม่!** 🌟
