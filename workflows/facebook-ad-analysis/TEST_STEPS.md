# คู่มือทดสอบ Workflow ทีละขั้นตอน

## เตรียมความพร้อม

### 1. สร้าง Google Sheet ใหม่
```
1. ไปที่ Google Sheets
2. สร้าง Sheet ใหม่ ชื่อ "CREMO Facebook Analysis"
3. สร้าง 5 tabs:
   - Competitor_Data
   - CREMO_Templates
   - Market_Intelligence
   - Analysis_Results
   - AB_Test_Queue
```

### 2. Import ข้อมูล CSV
```
1. เปิดไฟล์ data/cremo-templates.csv
2. Copy ข้อมูลไปวางใน tab "CREMO_Templates"
3. เปิดไฟล์ data/market-intelligence.csv
4. Copy ข้อมูลไปวางใน tab "Market_Intelligence"
```

### 3. ใส่ข้อมูล Competitor (ชั่วคราว)
```
ถ้ายังไม่มีข้อมูลจาก workflow อื่น ให้ใส่ข้อมูลทดสอบใน tab "Competitor_Data":

| page_name | post_text | engagement | ad_type |
|-----------|-----------|------------|---------|
| Walls Thailand | ไอศกรีมรสใหม่! | 1500 | Image |
| Swensen's | โปรโมชั่นสุดคุ้ม | 2300 | Video |
```

### 4. Copy Sheet ID
```
1. ดูที่ URL: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
2. Copy ส่วน YOUR_SHEET_ID
```

---

## Import Workflow ใน n8n

### 5. Import workflow.json
```
1. เปิด n8n
2. คลิก "Import from File"
3. เลือกไฟล์ workflow.json
4. กด Import
```

### 6. ตั้งค่า Google Sheets Nodes (5 nodes)
```
แก้ทั้ง 5 nodes นี้:
1. Read Competitor Data
2. Read Templates
3. Read Market Intel
4. Save Analysis
5. Save Tests

ในแต่ละ node:
- เปลี่ยน "YOUR_SHEET_ID" → Sheet ID จริงของคุณ
- เลือก Credential (Google OAuth2)
```

### 7. ตั้งค่า OpenAI Node
```
ใน node "AI Analysis":
- เลือก OpenAI Credential
- ตรวจสอบว่าเป็น gpt-4o
```

---

## ทดสอบ Workflow

### 8. ทดสอบทีละ Node

#### ทดสอบ Step 1: อ่านข้อมูล
```
1. คลิก node "Read Competitor Data"
2. กด "Test step"
3. ดูผลลัพธ์ → ต้องเห็นข้อมูลจาก Sheet

ทำซ้ำกับ:
- Read Templates
- Read Market Intel
```

#### ทดสอบ Step 2-3: Merge + AI
```
1. คลิก node "Merge Data"
2. กด "Test step"
3. ดูว่ารวมข้อมูลได้ครบ 3 แหล่ง

4. คลิก node "AI Analysis"
5. กด "Test step" (จะใช้เวลาประมาณ 10-20 วินาที)
6. ดูผลลัพธ์ → ต้องได้ JSON response
```

#### ทดสอบ Step 4: บันทึกผล
```
1. คลิก node "Save Analysis"
2. กด "Test step"
3. เช็คที่ Google Sheets tab "Analysis_Results" → ต้องมีข้อมูลใหม่

4. คลิก node "Save Tests"
5. กด "Test step"
6. เช็คที่ Google Sheets tab "AB_Test_Queue" → ต้องมี A/B test ideas
```

### 9. รัน Workflow ทั้งหมด
```
1. กลับไปที่หน้าแรกของ workflow
2. กด "Execute Workflow" (ปุ่มสีฟ้า)
3. รอประมาณ 30 วินาที
4. เช็คผลลัพธ์ใน Google Sheets
```

---

## เช็คผลลัพธ์

### ✅ สิ่งที่ต้องได้

**ใน tab "Analysis_Results":**
- timestamp
- performance_gap (ช่องว่างระหว่างเรากับคู่แข่ง)
- key_insights (ข้อสังเกต 3-5 ข้อ)
- regional_focus (ภูมิภาคที่แนะนำ)
- ab_test_count (จำนวน A/B tests)

**ใน tab "AB_Test_Queue":**
- test_id (A1, A2, A3)
- template (ชื่อเทมเพลตที่ใช้)
- variation (รายละเอียดการทดสอบ)
- image_prompt (prompt สำหรับสร้างภาพ)
- ad_copy (ข้อความโฆษณา)
- cta (Call-to-Action)
- expected_impact (ผลลัพธ์ที่คาดหวัง)
- status (pending)

---

## แก้ปัญหา

### ❌ Error: "Cannot read sheet"
```
→ เช็ค Sheet ID ว่าถูกต้อง
→ เช็ค Google credential ว่าเชื่อมต่อแล้ว
→ เช็ค tab name ว่าสะกดถูกต้อง
```

### ❌ Error: "OpenAI authentication failed"
```
→ เช็ค OpenAI API key
→ เช็คว่า account มี credits
→ เช็คว่าเปิดใช้งาน gpt-4o แล้ว
```

### ❌ Error: "JSON parse error"
```
→ ปกติไม่น่าเกิด เพราะมี error handling
→ ถ้าเกิด ให้ดูที่ node "Parse AI Response"
→ จะได้ default values แทน
```

### ❌ ไม่มีข้อมูลใน "AB_Test_Queue"
```
→ AI อาจไม่ได้สร้าง A/B tests
→ เช็คที่ "Analysis_Results" ว่ามีข้อมูลไหม
→ ลองรันใหม่
```

---

## เสร็จแล้วทำอะไรต่อ?

1. **ดูผลวิเคราะห์** ใน Analysis_Results
2. **เลือก A/B test** ที่ชอบจาก AB_Test_Queue
3. **สร้างโฆษณา** ตาม image_prompt และ ad_copy
4. **รัน workflow ทุกสัปดาห์** เพื่อ update insights

---

**เวอร์ชัน:** 1.0
**อัพเดท:** 2025-11-08
