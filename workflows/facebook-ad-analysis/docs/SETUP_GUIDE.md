# 🚀 Quick Setup Guide

## Step 1: เตรียม Google Sheets

1. สร้าง Google Sheet ใหม่ชื่อ **"CREMO Facebook Ad Analysis"**
2. สร้าง 5 sheets ดังนี้:

### Sheet 1: `Competitor_Data`
Header row:
```
page_name | page_id | page_likes | followers | display_format | cta_type | cta_text | ad_body_text | likes | shares | comments | viewsCount | collation_count | ad_archive_id | start_date | end_date | is_active
```

**วิธีกรอกข้อมูล:**
- รัน **APIFY Facebook Ad Library Scraper** workflow
- รัน **AI Facebook Ad Spy Tool** workflow
- Export ข้อมูลจาก output มาใส่ในนี้

### Sheet 2: `CREMO_Templates`
- Copy ข้อมูลจาก `🎨 CREMO Template Master 2acce42c98ce402aa9dc1d48273967ec_all.csv`
- Paste ทั้งหมดลงใน sheet นี้

### Sheet 3: `Market_Intelligence`
- Copy ข้อมูลจาก `📈 CREMO Market Intelligence eb1973013d9e44fa8cc7ab65acb3a77a_all.csv`
- Paste ทั้งหมดลงใน sheet นี้

### Sheet 4: `Analysis_Results` (ว่างไว้)
Header row เท่านั้น:
```
timestamp | performance_gap | key_insights | template_recommendations | regional_focus | ab_test_count
```

### Sheet 5: `AB_Test_Queue` (ว่างไว้)
Header row เท่านั้น:
```
timestamp | test_id | template | variation | image_prompt | ad_copy | cta | expected_impact | status
```

3. **Copy Sheet URL**
   - จาก URL: `https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXX/edit`
   - Copy ส่วน `XXXXXXXXXXXXX` นี่คือ **Sheet ID**

---

## Step 2: เตรียม Facebook Page ID

1. ไปที่เพจ Facebook ของคุณ
2. ดูที่ About section หรือ
3. ใช้ [FindMyFBID.com](https://findmyfbid.com/) หา Page ID
4. บันทึก Page ID (ตัวเลขยาวๆ เช่น `694634120405666`)

---

## Step 3: Import Workflow

1. เปิด n8n
2. ไปที่ **Workflows** → **Import from File**
3. เลือกไฟล์ `facebook-ad-analysis-ab-testing.json`
4. คลิก **Import**

---

## Step 4: ตั้งค่า Credentials

### Google Sheets
1. **Credentials** → **New** → **Google Sheets OAuth2**
2. Authorize account
3. จดชื่อ credential (เช่น "Google Sheets account")

### Facebook Graph API
1. ไปที่ [Meta for Developers](https://developers.facebook.com/apps)
2. สร้าง App (หรือใช้ของเดิม)
3. **Settings** → **Basic**
4. Copy **App ID** และ **App Secret**
5. ใน n8n: **Credentials** → **New** → **Facebook Graph API**
6. Paste credentials
7. Authentication Method: **OAuth2**
8. คลิก **Connect my account**

### OpenAI
1. ไปที่ [OpenAI API Keys](https://platform.openai.com/api-keys)
2. **Create new secret key**
3. Copy API key
4. ใน n8n: **Credentials** → **New** → **OpenAI**
5. Paste API key

---

## Step 5: แก้ไข Workflow

เปิด workflow และแก้ nodes ดังนี้:

### Node: "Read Competitor Data"
```
Document ID: [YOUR_SHEET_ID]
Sheet Name: Competitor_Data
Credential: [Select your Google Sheets credential]
```

### Node: "Read CREMO Templates"
```
Document ID: [YOUR_SHEET_ID]
Sheet Name: CREMO_Templates
Credential: [Select your Google Sheets credential]
```

### Node: "Read Market Intelligence"
```
Document ID: [YOUR_SHEET_ID]
Sheet Name: Market_Intelligence
Credential: [Select your Google Sheets credential]
```

### Node: "Fetch Own Page Data"
แก้ URL:
```
https://graph.facebook.com/v21.0/[YOUR_PAGE_ID]?fields=name,fan_count,followers_count,engagement
```
เช่น:
```
https://graph.facebook.com/v21.0/694634120405666?fields=name,fan_count,followers_count,engagement
```

### Node: "Save Analysis Summary"
```
Document ID: [YOUR_SHEET_ID]
Sheet Name: Analysis_Results
Credential: [Select your Google Sheets credential]
```

### Node: "Save A/B Tests to Queue"
```
Document ID: [YOUR_SHEET_ID]
Sheet Name: AB_Test_Queue
Credential: [Select your Google Sheets credential]
```

### Node: "AI Strategy Analysis"
```
Credential: [Select your OpenAI credential]
Model: gpt-4o
```

---

## Step 6: ทดสอบ

1. คลิก **Execute Workflow** (ปุ่มเล่น)
2. ดู execution log
3. เช็ค Google Sheets ว่ามีข้อมูลใน:
   - `Analysis_Results` sheet
   - `AB_Test_Queue` sheet

---

## Step 7: Enable Schedule (ถ้าต้องการ)

1. แก้ node "Schedule Daily 9AM" ถ้าต้องการเปลี่ยนเวลา
2. Toggle **Active** switch ที่มุมขวาบน
3. Workflow จะรันอัตโนมัติตามเวลาที่ตั้งไว้

---

## ✅ Checklist

- [ ] สร้าง Google Sheet พร้อม 5 sheets
- [ ] Copy Template Master CSV ลง sheet
- [ ] Copy Market Intelligence CSV ลง sheet
- [ ] กรอกข้อมูล Competitor จาก 2 workflows ที่มี
- [ ] หา Facebook Page ID ของเพจตัวเอง
- [ ] Import workflow ลง n8n
- [ ] ตั้งค่า credentials (Google Sheets, Facebook, OpenAI)
- [ ] แก้ไข Sheet ID ทุก node
- [ ] แก้ไข Page ID ใน Fetch Own Page Data
- [ ] ทดสอบรัน workflow
- [ ] เช็คผลลัพธ์ใน Google Sheets

---

## 🎯 หลังจากนี้

1. **Review Analysis** - อ่านผลวิเคราะห์ที่ AI แนะนำ
2. **Pick Tests** - เลือก A/B test ideas ที่น่าสนใจ
3. **Create Ads** - ใช้ prompts ไปสร้างภาพและโฆษณา
4. **Launch** - ลงโฆษณาจริง
5. **Track** - บันทึกผลกลับมา
6. **Iterate** - รัน workflow ใหม่และปรับปรุง
