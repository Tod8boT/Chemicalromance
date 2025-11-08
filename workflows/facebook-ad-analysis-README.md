# Facebook Ad Analysis & A/B Testing Sub-Workflow

## 📋 ภาพรวม

Workflow นี้ออกแบบมาเพื่อ:
1. **รวบรวมข้อมูล** จากคู่แข่งและเพจตัวเอง
2. **วิเคราะห์และเปรียบเทียบ** performance metrics
3. **แนะนำ A/B test variations** โดย AI
4. **สร้าง queue** สำหรับทดสอบโฆษณา

---

## 🔄 Workflow Flow

```
Schedule Trigger (รันทุกวัน 9:00)
    ↓
├─→ Read Competitor Data (Google Sheets)
├─→ Read CREMO Templates (CSV data)
├─→ Read Market Intelligence (CSV data)
└─→ Fetch Own Page Data (Facebook Graph API)
    ↓
Merge All Data
    ↓
Analyze Metrics (JavaScript calculation)
    ↓
AI Strategy Analysis (GPT-4o)
    ↓
Format Output
    ↓
├─→ Save Analysis Summary (Google Sheets)
└─→ Split & Save A/B Tests Queue (Google Sheets)
```

---

## 📊 Input Data Sources

### 1. Competitor Data (จาก 2 workflows ที่มี)
- **APIFY Facebook Ad Library Scraper** output
- **AI Facebook Ad Spy Tool** output

ต้องเก็บข้อมูลลง Google Sheets ในรูปแบบ:
```
| page_name | page_likes | display_format | cta_type | ad_body_text | likes | shares | comments | viewsCount |
```

### 2. CREMO Templates
- จาก CSV: `🎨 CREMO Template Master`
- Columns: Template_Name, Category, Prompt_Template, etc.

### 3. Market Intelligence
- จาก CSV: `📈 CREMO Market Intelligence`
- Columns: Analysis_ID, Key_Insights, Performance_Metrics, etc.

### 4. Own Page Data
- ดึงจาก **Facebook Graph API**
- Endpoint: `/YOUR_PAGE_ID?fields=name,fan_count,followers_count,engagement`

---

## 🎯 Output

### Sheet 1: Analysis_Results
บันทึกผลการวิเคราะห์:
- `timestamp`: เวลาที่รันวิเคราะห์
- `performance_gap`: ช่องว่างระหว่างเพจเรากับคู่แข่ง
- `key_insights`: ข้อสรุปสำคัญ (JSON)
- `template_recommendations`: Template ที่แนะนำ (JSON)
- `regional_focus`: ภูมิภาคที่ควรโฟกัส
- `ab_test_count`: จำนวน test ที่แนะนำ

### Sheet 2: AB_Test_Queue
บันทึก A/B test ideas:
- `test_id`: รหัสการทดสอบ (เช่น A1, A2, B1)
- `template`: Template ที่ใช้
- `variation`: คำอธิบายรูปแบบ
- `image_prompt`: Prompt สำหรับสร้างภาพ
- `ad_copy`: ข้อความโฆษณาที่แนะนำ
- `cta`: Call-to-Action
- `expected_impact`: ผลลัพธ์ที่คาดหวัง
- `status`: pending/running/completed

---

## ⚙️ การติดตั้ง

### 1. Prerequisites
- n8n instance (cloud หรือ self-hosted)
- Google Sheets credentials
- Facebook Graph API credentials
- OpenAI API key

### 2. Import Workflow
```bash
# Import workflow JSON
n8n import:workflow --input=workflows/facebook-ad-analysis-ab-testing.json
```

### 3. ตั้งค่า Credentials

#### Google Sheets
1. ไปที่ **Credentials** → **New**
2. เลือก **Google Sheets OAuth2**
3. Authorize account
4. Save

#### Facebook Graph API
1. ไปที่ [Meta for Developers](https://developers.facebook.com)
2. สร้าง App (หรือใช้ของเดิม)
3. Copy **App ID** และ **App Secret**
4. ใน n8n: **Credentials** → **New** → **Facebook Graph API**
5. Paste credentials

#### OpenAI
1. ไปที่ [OpenAI API Keys](https://platform.openai.com/api-keys)
2. สร้าง API key ใหม่
3. ใน n8n: **Credentials** → **New** → **OpenAI**
4. Paste API key

### 4. แก้ไข Workflow Parameters

เปิด workflow และแก้:

**Node: "Read Competitor Data"**
```json
{
  "documentId": "YOUR_GOOGLE_SHEET_ID_HERE",
  "sheetName": "Competitor_Data"
}
```

**Node: "Fetch Own Page Data"**
```json
{
  "url": "https://graph.facebook.com/v21.0/YOUR_PAGE_ID_HERE"
}
```

**Nodes: ทุก Google Sheets nodes**
- แก้ `documentId` เป็น Sheet ID ของคุณ
- แก้ credential IDs

---

## 📁 Google Sheets Structure

สร้าง Google Sheet ใหม่ด้วย sheets ดังนี้:

### Sheet 1: `Competitor_Data`
```
| page_name | page_id | page_likes | followers | display_format | cta_type | cta_text | ad_body_text | likes | shares | comments | viewsCount | collation_count |
```

### Sheet 2: `CREMO_Templates`
Copy จาก `🎨 CREMO Template Master CSV`

### Sheet 3: `Market_Intelligence`
Copy จาก `📈 CREMO Market Intelligence CSV`

### Sheet 4: `Analysis_Results` (ว่างไว้)
```
| timestamp | performance_gap | key_insights | template_recommendations | regional_focus | ab_test_count |
```

### Sheet 5: `AB_Test_Queue` (ว่างไว้)
```
| timestamp | test_id | template | variation | image_prompt | ad_copy | cta | expected_impact | status |
```

---

## 🚀 การใช้งาน

### รันแบบ Manual
1. เปิด workflow ใน n8n
2. คลิก **Execute Workflow**
3. ดูผลลัพธ์ใน Google Sheets

### รันแบบ Scheduled
1. Workflow ถูกตั้งให้รันทุกวันเวลา 9:00 น.
2. แก้ได้ที่ node "Schedule Daily 9AM"
3. Format: `0 9 * * *` (cron expression)

### Integration กับ Workflows อื่น
สามารถเรียกใช้ผ่าน **Execute Workflow** node:
```json
{
  "workflowId": "facebook-ad-analysis-ab-testing",
  "workflowInputs": {}
}
```

---

## 🧠 AI Analysis Prompt

AI จะวิเคราะห์โดยใช้ข้อมูล:
1. **Performance gap**: เพจเรา vs คู่แข่ง
2. **Winning patterns**: รูปแบบที่คู่แข่งใช้แล้วได้ผลดี
3. **CREMO templates**: Template ที่มีให้เลือก
4. **Market intelligence**: Insights จากตลาด

และแนะนำ:
- Template ที่เหมาะสม
- Regional focus (ภาคไหนควรโฟกัส)
- A/B test variations (3-5 รูปแบบ)
- Image prompts สำหรับสร้างภาพ

---

## 📈 Next Steps

หลังจาก workflow รัน:

1. **Review Analysis** - ดูผลใน `Analysis_Results` sheet
2. **Review Test Queue** - ดู A/B tests ที่แนะนำใน `AB_Test_Queue`
3. **Create Images** - ใช้ prompts ไปสร้างภาพด้วย workflows อื่น
4. **Launch Tests** - นำโฆษณาไปทดสอบจริง
5. **Track Results** - บันทึกผลลัพธ์กลับมา
6. **Iterate** - ปรับปรุงตาม insights

---

## 🔧 Customization

### แก้ไข AI Prompt
แก้ที่ node "AI Strategy Analysis" → System Message

### เพิ่ม Metrics
แก้ที่ node "Analyze Metrics" → JavaScript Code

### เปลี่ยน Schedule
แก้ที่ node "Schedule Daily 9AM" → Cron Expression

### เพิ่ม Notifications
เพิ่ม node:
- **Telegram** (ส่งผลวิเคราะห์)
- **Slack** (แจ้งเตือนทีม)
- **Email** (รายงานประจำวัน)

---

## ⚠️ Troubleshooting

### Facebook API Error
```
Error: Invalid OAuth access token
```
**แก้:** Regenerate access token ใน Facebook App settings

### Google Sheets Permission Error
```
Error: The caller does not have permission
```
**แก้:** Share Google Sheet ให้กับ service account email

### AI Analysis ไม่ได้ผล
```
Error: JSON parse error
```
**แก้:** เช็ค AI prompt ว่า output เป็น valid JSON หรือไม่

---

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [OpenAI API](https://platform.openai.com/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)

---

## 💡 Tips

1. **ทดสอบก่อน** - รัน manual ก่อน enable schedule
2. **Backup data** - Export Google Sheets เป็นประจำ
3. **Monitor costs** - เช็ค OpenAI usage
4. **Iterate prompts** - ปรับ AI prompt ให้ได้ผลดีขึ้น
5. **Track performance** - บันทึกผล A/B tests กลับมา

---

## 🤝 Support

หากมีปัญหา:
1. ตรวจสอบ execution logs ใน n8n
2. ดู error messages
3. เปิด issue ใน GitHub repo
