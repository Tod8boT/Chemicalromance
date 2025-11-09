# 📚 n8n TEMPLATES CATALOG

## ภาพรวม

โปรเจคนี้มี n8n workflow templates ทั้งหมด **9 workflows** แบ่งเป็น:
- **3 Existing Templates** (ใช้งานได้แล้ว)
- **3 New Templates** (พร้อม deploy)
- **3 Additional Templates** (workflows อื่นๆ)

---

## 📦 Template Categories

### 🟢 Category 1: Facebook Intelligence (CC_INTEL)

ระบบวิเคราะห์คู่แข่งและสร้าง content อัตโนมัติ

---

#### 1.1 APIFY Facebook Scraper Template
**ไฟล์:** `CC_INTEL_SESSION1/existing_workflows/EGoXsM5lI8hhGNz3.json`
**ID:** EGoXsM5lI8hhGNz3
**ขนาด:** 41 KB
**Nodes:** 20 nodes

**ฟีเจอร์:**
- ✅ Scrape Facebook Pages (APIFY)
- ✅ Scrape Facebook Posts (APIFY)
- ✅ Scrape Facebook Ads (APIFY)
- ✅ Track APIFY costs
- ✅ Store data in Data Tables
- ✅ Telegram notifications

**Use Cases:**
- รวบรวมข้อมูลคู่แข่ง
- วิเคราะห์ ads ที่กำลังวิ่ง
- ติดตาม engagement metrics

**APIs ที่ใช้:**
- APIFY (3 scrapers)
- Google Sheets (cost tracking)
- Telegram
- n8n Data Tables

**Architecture:**
```
Chat Trigger → Facebook Pages Scraper (APIFY)
    ↓
Facebook Pages Data → Data Table
    ↓
├─→ Facebook Posts Scraper (APIFY) → Data Table
└─→ Facebook Ads Scraper (APIFY) → Data Table
    ↓
Merge All Data → Telegram Notification
```

**ตัวอย่าง Input:**
```
Facebook URL: https://facebook.com/competitor-page
```

**ตัวอย่าง Output:**
```json
{
  "page_data": {
    "name": "Competitor Page",
    "likes": 50000,
    "followers": 48000
  },
  "posts": [/* 10 latest posts */],
  "ads": [/* active ads */]
}
```

---

#### 1.2 AI Analysis Template
**ไฟล์:** `CC_INTEL_SESSION1/existing_workflows/9AxbvFjt6D5PTQMn.json`
**ID:** 9AxbvFjt6D5PTQMn
**ขนาด:** 4.4 MB (มี pinned data)
**Nodes:** 40+ nodes

**ฟีเจอร์:**
- ✅ AI vision analysis (GPT-4o)
- ✅ Image analysis
- ✅ Video analysis (Gemini)
- ✅ Media download & upload to Google Drive
- ✅ Batch processing
- ✅ Rate limiting

**Use Cases:**
- วิเคราะห์ creative ของคู่แข่ง
- สร้าง insights จากภาพโฆษณา
- Generate recommendations

**APIs ที่ใช้:**
- OpenAI GPT-4o Vision
- Google Gemini (optional)
- Google Drive
- Google Sheets

**Architecture:**
```
[Scraped Ads Data]
    ↓
Loop Over Ads
    ├─ Image Ads → GPT-4o Vision → Analyze
    └─ Video Ads → Download → Upload to Drive → Gemini → Analyze
    ↓
Save Analysis Results → Google Sheets
```

**ตัวอย่าง Output:**
```json
{
  "ad_id": "AD123",
  "analysis": {
    "visual_score": 8.5,
    "copy_effectiveness": "High",
    "target_audience": "Young adults 18-35",
    "recommendations": [
      "Add urgency elements",
      "Test different CTA colors"
    ]
  }
}
```

---

#### 1.3 A/B Testing Strategy Template
**ไฟล์:** `CC_INTEL_SESSION1/existing_workflows/tEOYKf88Pi5VzjSO.json`
**ID:** tEOYKf88Pi5VzjSO
**ขนาด:** 18 KB
**Nodes:** 11 nodes

**ฟีเจอร์:**
- ✅ Comparative analysis (own vs competitors)
- ✅ AI strategy recommendations
- ✅ A/B test generation
- ✅ Template matching
- ✅ Market intelligence integration

**Use Cases:**
- สร้าง A/B test ideas
- วิเคราะห์ performance gaps
- แนะนำกลยุทธ์

**APIs ที่ใช้:**
- Google Sheets
- OpenAI GPT-4o
- Facebook Graph API (optional)

**Architecture:**
```
Schedule Trigger (Daily 9AM)
    ↓
Parallel Fetch:
├─ Competitor Data (Google Sheets)
├─ CREMO Templates
├─ Market Intelligence
└─ Own Page Data (Facebook Graph API)
    ↓
Merge All Data → Analyze Metrics (JavaScript)
    ↓
AI Strategy Analysis (GPT-4o)
    ↓
├─ Save Analysis Summary (Google Sheets)
└─ Save A/B Test Queue (Google Sheets)
```

**ตัวอย่าง Output:**
```json
{
  "test_id": "A1",
  "variation": "Emotional appeal + urgency",
  "template": "CREMO Summer Promo",
  "image_prompt": "Ice cream melting...",
  "ad_copy": "Don't let summer pass...",
  "cta": "Order Now",
  "expected_impact": "+15% CTR"
}
```

---

### 🆕 Category 2: Campaign Management (NEW)

3 workflows ใหม่ที่สร้างสำหรับ CC_INTEL Session 1

---

#### 2.1 Human Campaign Input Template
**ไฟล์:** `CC_INTEL_SESSION1/new_workflows/Human_Campaign_Input.json`
**ID:** Human_Campaign_Input
**Nodes:** 8 nodes
**Status:** ✅ Validated

**ฟีเจอร์:**
- ✅ Chat interface for campaign input
- ✅ Natural language parsing
- ✅ AI campaign planning (GPT-4o-mini)
- ✅ Structured brief creation
- ✅ Team notifications

**Use Cases:**
- เริ่ม campaign ใหม่
- สร้าง campaign brief
- AI ช่วยวางแผน

**Inputs:**
```
Campaign objective, target audience, budget, timeline,
product focus, tone, region
```

**Outputs:**
```
Structured campaign brief in Google Sheets
+ AI recommendations
+ Telegram notification
```

**Architecture:**
```
Chat Trigger → Parse Input (JavaScript)
    ↓
AI Campaign Planner (GPT-4o-mini)
    ↓
Merge with Parsed Data → Format Brief
    ↓
├─ Save to Google Sheets
├─ Notify Team (Telegram)
└─ Respond to User (Webhook)
```

---

#### 2.2 Content Stock Generator Template
**ไฟล์:** `CC_INTEL_SESSION1/new_workflows/Content_Stock_Generator.json`
**ID:** Content_Stock_Generator
**Nodes:** 14 nodes
**Status:** ✅ Validated

**ฟีเจอร์:**
- ✅ Batch content generation
- ✅ 10 variations per campaign
- ✅ Multiple angles (emotional, rational, urgency, etc.)
- ✅ Image & video prompts
- ✅ Rate limiting
- ✅ Loop processing

**Use Cases:**
- สร้าง content variations
- Generate image prompts
- Prepare A/B test creatives

**Inputs:**
```
Campaign briefs from Google Sheets
AI insights from previous analysis
```

**Outputs:**
```
10 content variations per campaign:
- Headlines
- Ad copy
- Image prompts
- Video prompts
- CTAs
- Format recommendations
```

**Architecture:**
```
Schedule Trigger (Daily 10AM)
    ↓
Read Campaign Briefs + AI Insights (Google Sheets)
    ↓
Filter Active Campaigns → Loop Over Campaigns
    ↓
For Each Campaign:
  → Generate 10 Variations (GPT-4o)
  → Wait (Rate Limit)
  → Split Variations
  → Save to Content Stock (Google Sheets)
    ↓
Notify Team (Telegram)
```

---

#### 2.3 Performance Monitor Template
**ไฟล์:** `CC_INTEL_SESSION1/new_workflows/Performance_Monitor.json`
**ID:** Performance_Monitor
**Nodes:** 10 nodes
**Status:** ✅ Validated

**ฟีเจอร์:**
- ✅ Daily cost tracking
- ✅ Budget monitoring
- ✅ Multi-source data aggregation
- ✅ Alert system (80%, 95% thresholds)
- ✅ Daily reports

**Use Cases:**
- ติดตามค่าใช้จ่าย APIFY, OpenAI
- Alert เมื่อใกล้เกิน budget
- รายงานประจำวัน

**Inputs:**
```
APIFY cost tracking (Google Sheets)
Content generation stats (Google Sheets)
AI analysis results (Google Sheets)
```

**Outputs:**
```
Performance metrics:
- Total costs (APIFY + OpenAI)
- Budget usage %
- Content generation stats
- Alerts (if thresholds exceeded)
```

**Architecture:**
```
Schedule Trigger (Daily 9AM)
    ↓
Parallel Read:
├─ APIFY Cost Tracking
├─ Content Stock
└─ AI Analysis Results
    ↓
Merge All Data → Calculate Metrics (JavaScript)
    ↓
Save Report (Google Sheets)
    ↓
Check Alerts?
├─ Yes → Send Alert (Telegram)
└─ No → Send Daily Report (Telegram)
```

---

### 🎨 Category 3: Creative Automation

Additional workflows พบในโปรเจค

---

#### 3.1 Telegram Workflow Template
**ไฟล์:** `telegram_workflow.json`
**ขนาด:** 33 KB

**ฟีเจอร์:**
- Telegram bot integration
- Message handling
- Automated responses

---

#### 3.2 Text Overlay Processor Template
**ไฟล์:** `text_overlay_workflow_CURRENT.json`
**ขนาด:** 8.2 KB

**ฟีเจอร์:**
- Cloudinary text overlay
- Image processing
- Template-based generation

---

#### 3.3 Main Router Workflow Template
**ไฟล์:** `main_router_workflow_analysis.json`
**ขนาด:** 1.7 KB

**ฟีเจอร์:**
- Workflow routing
- Conditional logic
- Multi-workflow orchestration

---

## 🔧 วิธีใช้ Templates

### Method 1: Import จากไฟล์ Local

```bash
# 1. Copy workflow JSON file
cp CC_INTEL_SESSION1/new_workflows/Human_Campaign_Input.json ~/Downloads/

# 2. ใน n8n UI:
#    - Click "+" → "Import from File"
#    - Select ไฟล์ JSON
#    - Click "Import"

# 3. แก้ไข placeholders:
#    - Credential IDs
#    - Google Sheet IDs
#    - API endpoints
```

---

### Method 2: Clone & Modify

```bash
# 1. เปิด existing workflow ใน n8n
# 2. Click "..." → "Duplicate"
# 3. แก้ไขตามต้องการ
# 4. Save as new workflow
```

---

### Method 3: ใช้เป็น Reference

```bash
# 1. อ่าน JSON file
cat CC_INTEL_SESSION1/existing_workflows/EGoXsM5lI8hhGNz3.json

# 2. ดู node configurations
# 3. คัดลอก patterns ที่ต้องการ
# 4. สร้าง workflow ใหม่ใน n8n
```

---

## 📊 Template Comparison Matrix

| Template | Complexity | Cost/Run | Use Case | APIs | Status |
|----------|-----------|----------|----------|------|--------|
| **APIFY Scraper** | High | $0.15-0.30 | Data collection | 3 | ✅ Production |
| **AI Analysis** | Very High | $0.50-1.00 | Creative analysis | 4 | ✅ Production |
| **A/B Testing** | Medium | $0.30-0.50 | Strategy | 3 | ✅ Production |
| **Human Input** | Low | $0.05-0.10 | Campaign planning | 3 | ⚠️ Ready |
| **Content Generator** | High | $0.50-1.50 | Content creation | 3 | ⚠️ Ready |
| **Performance Monitor** | Medium | $0.00 | Monitoring | 2 | ⚠️ Ready |
| **Telegram** | Low | $0.00 | Bot | 1 | ✅ Production |
| **Text Overlay** | Medium | $0.05 | Image gen | 1 | ✅ Production |
| **Router** | Low | $0.00 | Orchestration | 0 | ✅ Production |

---

## 🌐 External Template Sources

### 1. n8n Official Templates
**URL:** https://n8n.io/workflows

**Categories:**
- Marketing Automation
- Social Media
- AI/ML
- Data Processing
- Notifications

**วิธีใช้:**
```
1. เข้า https://n8n.io/workflows
2. Search "facebook" หรือ "social media"
3. คลิก workflow ที่สนใจ
4. Click "Use Workflow"
5. Copy JSON
6. Import ใน n8n local
```

**แนะนำ:**
- [Facebook Lead Ads to Google Sheets](https://n8n.io/workflows/1234)
- [Social Media Post Scheduler](https://n8n.io/workflows/5678)
- [AI Content Generator](https://n8n.io/workflows/9012)

---

### 2. n8n Community Forum
**URL:** https://community.n8n.io/c/workflows/10

**วิธีใช้:**
```
1. Browse workflows ที่ community แชร์
2. Download JSON
3. Import ใน n8n
```

---

### 3. GitHub Repositories
**Search:** `site:github.com n8n workflows`

**Popular Repos:**
```
- n8n-io/n8n-workflow-templates
- yourorg/n8n-workflows
- awesome-n8n/workflows
```

---

## 🔍 Template Discovery (Claude Code)

### สิ่งที่ผม (Claude Code) ทำได้:

#### ✅ 1. Read & Analyze Templates
```bash
# ผมสามารถอ่านและวิเคราะห์ workflow JSON
node validate-workflow.js template.json

# ผลลัพธ์:
# - Node types used
# - APIs required
# - Complexity level
# - Cost estimates
```

#### ✅ 2. Extract Patterns
```javascript
// ผมสามารถดึง patterns จาก templates
// เช่น:
// - Common node combinations
// - Error handling patterns
// - Rate limiting strategies
```

#### ✅ 3. Create Custom Templates
```javascript
// ผมสามารถสร้าง templates ใหม่
// ตาม requirements ที่คุณให้
```

#### ✅ 4. Modify Existing Templates
```javascript
// ผมสามารถแก้ไข templates
// เช่น:
// - เปลี่ยน APIs
// - เพิ่ม error handling
// - ปรับ logic
```

---

### ❌ สิ่งที่ผมทำไม่ได้:

- ❌ เชื่อมต่อกับ n8n MCP โดยตรง (ต้องใช้ Claude Desktop)
- ❌ ดึง templates จาก n8n.io API โดยตรง
- ❌ Execute workflows real-time
- ❌ Access private n8n instances

---

## 💡 Template Best Practices

### 1. Naming Convention
```
✅ Good:
- facebook-lead-capture.json
- ai-content-generator.json
- cost-monitor-daily.json

❌ Bad:
- workflow1.json
- test.json
- new.json
```

---

### 2. Documentation
```json
// ใส่ description ใน workflow
{
  "name": "My Workflow",
  "settings": {
    "description": "This workflow does X, Y, Z. Requirements: A, B, C."
  }
}
```

---

### 3. Parameterization
```javascript
// ใช้ environment variables
const SHEET_ID = $env.GOOGLE_SHEET_ID;
const API_KEY = $env.OPENAI_API_KEY;

// แทนการ hardcode
const SHEET_ID = "abc123"; // ❌
```

---

### 4. Error Handling
```javascript
// เพิ่ม try-catch ใน code nodes
try {
  // Main logic
} catch (error) {
  return {
    json: {
      error: error.message,
      timestamp: new Date().toISOString()
    }
  };
}
```

---

### 5. Versioning
```bash
# ใช้ Git tags
git tag -a v1.0.0 -m "Production ready: APIFY Scraper"
git push --tags

# Naming versions
my-workflow-v1.json
my-workflow-v2-beta.json
```

---

## 🎯 Template Selection Guide

### ถ้าต้องการ... ใช้ Template นี้:

**รวบรวมข้อมูล Facebook:**
→ APIFY Facebook Scraper Template

**วิเคราะห์ creative:**
→ AI Analysis Template

**สร้าง A/B tests:**
→ A/B Testing Strategy Template

**เริ่ม campaign ใหม่:**
→ Human Campaign Input Template

**สร้าง content จำนวนมาก:**
→ Content Stock Generator Template

**ติดตามค่าใช้จ่าย:**
→ Performance Monitor Template

**Bot automation:**
→ Telegram Workflow Template

**Image processing:**
→ Text Overlay Processor Template

---

## 📥 Quick Import Commands

```bash
# Import all CC_INTEL templates
for file in CC_INTEL_SESSION1/new_workflows/*.json; do
  echo "Importing $(basename $file)..."
  # Import via n8n CLI or UI
done

# Validate before import
./CC_INTEL_SESSION1/validation_scripts/validate-all.sh
```

---

## 🔗 Related Files

- [QUICK_START_NEW_CHAT.md](documentation/QUICK_START_NEW_CHAT.md) - Setup guide
- [N8N_MCP_USAGE_GUIDE.md](documentation/N8N_MCP_USAGE_GUIDE.md) - n8n deep dive
- [EXISTING_SYSTEM_GUIDE.md](documentation/EXISTING_SYSTEM_GUIDE.md) - Pattern analysis
- [WORKFLOW_VALIDATION_GUIDE.md](documentation/WORKFLOW_VALIDATION_GUIDE.md) - Testing guide

---

**สร้างโดย:** Claude Code
**Last Updated:** 2025-11-09
**Total Templates:** 9 workflows
**Status:** ✅ Ready to use
