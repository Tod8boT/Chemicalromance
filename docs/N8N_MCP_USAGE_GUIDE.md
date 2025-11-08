# n8n MCP Usage Guide - For Claude Code
**สำหรับ:** แชทใหม่ที่ต้องทำงานกับ n8n workflows
**Updated:** 2025-11-08
**Priority:** อ่านก่อนเริ่มงานทุกครั้ง

---

## 🎯 n8n MCP คืออะไร?

**n8n MCP (Model Context Protocol)** = เครื่องมือที่ให้ Claude Code เชื่อมต่อและจัดการ n8n workflows ได้โดยตรง

### สิ่งที่ทำได้:
✅ ดู workflows ทั้งหมด (list)
✅ อ่าน workflow แบบละเอียด (get)
✅ สร้าง workflow ใหม่ (create)
✅ อัพเดต workflow ที่มีอยู่ (update)
✅ ลบ workflow (delete)
✅ เปิด/ปิด workflow (activate/deactivate)
✅ ดู executions (logs/history)

### สิ่งที่ทำไม่ได้:
❌ Execute workflow ด้วยตัวเอง (ต้องใช้ webhook/trigger)
❌ เข้าถึง credentials โดยตรง
❌ แก้ไข n8n settings

---

## 📋 Available Tools (เครื่องมือที่มี)

ผมมี n8n MCP tools ดังนี้ (สันนิษฐานจากการใช้งาน):

### 1. **List Workflows**
```
ใช้เมื่อ: ต้องการดูว่ามี workflows อะไรบ้าง
Output: รายชื่อ workflows + ID + status (active/inactive)
```

### 2. **Get Workflow**
```
ใช้เมื่อ: ต้องการดูรายละเอียด workflow ที่เจาะจง
Input: workflow_id
Output: JSON ของ workflow ทั้งหมด (nodes, connections, settings)
```

### 3. **Create Workflow**
```
ใช้เมื่อ: สร้าง workflow ใหม่
Input: workflow JSON
Output: workflow_id ของ workflow ที่สร้าง
```

### 4. **Update Workflow**
```
ใช้เมื่อ: แก้ไข workflow ที่มีอยู่
Input: workflow_id + updated JSON
Output: success/failure
```

### 5. **Delete Workflow**
```
ใช้เมื่อ: ลบ workflow
Input: workflow_id
Output: confirmation
```

### 6. **Activate/Deactivate Workflow**
```
ใช้เมื่อ: เปิด/ปิด workflow
Input: workflow_id + active (true/false)
Output: new status
```

---

## 🚀 การใช้งานพื้นฐาน

### Pattern 1: ตรวจสอบ Workflow ที่มีอยู่

**เมื่อไหร่:** ก่อนสร้าง/แก้ไข workflow เสมอ

```
ขั้นตอน:
1. List workflows เพื่อดูทั้งหมด
2. หา workflow ที่ต้องการ (จาก ID หรือชื่อ)
3. Get workflow เพื่อดูรายละเอียด
4. วิเคราะห์ structure
```

**ตัวอย่าง:**
```markdown
ผม: "แสดง workflow ทั้งหมด"
→ ใช้ List Workflows

ผม: "ดู workflow ID: BrEps7QE3eBia4U4"
→ ใช้ Get Workflow (BrEps7QE3eBia4U4)
```

---

### Pattern 2: สร้าง Workflow ใหม่

**เมื่อไหร่:** เมื่อต้องการสร้าง workflow ใหม่จากศูนย์

```
ขั้นตอน:
1. ออกแบบ workflow structure (nodes + connections)
2. เขียน JSON ตาม n8n format
3. Validate JSON structure
4. Create workflow
5. Test และ activate
```

**JSON Structure:**
```json
{
  "name": "Workflow Name",
  "nodes": [
    {
      "id": "node-1",
      "name": "Node Name",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        // node-specific parameters
      }
    }
  ],
  "connections": {
    "Node Name": {
      "main": [[{"node": "Next Node", "type": "main", "index": 0}]]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1"
  }
}
```

---

### Pattern 3: แก้ไข Workflow ที่มีอยู่

**เมื่อไหร่:** แก้ bug, เพิ่ม features, อัพเดต logic

```
ขั้นตอน:
1. Get workflow ปัจจุบัน
2. บันทึก JSON เดิม (backup)
3. แก้ไขส่วนที่ต้องการ
4. Validate JSON ใหม่
5. Update workflow
6. Test
7. Activate (ถ้าทำงานถูกต้อง)
```

**สิ่งที่ต้องระวัง:**
⚠️ อย่าลืม backup JSON เดิม
⚠️ ตรวจสอบ connections ว่าถูกต้อง
⚠️ Test ก่อน activate
⚠️ อย่าแก้ credentials โดยตรง

---

### Pattern 4: Debug Workflow

**เมื่อไหร่:** workflow ไม่ทำงาน หรือ error

```
ขั้นตอน:
1. Get workflow JSON
2. ตรวจสอบ:
   - Node configuration
   - Connections ครบหรือไม่
   - Parameters ถูกต้องหรือไม่
   - Expressions/variables
3. ดู executions (logs)
4. แก้ไขปัญหา
5. Update workflow
```

---

## 📖 n8n Workflow JSON Format

### โครงสร้างพื้นฐาน

```json
{
  "name": "string",           // ชื่อ workflow
  "nodes": [],                 // array of nodes
  "connections": {},           // การเชื่อมต่อระหว่าง nodes
  "active": boolean,           // เปิดใช้งานหรือไม่
  "settings": {},              // ตั้งค่า workflow
  "staticData": null,          // data ที่เก็บไว้
  "tags": [],                  // tags สำหรับจัดกลุ่ม
  "pinData": {},               // pinned data สำหรับ test
  "versionId": "string"        // version
}
```

### Node Structure

```json
{
  "id": "uuid-string",              // unique ID
  "name": "Node Name",              // ชื่อ node (unique in workflow)
  "type": "n8n-nodes-base.webhook", // node type
  "typeVersion": 1,                 // version ของ node type
  "position": [x, y],               // ตำแหน่งบน canvas
  "parameters": {                   // ค่าตั้งต่างๆ ของ node
    // node-specific parameters
  },
  "credentials": {                  // credentials ที่ใช้
    "credentialType": {
      "id": "credential-id",
      "name": "Credential Name"
    }
  },
  "webhookId": "string",            // สำหรับ webhook nodes
  "disabled": false                 // ปิดการใช้งาน node นี้หรือไม่
}
```

### Connections Structure

```json
{
  "Node 1 Name": {
    "main": [                       // main output
      [                             // output index 0
        {
          "node": "Node 2 Name",    // target node
          "type": "main",           // connection type
          "index": 0                // input index ของ target
        }
      ]
    ]
  },
  "Node 2 Name": {
    "main": [
      [
        {
          "node": "Node 3 Name",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
}
```

---

## 🎨 Common Node Types

### 1. Webhook (Trigger)
```json
{
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1,
  "parameters": {
    "httpMethod": "GET",
    "path": "webhook-path",
    "responseMode": "onReceived",
    "options": {}
  },
  "webhookId": "generated-id"
}
```

### 2. HTTP Request
```json
{
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.1,
  "parameters": {
    "method": "POST",
    "url": "https://api.example.com/endpoint",
    "authentication": "none",
    "options": {}
  }
}
```

### 3. Code Node (JavaScript)
```json
{
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "parameters": {
    "mode": "runOnceForAllItems",
    "jsCode": "// JavaScript code here\nreturn $input.all();"
  }
}
```

### 4. Telegram
```json
{
  "type": "n8n-nodes-base.telegram",
  "typeVersion": 1.1,
  "parameters": {
    "operation": "sendMessage",
    "chatId": "={{ $json.chat_id }}",
    "text": "Message text"
  },
  "credentials": {
    "telegramApi": {
      "id": "credential-id",
      "name": "Telegram Bot"
    }
  }
}
```

### 5. Google Sheets
```json
{
  "type": "n8n-nodes-base.googleSheets",
  "typeVersion": 4.4,
  "parameters": {
    "operation": "append",
    "documentId": "spreadsheet-id",
    "sheetName": "Sheet1",
    "columns": {},
    "options": {}
  },
  "credentials": {
    "googleSheetsOAuth2Api": {
      "id": "credential-id",
      "name": "Google Sheets Account"
    }
  }
}
```

### 6. Execute Workflow (Sub-workflow)
```json
{
  "type": "n8n-nodes-base.executeWorkflow",
  "typeVersion": 1,
  "parameters": {
    "source": "database",
    "workflowId": "sub-workflow-id",
    "options": {}
  }
}
```

---

## ⚡ Best Practices

### 1. ก่อนสร้าง/แก้ไข
```
✅ ใช้ List workflows เพื่อดูว่ามีอะไรอยู่บ้าง
✅ ใช้ Get workflow เพื่ออ่าน structure เดิม
✅ Backup JSON เดิมเสมอ
✅ วางแผนการเปลี่ยนแปลงก่อน
```

### 2. ขณะสร้าง/แก้ไข
```
✅ ตั้งชื่อ nodes ให้ชัดเจน
✅ ใช้ position ที่เหมาะสม (ไม่ทับกัน)
✅ ตรวจสอบ connections ทุกครั้ง
✅ ใช้ expressions อย่างถูกต้อง (={{ ... }})
✅ Comment ใน code nodes
```

### 3. หลังสร้าง/แก้ไข
```
✅ Validate JSON structure
✅ Test workflow (ถ้าทำได้)
✅ ตรวจสอบ error handling
✅ เขียน documentation
✅ Activate เมื่อพร้อม
```

### 4. การ Debug
```
✅ ดู execution logs
✅ ตรวจสอบ input/output ของแต่ละ node
✅ ใช้ console.log ใน code nodes
✅ Test แบบ step-by-step
```

---

## 🚫 ข้อห้าม (DON'Ts)

❌ **อย่า** แก้ไข workflow โดยไม่ได้อ่านก่อน
❌ **อย่า** ลบ workflow โดยไม่ backup
❌ **อย่า** activate workflow ที่ยังไม่ได้ test
❌ **อย่า** ใช้ credentials แบบ hardcode
❌ **อย่า** สร้าง duplicate workflows โดยไม่จำเป็น
❌ **อย่า** แก้หลาย workflows พร้อมกันโดยไม่จำเป็น

---

## 📝 Templates พื้นฐาน

### Template 1: Simple Webhook → Code → Response

```json
{
  "name": "Simple Webhook Workflow",
  "nodes": [
    {
      "id": "webhook-1",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "my-webhook",
        "responseMode": "responseNode",
        "options": {}
      },
      "webhookId": "auto-generated"
    },
    {
      "id": "code-1",
      "name": "Process Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300],
      "parameters": {
        "mode": "runOnceForAllItems",
        "jsCode": "// Process input data\nconst items = $input.all();\nreturn items.map(item => ({\n  json: {\n    ...item.json,\n    processed: true\n  }\n}));"
      }
    },
    {
      "id": "respond-1",
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [650, 300],
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Process Data", "type": "main", "index": 0}]]
    },
    "Process Data": {
      "main": [[{"node": "Respond to Webhook", "type": "main", "index": 0}]]
    }
  },
  "active": false
}
```

### Template 2: Schedule → API → Google Sheets

```json
{
  "name": "Scheduled Data Collection",
  "nodes": [
    {
      "id": "schedule-1",
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [250, 300],
      "parameters": {
        "rule": {
          "interval": [{"field": "hours", "hoursInterval": 1}]
        }
      }
    },
    {
      "id": "http-1",
      "name": "Fetch Data",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [450, 300],
      "parameters": {
        "method": "GET",
        "url": "https://api.example.com/data",
        "options": {}
      }
    },
    {
      "id": "sheets-1",
      "name": "Save to Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.4,
      "position": [650, 300],
      "parameters": {
        "operation": "append",
        "documentId": "YOUR_SPREADSHEET_ID",
        "sheetName": "Sheet1",
        "options": {}
      },
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "google-creds-id",
          "name": "Google Sheets Account"
        }
      }
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [[{"node": "Fetch Data", "type": "main", "index": 0}]]
    },
    "Fetch Data": {
      "main": [[{"node": "Save to Sheets", "type": "main", "index": 0}]]
    }
  },
  "active": false
}
```

### Template 3: Telegram Bot

```json
{
  "name": "Telegram Bot Workflow",
  "nodes": [
    {
      "id": "telegram-trigger-1",
      "name": "Telegram Trigger",
      "type": "n8n-nodes-base.telegramTrigger",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "updates": ["message"]
      },
      "credentials": {
        "telegramApi": {
          "id": "telegram-creds-id",
          "name": "Telegram Bot"
        }
      }
    },
    {
      "id": "code-1",
      "name": "Process Message",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300],
      "parameters": {
        "mode": "runOnceForAllItems",
        "jsCode": "const message = $input.first().json.message.text;\nconst chatId = $input.first().json.message.chat.id;\n\nreturn [{\n  json: {\n    chat_id: chatId,\n    text: `You said: ${message}`\n  }\n}];"
      }
    },
    {
      "id": "telegram-send-1",
      "name": "Send Reply",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1.1,
      "position": [650, 300],
      "parameters": {
        "operation": "sendMessage",
        "chatId": "={{ $json.chat_id }}",
        "text": "={{ $json.text }}"
      },
      "credentials": {
        "telegramApi": {
          "id": "telegram-creds-id",
          "name": "Telegram Bot"
        }
      }
    }
  ],
  "connections": {
    "Telegram Trigger": {
      "main": [[{"node": "Process Message", "type": "main", "index": 0}]]
    },
    "Process Message": {
      "main": [[{"node": "Send Reply", "type": "main", "index": 0}]]
    }
  },
  "active": false
}
```

---

## 🔍 Troubleshooting Guide

### ปัญหาที่พบบ่อย

#### 1. "Workflow not found"
```
สาเหตุ: workflow ID ไม่ถูกต้อง
แก้ไข: ใช้ List workflows เพื่อหา ID ที่ถูกต้อง
```

#### 2. "Invalid JSON"
```
สาเหตุ: JSON format ผิด
แก้ไข:
- ตรวจสอบ syntax (brackets, commas, quotes)
- ใช้ JSON validator
- เปรียบเทียบกับ template
```

#### 3. "Connection not found"
```
สาเหตุ: ชื่อ node ใน connections ไม่ตรงกับ nodes
แก้ไข: ตรวจสอบว่าชื่อ node ตรงกันทุกที่
```

#### 4. "Node type not supported"
```
สาเหตุ: ใช้ node type ที่ไม่มีใน n8n version นั้น
แก้ไข: เช็ค n8n version และใช้ node ที่รองรับ
```

#### 5. "Credential not found"
```
สาเหตุ: credential ID ไม่ถูกต้อง
แก้ไข:
- ตรวจสอบ credential ID
- ใช้ credential ที่มีอยู่แล้ว
- อย่าลบ/แก้ไข credentials โดยตรง
```

---

## 📚 เอกสารอ้างอิง

### n8n Official Docs
- Workflow Structure: https://docs.n8n.io/workflows/
- Nodes: https://docs.n8n.io/integrations/builtin/
- Expressions: https://docs.n8n.io/code-examples/expressions/

### โปรเจคนี้
- OPERATING_MANUAL.md - บทบาทของ Coordinator
- PROJECT_STATUS.md - สถานะโปรเจคปัจจุบัน
- CC_INTEL/ - โปรเจค Facebook Data Architecture

---

## 💡 เคล็ดลับสำหรับแชทใหม่

### เมื่อได้รับงานใหม่:

1. **อ่าน DELIVERABLE file ก่อน**
   - เข้าใจว่าต้องทำอะไร
   - มี workflow ID ไหนบ้าง
   - Priority เท่าไร

2. **ตรวจสอบ workflows ที่เกี่ยวข้อง**
   - List workflows
   - Get workflows ที่เกี่ยวข้อง
   - วิเคราะห์ structure

3. **วางแผนก่อนทำ**
   - ต้องสร้างใหม่หรือแก้ไข?
   - มีผลกระทบกับ workflows อื่นไหม?
   - ต้อง backup อะไรบ้าง?

4. **ทำทีละขั้นตอน**
   - อย่ารีบ
   - Test แต่ละขั้นตอน
   - Document ตลอดเวลา

5. **รายงานผล**
   - อะไรทำเสร็จแล้ว
   - มีปัญหาอะไรบ้าง
   - ต้องทำอะไรต่อ

---

## ✅ Checklist สำหรับงานแต่ละประเภท

### สร้าง Workflow ใหม่:
- [ ] อ่าน requirements
- [ ] ออกแบบ node structure
- [ ] เขียน JSON
- [ ] Validate JSON
- [ ] Create workflow
- [ ] Test (ถ้าทำได้)
- [ ] Document
- [ ] รายงานผล

### แก้ไข Workflow:
- [ ] Get workflow เดิม
- [ ] Backup JSON
- [ ] วิเคราะห์ปัญหา
- [ ] วางแผนการแก้ไข
- [ ] แก้ไข JSON
- [ ] Validate
- [ ] Update workflow
- [ ] Test
- [ ] Document
- [ ] รายงานผล

### Debug Workflow:
- [ ] Get workflow
- [ ] อ่าน error/logs
- [ ] ตรวจสอบ nodes
- [ ] ตรวจสอบ connections
- [ ] ตรวจสอบ parameters
- [ ] แก้ไขปัญหา
- [ ] Test again
- [ ] Document fix
- [ ] รายงานผล

---

## 🎯 สรุป

### สิ่งสำคัญที่สุด:
1. **อ่าน DELIVERABLE ให้เข้าใจก่อน**
2. **ตรวจสอบ workflows ที่มีอยู่เสมอ**
3. **Backup ก่อนแก้ไข**
4. **Test ก่อน activate**
5. **Document ทุกอย่าง**

### เมื่อติดปัญหา:
- อ่าน error message ให้ดี
- เช็ค JSON structure
- เปรียบเทียบกับ template
- ถามผู้ใช้เมื่อไม่แน่ใจ

### เมื่อไม่แน่ใจ:
- อย่าเดา
- ถามผู้ใช้
- เสนอทางเลือก
- ระบุความเสี่ยง

---

**Good luck! 🚀**

*สร้างโดย: Claude Code Session (Nov 8, 2025)*
*สำหรับ: แชทใหม่ที่ต้องใช้ n8n MCP*
