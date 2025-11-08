# วิธีใช้งาน n8n MCP กับ Claude Desktop และ Claude Code

คู่มือนี้สำหรับการทำงานร่วมกันระหว่าง Claude Desktop (local) และ Claude Code (web) เพื่อพัฒนา n8n workflows

---

## 📋 ภาพรวมระบบ

```
┌─────────────────────────────────────────────────────────┐
│                    Workflow Development                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Claude Desktop (Local)          Claude Code (Web)      │
│  + n8n MCP (Docker)              + GitHub Access        │
│         ↓                                ↓               │
│    สร้าง/แก้ไข Workflows          Review/Test           │
│         ↓                                ↓               │
│    Export to JSON               Validate & Improve      │
│         ↓                                ↓               │
│         └──────→  GitHub Repo  ←─────────┘              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Workflow:**
1. คุณ (Local): สร้าง/แก้ไข workflows ด้วย Claude Desktop + n8n MCP
2. Export workflows เป็น JSON
3. Push ขึ้น GitHub repo นี้
4. Claude Code: Review, test, และ improve workflows
5. Merge กลับเข้า n8n instance

---

## 🔧 Setup: Claude Desktop + n8n MCP (Local)

### Prerequisites

- ✅ Docker & Docker Compose
- ✅ n8n instance (local หรือ cloud)
- ✅ Claude Desktop app

### 1. Setup n8n MCP ใน Docker

**สร้าง `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  n8n-mcp:
    image: ghcr.io/czlonkowski/n8n-mcp:latest
    container_name: n8n-mcp
    environment:
      - MCP_MODE=stdio
      - N8N_API_URL=http://host.docker.internal:5678  # URL ของ n8n instance
      - N8N_API_KEY=${N8N_API_KEY}                    # n8n API key
    stdin_open: true
    tty: true
```

**รัน:**
```bash
docker-compose up -d
```

### 2. ตั้งค่า Claude Desktop

**สร้าง/แก้ไข config file:**

```bash
# macOS/Linux
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Windows
notepad %APPDATA%/Claude/claude_desktop_config.json
```

**เพิ่ม config:**

```json
{
  "mcpServers": {
    "n8n": {
      "command": "docker",
      "args": ["exec", "-i", "n8n-mcp", "node", "build/index.js"],
      "env": {
        "N8N_API_KEY": "your-n8n-api-key",
        "N8N_API_URL": "http://localhost:5678"
      }
    }
  }
}
```

**หา n8n API Key:**
1. เปิด n8n UI
2. ไปที่ Settings → API
3. สร้าง API key ใหม่
4. Copy มาใส่ใน config

### 3. Restart Claude Desktop

ปิดแล้วเปิด Claude Desktop ใหม่

### 4. ทดสอบ

พิมพ์ใน Claude Desktop:
```
ใช้ n8n MCP แสดงรายการ workflows ทั้งหมด
```

ถ้าได้ผลลัพธ์ = Setup สำเร็จ! ✅

---

## 💻 Setup: Claude Code (Web)

Claude Code ไม่สามารถเชื่อมต่อกับ Docker local ได้ แต่สามารถ:

### ทำได้:
- ✅ อ่านและวิเคราะห์ workflow JSON files
- ✅ ตรวจสอบ errors และ best practices
- ✅ แนะนำการปรับปรุง workflows
- ✅ สร้าง workflows ใหม่ตาม n8n schema
- ✅ จัดการ Git operations (commit, push, PR)

### ทำไม่ได้:
- ❌ เชื่อมต่อกับ n8n MCP ใน Docker โดยตรง
- ❌ Execute workflows real-time
- ❌ เข้าถึง local n8n instance

### วิธีใช้งาน:

1. **Export workflows จาก n8n**
2. **Push ขึ้น GitHub**
3. **Claude Code จะ review และแนะนำ**

---

## 🔄 Workflow Development Process

### สำหรับคุณ (Local with Claude Desktop):

#### 1. สร้าง/แก้ไข Workflow

```
คุณ: "สร้าง workflow สำหรับ Facebook auto-reply"

Claude Desktop + n8n MCP:
- ค้นหา Facebook Trigger node
- ดู schema และ properties
- สร้าง workflow ใน n8n
- ทดสอบ
```

#### 2. Export Workflow

ใน n8n UI:
1. เปิด workflow
2. คลิก **...** (menu)
3. เลือก **Export**
4. Save เป็น `workflow-name.json`

#### 3. เพิ่มเข้า Repo

```bash
# Clone repo (ครั้งแรก)
git clone https://github.com/Tod8boT/Chemicalromance.git
cd Chemicalromance

# ย้ายไฟล์เข้า workflows/
mv ~/Downloads/my-workflow.json workflows/

# Commit
git add workflows/my-workflow.json
git commit -m "Add: my-workflow"
git push
```

---

### สำหรับ Claude Code (Web):

#### 1. Review Workflow

```bash
# Claude Code จะ:
- อ่านไฟล์ JSON
- ตรวจสอบ structure
- หา errors
- แนะนำการปรับปรุง
```

#### 2. Improve Workflow

```bash
# Claude Code สามารถ:
- แก้ไข JSON โดยตรง
- เพิ่ม error handling
- ปรับปรุง logic
- เพิ่ม documentation
```

#### 3. Create Pull Request

```bash
# Claude Code จะ:
- สร้าง branch ใหม่
- Commit changes
- Push และสร้าง PR
- คุณ review และ merge
```

---

## 📁 โครงสร้าง Repo

```
Chemicalromance/
├── README.md                 # ภาพรวมโปรเจค
├── MCP_SETUP.md             # ไฟล์นี้
├── workflows/               # เก็บ workflow JSON files
│   ├── facebook-*.json
│   ├── instagram-*.json
│   └── ...
└── docs/                    # Documentation (optional)
    └── best-practices.md
```

---

## 🎯 Best Practices

### การตั้งชื่อไฟล์:

```
✅ Good:
- facebook-auto-reply.json
- instagram-comment-webhook.json
- slack-notification-workflow.json

❌ Bad:
- workflow1.json
- test.json
- new-workflow.json
```

### ก่อน Export:

1. **ลบข้อมูล Sensitive**
   - ตรวจสอบว่าไม่มี API keys
   - ตรวจสอบว่าไม่มี passwords
   - ตรวจสอบว่าไม่มี tokens

2. **เพิ่ม Description**
   - ใส่ description ใน workflow metadata
   - อธิบายว่า workflow ทำอะไร
   - ระบุ prerequisites

3. **Test ก่อน Export**
   - รัน workflow ให้สำเร็จ
   - ตรวจสอบ error handling
   - ทดสอบกับ test data

### Commit Messages:

```bash
# แนะนำ:
git commit -m "Add: Facebook auto-reply workflow"
git commit -m "Fix: Instagram webhook validation"
git commit -m "Update: Slack notification with error handling"

# หลีกเลี่ยง:
git commit -m "update"
git commit -m "fix bug"
git commit -m "new workflow"
```

---

## 🔒 Security

### ห้าม Commit:

- ❌ API keys
- ❌ Access tokens
- ❌ Passwords
- ❌ Credentials
- ❌ Environment variables ที่มี sensitive data

### แนะนำ:

- ✅ ใช้ environment variables ใน n8n
- ✅ ใช้ n8n credential system
- ✅ เก็บ secrets ใน n8n vault
- ✅ ใช้ `.gitignore` ถ้ามีไฟล์ sensitive

---

## 🆘 Troubleshooting

### n8n MCP ไม่ทำงาน

**ตรวจสอบ:**
```bash
# Docker container รันอยู่ไหม?
docker ps | grep n8n-mcp

# Logs มี error ไหม?
docker logs n8n-mcp

# n8n API ใช้งานได้ไหม?
curl http://localhost:5678/api/v1/workflows \
  -H "X-N8N-API-KEY: your-key"
```

**แก้ไข:**
```bash
# Restart container
docker restart n8n-mcp

# หรือ rebuild
docker-compose down
docker-compose up -d
```

### Claude Desktop ไม่เห็น MCP

**ตรวจสอบ:**
1. Config file ถูกต้องไหม? (ต้องเป็น valid JSON)
2. Path ถูกต้องไหม?
3. Restart Claude Desktop แล้วไหม?

**แก้ไข:**
```bash
# Validate JSON
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq

# ถ้า error = แก้ JSON syntax
```

### Workflow Import ไม่ได้

**สาเหตุ:**
- n8n version ไม่ตรงกัน
- Missing nodes/credentials
- Invalid JSON format

**แก้ไข:**
1. ตรวจสอบ n8n version
2. ติดตั้ง custom nodes ที่ขาด
3. Validate JSON format

---

## 📚 Resources

### Documentation:
- [n8n MCP GitHub](https://github.com/czlonkowski/n8n-mcp)
- [n8n Documentation](https://docs.n8n.io)
- [MCP Protocol](https://modelcontextprotocol.io)

### Tools:
- [JSON Validator](https://jsonlint.com)
- [n8n Workflow Templates](https://n8n.io/workflows)

### Community:
- [n8n Community](https://community.n8n.io)
- [n8n Discord](https://discord.gg/n8n)

---

## 💡 Tips

### เพิ่มประสิทธิภาพ:

1. **ใช้ n8n MCP Documentation Mode**
   ```bash
   # ไม่ต้องมี N8N_API_URL ก็ได้
   # จะได้ข้อมูล 541 nodes + templates
   ```

2. **ใช้ Templates**
   ```bash
   # Claude Desktop: "แสดง workflow templates ที่มี"
   # เลือกที่ใกล้เคียง แล้วปรับแต่ง
   ```

3. **Version Control**
   ```bash
   # สร้าง branch สำหรับ workflow ใหม่
   git checkout -b workflow/facebook-integration

   # Merge เมื่อทดสอบเสร็จ
   git checkout main
   git merge workflow/facebook-integration
   ```

---

## 🤝 Collaboration Workflow

### ระหว่าง Claude Desktop และ Claude Code:

**Claude Desktop (คุณ):**
1. สร้าง workflow ด้วย MCP
2. Export เป็น JSON
3. Push ขึ้น GitHub
4. Tag หรือ notify Claude Code

**Claude Code:**
1. Pull ไฟล์ใหม่จาก GitHub
2. Review workflow
3. ตรวจสอบ errors
4. แนะนำการปรับปรุง
5. สร้าง PR ถ้ามีการแก้ไข

**คุณ:**
1. Review PR
2. Test การเปลี่ยนแปลง
3. Merge
4. Import กลับเข้า n8n

---

**หากมีคำถามเพิ่มเติม ถามได้ทุกเมื่อ!** 😊
