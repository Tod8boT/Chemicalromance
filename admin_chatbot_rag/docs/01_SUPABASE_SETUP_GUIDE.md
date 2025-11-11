# 📘 คู่มือการ Setup Supabase - CREMO Admin Chatbot

**Created:** 2025-11-11
**For:** CREMO Admin Chatbot Enhanced
**Time Required:** 15-20 นาที

---

## 🎯 สิ่งที่จะได้

หลังจากทำตามคู่มือนี้ คุณจะได้:
- ✅ Supabase database พร้อม 4 tables
- ✅ ข้อมูล 43 QA scenarios + 29 business variables
- ✅ Vector Store สำหรับ RAG
- ✅ Credentials สำหรับเชื่อม n8n

---

## 📋 ขั้นตอนที่ 1: เข้า Supabase Dashboard

### 1.1 เข้าสู่ระบบ
1. ไป https://app.supabase.com
2. เข้าสู่ระบบด้วย account ของคุณ
3. เลือก Project ที่คุณต้องการใช้งาน (หรือสร้างใหม่)

### 1.2 เก็บข้อมูล Connection
ไปที่ **Settings** > **API** แล้วเก็บข้อมูลเหล่านี้:

```
Project URL: https://xxxxx.supabase.co
API Key (anon, public): eyJxxx...
Service Role Key: eyJxxx... (สำหรับ admin operations)
```

⚠️ **สำคัญ:** เก็บ Service Role Key ไว้เป็นความลับ!

---

## 📋 ขั้นตอนที่ 2: สร้าง Database Tables

### 2.1 เปิด SQL Editor
1. ไปที่ **SQL Editor** ในเมนูซ้าย
2. คลิก **New query**

### 2.2 Run Schema Script
1. เปิดไฟล์: `database/supabase_schema.sql`
2. Copy โค้ดทั้งหมด
3. Paste ลงใน SQL Editor
4. คลิก **Run** (หรือ Ctrl+Enter)

### 2.3 ตรวจสอบผลลัพธ์
ควรเห็นข้อความสำเร็จ:
```
Success. Created 4 tables:
- enhanced_chat_sessions
- qa_scenarios
- business_data
- customer_check
```

### 2.4 ตรวจสอบ Tables
ไปที่ **Table Editor** ควรเห็น tables ใหม่ทั้ง 4 ตัว

---

## 📋 ขั้นตอนที่ 3: Import ข้อมูล

### 3.1 Run Migration Script
1. กลับไปที่ **SQL Editor**
2. เปิดไฟล์: `database/migration_scripts.sql`
3. Copy โค้ดทั้งหมด
4. Paste และ **Run**

### 3.2 ตรวจสอบข้อมูล
Run query นี้เพื่อตรวจสอบ:

```sql
SELECT
  'qa_scenarios' as table_name,
  COUNT(*) as record_count
FROM qa_scenarios
UNION ALL
SELECT
  'business_data' as table_name,
  COUNT(*) as record_count
FROM business_data;
```

**ผลลัพธ์ที่ถูกต้อง:**
```
table_name     | record_count
---------------|-------------
qa_scenarios   | 43
business_data  | 29
```

---

## 📋 ขั้นตอนที่ 4: Setup Vector Store (สำหรับ RAG)

### 4.1 Enable Vector Extension
1. ไปที่ **Database** > **Extensions**
2. ค้นหา `vector`
3. คลิก **Enable** ข้างๆ `pgvector`

### 4.2 สร้าง Vector Store Tables
Vector Store tables จะถูกสร้างอัตโนมัติโดย n8n เมื่อใช้งานครั้งแรก

Tables ที่จะถูกสร้าง:
- `documents` - เก็บ embeddings
- (metadata สำหรับ filtering)

---

## 📋 ขั้นตอนที่ 5: Test Connection

### 5.1 Test Basic Query
Run query นี้:

```sql
-- ทดสอบ QA scenarios
SELECT category, COUNT(*) as count
FROM qa_scenarios
GROUP BY category
ORDER BY count DESC;

-- ทดสอบ business data
SELECT category, COUNT(*) as count
FROM business_data
GROUP BY category
ORDER BY count DESC;
```

### 5.2 Test Sample Data
```sql
-- ดู QA scenario ตัวอย่าง
SELECT * FROM qa_scenarios WHERE category = 'location' LIMIT 3;

-- ดู business data ตัวอย่าง
SELECT * FROM business_data WHERE category = 'price' LIMIT 3;
```

---

## 📋 ขั้นตอนที่ 6: เตรียม Credentials สำหรับ n8n

### 6.1 เก็บข้อมูลเหล่านี้:
```
Supabase Project URL: https://xxxxx.supabase.co
Supabase Service Role Key: eyJxxx...
```

### 6.2 สร้าง Credential ใน n8n
1. เปิด n8n
2. ไปที่ **Credentials** > **New**
3. เลือก **Supabase**
4. กรอกข้อมูล:
   - **Host:** xxxxx.supabase.co (ไม่ต้องมี https://)
   - **Service Role Key:** eyJxxx...
5. **Save**

---

## 📋 ขั้นตอนที่ 7: ตรวจสอบ Indexes

### 7.1 Check Indexes
Run query นี้เพื่อดู indexes:

```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN (
  'enhanced_chat_sessions',
  'qa_scenarios',
  'business_data',
  'customer_check'
)
ORDER BY tablename, indexname;
```

ควรเห็น indexes ประมาณ 15-20 indexes

---

## 📋 ขั้นตอนที่ 8: Optional - Enable Row Level Security (RLS)

### 8.1 ถ้าต้องการความปลอดภัยเพิ่ม
```sql
-- Enable RLS
ALTER TABLE enhanced_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_check ENABLE ROW LEVEL SECURITY;

-- Create policies (ตัวอย่าง)
-- Public read access for qa_scenarios
CREATE POLICY "Public read access"
ON qa_scenarios
FOR SELECT
USING (true);

-- Service role full access
CREATE POLICY "Service role full access"
ON qa_scenarios
FOR ALL
USING (auth.role() = 'service_role');
```

---

## ✅ Checklist สำหรับตรวจสอบ

- [ ] เข้า Supabase Dashboard ได้
- [ ] Run `supabase_schema.sql` สำเร็จ (4 tables created)
- [ ] Run `migration_scripts.sql` สำเร็จ (43 + 29 records)
- [ ] Enable `pgvector` extension แล้ว
- [ ] Test query ข้อมูลได้
- [ ] เก็บ Project URL + Service Role Key ไว้แล้ว
- [ ] สร้าง Supabase credential ใน n8n แล้ว

---

## 🔧 Troubleshooting

### ปัญหา: Cannot create table
**สาเหตุ:** อาจมี table ชื่อซ้ำอยู่แล้ว
**แก้ไข:**
```sql
-- ลบ table เก่า (ระวัง: ข้อมูลจะหายหมด)
DROP TABLE IF EXISTS enhanced_chat_sessions CASCADE;
DROP TABLE IF EXISTS qa_scenarios CASCADE;
DROP TABLE IF EXISTS business_data CASCADE;
DROP TABLE IF EXISTS customer_check CASCADE;

-- แล้ว run schema script ใหม่
```

### ปัญหา: Permission denied
**สาเหตุ:** ใช้ API Key ผิดประเภท
**แก้ไข:** ใช้ **Service Role Key** ไม่ใช่ anon key

### ปัญหา: Vector extension not found
**สาเหตุ:** ยังไม่ได้ enable pgvector
**แก้ไข:** ไปที่ Database > Extensions > Enable pgvector

---

## 📊 โครงสร้าง Tables (สรุป)

### Table 1: enhanced_chat_sessions
```
Columns: 11 columns
Primary use: Smart message batching + session history
Key columns: user_id, merged_message, processed
Indexes: 4 indexes
```

### Table 2: qa_scenarios
```
Columns: 11 columns
Primary use: Q&A knowledge base with images
Key columns: category, customer_question, reply, image_url
Indexes: 5 indexes
Records: 43 scenarios
```

### Table 3: business_data
```
Columns: 9 columns
Primary use: Dynamic business information
Key columns: variable, description, category
Indexes: 4 indexes
Records: 29 variables
```

### Table 4: customer_check
```
Columns: 13 columns
Primary use: Customer tracking and status
Key columns: psid, status, intent_history
Indexes: 4 indexes
```

---

## 📞 ขั้นตอนถัดไป

หลังจาก Setup Supabase เสร็จแล้ว:
1. ✅ ไปที่ `02_N8N_WORKFLOW_IMPORT_GUIDE.md`
2. Import workflow `enhanced_admin_chatbot.json`
3. เชื่อม Supabase credentials
4. ทดสอบระบบ

---

## 🎉 สำเร็จ!

ตอนนี้ Supabase database ของคุณพร้อมใช้งานแล้ว!

**Next Steps:**
- [คู่มือ Import Workflow →](02_N8N_WORKFLOW_IMPORT_GUIDE.md)
- [คู่มือการใช้งาน →](03_USER_GUIDE.md)
- [คู่มือทดสอบ →](04_TESTING_GUIDE.md)

---

**Last Updated:** 2025-11-11
**Version:** 1.0
**Need Help?** ดูคำถามที่พบบ่อยใน `05_FAQ.md`
