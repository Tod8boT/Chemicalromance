# 📖 n8n MCP Documentation Mode Guide

## ภาพรวม

n8n MCP มี **2 โหมดการทำงาน:**

### 🔵 **API Mode** (ต้องมี n8n instance)
- เชื่อมต่อกับ n8n instance ผ่าน API
- สร้าง/แก้ไข/execute workflows ได้
- ต้องมี `N8N_API_URL` และ `N8N_API_KEY`

### 📚 **Documentation Mode** (ไม่ต้องมี n8n instance)
- ใช้งานได้ทันทีโดยไม่ต้อง setup n8n
- อ่านเอกสาร nodes ทั้งหมด (541 nodes)
- ดู workflow syntax และ expressions
- Validate workflow structure
- **ไม่สามารถ execute workflows ได้**

---

## 🎯 Documentation Mode คืออะไร?

**Documentation Mode** เป็นโหมดที่ให้คุณเข้าถึงข้อมูลทั้งหมดของ n8n nodes โดยไม่ต้องมี n8n instance running

**ข้อมูลที่เข้าถึงได้:**
- ✅ **541 n8n nodes** (built-in + community)
- ✅ Node parameters และ configurations
- ✅ Expression syntax และ functions
- ✅ Workflow JSON schema
- ✅ ตัวอย่างการใช้งาน
- ✅ Best practices

**ไม่สามารถทำ:**
- ❌ Execute workflows
- ❌ เขียนข้อมูลลง n8n instance
- ❌ ดึงข้อมูล real-time จาก n8n

---

## 🚀 Setup: Documentation Mode

### Prerequisites
- ✅ Docker & Docker Compose
- ✅ Claude Desktop app
- ❌ **ไม่ต้องมี n8n instance!**

---

### Step 1: Setup n8n MCP Container

**สร้าง `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  n8n-mcp-docs:
    image: ghcr.io/czlonkowski/n8n-mcp:latest
    container_name: n8n-mcp-docs
    environment:
      - MCP_MODE=stdio
      # ไม่ต้องใส่ N8N_API_URL และ N8N_API_KEY
      # จะใช้ Documentation Mode อัตโนมัติ
    stdin_open: true
    tty: true
```

**รัน:**
```bash
docker-compose up -d
```

**ตรวจสอบ:**
```bash
docker ps | grep n8n-mcp-docs
# ควรเห็น container running
```

---

### Step 2: ตั้งค่า Claude Desktop

**แก้ไข config file:**

```bash
# macOS/Linux
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Windows
notepad %APPDATA%/Claude/claude_desktop_config.json
```

**Config สำหรับ Documentation Mode:**

```json
{
  "mcpServers": {
    "n8n-docs": {
      "command": "docker",
      "args": ["exec", "-i", "n8n-mcp-docs", "node", "build/index.js"]
    }
  }
}
```

**สังเกต:**
- ✅ **ไม่มี** `env` section
- ✅ **ไม่มี** `N8N_API_KEY` หรือ `N8N_API_URL`
- ✅ จะใช้ Documentation Mode อัตโนมัติ

---

### Step 3: Restart Claude Desktop

1. ปิด Claude Desktop
2. เปิดใหม่
3. รอ MCP server load (2-3 วินาที)

---

### Step 4: ทดสอบ

**ใน Claude Desktop พิมพ์:**

```
แสดงข้อมูล Google Sheets node
```

หรือ

```
มี nodes อะไรบ้างที่เกี่ยวกับ Facebook?
```

**ผลลัพธ์ที่คาดหวัง:**
```
Google Sheets Node

Type: n8n-nodes-base.googleSheets
Version: 4.7
Category: Productivity

Operations:
- Read: อ่านข้อมูลจาก sheet
- Append: เพิ่มแถวใหม่
- Update: อัปเดทข้อมูล
- Lookup: ค้นหาข้อมูล
- Delete: ลบข้อมูล

Parameters:
...
```

---

## 💡 Use Cases: Documentation Mode

### 1. ค้นหา Nodes

**ตัวอย่าง:**

```
User: มี nodes อะไรบ้างที่ทำงานกับ OpenAI?

Claude + MCP:
- OpenAI (n8n-nodes-base.openAi)
- OpenAI Chat Model (@n8n/n8n-nodes-langchain.lmChatOpenAi)
- OpenAI Embeddings (@n8n/n8n-nodes-langchain.embeddingsOpenAi)
```

---

### 2. ดู Node Parameters

**ตัวอย่าง:**

```
User: Google Sheets node มี parameters อะไรบ้าง?

Claude + MCP:
Parameters:
- operation: [read, append, update, lookup, delete]
- documentId: Google Sheet ID
- sheetName: ชื่อ sheet
- columns: Column mapping
- options: Advanced options
  - range: A1 notation range
  - valueInputMode: RAW or USER_ENTERED
```

---

### 3. Validate Workflow Structure

**ตัวอย่าง:**

```
User: Workflow JSON นี้ถูกต้องไหม?

{
  "name": "Test",
  "nodes": [...],
  "connections": {...}
}

Claude + MCP:
✅ Valid workflow structure
⚠️ Missing 'active' field
⚠️ Node "ABC" uses deprecated typeVersion
```

---

### 4. Expression Syntax Help

**ตัวอย่าง:**

```
User: อยากได้วันที่วันนี้ในรูปแบบ dd/MM/yyyy

Claude + MCP:
{{ $now.setZone("Asia/Bangkok").format("dd/MM/yyyy") }}

หรือ
{{ $now.toFormat("dd/MM/yyyy") }}
```

---

### 5. Workflow Design Consultation

**ตัวอย่าง:**

```
User: อยากสร้าง workflow ที่ scrape Facebook แล้วเก็บใน Google Sheets

Claude + MCP:
Recommended nodes:
1. Trigger: Schedule Trigger (n8n-nodes-base.scheduleTrigger)
2. Scraper: HTTP Request (n8n-nodes-base.httpRequest)
   หรือ APIFY (@apify/n8n-nodes-apify.apify)
3. Transform: Code (n8n-nodes-base.code)
4. Storage: Google Sheets (n8n-nodes-base.googleSheets)

Architecture:
Schedule → APIFY Scraper → Transform Data → Google Sheets
```

---

### 6. Node Comparison

**ตัวอย่าง:**

```
User: ต่างกันยังไง: HTTP Request vs. Webhook?

Claude + MCP:
HTTP Request:
- ส่ง request ไป external API
- Outbound
- ใช้สำหรับ: API calls, scraping

Webhook:
- รับ request จาก external services
- Inbound
- ใช้สำหรับ: webhooks, form submissions
```

---

## 🔄 Documentation Mode vs API Mode

| Feature | Documentation Mode | API Mode |
|---------|-------------------|----------|
| **Setup** | ไม่ต้องมี n8n | ต้องมี n8n instance |
| **Cost** | ฟรี | ฟรี (แต่ต้องรัน n8n) |
| **Node Info** | ✅ 541 nodes | ✅ 541 nodes |
| **Syntax Help** | ✅ ครบ | ✅ ครบ |
| **Validation** | ✅ Structure only | ✅ Full validation |
| **Create Workflow** | ❌ JSON only | ✅ Direct to n8n |
| **Execute Workflow** | ❌ ไม่ได้ | ✅ ได้ |
| **Read Existing** | ❌ ไม่ได้ | ✅ ได้ |

---

## 🎯 เมื่อไหร่ควรใช้แต่ละโหมด?

### ใช้ **Documentation Mode** เมื่อ:

✅ กำลังเรียนรู้ n8n
✅ วางแผน workflow
✅ ค้นหา nodes ที่เหมาะสม
✅ ตรวจสอบ syntax
✅ Validate workflow JSON
✅ **ยังไม่มี n8n instance**

---

### ใช้ **API Mode** เมื่อ:

✅ มี n8n instance แล้ว
✅ ต้องการสร้าง workflow โดยตรง
✅ ต้องการ execute workflows
✅ ต้องการอ่าน/แก้ไข workflows ที่มี
✅ Development & Testing

---

## 💻 ตัวอย่างการใช้งานจริง

### Example 1: วางแผน Workflow

**Scenario:** ต้องการสร้าง workflow scrape Facebook แล้ววิเคราะห์ด้วย AI

**ใน Claude Desktop:**

```
User: ช่วยวางแผน workflow สำหรับ:
1. Scrape Facebook posts ทุกวัน
2. วิเคราะห์ sentiment ด้วย OpenAI
3. เก็บผลลัพธ์ใน Google Sheets

Claude + MCP (Documentation Mode):

ขั้นตอนที่แนะนำ:

1. Trigger Node
   - Type: Schedule Trigger
   - Cron: 0 2 * * * (ทุกวัน 2:00)

2. Scraper Node
   - Option 1: APIFY Facebook Scraper
     - Type: @apify/n8n-nodes-apify.apify
     - Actor ID: facebook-posts-scraper

   - Option 2: HTTP Request (ถ้ามี API)
     - Type: n8n-nodes-base.httpRequest
     - Method: GET
     - URL: Facebook Graph API endpoint

3. Data Processing
   - Type: n8n-nodes-base.code
   - Purpose: Transform scraped data

4. AI Analysis
   - Type: @n8n/n8n-nodes-langchain.openAi
   - Model: gpt-4o
   - Task: Sentiment analysis

5. Storage
   - Type: n8n-nodes-base.googleSheets
   - Operation: append
   - Sheet: Results

6. Error Handling
   - Type: n8n-nodes-base.if
   - Condition: Check for errors

Estimated costs:
- APIFY: $0.10-0.30 per run
- OpenAI: $0.05-0.20 per run
- Google Sheets: Free (within limits)

Total: ~$0.15-0.50 per day
```

---

### Example 2: ตรวจสอบ Node Parameters

**Scenario:** ไม่แน่ใจว่า Google Sheets append node ต้อง config อย่างไร

**ใน Claude Desktop:**

```
User: Google Sheets append operation ต้องตั้งค่าอะไรบ้าง?

Claude + MCP:

Required Parameters:
1. documentId (Resource Locator)
   - Google Sheet ID
   - Format: xxx...xxx
   - Example: "1rAFlwhtvKQUr60soudidfkX19rHz9e2u..."

2. sheetName (Resource Locator)
   - Sheet tab name
   - Example: "Sheet1" or "gid=0"

3. columns (Mapping)
   - Column mapping mode: "defineBelow" or "autoMap"
   - Value mappings:
     {
       "column_name": "={{ $json.field }}"
     }

Optional Parameters:
- options.range: Specific cell range (A1 notation)
- options.valueInputMode: "RAW" or "USER_ENTERED"

Example Configuration:
{
  "operation": "append",
  "documentId": "YOUR_SHEET_ID",
  "sheetName": "Sheet1",
  "columns": {
    "mappingMode": "defineBelow",
    "value": {
      "name": "={{ $json.name }}",
      "email": "={{ $json.email }}",
      "date": "={{ $now.toISO() }}"
    }
  }
}
```

---

### Example 3: ค้นหา Nodes ที่เหมาะสม

**Scenario:** ต้องการส่ง email notification

**ใน Claude Desktop:**

```
User: มี nodes อะไรบ้างที่ส่ง email ได้?

Claude + MCP:

Email Nodes Available:

1. **Gmail** (n8n-nodes-base.gmail)
   - Pros: Free, ใช้ง่าย
   - Cons: Gmail API limits
   - Best for: Personal use, small volume

2. **Send Email** (n8n-nodes-base.emailSend)
   - Pros: ใช้ SMTP ได้, flexible
   - Cons: ต้อง config SMTP server
   - Best for: Custom mail servers

3. **SendGrid** (n8n-nodes-base.sendGrid)
   - Pros: Professional, high volume
   - Cons: ต้องจ่ายเงิน
   - Best for: Transactional emails, marketing

4. **Mailgun** (n8n-nodes-base.mailgun)
   - Pros: Developer-friendly
   - Cons: ต้องจ่ายเงิน
   - Best for: API-based sending

Recommendation:
- For testing: Gmail
- For production (< 100/day): Send Email (SMTP)
- For production (> 100/day): SendGrid or Mailgun
```

---

## 🔧 Tips & Tricks

### 1. ค้นหา Nodes อย่างมีประสิทธิภาพ

```
❌ ไม่ดี: "แสดง nodes ทั้งหมด"
✅ ดี: "แสดง nodes ที่เกี่ยวกับ database"
✅ ดี: "nodes ไหนใช้สำหรับ API calls?"
✅ ดี: "เปรียบเทียบ HTTP Request และ Webhook"
```

---

### 2. ขอตัวอย่าง Configuration

```
User: ยกตัวอย่าง config ของ OpenAI node

Claude + MCP จะให้:
- JSON configuration
- Parameter explanations
- Example inputs/outputs
```

---

### 3. Validate Workflows ก่อน Import

```
User: Workflow JSON นี้ถูกต้องไหม?
[paste JSON]

Claude + MCP จะตรวจ:
- JSON syntax
- Required fields
- Node types
- Connections
```

---

### 4. Expression Help

```
User: วิธีแปลง timestamp เป็น readable date?

Claude + MCP:
{{ $now.setZone("Asia/Bangkok").format("dd/MM/yyyy HH:mm:ss") }}

หรือ
{{ DateTime.fromISO($json.timestamp).toFormat("dd/MM/yyyy") }}
```

---

## 📚 Resources

### n8n MCP Documentation Mode

**GitHub:**
- https://github.com/czlonkowski/n8n-mcp

**Features:**
- 541 built-in nodes
- Expression functions
- Workflow examples

---

### Official n8n Docs

**URL:**
- https://docs.n8n.io

**Sections:**
- Nodes reference
- Expressions
- Workflows
- Best practices

---

## ⚠️ Limitations

### Documentation Mode ไม่สามารถ:

1. **Execute Workflows**
   ```
   ❌ ไม่ได้: "รัน workflow นี้"
   ✅ ได้: "Workflow นี้จะทำงานอย่างไร?"
   ```

2. **Access Real Data**
   ```
   ❌ ไม่ได้: "ดึงข้อมูลจาก Google Sheets"
   ✅ ได้: "วิธี config Google Sheets node"
   ```

3. **Create in n8n**
   ```
   ❌ ไม่ได้: "สร้าง workflow ลง n8n"
   ✅ ได้: "สร้าง workflow JSON file"
   ```

4. **Read Existing Workflows**
   ```
   ❌ ไม่ได้: "แสดง workflows ที่มีใน n8n"
   ✅ ได้: "วิเคราะห์ workflow JSON file นี้"
   ```

---

## 🎓 Learning Path with Documentation Mode

### Week 1: Basics
```
Day 1-2: ค้นหาและทำความเข้าใจ basic nodes
Day 3-4: เรียนรู้ expressions และ functions
Day 5-7: ฝึกออกแบบ workflows
```

### Week 2: Intermediate
```
Day 1-3: Advanced nodes (AI, databases)
Day 4-5: Error handling patterns
Day 6-7: Performance optimization
```

### Week 3: Advanced
```
Day 1-3: Complex workflows
Day 4-5: Best practices
Day 6-7: สร้าง custom solutions
```

---

## 🆚 Comparison: Documentation Mode Tools

| Feature | n8n MCP Docs Mode | Claude Code (ผม) | n8n Official Docs |
|---------|-------------------|------------------|-------------------|
| **Interactive** | ✅ Chat-based | ✅ Chat-based | ❌ Static |
| **Node Search** | ✅ 541 nodes | ✅ Via search | ✅ Manual browse |
| **Examples** | ✅ Dynamic | ✅ Custom generated | ✅ Pre-made |
| **Validation** | ✅ Real-time | ✅ Script-based | ❌ Manual |
| **Custom Help** | ✅ Contextual | ✅ Tailored | ❌ Generic |

---

## 💡 Pro Tips

### 1. ใช้ร่วมกับ Claude Code

```
Step 1: ใช้ MCP Docs Mode (Claude Desktop)
        → ค้นหา nodes และออกแบบ workflow

Step 2: ใช้ Claude Code (Web)
        → สร้าง workflow JSON file
        → Validate ด้วย scripts

Step 3: Import เข้า n8n
        → Test และ deploy
```

---

### 2. Save Useful Configs

```bash
# สร้างไฟล์ snippets
mkdir ~/.n8n-snippets

# บันทึก configs ที่ได้จาก MCP
cat > ~/.n8n-snippets/google-sheets-append.json << 'EOF'
{
  "operation": "append",
  "documentId": "SHEET_ID",
  ...
}
EOF
```

---

### 3. Build Knowledge Base

```
เก็บคำตอบจาก MCP ไว้ใน notes:
- Common node configurations
- Expression patterns
- Workflow patterns
```

---

## ✅ Quick Reference

### ใช้ Documentation Mode ได้เลยเมื่อ:

- ✅ ต้องการหา nodes
- ✅ ต้องการ syntax help
- ✅ ต้องการ validate JSON
- ✅ ต้องการออกแบบ workflow
- ✅ ต้องการเปรียบเทียบ nodes

### ต้องใช้ API Mode เมื่อ:

- ✅ ต้องการสร้าง workflow ลง n8n โดยตรง
- ✅ ต้องการ execute workflows
- ✅ ต้องการดู workflows ที่มี
- ✅ ต้องการแก้ไข workflows จริง

---

**Documentation Mode คือเครื่องมือที่ยอดเยี่ยมสำหรับเรียนรู้และวางแผน workflows!** 📚✨

**Last Updated:** 2025-11-09
**n8n MCP Version:** Latest (from ghcr.io/czlonkowski/n8n-mcp)
