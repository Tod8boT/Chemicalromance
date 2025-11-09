# 🚀 QUICK START - Facebook Intelligence System

## ภาพรวมระบบ

ระบบ Facebook Intelligence ถูกออกแบบมาเพื่อทำ 3 สิ่งหลัก:

1. **รวบรวมข้อมูล** จาก Facebook (คู่แข่ง, โฆษณา, โพสต์)
2. **วิเคราะห์ด้วย AI** เพื่อหา patterns และ insights
3. **สร้างกลยุทธ์** A/B testing และ content recommendations

---

## 📁 โครงสร้างโปรเจค

```
CC_INTEL_SESSION1/
├── documentation/          # เอกสารทั้งหมด
│   ├── QUICK_START_NEW_CHAT.md
│   ├── N8N_MCP_USAGE_GUIDE.md
│   └── EXISTING_SYSTEM_GUIDE.md
│
├── existing_workflows/     # Workflows ที่มีอยู่แล้ว (ใช้เป็น templates)
│   ├── EGoXsM5lI8hhGNz3.json  # APIFY Scraper
│   ├── 9AxbvFjt6D5PTQMn.json  # AI Analysis
│   └── tEOYKf88Pi5VzjSO.json  # A/B Testing
│
├── new_workflows/          # Workflows ใหม่ที่สร้าง
│   ├── Human_Campaign_Input.json
│   ├── Content_Stock_Generator.json
│   └── Performance_Monitor.json
│
└── csv_templates/          # CSV templates สำหรับ Google Sheets
    ├── Facebook_Raw_Data.csv
    ├── AI_Analysis_Results.csv
    └── Strategic_Intelligence.csv
```

---

## ⚡ Quick Start (5 นาที)

### Step 1: เตรียม Google Sheets

1. สร้าง Google Sheet ใหม่ชื่อ **"Facebook Intelligence System"**
2. สร้าง 5 sheets:
   - `Facebook_Raw_Data`
   - `AI_Analysis_Results`
   - `Strategic_Intelligence`
   - `Cost_Analytics`
   - `Market_Trends`

3. Import headers จาก CSV templates ใน `csv_templates/`

### Step 2: ตั้งค่า n8n Credentials

ไปที่ n8n → **Settings** → **Credentials** แล้วเพิ่ม:

```
✓ Google Sheets OAuth2
✓ APIFY API (3 accounts: linemind, todxongdur, tripletreeandyun)
✓ OpenAI API
✓ Facebook Graph API (optional)
✓ Telegram Bot (สำหรับ notifications)
```

### Step 3: Import Workflows

```bash
# Import existing workflows ก่อน (เพื่อดู patterns)
n8n import:workflow --input=existing_workflows/EGoXsM5lI8hhGNz3.json
n8n import:workflow --input=existing_workflows/9AxbvFjt6D5PTQMn.json
n8n import:workflow --input=existing_workflows/tEOYKf88Pi5VzjSO.json

# Import workflows ใหม่
n8n import:workflow --input=new_workflows/Human_Campaign_Input.json
n8n import:workflow --input=new_workflows/Content_Stock_Generator.json
n8n import:workflow --input=new_workflows/Performance_Monitor.json
```

### Step 4: ทดสอบ Workflows

#### 4.1 ทดสอบ Human_Campaign_Input
1. เปิด workflow "Human_Campaign_Input"
2. กรอกข้อมูล campaign:
   - Campaign objective (Brand Awareness, Sales, Engagement)
   - Target audience
   - Budget
   - Timeline
3. Execute → ระบบจะบันทึกลง Google Sheets

#### 4.2 ทดสอบ Content_Stock_Generator
1. เปิด workflow "Content_Stock_Generator"
2. ระบบจะอ่านข้อมูล campaign จาก sheet
3. Generate content variations (5-10 รูปแบบ)
4. บันทึก prompts ลง Google Sheets

#### 4.3 ทดสอบ Performance_Monitor
1. เปิด workflow "Performance_Monitor"
2. ระบบจะติดตาม:
   - APIFY usage
   - OpenAI costs
   - Generated content count
3. แสดง dashboard ใน Google Sheets

---

## 🔄 Data Flow ทั้งระบบ

```
[1] Human Input (Campaign Goals)
     ↓
[2] APIFY Scraper (รวบรวมข้อมูลคู่แข่ง)
     ↓
[3] Facebook_Raw_Data (Google Sheets)
     ↓
[4] AI Analysis (GPT-4o + Claude)
     ↓
[5] AI_Analysis_Results (insights + recommendations)
     ↓
[6] Content_Stock_Generator (สร้าง variations)
     ↓
[7] Strategic_Intelligence (A/B test plans)
     ↓
[8] Performance_Monitor (track results)
```

---

## 📊 Google Sheets Architecture

### Sheet 1: Facebook_Raw_Data
เก็บข้อมูลดิบจาก APIFY
```
| timestamp | page_name | page_url | post_text | engagement | ad_format | cta_type |
```

### Sheet 2: AI_Analysis_Results
ผลวิเคราะห์จาก AI
```
| timestamp | summary | rewritten_copy | image_prompt | video_prompt | confidence_score |
```

### Sheet 3: Strategic_Intelligence
กลยุทธ์และ A/B tests
```
| test_id | campaign_id | variation | template | expected_impact | priority | status |
```

### Sheet 4: Cost_Analytics
ติดตามค่าใช้จ่าย
```
| date | apify_cost | openai_cost | claude_cost | total | notes |
```

### Sheet 5: Market_Trends
แนวโน้มระยะยาว
```
| week | trend_category | pattern | frequency | recommendation |
```

---

## 💡 Use Cases

### Use Case 1: วิเคราะห์คู่แข่งรายใหม่
```
1. เปิด APIFY Scraper workflow
2. Input: Facebook Page URL ของคู่แข่ง
3. ระบบ scrape → analyze → generate insights
4. ผลลัพธ์: Strategic recommendations
```

### Use Case 2: สร้าง Content สำหรับ Campaign
```
1. Human_Campaign_Input: กรอก campaign objectives
2. Content_Stock_Generator: สร้าง 10 variations
3. ดู results ใน AI_Analysis_Results sheet
4. เลือก variations ที่ต้องการ
```

### Use Case 3: ติดตาม Performance
```
1. Performance_Monitor รันทุกวัน 9:00
2. รวบรวม metrics ทั้งหมด
3. แสดงใน Cost_Analytics sheet
4. Alert ถ้าเกิน budget
```

---

## ⚙️ Configuration

### Environment Variables (optional)
```bash
# .env file
GOOGLE_SHEET_ID=your_sheet_id_here
APIFY_API_KEY_1=your_key
APIFY_API_KEY_2=your_key
APIFY_API_KEY_3=your_key
OPENAI_API_KEY=your_key
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
```

### Workflow Schedules
```
- APIFY Scraper: ทุกวัน 02:00
- AI Analysis: ทุกวัน 03:00
- Content Generator: On-demand
- Performance Monitor: ทุกวัน 09:00
- Weekly Report: จันทร์ 09:00
```

---

## 🔧 Troubleshooting

### ปัญหา: APIFY ไม่ scrape
```
✓ เช็ค API key
✓ เช็ค credits ใน APIFY account
✓ ลอง scrape URL อื่น
```

### ปัญหา: Google Sheets ไม่เขียนได้
```
✓ เช็ค permissions (share sheet กับ service account)
✓ เช็ค sheet names (ต้องตรงกับ workflow)
✓ Reauthorize credentials
```

### ปัญหา: AI Analysis ให้ผลแปลก
```
✓ เช็ค input data quality
✓ ปรับ AI prompt
✓ ลด temperature (ให้มั่นใจกว่า)
```

---

## 📚 Next Steps

1. **อ่านต่อ:**
   - `N8N_MCP_USAGE_GUIDE.md` - วิธีใช้ n8n แบบละเอียด
   - `EXISTING_SYSTEM_GUIDE.md` - วิเคราะห์ workflows ที่มีอยู่

2. **Customize:**
   - แก้ AI prompts ตามแบรนด์
   - เพิ่ม metrics ที่ต้องการติดตาม
   - ปรับ schedules ตามเวลาทำงาน

3. **Scale:**
   - เพิ่ม competitors ที่ต้องการติดตาม
   - Integrate กับ Facebook Ads API (สร้างโฆษณาอัตโนมัติ)
   - สร้าง dashboard ด้วย Looker Studio

---

## 🎯 Success Metrics

หลังจากรันระบบ 1 สัปดาห์ ควรได้:

- ✓ Scraped data จากคู่แข่ง 5-10 เพจ
- ✓ AI insights อย่างน้อย 20+ items
- ✓ Content variations พร้อมใช้ 50+ รูปแบบ
- ✓ A/B test recommendations 10+ tests
- ✓ Cost tracking แม่นยำ 100%

---

## 💬 Support

หากติดปัญหา:
1. เช็ค execution logs ใน n8n
2. ดู error details
3. อ่าน documentation ใน `documentation/`
4. ติดต่อทีม CC_INTEL

---

**เริ่มได้เลย!** 🚀
