# 🚀 Quick Start Guide - CREMO Admin Chatbot Enhanced

**Created:** 2025-11-11
**Time Required:** 30 นาที
**For:** ทดสอบ workflow ได้เลยทันที

---

## 📋 สิ่งที่ต้องเตรียม

ก่อนเริ่มต้อง มี:
- ✅ Supabase Account (มีอยู่แล้ว)
- ✅ n8n Instance (มีอยู่แล้ว)
- ✅ Facebook Page Access Token
- ✅ Cohere API Key (สำหรับ embeddings)
- ✅ OpenRouter API Key (สำหรับ AI)

---

## ⚡ Quick Start (3 ขั้นตอน)

### **Step 1: Setup Database (10 นาที)**

#### 1.1 เปิด Supabase SQL Editor
```
1. ไป https://app.supabase.com
2. เลือก Project
3. ไปที่ SQL Editor
```

#### 1.2 Run Schema Script
```sql
-- Copy ทั้งหมดจาก: database/supabase_schema.sql
-- Paste ใน SQL Editor
-- กด Run (Ctrl+Enter)
```

✅ **ผลลัพธ์:** สร้าง 4 tables สำเร็จ

#### 1.3 Import ข้อมูล
```sql
-- Copy ทั้งหมดจาก: database/migration_scripts.sql
-- Paste ใน SQL Editor
-- กด Run
```

✅ **ผลลัพธ์:** 43 QA scenarios + 29 business data

#### 1.4 Enable Vector Extension
```
1. ไปที่ Database > Extensions
2. ค้นหา "vector"
3. Enable pgvector
```

#### 1.5 เก็บ Credentials
```
Project URL: https://xxxxx.supabase.co
Service Role Key: eyJxxx...
```

---

### **Step 2: Import Workflow (10 นาที)**

#### 2.1 เปิด n8n
```
http://your-n8n-instance:5678
```

#### 2.2 Import Workflow (เลือก 1 วิธี)

**วิธี 1: Import Workflow ใหม่ (แนะนำ)**
```
1. ไปที่ Workflows
2. คลิก "Import from File"
3. เลือก: workflows/enhanced_admin_chatbot.json
4. Save
```

**วิธี 2: Upgrade Workflow เดิม**
```
1. เปิด workflow user-admin_chatbot.json
2. ทำตามคู่มือ: docs/02_WORKFLOW_UPGRADE_GUIDE.md
3. เพิ่ม nodes สำหรับ Smart Batching
4. Save
```

#### 2.3 เชื่อม Credentials

**Supabase:**
```
Host: xxxxx.supabase.co
Service Role Key: eyJxxx...
```

**Cohere:**
```
API Key: your-cohere-key
Model: embed-multilingual-v3.0
```

**OpenRouter:**
```
API Key: your-openrouter-key
Model: google/gemini-2.5-flash
```

**Facebook Messenger:**
```
Page Access Token: your-token
Verify Token: n8n-webhook
Page ID: 107201445711168
```

---

### **Step 3: Test (10 นาที)**

#### 3.1 Enable Workflow
```
1. เปิด workflow
2. คลิก "Active" toggle
3. ตรวจสอบ webhook URL
```

#### 3.2 ทดสอบ 5 Test Cases

**Test 1: Smart Batching**
```
ส่งข้อความ 3 ครั้งติดกัน:
1. "สวัสดีครับ"
2. "ผมสนใจตู้แช่"
3. "ราคาเท่าไหร่"

✅ Expected: ได้ 1 response รวม (ไม่เบิ้ล)
```

**Test 2: Image Response**
```
ถาม: "ให้บริการที่ไหนบ้างครับ"

✅ Expected: ได้รูปภาพแผนที่ + ข้อความ
```

**Test 3: Dynamic Content**
```
ถาม: "โปรโมชั่นอะไรบ้าง"

✅ Expected: ข้อมูลโปรโมชั่นจาก business_data
```

**Test 4: Session History**
```
1. ถาม: "สนใจตู้แช่ครับ"
2. รอ 1 นาที
3. ถาม: "ที่เคยถามไปเมื่อกี้นั่นล่ะ"

✅ Expected: จำบทสนทนาได้
```

**Test 5: Thai Context**
```
ถาม: "ขายอะไร"

✅ Expected: ตอบด้วยน้ำเสียง "น้องโม" แบบเป็นกันเอง
```

---

## ✅ Checklist ก่อนใช้งานจริง

### Database:
- [ ] 4 tables created
- [ ] 43 QA scenarios imported
- [ ] 29 business data imported
- [ ] pgvector enabled

### n8n Workflow:
- [ ] Workflow imported/upgraded
- [ ] All credentials connected
- [ ] Workflow activated
- [ ] Webhook URL configured

### Facebook:
- [ ] Webhook verified
- [ ] Page Access Token valid
- [ ] Test message successful

### Testing:
- [ ] Smart Batching works (no duplicates)
- [ ] Image sending works
- [ ] Dynamic content replacement works
- [ ] Session history works
- [ ] Thai business context correct

---

## 🔧 Quick Troubleshooting

### ปัญหา: Workflow ไม่ active ได้
**แก้:** ตรวจสอบ credentials ทั้งหมดต้องเชื่อมถูก

### ปัญหา: ส่งข้อความแล้วไม่ตอบกลับ
**แก้:**
1. ดู n8n execution logs
2. ตรวจสอบ webhook URL
3. ตรวจสอบ Facebook Page Access Token

### ปัญหา: ตอบข้อความซ้ำ (duplicate)
**แก้:** ตรวจสอบ Smart Batching nodes:
- Wait node ต้องตั้ง 5 seconds
- มี "Mark as Processed" node
- Query ต้องมี `WHERE processed = false`

### ปัญหา: ไม่ส่งรูปภาพ
**แก้:**
1. ตรวจสอบ image_url มีใน database
2. ตรวจสอบ "Image URL Extractor" node
3. ตรวจสอบ Facebook template ต้องเป็น "Generic Template"

### ปัญหา: ไม่แทนที่ business_data
**แก้:** ตรวจสอบ "Dynamic Content Replacer" node:
```javascript
const placeholderRegex = /\(ดึงจาก business_data: ([^)]+)\)/g;
```

---

## 📊 Quick Verification Queries

### ตรวจสอบข้อมูล Database:
```sql
-- ตรวจนับจำนวนข้อมูล
SELECT
  (SELECT COUNT(*) FROM qa_scenarios) as qa_count,
  (SELECT COUNT(*) FROM business_data) as business_count;

-- Expected: qa_count=43, business_count=29
```

### ตรวจสอบ Vector Extension:
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Expected: 1 row returned
```

### ตรวจสอบ Indexes:
```sql
SELECT tablename, COUNT(*) as index_count
FROM pg_indexes
WHERE tablename IN (
  'enhanced_chat_sessions',
  'qa_scenarios',
  'business_data',
  'customer_check'
)
GROUP BY tablename;

-- Expected: 15-20 indexes total
```

---

## 📚 คู่มือเพิ่มเติม

### หลังจากทดสอบเบื้องต้นสำเร็จแล้ว:

**การใช้งานประจำวัน:**
- [User Guide →](03_USER_GUIDE.md)

**ทดสอบครบทั้ง 25 test cases:**
- [Testing Guide →](03_TESTING_GUIDE.md)

**Deploy Production:**
- [Deployment Checklist →](04_DEPLOYMENT_CHECKLIST.md)

**อ่านเพิ่มเติมเกี่ยว Database:**
- [Database Reference →](DATABASE_REFERENCE.md)
- [Supabase Setup Guide →](01_SUPABASE_SETUP_GUIDE.md)

**Upgrade Workflow เดิม:**
- [Workflow Upgrade Guide →](02_WORKFLOW_UPGRADE_GUIDE.md)

---

## 🎯 Success Criteria

หลังทำตาม Quick Start นี้เสร็จ คุณจะสามารถ:

✅ ส่งข้อความถึง Facebook Page แล้วได้รับการตอบกลับ
✅ ส่งข้อความหลายครั้งติดกัน ได้ 1 response (ไม่ซ้ำ)
✅ ถามเรื่องสถานที่ให้บริการ ได้รูปแผนที่ + ข้อความ
✅ ถามเรื่องโปรโมชั่น ได้ข้อมูลจาก business_data
✅ AI จดจำบทสนทนาได้ (session history)
✅ AI ตอบด้วยน้ำเสียง "น้องโม" แบบเป็นกันเอง

---

## 📞 ติดปัญหา?

### Debug Workflow:
```
1. เปิด workflow
2. ไปที่ Executions tab
3. ดู error logs
4. คลิก execution แต่ละอันเพื่อดู node output
```

### Debug Database:
```sql
-- ดูข้อความล่าสุด
SELECT * FROM enhanced_chat_sessions
ORDER BY created_at DESC
LIMIT 5;

-- ดูสถานะ processing
SELECT user_id, processed, created_at
FROM enhanced_chat_sessions
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Debug Facebook:
```
1. ไปที่ Facebook Developer Console
2. ตรวจสอบ Webhooks Subscriptions
3. ดู webhook logs
```

---

## 🚀 Ready to Go!

ตอนนี้คุณพร้อมใช้งานแล้ว!

**Next Actions:**
1. ✅ ทดสอบทั้ง 5 test cases
2. ✅ ถ้าผ่านหมด ไปอ่าน Testing Guide สำหรับ 25 test cases
3. ✅ ถ้าพร้อม Deploy production ไปดู Deployment Checklist

---

## 📦 ไฟล์ที่สำคัญ

```
admin_chatbot_rag/
├── database/
│   ├── supabase_schema.sql         ← Run ก่อน
│   └── migration_scripts.sql       ← Run หลัง
├── workflows/
│   └── enhanced_admin_chatbot.json ← Import ใน n8n
└── docs/
    ├── 00_QUICK_START_GUIDE.md     ← อ่านไฟล์นี้
    ├── 01_SUPABASE_SETUP_GUIDE.md  ← Step-by-step Supabase
    ├── 02_WORKFLOW_UPGRADE_GUIDE.md ← Upgrade workflow เดิม
    ├── 03_TESTING_GUIDE.md         ← ทดสอบ 25 test cases
    ├── 04_DEPLOYMENT_CHECKLIST.md  ← Deploy production
    └── DATABASE_REFERENCE.md       ← Database documentation
```

---

**Last Updated:** 2025-11-11
**Version:** 1.0
**Status:** Ready to Test

**Good luck! 🎉**
