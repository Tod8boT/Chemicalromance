# 🔍 การวิเคราะห์และแผนปรับปรุง Admin Chatbot

**Created:** 2025-11-11
**By:** Claude Code ID1
**For:** Tod8boT/Chemicalromance - Branch: claude/review-admin-chatbot-rag-011CV29s6qF8kjYZRr9Gpd2b

---

## 📊 สรุปการวิเคราะห์

### ✅ **Workflow ปัจจุบัน (user-admin_chatbot)**

```
📄 File: user-admin_chatbot.json (1459 บรรทัด, ~35 nodes)
🏗️ Architecture:
├── Webhook (Facebook Messenger)
├── Verification + Event Extraction
├── Call check_customer (sub-workflow) → Classification
├── Switch (4 routes: close sale/meaningless/normal/sale)
├── AI Agent (Gemini 2.5 Flash)
│   └── 3 RAG Tools:
│       ├── search_chat_history (Supabase vector)
│       ├── search_QA_scenarios (Supabase vector)
│       └── search_business_data (Supabase vector)
├── Call update_chat_history (sub-workflow) → Storage
└── Send Response (Text + Image support)

🤖 AI Agent:
- Model: google/gemini-2.5-flash (via OpenRouter)
- Embeddings: embed-multilingual-v3.0 (Cohere)
- Reranker: Cohere rerank
- Persona: น้องโม - แอดมินเพจไอศกรีมครีโม
```

### 🏆 **Facebook Smart Batch Reference**

```
📄 File: Facebook Message Chatbot - Smart Batch.json (1035 บรรทัด, ~35 nodes)
🏗️ Key Features:
├── Insert To Process → เก็บข้อความลง data table
├── Wait (5 seconds) → รอให้ข้อความมาครบ
├── Get unprocessed message → ดึงข้อความที่ยังไม่ประมวลผล
├── Get Max ID + Merged Mess → รวมข้อความหลายข้อเป็นข้อเดียว
├── Update FALSE to TRUE → ทำเครื่องหมายว่าประมวลผลแล้ว
├── Set Context → สร้าง context (old + new sessions)
├── Merge History → แยก old_session_history vs now_session_history
├── AI Processing (Gemini Pro)
├── Format for Facebook Output → จัดรูปแบบข้อความ
└── Send Text → ส่งกลับ Facebook

✨ Smart Features:
1. Message Batching (5 sec wait)
2. Session-aware History (old vs new)
3. Data Table Management
4. Facebook Markdown Formatting
```

### 📋 **Thai Business Data (CSV Files)**

```csv
✅ QA_scenarios.csv: 43 scenarios
Categories: location (7), price_question (10), freezer_info (8),
           contract (5), school_special (3), product_info (3),
           objection (3), follow_up (4)

Dynamic Placeholders:
- "(ดึงจาก business_data: โปรโมชั่นปัจจุบัน)"
- "(ดึงจาก business_data: ค่าใช้จ่ายทั้งหมด)"
- "(ดึงจาก business_data: กำไรโดยเฉลี่ย)"

⚠️ Missing: image_url column (need to add!)

✅ business_data.csv: 29 variables
- สินค้าหลัก, ไอศกรีมตัก, รสชาติสินค้า
- ขนาดตู้แช่, ค่าไฟตู้แช่, การรับประกันตู้
- โปรโมชั่นปัจจุบัน, ค่าใช้จ่ายทั้งหมด
- กำไรโดยเฉลี่ย, ราคาขายออก
- (และอีก 19 ตัวแปร)

✅ customer_check.csv: Customer tracking
Columns: psid, วันที่, คำตอบล่าสุด, สถานะลูกค้า, status
Status values: Normal, Handoff, success
```

---

## 🎯 แผนการปรับปรุง (Enhancement Plan)

### **Phase 1: Database Setup (วันที่ 1-2)**

#### 1.1 สร้าง Supabase Enhanced Schema

```sql
-- Table 1: enhanced_chat_sessions (Smart Batching)
CREATE TABLE enhanced_chat_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_text TEXT,
  merged_message TEXT,
  ai_response TEXT,
  old_session_history TEXT,
  now_session_history TEXT,
  intent_classification VARCHAR(50),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_processed (user_id, processed),
  INDEX idx_created (created_at DESC)
);

-- Table 2: qa_scenarios (Enhanced with Images)
CREATE TABLE qa_scenarios (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  customer_question TEXT NOT NULL,
  reply TEXT NOT NULL,
  image_url TEXT,
  priority INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_category (category),
  INDEX idx_active (active)
);

-- Table 3: business_data (Dynamic Content)
CREATE TABLE business_data (
  id SERIAL PRIMARY KEY,
  variable VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  image_urls TEXT[],
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_variable (variable),
  INDEX idx_category (category)
);

-- Table 4: customer_check (Enhanced Tracking)
CREATE TABLE customer_check (
  id SERIAL PRIMARY KEY,
  psid VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'Normal',
  latest_response TEXT,
  customer_status TEXT,
  intent_history JSONB,
  date_added TIMESTAMP DEFAULT NOW(),
  last_interaction TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  INDEX idx_psid (psid),
  INDEX idx_status (status)
);
```

#### 1.2 สร้าง Migration Script

```sql
-- migrate_qa_scenarios.sql
INSERT INTO qa_scenarios (category, customer_question, reply, image_url, priority)
SELECT
  category,
  customer_question,
  reply,
  NULL as image_url,  -- Will be populated later
  CASE
    WHEN category = 'price_question' THEN 1
    WHEN category = 'location' THEN 2
    ELSE 3
  END as priority
FROM csv_import_qa_scenarios;

-- migrate_business_data.sql
INSERT INTO business_data (variable, description, category)
SELECT
  variable,
  description,
  CASE
    WHEN variable LIKE '%โปรโมชั่น%' OR variable LIKE '%ราคา%' THEN 'price'
    WHEN variable LIKE '%สินค้า%' OR variable LIKE '%รส%' THEN 'product'
    WHEN variable LIKE '%ตู้%' THEN 'freezer'
    WHEN variable LIKE '%สัญญา%' THEN 'contract'
    ELSE 'service'
  END as category
FROM csv_import_business_data;

-- migrate_customer_check.sql
INSERT INTO customer_check (psid, status, latest_response, customer_status, date_added)
SELECT
  psid,
  'Normal' as status,
  "คำตอบล่าสุด" as latest_response,
  "สถานะลูกค้า" as customer_status,
  TO_TIMESTAMP("วันที่", 'DD/MM/YYYY HH24:MI:SS') as date_added
FROM csv_import_customer_check;
```

#### 1.3 เพิ่ม Image URLs สำหรับ QA Scenarios

```csv
# จะสร้างไฟล์ qa_scenarios_with_images.csv ที่มี:
# - All 43 scenarios
# - image_url column populated with Cloudinary URLs
# - Organized by category

Example image mappings:
- location → Thailand map image
- price_question → Pricing table image
- freezer_info → Freezer showcase image (มีอยู่แล้ว)
- contract → Contract terms infographic
- school_special → School success story image
- product_info → Product catalog image
- objection → Benefits comparison chart
- follow_up → Contact info graphic
```

### **Phase 2: Enhanced Workflow Development (วันที่ 3-7)**

#### 2.1 Smart Message Batching (จาก Facebook Reference)

```
New Nodes to Add:
1. Insert To Process
   - Type: Supabase Insert
   - Table: enhanced_chat_sessions
   - Data: {user_id: psid, user_text: message, processed: false}

2. Wait (5 seconds)
   - Type: Wait
   - Amount: 5
   - Unit: seconds
   - Purpose: รอให้ข้อความหลายข้อมาครบ

3. Get Unprocessed Messages
   - Type: Supabase Get
   - Table: enhanced_chat_sessions
   - Filter: {user_id: $psid, processed: false}
   - Sort: created_at ASC

4. Merge Messages + Get Max ID
   - Type: Code
   - Logic:
     ```javascript
     const sortedItems = items.sort((a, b) => a.json.id - b.json.id);
     const mergedMessage = sortedItems
       .map(item => item.json.user_text)
       .filter(text => text !== null)
       .join(' ');
     const maxItem = sortedItems[sortedItems.length - 1];
     maxItem.json.merged_message = mergedMessage;
     return [maxItem];
     ```

5. Update Processed Flag
   - Type: Supabase Update
   - Table: enhanced_chat_sessions
   - Filter: {id: $maxId}
   - Data: {processed: true}
```

#### 2.2 Session-Aware History Management

```
Enhanced History Builder:
1. Get Last 15 Messages
   - Type: Supabase Get
   - Table: enhanced_chat_sessions
   - Filter: {user_id: $psid}
   - Sort: created_at DESC
   - Limit: 15

2. Build Context with Session Separation
   - Type: Code
   - Logic:
     ```javascript
     // Get VN/TH timezone date
     function getThaiDate(date) {
       return new Date(date).toLocaleDateString('th-TH');
     }

     const todayTH = getThaiDate(new Date());
     let oldSessionHistory = '';
     let nowSessionHistory = '';

     // Sort chronologically (oldest first)
     const chronological = items
       .sort((a, b) => new Date(a.json.created_at) - new Date(b.json.created_at));

     // Group by session date
     const sessions = {};
     chronological.forEach(item => {
       const sessionDate = getThaiDate(item.json.created_at);
       if (!sessions[sessionDate]) sessions[sessionDate] = [];
       sessions[sessionDate].push(item);
     });

     // Build history strings
     Object.keys(sessions).forEach(sessionDate => {
       const sessionBlock = sessions[sessionDate]
         .map(item => `User: ${item.json.user_text}\nBot: ${item.json.ai_response}`)
         .join('\n\n');

       if (sessionDate === todayTH) {
         nowSessionHistory += `--- Session ${sessionDate} ---\n${sessionBlock}\n\n`;
       } else {
         oldSessionHistory += `--- Session ${sessionDate} ---\n${sessionBlock}\n\n`;
       }
     });

     return [{
       json: {
         old_session_history: oldSessionHistory || 'No previous sessions',
         now_session_history: nowSessionHistory || 'First message today',
         merged_message: $('Get Max ID').first().json.merged_message
       }
     }];
     ```
```

#### 2.3 Dynamic Content Replacement Engine

```
New Node: Replace Business Data Placeholders
- Type: Code
- Position: After AI Agent, Before Send Response
- Logic:
  ```javascript
  // Get AI response
  let response = $('AI Agent').first().json.Response ||
                $('AI Agent').first().json.output ||
                $('AI Agent').first().json.text;

  // Get business data from Supabase
  const businessData = {};
  $('Get Business Data').all().forEach(item => {
    businessData[item.json.variable] = item.json.description;
  });

  // Replace placeholders: (ดึงจาก business_data: variable_name)
  const placeholderRegex = /\(ดึงจาก business_data: ([^)]+)\)/g;
  response = response.replace(placeholderRegex, (match, variable) => {
    const value = businessData[variable];
    if (value) {
      return value;
    }
    return `[ข้อมูล "${variable}" ไม่พบในระบบ]`;
  });

  // Extract image URLs from response
  const imageRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi;
  const images = response.match(imageRegex) || [];

  // Clean text (remove image URLs)
  const cleanText = response.replace(imageRegex, '').trim();

  return [{
    json: {
      final_response: cleanText,
      has_images: images.length > 0,
      image_urls: images,
      psid: $('Extract Event').first().json.psid
    }
  }];
  ```

Pre-requisite Node: Get Business Data
- Type: Supabase Get All
- Table: business_data
- Cache: Yes (refresh every 1 hour)
```

#### 2.4 Enhanced Image + Text Response Handler

```
Updated Send Logic:
1. Check Image Output
   - Type: If
   - Condition: {{ $json.has_images === true }}

2a. Send Image First (If has images)
   - Type: HTTP Request
   - Method: POST
   - URL: https://graph.facebook.com/v24.0/me/messages
   - Body:
     ```json
     {
       "recipient": {"id": "{{ $json.psid }}"},
       "message": {
         "attachment": {
           "type": "image",
           "payload": {
             "url": "{{ $json.image_urls[0] }}",
             "is_reusable": true
           }
         }
       }
     }
     ```

2b. Send Text (After image or standalone)
   - Type: HTTP Request
   - Method: POST
   - URL: https://graph.facebook.com/v24.0/me/messages
   - Body:
     ```json
     {
       "recipient": {"id": "{{ $json.psid }}"},
       "message": {
         "text": "{{ $json.final_response }}"
       }
     }
     ```

Multiple Images Support:
- If image_urls.length > 1, loop through all images
- Use Split in Batches node (batch size: 1)
- Send each image with 1-second delay between
```

#### 2.5 Enhanced AI Agent Configuration

```
Updated System Prompt:
คุณคือ "น้องโม" แอดมินเพจไอศกรีมครีโม CREMO

# บุคลิกและการพูด
- ใช้คำว่า "หนู" แทนตัวเอง เรียกลูกค้าว่า "พี่"
- พูดสั้นๆ กระชับ 2-3 ประโยค
- สุภาพ เป็นกันเอง อบอุ่น
- ไม่พูดเกินจริง เน้นข้อเท็จจริง

# เป้าหมาย
เชิญชวนให้ร้านค้า คาเฟ่ ร้านสะดวกซื้อ โรงเรียน มาวางตู้แช่ไอศกรีม CREMO

# การตอบคำถาม
1. ใช้ search_QA_scenarios หาแนวทางตอบกลางๆ
2. ใช้ search_business_data ดึงข้อมูลที่เป็นปัจจุบัน
3. ใช้ search_chat_history เพื่อเข้าใจบริบทการสนทนา
4. รวมข้อมูลมาตอบให้ตรงคำถาม กระชับ

# การใช้ข้อมูล
- ถ้าเจอ placeholder: (ดึงจาก business_data: variable_name)
  → ใส่ไว้ในคำตอบเลย ระบบจะแทนที่ให้เอง
- ถ้ามีรูปประกอบ → บอก URL ไว้ในคำตอบ

# Session History
- old_session_history: บทสนทนาวันก่อนๆ
- now_session_history: บทสนทนาวันนี้
- ใช้เป็น context แต่ไม่ต้องพูดถึงโดยตรง

# การ Classify Intent
ระบุ intent เป็น 1 ใน:
- Inquiry (สอบถามข้อมูล)
- Interest (สนใจ แต่ยังไม่พร้อม)
- Ready (พร้อมเริ่ม/ให้ติดต่อ)
- Objection (ข้อกังวล)
- Follow_up (ติดตามผล)

# Output Format
{
  "Response": "คำตอบภาษาไทย (สั้นๆ 2-3 ประโยค)",
  "intent": "Intent classification"
}

Tools Configuration:
1. search_QA_scenarios
   - Description: "ใช้หาแนวทางตอบคำถามจาก 43 scenarios พร้อมรูปภาพประกอบ"
   - Table: qa_scenarios
   - Top K: 3
   - Use Reranker: Yes
   - Metadata: {fileName: "qa_scenarios"}

2. search_business_data
   - Description: "ข้อมูลสินค้าและบริการ CREMO ที่เปลี่ยนได้ตามธุรกิจ (29 variables)"
   - Table: business_data
   - Top K: 3
   - Use Reranker: Yes
   - Metadata: {fileName: "business_data"}

3. search_chat_history
   - Description: "ประวัติการสนทนาแยก old/new sessions สำหรับเข้าใจ context"
   - Table: enhanced_chat_sessions
   - Top K: 5
   - Use Reranker: Yes
   - Metadata: {fileName: "psid", psid: "{{ $json.psid }}"}
   - Additional Context:
     - old_session_history: {{ $json.old_session_history }}
     - now_session_history: {{ $json.now_session_history }}
```

### **Phase 3: Testing & Documentation (วันที่ 8-10)**

#### 3.1 Test Scenarios (43 categories)

```
Test Coverage:
✅ Location (7 scenarios)
✅ Price Questions (10 scenarios)
✅ Freezer Info (8 scenarios)
✅ Contract (5 scenarios)
✅ School Special (3 scenarios)
✅ Product Info (3 scenarios)
✅ Objection Handling (3 scenarios)
✅ Follow-up (4 scenarios)

Testing Checklist:
[ ] Smart Batching: ส่งข้อความ 3 ข้อเวาะๆ ภายใน 5 วินาที → ควรรวมเป็นข้อเดียว
[ ] Session History: ทดสอบคุยวันนึง พักไป คุยอีกวัน → ควรแยก old/new sessions
[ ] Dynamic Replacement: ทดสอบคำถามที่มี placeholder → ควรแทนที่ถูกต้อง
[ ] Image Sending: ทดสอบ scenario ที่มีรูป → ควรส่งรูป + ข้อความ
[ ] Intent Classification: ทดสอบทุก intent → ควรจำแนกถูกต้อง
[ ] Error Handling: ทดสอบ edge cases → ไม่ควร crash
[ ] Performance: วัดเวลาตอบสนอง → ควร < 5 วินาที
```

#### 3.2 Documentation to Create

```
📄 DEPLOYMENT_GUIDE.md
   - Supabase setup step-by-step
   - n8n workflow import instructions
   - Credential configuration
   - Testing procedures
   - Troubleshooting guide

📄 THAI_BUSINESS_CONTEXT.md
   - Complete CREMO business explanation
   - 43 QA scenarios breakdown
   - 29 business variables reference
   - Dynamic content rules
   - Image URL mappings

📄 TESTING_RESULTS.md
   - Test scenarios results
   - Performance benchmarks
   - Known issues and limitations
   - Recommendations for improvements

📄 WORKFLOW_COMPARISON.md
   - Old vs New architecture
   - Feature comparison table
   - Migration guide
   - Rollback procedures
```

---

## 🎯 Success Criteria

### Performance Targets
```
⚡ Response Time: < 5 seconds (with batching)
🎯 Accuracy Rate: > 95% (Thai business context)
📊 Image Support: 100% scenarios with relevant images
🔄 Data Migration: 100% preservation (43 + 29 records)
📱 Thai Language: Perfect business communication
🤖 Smart Batching: Zero duplicate responses
📚 Context Awareness: 15-message history + session separation
```

### Technical Features
```
✅ Smart 5-second message batching
✅ Session-aware history (old + new separation)
✅ Dynamic business content replacement
✅ Image + text response support
✅ Facebook Markdown formatting
✅ Thai business persona (น้องโม)
✅ 43 QA scenarios + 29 business variables
✅ Enhanced customer tracking with intent history
✅ PDPA-compliant data management
```

---

## 📦 Deliverables

### Workflow Files
```
📄 enhanced_admin_chatbot.json
   - Complete workflow with all enhancements
   - ~50-60 nodes (20-25 new nodes)
   - Fully tested and documented

📄 enhanced_check_customer.json (optional enhancement)
   - Enhanced classification with intent tracking
   - Integration with new customer_check table

📄 enhanced_chat_history.json (optional enhancement)
   - Session-aware storage
   - Intent history tracking
```

### Database Files
```
📄 supabase_schema.sql
   - 4 table definitions
   - Indexes for performance
   - RLS policies (if needed)

📄 migration_scripts.sql
   - CSV to Supabase migration
   - Data validation queries
   - Rollback procedures

📄 seed_data.sql
   - Sample data for testing
   - Default business data
   - Test customer records

📄 qa_scenarios_with_images.csv
   - All 43 scenarios
   - Complete image URL mappings
   - Ready for import
```

### Documentation
```
📄 DEPLOYMENT_GUIDE.md
📄 THAI_BUSINESS_CONTEXT.md
📄 TESTING_RESULTS.md
📄 WORKFLOW_COMPARISON.md
📄 MAINTENANCE_GUIDE.md
```

---

## 🚀 Next Steps

### Immediate Actions (คุณตัดสินใจ)
```
1. [ ] Review แผนนี้ → ให้ feedback ถ้ามีข้อเสนอแนะ
2. [ ] Approve to start → ยืนยันว่าให้เริ่มทำได้
3. [ ] Priority clarification → มี feature ไหนที่สำคัญที่สุด?
4. [ ] Timeline confirmation → ต้องการเสร็จเมื่อไหร่?
```

### Development Sequence (ถ้าได้รับ approval)
```
Step 1: สร้าง Supabase schema + migration scripts
Step 2: เตรียม image URLs สำหรับ QA scenarios
Step 3: สร้าง enhanced workflow with smart batching
Step 4: Testing with all 43 scenarios
Step 5: Documentation + deployment guide
Step 6: Commit & Push to branch
```

---

**Status:** 🔥 Ready to start development
**Waiting for:** User approval and any clarifications
**Estimated Time:** 8-10 days (full implementation + testing + docs)

**Questions for User:**
1. ต้องการให้เริ่มเลยหรือต้องการปรับแก้แผนก่อน?
2. มี feature ไหนที่ต้องการเน้นเป็นพิเศษ?
3. ต้องการให้ทำ deployment guide แบบละเอียดแค่ไหน?
4. มี Supabase project ที่พร้อมใช้งานแล้วหรือต้องการให้แนะนำการ setup?
