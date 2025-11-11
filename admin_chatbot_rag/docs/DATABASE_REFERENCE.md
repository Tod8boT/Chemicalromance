# 📚 CREMO Admin Chatbot - รายละเอียดฐานข้อมูลแบบเต็ม

**Created:** 2025-11-11
**Purpose:** อธิบายรายละเอียด tables และ columns ทั้งหมด
**For:** Developers และ System Administrators

---

## 📊 ภาพรวมฐานข้อมูล

```
Database: Supabase (PostgreSQL 15)
Total Tables: 4 main tables + 1 vector store table
Total Indexes: ~17 indexes
Extensions: pgvector (for embeddings)
```

---

## 🗃️ TABLE 1: enhanced_chat_sessions

### 📝 **ภาพรวม:**
เก็บข้อมูลการสนทนากับลูกค้า พร้อม Smart Batching และ Session-aware History

### 📋 **Columns:**

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| **id** | SERIAL | NO | auto | Primary key, รหัสเฉพาะของแต่ละ message |
| **user_id** | VARCHAR(255) | NO | - | รหัสผู้ใช้ (Facebook PSID หรือ custom ID) |
| **psid** | VARCHAR(255) | YES | NULL | Facebook Page-Scoped ID |
| **user_text** | TEXT | YES | NULL | ข้อความจริงจากผู้ใช้ |
| **merged_message** | TEXT | YES | NULL | ข้อความที่รวมแล้ว (หลังจาก 5-sec batching) |
| **ai_response** | TEXT | YES | NULL | คำตอบจาก AI |
| **old_session_history** | TEXT | YES | NULL | บทสนทนาวันก่อนหน้า (session แยก) |
| **now_session_history** | TEXT | YES | NULL | บทสนทนาวันนี้ |
| **intent_classification** | VARCHAR(50) | YES | NULL | ประเภทความตั้งใจ (Inquiry/Interest/Ready/etc.) |
| **processed** | BOOLEAN | NO | false | สถานะการประมวลผล (false=รอ, true=เสร็จแล้ว) |
| **created_at** | TIMESTAMP | NO | NOW() | เวลาที่สร้าง record |
| **updated_at** | TIMESTAMP | NO | NOW() | เวลาที่แก้ไขล่าสุด (auto-update) |

### 🔑 **Keys & Indexes:**
```sql
PRIMARY KEY: id
INDEXES:
  - idx_enhanced_chat_user_processed (user_id, processed) -- สำหรับ batching
  - idx_enhanced_chat_psid (psid) -- ค้นหาตาม Facebook ID
  - idx_enhanced_chat_created (created_at DESC) -- เรียงตามเวลา
  - idx_enhanced_chat_intent (intent_classification) -- กรองตาม intent
```

### 💡 **Use Cases:**
1. **Smart Batching:** ใช้ `processed = false` เพื่อหาข้อความที่รอรวม
2. **Session History:** ใช้ `old_session_history` และ `now_session_history`
3. **Intent Tracking:** ติดตามว่าลูกค้าสนใจอะไร
4. **Analytics:** วิเคราะห์ปริมาณการสนทนา

### 📊 **Sample Data:**
```sql
id: 1
user_id: "25080082301653737"
psid: "25080082301653737"
user_text: "สอบถามราคา"
merged_message: "สอบถามราคา ตู้ใหญ่แค่ไหน"  -- รวม 2 messages
ai_response: "ขอเช็คโปรโมชั่นล่าสุด... บิลแรก 1,500 บาทค่ะ"
old_session_history: "--- Session 2025-11-10 ---\nUser: สวัสดี..."
now_session_history: "--- Session 2025-11-11 ---\nUser: สอบถามราคา..."
intent_classification: "Inquiry"
processed: true
created_at: 2025-11-11 10:30:00
updated_at: 2025-11-11 10:30:05
```

### ⚙️ **Triggers:**
```sql
TRIGGER: update_enhanced_chat_sessions_updated_at
  - Auto-update updated_at เมื่อมีการแก้ไข
```

---

## 🗃️ TABLE 2: qa_scenarios

### 📝 **ภาพรวม:**
Q&A Knowledge Base พร้อมรูปภาพประกอบ สำหรับ RAG

### 📋 **Columns:**

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| **id** | SERIAL | NO | auto | Primary key |
| **category** | VARCHAR(100) | NO | - | หมวดหมู่ (location/price_question/freezer_info/contract/school_special/product_info/objection/follow_up) |
| **customer_question** | TEXT | NO | - | คำถามตัวอย่างจากลูกค้า |
| **reply** | TEXT | NO | - | คำตอบแนะนำ (อาจมี placeholder) |
| **image_url** | TEXT | YES | NULL | URL รูปภาพประกอบ (Cloudinary) |
| **image_urls** | TEXT[] | YES | NULL | รูปภาพหลายรูป (array) |
| **priority** | INTEGER | NO | 1 | ลำดับความสำคัญ (1=สูง, 2=กลาง, 3=ต่ำ) |
| **active** | BOOLEAN | NO | true | เปิด/ปิดใช้งาน (ไม่ต้องลบ) |
| **tags** | TEXT[] | YES | NULL | Tags สำหรับค้นหา |
| **notes** | TEXT | YES | NULL | บันทึกภายใน |
| **created_at** | TIMESTAMP | NO | NOW() | เวลาที่สร้าง |
| **updated_at** | TIMESTAMP | NO | NOW() | เวลาที่แก้ไข (auto-update) |

### 🔑 **Keys & Indexes:**
```sql
PRIMARY KEY: id
INDEXES:
  - idx_qa_category (category) -- ค้นหาตาม category
  - idx_qa_active (active) -- กรองเฉพาะที่ active
  - idx_qa_priority (priority) -- เรียงตามความสำคัญ
  - idx_qa_tags USING GIN(tags) -- Full-text search ใน tags
```

### 💡 **Categories (8 ประเภท):**
```
1. location (7 scenarios) - สอบถามพื้นที่บริการ, Priority 1
2. price_question (10 scenarios) - สอบถามราคา, โปรโมชั่น, Priority 1
3. freezer_info (8 scenarios) - สอบถามเกี่ยวกับตู้แช่, Priority 2
4. contract (5 scenarios) - สัญญา เงื่อนไข, Priority 2
5. school_special (3 scenarios) - กรณีพิเศษโรงเรียน, Priority 2
6. product_info (3 scenarios) - สอบถามสินค้า, Priority 3
7. objection (3 scenarios) - จัดการข้อกังวล, Priority 3
8. follow_up (4 scenarios) - ติดตามผล, Priority 3
```

### 📊 **Sample Data:**
```sql
id: 1
category: "location"
customer_question: "ให้บริการกรุงเทพไหม"
reply: "ให้บริการทั่วไทยค่ะ กทม.ก็ได้ พี่อยู่แถวไหนคะ..."
image_url: "https://res.cloudinary.com/.../cremo-thailand-map.jpg"
image_urls: NULL
priority: 1
active: true
tags: {"กรุงเทพ", "พื้นที่บริการ", "location"}
notes: "High priority - location inquiry"
created_at: 2025-11-11 09:00:00
updated_at: 2025-11-11 09:00:00
```

### 🎯 **Dynamic Placeholders:**
Reply อาจมี placeholders แบบนี้:
```
"(ดึงจาก business_data: โปรโมชั่นปัจจุบัน)"
"(ดึงจาก business_data: ค่าใช้จ่ายทั้งหมด)"
"(ดึงจาก business_data: กำไรโดยเฉลี่ย)"
```
Workflow จะ replace placeholders ด้วยข้อมูลจริงจาก `business_data` table

### ⚙️ **Triggers:**
```sql
TRIGGER: update_qa_scenarios_updated_at
  - Auto-update updated_at
```

---

## 🗃️ TABLE 3: business_data

### 📝 **ภาพรวม:**
ข้อมูลธุรกิจของ CREMO ที่สามารถเปลี่ยนแปลงได้ (Dynamic Content)

### 📋 **Columns:**

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| **id** | SERIAL | NO | auto | Primary key |
| **variable** | VARCHAR(100) | NO | UNIQUE | ชื่อตัวแปร (ใช้ใน placeholder) |
| **description** | TEXT | NO | - | เนื้อหาจริงของข้อมูลธุรกิจ |
| **category** | VARCHAR(50) | YES | NULL | หมวดหมู่ (price/product/freezer/contract/service) |
| **types_of_conversation** | VARCHAR(50) | YES | NULL | ประเภทการสนทนาที่เกี่ยวข้อง |
| **image_urls** | TEXT[] | YES | NULL | รูปภาพที่เกี่ยวข้อง |
| **tags** | TEXT[] | YES | NULL | Tags สำหรับค้นหา |
| **notes** | TEXT | YES | NULL | บันทึกภายใน |
| **created_at** | TIMESTAMP | NO | NOW() | เวลาที่สร้าง |
| **updated_at** | TIMESTAMP | NO | NOW() | เวลาที่แก้ไข (auto-update) |

### 🔑 **Keys & Indexes:**
```sql
PRIMARY KEY: id
UNIQUE: variable
INDEXES:
  - idx_business_variable (variable) -- ค้นหาตามชื่อตัวแปร (FAST)
  - idx_business_category (category) -- กรองตาม category
  - idx_business_updated (updated_at DESC) -- เรียงตามการแก้ไขล่าสุด
  - idx_business_tags USING GIN(tags) -- Full-text search
```

### 💡 **Categories (5 ประเภท):**
```
1. price (10 variables) - ข้อมูลราคา โปรโมชั่น
2. product (3 variables) - ข้อมูลสินค้า
3. freezer (6 variables) - ข้อมูลตู้แช่
4. contract (3 variables) - สัญญา เงื่อนไข
5. service (7 variables) - การบริการ
```

### 📊 **Sample Data:**
```sql
id: 11
variable: "โปรโมชั่นปัจจุบัน"
description: "บิลแรก 2,500 บาท ลดทันที 1,000 บาท จ่ายจริงเพียง 1,500 บาท..."
category: "price"
types_of_conversation: NULL
image_urls: {
  "https://res.cloudinary.com/.../cremo-promotion.jpg"
}
tags: {"โปรโมชั่น", "ส่วนลด", "ราคา"}
notes: "อัปเดตเป็นระยะ ตรวจสอบความถูกต้องก่อนใช้"
created_at: 2025-11-11 09:00:00
updated_at: 2025-11-11 14:30:00  -- แก้ไขล่าสุด
```

### 🎯 **การใช้งาน Placeholders:**

**ใน qa_scenarios:**
```
"(ดึงจาก business_data: โปรโมชั่นปัจจุบัน)"
```

**Workflow จะ replace เป็น:**
```
"บิลแรก 2,500 บาท ลดทันที 1,000 บาท จ่ายจริงเพียง 1,500 บาท..."
```

### 📝 **ตัวแปรสำคัญ (29 variables):**
```
โปรโมชั่นปัจจุบัน, ค่าใช้จ่ายทั้งหมด, ค่ามัดจำตู้, กำไรโดยเฉลี่ย,
ราคาขายออก, ขนาดตู้แช่, ค่าไฟตู้แช่, การรับประกันตู้, สัญญาและเงื่อนไข,
การยกเลิกสัญญา, พื้นที่ให้บริการ, ... และอื่นๆ อีก 18 ตัว
```

### ⚙️ **Triggers:**
```sql
TRIGGER: update_business_data_updated_at
  - Auto-update updated_at เมื่อมีการแก้ไข
```

---

## 🗃️ TABLE 4: customer_check

### 📝 **ภาพรวม:**
ติดตามสถานะและประวัติลูกค้า (PDPA compliant)

### 📋 **Columns:**

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| **id** | SERIAL | NO | auto | Primary key |
| **psid** | VARCHAR(50) | NO | UNIQUE | Facebook Page-Scoped ID (unique per customer) |
| **status** | VARCHAR(20) | NO | 'Normal' | สถานะลูกค้า (Normal/Handoff/success) |
| **customer_status** | TEXT | YES | NULL | คำอธิบายสถานะ custom |
| **latest_response** | TEXT | YES | NULL | ข้อความล่าสุดจากลูกค้า |
| **intent_history** | JSONB | YES | NULL | ประวัติ intent ทั้งหมด (JSON array) |
| **last_intent** | VARCHAR(50) | YES | NULL | Intent ล่าสุด |
| **decision_reason** | TEXT | YES | NULL | เหตุผลการจำแนกประเภท |
| **contact_phone** | VARCHAR(20) | YES | NULL | เบอร์โทรศัพท์ (ถ้าให้มา) |
| **contact_name** | VARCHAR(100) | YES | NULL | ชื่อ (ถ้าให้มา) |
| **contact_address** | TEXT | YES | NULL | ที่อยู่ (ถ้าให้มา) |
| **date_added** | TIMESTAMP | NO | NOW() | วันที่เพิ่ม customer |
| **last_interaction** | TIMESTAMP | NO | NOW() | การโต้ตอบล่าสุด (auto-update) |
| **notes** | TEXT | YES | NULL | บันทึกของ admin |

### 🔑 **Keys & Indexes:**
```sql
PRIMARY KEY: id
UNIQUE: psid
INDEXES:
  - idx_customer_psid (psid) -- ค้นหาลูกค้า (FAST)
  - idx_customer_status (status) -- กรองตามสถานะ
  - idx_customer_last_interaction (last_interaction DESC) -- เรียงตามล่าสุด
  - idx_customer_intent_history USING GIN(intent_history) -- JSONB search
```

### 💡 **Status Types:**
```
1. Normal - ลูกค้าปกติ กำลังสอบถามข้อมูล
2. Handoff - ต้องการให้ human agent รับช่วง
3. success - ปิดการขายสำเร็จ (ให้ข้อมูลติดต่อแล้ว)
```

### 📊 **Sample Data:**
```sql
id: 1
psid: "24717167167878639"
status: "success"
customer_status: "ปิดการขาย"
latest_response: "ส่งเบอร์โทร 081-234-5678"
intent_history: [
  {"intent": "Inquiry", "timestamp": "2025-11-11T10:00:00"},
  {"intent": "Interest", "timestamp": "2025-11-11T10:05:00"},
  {"intent": "Ready", "timestamp": "2025-11-11T10:10:00"}
]
last_intent: "Ready"
decision_reason: "Customer provided phone number"
contact_phone: "081-234-5678"
contact_name: "คุณสมชาย"
contact_address: NULL
date_added: 2025-10-26 06:21:40
last_interaction: 2025-11-11 10:10:00
notes: "ลูกค้าสนใจร้านคาเฟ่ กทม."
```

### 🎯 **Intent History (JSONB) Format:**
```json
[
  {
    "intent": "Inquiry",
    "timestamp": "2025-11-11T10:00:00",
    "confidence": 0.95,
    "message": "สอบถามราคา"
  },
  {
    "intent": "Interest",
    "timestamp": "2025-11-11T10:05:00",
    "confidence": 0.88,
    "message": "ขายดีไหม"
  },
  {
    "intent": "Ready",
    "timestamp": "2025-11-11T10:10:00",
    "confidence": 0.92,
    "message": "ให้เซลส์โทรมา 081-234-5678"
  }
]
```

### ⚙️ **Triggers:**
```sql
TRIGGER: update_customer_last_interaction
  - Auto-update last_interaction เมื่อมีการแก้ไข
```

---

## 🗃️ TABLE 5: documents (Vector Store)

### 📝 **ภาพรวม:**
เก็บ embeddings สำหรับ RAG (สร้างโดย n8n Supabase Vector Store)

### 📋 **Columns:**

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| **id** | SERIAL | NO | auto | Primary key |
| **content** | TEXT | NO | - | เนื้อหาต้นฉบับ |
| **metadata** | JSONB | YES | NULL | ข้อมูลเสริม (fileName, psid, etc.) |
| **embedding** | VECTOR(1536) | NO | - | Embedding vector (Cohere: 1536 dimensions) |
| **created_at** | TIMESTAMP | NO | NOW() | เวลาที่สร้าง |

### 🔑 **Keys & Indexes:**
```sql
PRIMARY KEY: id
INDEXES:
  - vector_index USING ivfflat(embedding) -- Vector similarity search
  - metadata_index USING GIN(metadata) -- JSONB search
```

### 💡 **Metadata Format:**

**สำหรับ chat_history:**
```json
{
  "fileName": "psid",
  "psid": "24717167167878639",
  "timestamp": "2025-11-11T10:00:00"
}
```

**สำหรับ qa_scenarios:**
```json
{
  "fileName": "qa_scenarios",
  "category": "location",
  "priority": 1
}
```

**สำหรับ business_data:**
```json
{
  "fileName": "business_data",
  "variable": "โปรโมชั่นปัจจุบัน",
  "category": "price"
}
```

---

## 📊 Relationships (ความสัมพันธ์ระหว่าง Tables)

```
enhanced_chat_sessions.psid → customer_check.psid
  - 1:Many relationship
  - ใช้ JOIN หา customer status

qa_scenarios.reply → business_data.variable
  - Logical relationship (via placeholders)
  - ไม่ใช่ FK แต่ใช้ dynamic replacement

documents.metadata → All tables
  - Metadata links to original tables
  - ใช้สำหรับ RAG filtering
```

---

## 🔍 Useful Queries

### Query 1: ดูสถิติ Chat Sessions
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_messages,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(LENGTH(merged_message)) as avg_message_length
FROM enhanced_chat_sessions
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Query 2: วิเคราะห์ Intent
```sql
SELECT
  intent_classification,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM enhanced_chat_sessions
WHERE intent_classification IS NOT NULL
GROUP BY intent_classification
ORDER BY count DESC;
```

### Query 3: ดู QA Scenarios ที่ใช้บ่อย (ต้องมี usage tracking)
```sql
SELECT
  category,
  customer_question,
  COUNT(*) as usage_count
FROM qa_scenarios
JOIN (
  -- Subquery to track usage (implement in workflow)
  SELECT scenario_id, COUNT(*) as count
  FROM usage_logs
  GROUP BY scenario_id
) usage ON qa_scenarios.id = usage.scenario_id
GROUP BY category, customer_question
ORDER BY usage_count DESC
LIMIT 10;
```

### Query 4: ดูลูกค้าที่ success (ปิดการขาย)
```sql
SELECT
  psid,
  contact_name,
  contact_phone,
  last_intent,
  date_added,
  last_interaction,
  EXTRACT(DAY FROM last_interaction - date_added) as days_to_close
FROM customer_check
WHERE status = 'success'
ORDER BY last_interaction DESC;
```

### Query 5: ดู Business Data ที่แก้ไขล่าสุด
```sql
SELECT
  variable,
  LEFT(description, 100) as preview,
  category,
  updated_at
FROM business_data
ORDER BY updated_at DESC
LIMIT 10;
```

---

## 📏 Database Size Estimates

```
Table                      | Rows  | Size (estimate)
---------------------------|-------|----------------
enhanced_chat_sessions     | ~10K  | ~50 MB
qa_scenarios               | 43    | < 1 MB
business_data              | 29    | < 1 MB
customer_check             | ~1K   | ~5 MB
documents (vector store)   | ~15K  | ~200 MB (with embeddings)
---------------------------|-------|----------------
TOTAL                      | ~26K  | ~256 MB
```

*ประมาณการสำหรับ 3 เดือนแรก*

---

## 🔧 Maintenance Tasks

### Weekly:
```sql
-- Vacuum tables
VACUUM ANALYZE enhanced_chat_sessions;
VACUUM ANALYZE documents;
```

### Monthly:
```sql
-- Archive old chat sessions (> 90 days)
DELETE FROM enhanced_chat_sessions
WHERE created_at < NOW() - INTERVAL '90 days';

-- Rebuild vector indexes
REINDEX INDEX vector_index;
```

---

## 🎓 Best Practices

### 1. **Batching Queries**
```sql
-- ดี: ใช้ batch insert
INSERT INTO enhanced_chat_sessions (user_id, user_text)
SELECT user_id, user_text FROM staging_table;

-- ไม่ดี: insert ทีละ row ใน loop
```

### 2. **Index Hints**
```sql
-- ดี: ใช้ indexed column
SELECT * FROM qa_scenarios WHERE category = 'location';

-- ไม่ดี: full table scan
SELECT * FROM qa_scenarios WHERE LOWER(reply) LIKE '%ราคา%';
```

### 3. **Vector Search Optimization**
```sql
-- ดี: กรองด้วย metadata ก่อน search
SELECT * FROM documents
WHERE metadata @> '{"fileName": "qa_scenarios"}'
ORDER BY embedding <-> query_vector
LIMIT 5;
```

---

## 📞 Support

หากมีคำถามเกี่ยวกับฐานข้อมูล:
- ดูคู่มือ: `01_SUPABASE_SETUP_GUIDE.md`
- ดู FAQ: `05_FAQ.md`
- ติดต่อ: System Administrator

---

**Last Updated:** 2025-11-11
**Version:** 1.0
**Total Pages:** Complete database reference
