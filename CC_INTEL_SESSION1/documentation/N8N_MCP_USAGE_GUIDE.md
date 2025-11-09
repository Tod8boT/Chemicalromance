# 📘 N8N & MCP USAGE GUIDE

## บทนำ

คู่มือนี้จะสอนวิธีใช้ n8n (automation platform) และ MCP (Model Context Protocol) สำหรับระบบ Facebook Intelligence

---

## 🎯 n8n Basics

### n8n คืออะไร?

n8n เป็น workflow automation tool แบบ open-source ที่:
- เชื่อมต่อ services ต่างๆ ได้ง่าย (Google Sheets, APIFY, OpenAI, etc.)
- ใช้ visual editor (drag & drop)
- รัน workflows แบบ scheduled หรือ trigger-based
- รองรับ custom JavaScript code

### สถาปัตยกรรม n8n

```
┌─────────────────────────────────────┐
│         n8n Workflow                │
│                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐     │
│  │ Node │→ │ Node │→ │ Node │     │
│  │  1   │  │  2   │  │  3   │     │
│  └──────┘  └──────┘  └──────┘     │
│                                     │
│  Trigger → Process → Output        │
└─────────────────────────────────────┘
```

---

## 📦 Key Nodes Used

### 1. Trigger Nodes

#### Schedule Trigger
ใช้สำหรับ: รัน workflow ตามเวลาที่กำหนด

```json
{
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "cronExpression",
          "expression": "0 2 * * *"  // ทุกวัน 2:00
        }
      ]
    }
  },
  "name": "Daily Scrape Trigger",
  "type": "n8n-nodes-base.scheduleTrigger"
}
```

**ตัวอย่าง Cron Expressions:**
```
0 2 * * *      # ทุกวัน 2:00
0 9 * * 1      # จันทร์ 9:00
*/30 * * * *   # ทุก 30 นาที
0 0 1 * *      # วันที่ 1 ของทุกเดือน
```

#### Webhook Trigger
ใช้สำหรับ: รับข้อมูลจาก external systems

```json
{
  "parameters": {
    "path": "facebook-webhook",
    "responseMode": "responseNode",
    "options": {}
  },
  "name": "Webhook Trigger",
  "type": "n8n-nodes-base.webhook"
}
```

#### Chat Trigger
ใช้สำหรับ: สร้าง chatbot interface

```json
{
  "parameters": {
    "options": {}
  },
  "name": "When chat message received",
  "type": "@n8n/n8n-nodes-langchain.chatTrigger"
}
```

---

### 2. Data Processing Nodes

#### Google Sheets
**Operations:**
- `read`: อ่านข้อมูล
- `append`: เพิ่มแถวใหม่
- `update`: อัพเดทข้อมูล
- `lookup`: ค้นหาข้อมูล

```json
{
  "parameters": {
    "operation": "append",
    "documentId": {
      "__rl": true,
      "value": "YOUR_SHEET_ID",
      "mode": "list"
    },
    "sheetName": {
      "__rl": true,
      "value": "gid=0",
      "mode": "list",
      "cachedResultName": "Facebook_Raw_Data"
    },
    "columns": {
      "mappingMode": "defineBelow",
      "value": {
        "timestamp": "={{ $now.toISO() }}",
        "page_name": "={{ $json.page_name }}",
        "engagement": "={{ $json.likes + $json.shares }}"
      }
    }
  },
  "name": "Write to Sheets",
  "type": "n8n-nodes-base.googleSheets"
}
```

**Tips:**
- ใช้ `batch mode` สำหรับข้อมูลมาก (> 100 rows)
- Enable `rate limiting` เพื่อไม่เกิน API quota
- ใช้ `valueInputMode: RAW` สำหรับ formulas

#### Code Node (JavaScript)
ใช้สำหรับ: data transformation, calculations

```javascript
// Example: Calculate engagement rate
const items = $input.all();

return items.map(item => {
  const data = item.json;

  const totalEngagement = (data.likes || 0) +
                          (data.shares || 0) +
                          (data.comments || 0);

  const engagementRate = data.followers > 0
    ? (totalEngagement / data.followers * 100).toFixed(2)
    : 0;

  return {
    json: {
      ...data,
      total_engagement: totalEngagement,
      engagement_rate: engagementRate,
      calculated_at: new Date().toISOString()
    }
  };
});
```

**Built-in Variables:**
- `$input.all()`: ข้อมูลทั้งหมด
- `$input.first()`: item แรก
- `$input.last()`: item สุดท้าย
- `$json`: ข้อมูล item ปัจจุบัน
- `$now`: วันเวลาปัจจุบัน
- `$workflow`: metadata ของ workflow

#### Merge Node
ใช้สำหรับ: รวมข้อมูลจากหลาย nodes

**Modes:**
1. **Combine**: รวมทุก items
2. **Choose Branch**: เลือก branch หนึ่ง
3. **Append**: ต่อท้ายกัน

```json
{
  "parameters": {
    "mode": "combine",
    "combineBy": "combineAll",
    "options": {}
  },
  "name": "Merge Data",
  "type": "n8n-nodes-base.merge"
}
```

---

### 3. AI Nodes

#### OpenAI Node
**Models ที่ใช้:**
- `gpt-4o`: สำหรับ analysis + creative
- `gpt-4o-mini`: สำหรับ simple tasks (ประหยัด)
- `gpt-4-turbo`: สำหรับ long context

```json
{
  "parameters": {
    "modelId": {
      "__rl": true,
      "value": "gpt-4o",
      "mode": "list"
    },
    "messages": {
      "values": [
        {
          "role": "system",
          "content": "You are a Facebook ads analyst..."
        },
        {
          "role": "user",
          "content": "=Analyze this data:\n{{ JSON.stringify($json, null, 2) }}"
        }
      ]
    },
    "jsonOutput": true,
    "options": {
      "temperature": 0.7,
      "maxTokens": 2000
    }
  },
  "name": "AI Analysis",
  "type": "@n8n/n8n-nodes-langchain.openAi"
}
```

**Best Practices:**
- ใช้ `jsonOutput: true` ถ้าต้องการ structured output
- ตั้ง `temperature: 0.3-0.5` สำหรับ analytical tasks
- ตั้ง `temperature: 0.7-0.9` สำหรับ creative tasks
- ใช้ `maxTokens` เพื่อควบคุม costs

---

### 4. External API Nodes

#### APIFY
ใช้สำหรับ: scrape Facebook data

```json
{
  "parameters": {
    "actorSource": "store",
    "actorId": {
      "__rl": true,
      "value": "JJghSZmShuco4j9gJ",
      "mode": "list",
      "cachedResultName": "Facebook Ads Scraper"
    },
    "customBody": "={\n  \"startUrls\": [{\n    \"url\": \"{{ $json.page_url }}\"\n  }],\n  \"resultsLimit\": 50\n}",
    "timeout": 300
  },
  "name": "APIFY Scraper",
  "type": "@apify/n8n-nodes-apify.apify"
}
```

**APIFY Actors ที่ใช้:**
- `facebook-pages-scraper` (4Hv5RhChiaDk6iwad)
- `facebook-posts-scraper` (KoJrdxJCTtpon81KY)
- `facebook-ads-scraper` (JJghSZmShuco4j9gJ)

**Tips:**
- ตั้ง `timeout` ที่เหมาะสม (300-600 seconds)
- ใช้ `resultsLimit` เพื่อประหยัด credits
- เช็ค `pricingInfo` ใน output

---

## 🔗 MCP (Model Context Protocol)

### MCP คืออะไร?

MCP เป็น protocol สำหรับให้ AI models เข้าถึง external tools และ data sources

### MCP in n8n Context

ในระบบของเรา MCP ใช้สำหรับ:

1. **Context Sharing**: แชร์ context ระหว่าง workflows
2. **Tool Calling**: ให้ AI เรียกใช้ n8n workflows เป็น tools
3. **State Management**: เก็บ state ของ conversations

### MCP Configuration

```json
{
  "mcp_config": {
    "tools": [
      {
        "name": "scrape_facebook_page",
        "description": "Scrape Facebook page data",
        "workflow_id": "EGoXsM5lI8hhGNz3",
        "parameters": {
          "page_url": "string"
        }
      },
      {
        "name": "analyze_competitor",
        "description": "Analyze competitor performance",
        "workflow_id": "9AxbvFjt6D5PTQMn",
        "parameters": {
          "competitor_data": "object"
        }
      }
    ]
  }
}
```

### Using MCP Tools in AI Prompts

```javascript
// In OpenAI node
const systemPrompt = `
You have access to the following tools:

1. scrape_facebook_page(page_url: string)
   - Scrapes Facebook page data including posts and ads

2. analyze_competitor(competitor_data: object)
   - Analyzes competitor performance metrics

When the user asks about competitor analysis:
1. Use scrape_facebook_page to get data
2. Use analyze_competitor to generate insights
3. Return structured recommendations
`;
```

---

## 🔄 Workflow Patterns

### Pattern 1: Scrape → Store → Analyze

```
Schedule Trigger
    ↓
APIFY Scraper (get data)
    ↓
Code Node (validate & transform)
    ↓
Google Sheets (store raw data)
    ↓
OpenAI (analyze)
    ↓
Google Sheets (store insights)
    ↓
Telegram (notify team)
```

### Pattern 2: Human Input → Generate → Review

```
Webhook/Chat Trigger (human input)
    ↓
Code Node (parse input)
    ↓
Google Sheets (read templates)
    ↓
OpenAI (generate variations)
    ↓
Google Sheets (save results)
    ↓
HTTP Response (show to user)
```

### Pattern 3: Monitor → Alert → Action

```
Schedule Trigger (every hour)
    ↓
Google Sheets (read metrics)
    ↓
Code Node (check thresholds)
    ↓
IF Node (budget exceeded?)
    ├─ Yes → Telegram Alert
    └─ No → Log to sheet
```

---

## 💾 Data Table vs Google Sheets

### Data Table (n8n built-in)
**Pros:**
- ติดตั้งง่าย (no external service)
- เร็วกว่า
- ไม่มี API rate limits

**Cons:**
- จำกัด features (ไม่มี formulas, charts)
- ยากในการ share กับทีม
- ไม่มี version history

### Google Sheets
**Pros:**
- Full spreadsheet features
- Share ได้ง่าย
- Integrate กับ Looker Studio
- Version history

**Cons:**
- API rate limits (300 requests/min)
- ต้อง setup credentials
- ช้ากว่า Data Table

**Recommendation:**
- ใช้ **Data Table** สำหรับ temporary/intermediate data
- ใช้ **Google Sheets** สำหรับ final outputs และ reporting

---

## ⚡ Performance Optimization

### 1. Batch Processing

```javascript
// แทนที่จะเขียนทีละแถว
for (const item of items) {
  await googleSheets.append(item);  // ❌ ช้า
}

// ใช้ batch write
await googleSheets.batchWrite(items);  // ✅ เร็ว
```

### 2. Rate Limiting

```json
{
  "parameters": {
    "options": {
      "batchSize": 100,
      "delayBetweenBatches": 1200  // 1.2 seconds
    }
  }
}
```

### 3. Parallel Execution

```
Trigger
    ↓
Split In Batches
    ├─→ Process Batch 1
    ├─→ Process Batch 2
    └─→ Process Batch 3
         ↓
    Merge Results
```

---

## 🔒 Security Best Practices

### 1. Credentials Management
- ใช้ n8n credentials system (ไม่ hard-code API keys)
- Rotate keys ทุก 3-6 เดือน
- ใช้ different keys สำหรับ dev/prod

### 2. Data Privacy
- ไม่เก็บ personal data ที่ไม่จำเป็น
- Anonymize data ก่อนส่งไปยัง AI
- ตั้ง data retention policy

### 3. Access Control
- Share workflows เฉพาะทีม
- ใช้ webhook authentication
- Log ทุก executions

---

## 📊 Monitoring & Debugging

### Execution Logs
```
n8n UI → Executions → เลือก execution → ดู details
```

**ข้อมูลที่ได้:**
- Input/Output ของแต่ละ node
- Execution time
- Error messages
- Data transformations

### Error Handling

```json
{
  "parameters": {
    "rules": {
      "values": [
        {
          "conditions": {
            "boolean": [
              {
                "value1": "={{ $json.error }}",
                "operation": "exists"
              }
            ]
          },
          "renameOutput": true,
          "outputKey": "hasError"
        }
      ]
    },
    "options": {}
  },
  "name": "Check for Errors",
  "type": "n8n-nodes-base.switch"
}
```

---

## 🧪 Testing Workflows

### Manual Testing
1. Disable schedule trigger
2. ใช้ "Execute Node" เพื่อทดสอบทีละ node
3. ตรวจสอบ output ของแต่ละ node
4. เมื่อถูกต้องแล้ว "Execute Workflow"

### Test Data
สร้าง test data node:

```json
{
  "parameters": {
    "values": {
      "string": [
        {
          "name": "page_url",
          "value": "https://facebook.com/test-page"
        }
      ]
    },
    "options": {}
  },
  "name": "Test Data",
  "type": "n8n-nodes-base.set"
}
```

---

## 📚 Resources

### Official Documentation
- [n8n Docs](https://docs.n8n.io)
- [n8n Community](https://community.n8n.io)
- [n8n YouTube](https://youtube.com/@n8n-io)

### APIFY Documentation
- [APIFY Docs](https://docs.apify.com)
- [Facebook Scrapers](https://apify.com/store?search=facebook)

### AI Documentation
- [OpenAI API](https://platform.openai.com/docs)
- [LangChain](https://js.langchain.com)

---

## 🎓 Next Steps

1. **Practice**: ลองสร้าง simple workflow
2. **Experiment**: ทดลอง nodes ต่างๆ
3. **Optimize**: ปรับ workflows ให้เร็วขึ้น
4. **Scale**: เพิ่ม complexity ทีละน้อย

---

**Happy Automating!** 🚀
