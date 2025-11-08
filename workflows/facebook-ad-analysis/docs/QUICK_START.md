# ⚡ Quick Start - Facebook Ad Analysis Workflow

## ปัญหาที่แก้ไข (v2)

- ✅ ทำให้ workflow ง่ายขึ้น ใช้ Manual Trigger
- ✅ ลบ Code ที่ซับซ้อนออก ใช้ Set nodes
- ✅ แก้ไข Merge logic ให้ถูกต้อง
- ✅ ปรับ AI node ให้ใช้งานได้จริง
- ✅ เพิ่ม error handling

---

## 🚀 Setup ใน 5 นาที

### 1. เตรียม Google Sheet

สร้าง Google Sheet ใหม่ชื่อ **"CREMO Ad Analysis"** ด้วย 5 sheets:

#### Sheet 1: `Competitor_Data`
```
page_name | page_likes | display_format | cta_type | ad_body_text | likes | shares | comments
```
ตัวอย่าง:
```
ไอศครีมครีโม | 2480 | VIDEO | LIKE_PAGE | สนใจลงตู้... | 150 | 45 | 23
```

#### Sheet 2: `CREMO_Templates`
Copy จาก: `🎨 CREMO Template Master CSV`

#### Sheet 3: `Market_Intelligence`
Copy จาก: `📈 CREMO Market Intelligence CSV`

#### Sheet 4: `Analysis_Results` (ว่างไว้)
```
timestamp | performance_gap | key_insights | opportunities | regional_focus | ab_test_count
```

#### Sheet 5: `AB_Test_Queue` (ว่างไว้)
```
timestamp | test_id | template | variation | image_prompt | ad_copy | cta | expected_impact | status
```

**Copy Sheet ID:**
- URL: `https://docs.google.com/spreadsheets/d/XXXXX/edit`
- Copy `XXXXX` นี่คือ Sheet ID

---

### 2. Import Workflow

1. เปิด n8n
2. **Workflows** → **Import from File**
3. เลือก `facebook-ad-analysis-ab-testing.json`
4. **Import**

---

### 3. Setup Credentials

#### Google Sheets
1. **Credentials** → **New** → **Google Sheets OAuth2**
2. **Authorize** → **Save**

#### OpenAI
1. Get API key จาก [OpenAI](https://platform.openai.com/api-keys)
2. **Credentials** → **New** → **OpenAI**
3. Paste key → **Save**

---

### 4. แก้ไข Sheet ID

เปิด workflow → แก้ **ทุก Google Sheets nodes**:

```
Document ID: [PASTE_YOUR_SHEET_ID_HERE]
```

Nodes ที่ต้องแก้ (5 nodes):
- ✏️ Read Competitor Data
- ✏️ Read Templates
- ✏️ Read Market Intel
- ✏️ Save Analysis
- ✏️ Save Tests

---

### 5. เลือก Credentials

แก้ credentials ใน nodes:

**Google Sheets nodes (5 nodes):**
```
Credential: [Select your Google Sheets OAuth2]
```

**AI Analysis node:**
```
Credential: [Select your OpenAI]
```

---

### 6. ทดสอบ

1. คลิก **Execute Workflow** (ปุ่มเล่น ▶️)
2. ดู execution log
3. เช็ค Google Sheets ผลลัพธ์:
   - Sheet `Analysis_Results` - มี 1 row ใหม่
   - Sheet `AB_Test_Queue` - มี 3 rows (A/B tests)

---

## ✅ Checklist

- [ ] สร้าง Google Sheet (5 sheets)
- [ ] Copy Template Master CSV
- [ ] Copy Market Intelligence CSV
- [ ] กรอกข้อมูล Competitor (จาก workflows ที่มี)
- [ ] Copy Sheet ID
- [ ] Import workflow ลง n8n
- [ ] Setup Google Sheets credential
- [ ] Setup OpenAI credential
- [ ] แก้ Sheet ID (5 nodes)
- [ ] เลือก credentials (6 nodes)
- [ ] ทดสอบรัน workflow
- [ ] เช็คผลใน Google Sheets

---

## 🎯 Workflow Flow

```
Manual Trigger
    ↓
[Parallel reads]
├─ Read Competitor Data
├─ Read Templates
└─ Read Market Intel
    ↓
[Set nodes] - จัดรูปแบบข้อมูล
├─ Set Competitor
├─ Set Templates
└─ Set Intel
    ↓
Merge Data (combine by position)
    ↓
AI Analysis (GPT-4o)
    ↓
Parse AI Response (clean JSON)
    ↓
[Split output]
├─ Save Analysis → Google Sheets
└─ Split Tests → Save Tests → Google Sheets
```

---

## 🐛 Troubleshooting

### Error: "Missing credentials"
**แก้:** เลือก credential ในทุก nodes ที่ต้องใช้

### Error: "Sheet not found"
**แก้:** ตรวจสอบชื่อ sheet ต้องตรงกับใน Google Sheet

### Error: "Invalid JSON from AI"
**แก้:** Parse node จะจัดการให้ ถ้ายังมีปัญหา ลองรันใหม่

### Workflow รันไม่สำเร็จ
1. ดู execution log
2. เช็คว่า Google Sheets มีข้อมูล
3. เช็คว่า OpenAI API key ใช้งานได้
4. ลอง Execute แต่ละ node ทีละตัว

---

## 📈 Next Steps

หลังรัน workflow สำเร็จ:

1. **Review Analysis** - ดูผลวิเคราะห์ใน `Analysis_Results`
2. **Pick Tests** - เลือก A/B test จาก `AB_Test_Queue`
3. **Create Ads** - ใช้ image_prompt สร้างภาพ
4. **Launch** - ลงโฆษณาจริง
5. **Track** - บันทึกผลและ iterate

---

## 🔄 Update to Scheduled Version

ถ้าต้องการให้รันอัตโนมัติทุกวัน:

1. ลบ "Manual Trigger" node
2. เพิ่ม "Schedule Trigger" node:
   ```
   Type: Schedule Trigger
   Cron: 0 9 * * * (9:00 AM daily)
   ```
3. Connect to "Read Competitor Data" node
4. **Save** → Toggle **Active** switch

---

## 💡 Tips

1. **ทดสอบด้วยข้อมูลน้อยๆ ก่อน** - 1-2 rows
2. **เช็ค AI response** - ดูว่า JSON ถูกต้องไหม
3. **เพิ่ม own page data** - ต่อ Facebook Graph API node ทีหลัง
4. **Customize AI prompt** - แก้ system message ให้เหมาะกับธุรกิจ
5. **Backup sheets** - Export Google Sheets เป็นประจำ

---

## 📞 Help

ถ้าติดปัญหา:
1. เช็ค execution log ใน n8n
2. อ่าน error message
3. ดู [n8n docs](https://docs.n8n.io)
4. เปิด issue ใน GitHub repo
