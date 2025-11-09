# 🔍 Workflow Validation Scripts

เครื่องมือสำหรับ validate n8n workflows ก่อน import เข้า n8n instance

---

## 📦 ไฟล์ในชุดนี้

- **validate-workflow.js** - Validator หลัก (Node.js script)
- **validate-all.sh** - Validate workflows ทั้งหมดในครั้งเดียว (Bash script)
- **README.md** - ไฟล์นี้

---

## 🚀 การใช้งาน

### Prerequisites

```bash
# ต้องมี Node.js installed
node --version  # v14 ขึ้นไป
```

---

### 1. Validate ทีละไฟล์

```bash
# รูปแบบ
node validation_scripts/validate-workflow.js <path-to-workflow.json>

# ตัวอย่าง
node validation_scripts/validate-workflow.js new_workflows/Human_Campaign_Input.json
```

**Output:**

```
🔍 Validating: Human_Campaign_Input.json

✅ JSON syntax valid
✅ All required fields present
✅ All 8 nodes structurally valid
⚠️  Node 3 (AI Campaign Planner): Placeholder credential ID - "YOUR_OPENAI_CRED_ID"
⚠️  Node 5 (Save Campaign Brief): Placeholder credential ID - "YOUR_GOOGLE_CRED_ID"
✅ All connections valid

📊 Workflow Summary:
   Name: Human_Campaign_Input
   ID: Human_Campaign_Input
   Nodes: 8
   Active: false

📦 Node Types:
   chatTrigger: 1
   code: 2
   openAi: 1
   googleSheets: 1
   merge: 1
   telegram: 1
   respondToWebhook: 1

⚠️  Placeholders to Replace:
   AI Campaign Planner: openAiApi (YOUR_OPENAI_CRED_ID)
   Save Campaign Brief: googleSheetsOAuth2Api (YOUR_GOOGLE_CRED_ID)
   Notify Team: telegramApi (YOUR_TELEGRAM_CRED_ID)

📝 Next Steps:
   1. Import workflow into n8n
   2. Replace placeholder credential IDs
   3. Configure required parameters
   4. Test individual nodes
   5. Execute full workflow

✨ Workflow validation passed!
   Ready for import into n8n (after replacing placeholders)
```

---

### 2. Validate ทั้งหมดในครั้งเดียว

```bash
# รูปแบบ
./validation_scripts/validate-all.sh

# หรือ
bash validation_scripts/validate-all.sh
```

**Output:**

```
🔍 Validating all workflows in: new_workflows/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Validating: Human_Campaign_Input.json
...
✨ Workflow validation passed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Validating: Content_Stock_Generator.json
...
✨ Workflow validation passed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Validating: Performance_Monitor.json
...
✨ Workflow validation passed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary:
   Total: 3
   ✅ Passed: 3
   ❌ Failed: 0

✨ All workflows validated successfully!
```

---

## ✅ สิ่งที่ Validator ตรวจสอบ

### 1. JSON Syntax
- ✅ Valid JSON format
- ✅ Proper encoding
- ✅ No syntax errors

### 2. Required Fields
- ✅ `name` - Workflow name
- ✅ `nodes` - Array of nodes
- ✅ `connections` - Node connections
- ✅ `active` - Workflow status
- ✅ `settings` - Workflow settings
- ✅ `versionId` - Version identifier
- ✅ `id` - Workflow ID

### 3. Node Structure
- ✅ Required fields: `id`, `name`, `type`, `typeVersion`, `position`
- ✅ Unique node IDs
- ⚠️  Duplicate node names (warning)
- ⚠️  Placeholder credential IDs

### 4. Connections
- ✅ Source nodes exist
- ✅ Target nodes exist
- ✅ Valid connection types
- ✅ Valid indices

### 5. Node Types
- ⚠️  Uncommon node types (may need custom installation)
- ✅ Built-in n8n nodes recognized

### 6. Placeholders
- ⚠️  Credential IDs containing `YOUR_`
- ⚠️  Parameter values containing `YOUR_` or `PLACEHOLDER`

---

## 📊 Exit Codes

```bash
0 - ✅ Validation passed (warnings OK)
1 - ❌ Validation failed (errors found)
```

---

## 🎯 Validation Levels

### ✅ Pass with Warnings
Workflow จะ pass validation แม้มี warnings:
- Placeholder credentials (ปกติ - ต้องแก้ก่อน import)
- Duplicate node names (อาจมีปัญหา - ควรแก้)
- Uncommon node types (อาจต้องติดตั้ง custom nodes)

### ❌ Fail (Errors)
Workflow จะ fail ถ้ามี errors:
- Invalid JSON syntax
- Missing required fields
- Missing node IDs
- Duplicate node IDs
- Invalid connections (references non-existent nodes)

---

## 🔧 การแก้ไข Common Issues

### Issue 1: Placeholder Credentials

**Warning:**
```
⚠️  Node "Save to Sheets": Placeholder credential ID - "YOUR_GOOGLE_CRED_ID"
```

**วิธีแก้:**
1. Import workflow เข้า n8n
2. เปิด node "Save to Sheets"
3. ใน Credentials section → Create New หรือ Select Existing
4. Save workflow

---

### Issue 2: Duplicate Node Names

**Warning:**
```
⚠️  Duplicate node name: "Merge" (may cause connection issues)
```

**วิธีแก้:**
1. เปิดไฟล์ workflow JSON
2. หา nodes ที่ชื่อซ้ำ
3. เปลี่ยนชื่อให้ unique (เช่น "Merge1", "Merge2")
4. Validate ใหม่

---

### Issue 3: Uncommon Node Type

**Warning:**
```
⚠️  Uncommon node type: @custom/my-node.custom in "My Node"
```

**วิธีแก้:**
1. ตรวจสอบว่า custom node ถูกติดตั้งใน n8n หรือยัง
2. ถ้ายัง → ติดตั้งก่อน: Settings → Community Nodes
3. หรือเปลี่ยนเป็น built-in node ที่มีฟังก์ชันใกล้เคียง

---

### Issue 4: Invalid Connection

**Error:**
```
❌ Connection target not found: "Node A" -> "Node B"
```

**วิธีแก้:**
1. เช็คว่า "Node B" มีอยู่ใน workflow จริงหรือไม่
2. ถ้าไม่มี → เพิ่ม node หรือลบ connection
3. ถ้ามีแต่ชื่อผิด → แก้ชื่อใน connections section

---

## 📝 Integration กับ CI/CD

### GitHub Actions Example

```yaml
name: Validate n8n Workflows

on:
  pull_request:
    paths:
      - 'workflows/*.json'
      - 'new_workflows/*.json'

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Validate Workflows
        run: |
          chmod +x validation_scripts/validate-all.sh
          ./validation_scripts/validate-all.sh
```

---

## 🎓 Advanced Usage

### Use as Module

```javascript
const { validateWorkflow } = require('./validate-workflow.js');

// Validate programmatically
try {
  validateWorkflow('./my-workflow.json');
  console.log('Valid!');
} catch (err) {
  console.error('Invalid:', err.message);
}
```

---

### Custom Validation Rules

**แก้ไข `validate-workflow.js`:**

```javascript
// เพิ่ม custom validation
function validateCustomRules(workflow) {
  const errors = [];

  // ตัวอย่าง: ห้ามใช้ชื่อ workflow ที่มี "test"
  if (workflow.name.toLowerCase().includes('test')) {
    errors.push('Workflow name should not contain "test"');
  }

  // ตัวอย่าง: ต้องมี description
  if (!workflow.settings || !workflow.settings.description) {
    warnings.push('Workflow should have a description');
  }

  return errors.length === 0;
}
```

---

## 📚 Resources

- [n8n Workflow Structure](https://docs.n8n.io/workflows/)
- [n8n Node Types](https://docs.n8n.io/integrations/builtin/core-nodes/)
- [JSON Schema](https://json-schema.org/)

---

## 🐛 Troubleshooting

### Script ไม่รัน

```bash
# ตรวจสอบ permissions
ls -la validation_scripts/

# ให้สิทธิ์ execute
chmod +x validation_scripts/validate-all.sh

# ตรวจสอบ Node.js
node --version
```

---

### JSON Parse Error

```bash
# Validate JSON syntax ด้วย jq
jq . workflow.json

# หรือใช้ online validator
# https://jsonlint.com
```

---

## 💡 Tips

1. **Run ก่อน commit:**
   ```bash
   ./validation_scripts/validate-all.sh && git commit
   ```

2. **Add to Git hooks:**
   ```bash
   # .git/hooks/pre-commit
   #!/bin/bash
   ./validation_scripts/validate-all.sh
   ```

3. **Continuous validation:**
   ```bash
   # Watch for changes
   while true; do
     clear
     ./validation_scripts/validate-all.sh
     sleep 5
   done
   ```

---

**สร้างโดย: Claude Code**
**Version: 1.0.0**
**Last Updated: 2025-11-09**
