# 🔍 WORKFLOW VALIDATION GUIDE

## ⚠️ ข้อควรรู้สำคัญ

**Claude Code (Web) ไม่สามารถทดสอบ workflows ใน n8n ได้โดยตรง**

Workflows ที่สร้างโดย Claude Code เป็นการสร้างตาม:
- ✅ n8n JSON schema (โครงสร้างถูกต้อง)
- ✅ Patterns จาก existing workflows ที่ใช้งานได้
- ✅ n8n documentation และ best practices
- ❌ **แต่ยังไม่ได้ทดสอบจริงใน n8n instance**

---

## 🎯 Validation Strategy (แนะนำ)

### ✅ Level 1: JSON Validation (ทำได้ทันที)
### ✅ Level 2: Manual Testing (ต้อง import เข้า n8n)
### ✅ Level 3: Production Testing (test กับ real data)

---

## 📋 Level 1: JSON Validation (ก่อน Import)

### 1.1 ตรวจสอบ JSON Syntax

```bash
# ใช้ jq validate
jq . CC_INTEL_SESSION1/new_workflows/Human_Campaign_Input.json

# ถ้าไม่มี error = JSON structure ถูกต้อง
```

**Expected Output:**
```
✅ Valid JSON syntax
```

---

### 1.2 ตรวจสอบ Required Fields

**Checklist สำหรับทุก workflow:**

```javascript
// ต้องมีทุกฟิลด์นี้:
{
  "name": "string",           ✅
  "nodes": [array],           ✅
  "connections": {object},    ✅
  "active": boolean,          ✅
  "settings": {object},       ✅
  "versionId": "string",      ✅
  "id": "string",             ✅
  "tags": [array]             ✅
}
```

**ทดสอบด้วย script:**

```bash
# สร้างไฟล์ validate.js
cat > validate.js << 'EOF'
const fs = require('fs');
const workflow = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

const required = ['name', 'nodes', 'connections', 'active', 'settings', 'versionId', 'id'];
const missing = required.filter(field => !workflow[field]);

if (missing.length > 0) {
  console.error('❌ Missing fields:', missing);
  process.exit(1);
}

console.log('✅ All required fields present');
console.log('📊 Stats:');
console.log('  - Nodes:', workflow.nodes.length);
console.log('  - Active:', workflow.active);
EOF

# รัน validation
node validate.js CC_INTEL_SESSION1/new_workflows/Human_Campaign_Input.json
```

---

### 1.3 ตรวจสอบ Node Structure

**แต่ละ node ต้องมี:**

```javascript
{
  "parameters": {object},     // ✅ required
  "id": "string",             // ✅ required (unique)
  "name": "string",           // ✅ required
  "type": "string",           // ✅ required (n8n node type)
  "typeVersion": number,      // ✅ required
  "position": [x, y]          // ✅ required
}
```

**ทดสอบ:**

```javascript
// validate-nodes.js
const fs = require('fs');
const workflow = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

const nodeIds = new Set();
const errors = [];

workflow.nodes.forEach((node, index) => {
  // Check required fields
  if (!node.id) errors.push(`Node ${index}: missing id`);
  if (!node.name) errors.push(`Node ${index}: missing name`);
  if (!node.type) errors.push(`Node ${index}: missing type`);
  if (!node.typeVersion) errors.push(`Node ${index}: missing typeVersion`);

  // Check duplicate IDs
  if (nodeIds.has(node.id)) {
    errors.push(`Duplicate node ID: ${node.id}`);
  }
  nodeIds.add(node.id);
});

if (errors.length > 0) {
  console.error('❌ Validation errors:');
  errors.forEach(err => console.error('  -', err));
  process.exit(1);
}

console.log('✅ All nodes valid');
```

---

### 1.4 ตรวจสอบ Connections

**Connections ต้อง:**
- Reference node names ที่มีอยู่จริง
- มี valid index

```javascript
// validate-connections.js
const fs = require('fs');
const workflow = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

const nodeNames = new Set(workflow.nodes.map(n => n.name));
const errors = [];

Object.keys(workflow.connections).forEach(sourceName => {
  // Check source node exists
  if (!nodeNames.has(sourceName)) {
    errors.push(`Connection source not found: ${sourceName}`);
  }

  const outputs = workflow.connections[sourceName];
  Object.keys(outputs).forEach(outputType => {
    outputs[outputType].forEach(connections => {
      connections.forEach(conn => {
        // Check target node exists
        if (!nodeNames.has(conn.node)) {
          errors.push(`Connection target not found: ${conn.node}`);
        }
      });
    });
  });
});

if (errors.length > 0) {
  console.error('❌ Connection errors:');
  errors.forEach(err => console.error('  -', err));
  process.exit(1);
}

console.log('✅ All connections valid');
```

---

## 🧪 Level 2: Manual Testing (ใน n8n)

### 2.1 Import Workflow

**ขั้นตอน:**

```bash
1. เปิด n8n UI (http://localhost:5678)
2. คลิก "+" → "Import from File"
3. เลือกไฟล์ workflow JSON
4. คลิก "Import"
```

**Expected Results:**

✅ **Success:**
```
"Workflow imported successfully"
- ไม่มี error messages
- เห็น workflow canvas พร้อม nodes
- Connections แสดงถูกต้อง
```

❌ **Failure - Common Errors:**

```
Error: "Invalid workflow data"
→ แก้: ตรวจสอบ JSON syntax

Error: "Unknown node type: xxx"
→ แก้: ติดตั้ง custom node หรือใช้ node อื่นแทน

Error: "Missing credentials"
→ แก้: ตั้งค่า credentials ก่อนใช้งาน
```

---

### 2.2 ตรวจสอบ Nodes ทีละตัว

**Checklist สำหรับแต่ละ node:**

```
1. เปิด node settings (double-click)
   ✅ Parameters แสดงครบ
   ✅ ไม่มี required fields สีแดง
   ✅ Default values สมเหตุสมผล

2. ตรวจสอบ credentials (ถ้ามี)
   ✅ Credential type ถูกต้อง
   ⚠️  Placeholder IDs ต้องแก้เป็นของจริง

3. ทดสอบ expressions (ถ้ามี)
   ✅ Syntax ถูกต้อง (ไม่มี error สีแดง)
   ✅ Variables accessible
```

**ตัวอย่าง - ตรวจสอบ Google Sheets Node:**

```json
// ใน workflow JSON
{
  "name": "Save to Sheets",
  "type": "n8n-nodes-base.googleSheets",
  "credentials": {
    "googleSheetsOAuth2Api": {
      "id": "YOUR_GOOGLE_CRED_ID",  // ⚠️ ต้องแก้!
      "name": "Google Sheets account"
    }
  }
}
```

**ต้องทำ:**
```bash
1. Settings → Credentials → Create New
2. เลือก "Google Sheets OAuth2 API"
3. Authorize
4. Copy credential ID ที่ได้
5. แก้ไขใน workflow node
```

---

### 2.3 Test Execution (Execute Node)

**ทดสอบทีละ node:**

```
1. เลือก node แรก (Trigger node)
2. คลิก "Execute Node" (play button)
3. ดู output

Expected:
✅ Output data แสดงใน panel
✅ ไม่มี error message
✅ Data structure ตามที่คาดหวัง
```

**ตัวอย่าง - Test Chat Trigger:**

```javascript
// Expected Output:
{
  "chatInput": "test message",
  "sessionId": "xxx"
}
```

---

### 2.4 Test Full Workflow

**ขั้นตอน:**

```
1. คลิก "Execute Workflow" (play button บนขวา)
2. ติดตาม execution flow
3. ตรวจสอบ output แต่ละ node
```

**Execution Panel แสดง:**

```
✅ Node 1: Success (0.2s) → 1 item
✅ Node 2: Success (0.5s) → 1 item
✅ Node 3: Success (1.2s) → 1 item
❌ Node 4: Error - "Invalid API key"
```

**ถ้ามี errors:**
```bash
1. คลิกที่ node ที่ error
2. อ่าน error message
3. แก้ไขตาม message
4. Execute ใหม่
```

---

## 🚀 Level 3: Production Testing

### 3.1 Test กับ Real Data

**สำหรับแต่ละ workflow:**

#### **Human_Campaign_Input:**

```
Test Case 1: Valid Input
Input:
  "Objective: Brand Awareness
   Target: Gen Z Bangkok
   Budget: 50000 THB"

Expected Output:
  ✅ Campaign brief created in Google Sheets
  ✅ AI planning completed
  ✅ Telegram notification sent

Test Case 2: Missing Info
Input:
  "Run a campaign"

Expected Output:
  ✅ AI identifies missing info
  ✅ Prompts for more details
```

---

#### **Content_Stock_Generator:**

```
Test Case 1: Active Campaign Exists
Precondition:
  - Campaign brief in sheet (status: Draft)

Expected Output:
  ✅ 10 content variations generated
  ✅ Saved to Content_Stock sheet
  ✅ All variations have prompts

Test Case 2: No Active Campaigns
Precondition:
  - No campaigns with status Draft/Active

Expected Output:
  ✅ Workflow completes without errors
  ✅ No content generated
  ✅ (Optional) Notification "No campaigns to process"
```

---

#### **Performance_Monitor:**

```
Test Case 1: Normal Usage
Precondition:
  - APIFY costs exist
  - Content generated
  - Budget < 80%

Expected Output:
  ✅ Metrics calculated correctly
  ✅ Report saved to sheet
  ✅ Daily report sent (no alerts)

Test Case 2: Budget Warning
Precondition:
  - Budget usage > 80%

Expected Output:
  ✅ Metrics calculated
  ✅ Report saved
  ✅ Warning alert sent via Telegram
```

---

### 3.2 Error Handling Tests

**ทดสอบกรณี error:**

```
1. API Rate Limit
   - Trigger: เรียก API มากเกินไป
   - Expected: Wait node ทำงาน, retry logic

2. Invalid Data
   - Trigger: ส่ง data format ผิด
   - Expected: Validation error, clear message

3. Missing Credentials
   - Trigger: ลบ credential
   - Expected: Error message ชัดเจน

4. Network Timeout
   - Trigger: API ช้า/ไม่ตอบสนอง
   - Expected: Timeout gracefully, error logged
```

---

### 3.3 Performance Testing

**Metrics ที่ต้องดู:**

```
1. Execution Time
   ✅ Human_Campaign_Input: < 10s
   ✅ Content_Stock_Generator: < 5 min (10 items)
   ✅ Performance_Monitor: < 30s

2. API Costs
   ✅ OpenAI calls: ตรงกับที่คาดหวัง
   ✅ ไม่มี duplicate calls
   ✅ Rate limiting ทำงาน

3. Data Quality
   ✅ ไม่มี duplicate records ใน Google Sheets
   ✅ Timestamps ถูกต้อง (Asia/Bangkok)
   ✅ Data types ตรงตาม schema
```

---

## 🔧 Troubleshooting Checklist

### Import ไม่ได้

```bash
❌ Error: "Invalid JSON"
→ Run: jq . workflow.json
→ Fix: แก้ JSON syntax

❌ Error: "Unknown node type"
→ Check: n8n version compatibility
→ Fix: อัพเดท n8n หรือเปลี่ยน node

❌ Error: "Missing dependencies"
→ Check: Custom nodes installed?
→ Fix: ติดตั้ง required nodes
```

---

### Execute ไม่สำเร็จ

```bash
❌ Node Error: "Invalid credentials"
→ Check: Credential ID ถูกต้องไหม
→ Fix: สร้าง/เลือก credential ใหม่

❌ Node Error: "Required parameter missing"
→ Check: Node configuration
→ Fix: กรอกค่า required parameters

❌ Connection Error: "Node not found"
→ Check: Node names ตรงกันไหม
→ Fix: อัพเดท connections
```

---

### Output ไม่ถูกต้อง

```bash
❌ ข้อมูลไม่ครบ
→ Check: Mapping configuration
→ Fix: เช็ค expressions และ field mapping

❌ Format ผิด
→ Check: Data transformation nodes
→ Fix: แก้ JavaScript code หรือ expressions

❌ Duplicate data
→ Check: Deduplication logic
→ Fix: เพิ่ม filter/unique checks
```

---

## 📊 Validation Checklist Template

```markdown
## Workflow: [Name]
**Validated by:** [Your Name]
**Date:** [Date]
**n8n Version:** [Version]

### ✅ Level 1: JSON Validation
- [ ] JSON syntax valid
- [ ] All required fields present
- [ ] Node IDs unique
- [ ] Connections valid
- [ ] No placeholder values remaining

### ✅ Level 2: Manual Testing
- [ ] Import successful
- [ ] All nodes configured
- [ ] Credentials set up
- [ ] Individual nodes execute
- [ ] Full workflow executes
- [ ] No errors in execution

### ✅ Level 3: Production Testing
- [ ] Test Case 1: [Description] - ✅/❌
- [ ] Test Case 2: [Description] - ✅/❌
- [ ] Error handling works
- [ ] Performance acceptable
- [ ] Data quality verified

### 📝 Issues Found:
1. [Issue description] - Status: [Fixed/Pending]
2. [Issue description] - Status: [Fixed/Pending]

### 🎯 Ready for Production: ✅/❌
```

---

## 🎓 Best Practices

### 1. เริ่มจาก Existing Workflows

```bash
✅ DO:
- Copy existing workflow ที่ใช้งานได้
- แก้ไขทีละส่วน
- ทดสอบหลังแก้ไขทุกครั้ง

❌ DON'T:
- สร้าง workflow ใหม่ทั้งหมดจาก scratch
- แก้หลาย nodes พร้อมกัน
- Skip testing ระหว่างทาง
```

---

### 2. Incremental Development

```
Step 1: สร้าง trigger + 1 node
        → Test ✅

Step 2: เพิ่ม processing node
        → Test ✅

Step 3: เพิ่ม output node
        → Test ✅

Step 4: เพิ่ม error handling
        → Test ✅
```

---

### 3. Use Test Data

```javascript
// สร้าง "Set Node" สำหรับ test data
{
  "name": "Test Data",
  "type": "n8n-nodes-base.set",
  "parameters": {
    "values": {
      "string": [
        {
          "name": "campaign_id",
          "value": "TEST_001"
        }
      ]
    }
  }
}

// เชื่อมก่อน trigger node จริง
// เปลี่ยนเป็น real trigger เมื่อ test ผ่าน
```

---

### 4. Version Control

```bash
# Save ทุกครั้งที่ test ผ่าน
git add workflows/my-workflow.json
git commit -m "Test passed: Human_Campaign_Input - basic flow"

# Tag versions ที่ stable
git tag -a v1.0.0 -m "Production ready: Human_Campaign_Input"
```

---

## 🤝 Collaboration Strategy

### **คุณ (Testing)** ↔️ **Claude Code (ผม)**

```
Round 1:
  ผม → สร้าง workflow
  คุณ → Import และ test
  คุณ → รายงาน issues

Round 2:
  ผม → แก้ไข issues
  คุณ → Test ใหม่
  คุณ → Confirm fixes

Round 3:
  คุณ → Production testing
  คุณ → Final approval ✅
```

---

## 📞 การรายงาน Issues

**Template:**

```markdown
## Issue Report: [Workflow Name]

### Error
**Node:** [Node name]
**Error Message:**
```
[Copy error message here]
```

### Steps to Reproduce
1. Import workflow
2. Configure credentials
3. Execute node [name]
4. Error occurs

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Environment
- n8n Version: [version]
- Node Version: [version]
- Browser: [if relevant]

### Screenshots
[Attach if helpful]
```

---

## ✨ สรุป

### ✅ Workflows ที่ Claude Code สร้างมา:

**Confidence Level:**
- JSON Structure: **95%** (ตาม n8n schema)
- Logic Flow: **85%** (ตาม patterns ที่พิสูจน์แล้ว)
- **Production Ready: 0%** (ยังไม่ได้ test!)

### 🎯 ต้องทำเพื่อให้มั่นใจ:

1. **Import เข้า n8n** (5 นาที)
2. **แก้ placeholders** (10 นาที)
   - Credential IDs
   - Google Sheet IDs
   - Telegram Chat IDs
3. **Test แต่ละ node** (15 นาที)
4. **Test full workflow** (10 นาที)
5. **Production testing** (1-2 วัน)

**Total Time: ~2-3 ชั่วโมงสำหรับ setup + testing**

---

**Workflows ที่สร้างไปเป็น "starter templates" ที่ต้อง validate และ customize ตามจริงครับ!**

ต้องการให้ผมช่วยสร้าง validation scripts หรือไม่ครับ?
