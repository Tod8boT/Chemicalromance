# Chemicalromance

> n8n Workflow Automation Repository

โปรเจคนี้เก็บ n8n workflows สำหรับระบบ automation ต่างๆ พร้อม documentation และ best practices

---

## 📚 สารบัญ

- [เกี่ยวกับโปรเจค](#เกี่ยวกับโปรเจค)
- [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
- [Workflows ที่มีให้ใช้](#workflows-ที่มีให้ใช้)
- [เริ่มต้นใช้งาน](#เริ่มต้นใช้งาน)
- [การพัฒนา](#การพัฒนา)
- [Resources](#resources)

---

## เกี่ยวกับโปรเจค

โปรเจคนี้ถูกสร้างขึ้นเพื่อ:

- 📦 เก็บรวม n8n workflows แบบ version control
- 🔄 แชร์ workflows ระหว่างทีม
- 📖 สร้าง documentation และ best practices
- 🧪 ทดสอบและ validate workflows ก่อน deploy
- 🤖 Automate ด้วย Facebook, Instagram, และ services อื่นๆ

---

## โครงสร้างโปรเจค

```
Chemicalromance/
├── workflows/              # n8n workflows
│   ├── README.md          # คำอธิบาย workflows
│   ├── examples/          # ตัวอย่าง workflows
│   │   ├── facebook-trigger-webhook.json
│   │   ├── webhook-to-facebook.json
│   │   └── README.md
│   └── templates/         # Workflow templates
├── docs/                  # Documentation
│   └── n8n-setup-guide.md # คู่มือการตั้งค่า
├── .github/
│   └── workflows/         # GitHub Actions (CI/CD)
└── README.md             # ไฟล์นี้
```

---

## Workflows ที่มีให้ใช้

### 1. 📱 Facebook Trigger - Instagram Comments Webhook

รับ webhook จาก Instagram และตอบกลับ comments อัตโนมัติ

**ไฟล์:** [`workflows/examples/facebook-trigger-webhook.json`](workflows/examples/facebook-trigger-webhook.json)

**Features:**
- ✅ รับ Instagram comments และ mentions
- ✅ ตรวจจับ event type อัตโนมัติ
- ✅ ตอบกลับ comments ด้วย Facebook Graph API
- ✅ รองรับ custom responses

**Use cases:**
- Customer service automation
- Social media engagement
- Auto-reply bot

---

### 2. 🌐 Webhook to Facebook Post

รับ HTTP request แล้วสร้างโพสต์บน Facebook Page

**ไฟล์:** [`workflows/examples/webhook-to-facebook.json`](workflows/examples/webhook-to-facebook.json)

**Features:**
- ✅ รับ POST request
- ✅ สร้างโพสต์บน Facebook Page
- ✅ รองรับ images
- ✅ Validation และ error handling

**Use cases:**
- Scheduled posting
- Content distribution
- Integration กับระบบอื่น

---

## เริ่มต้นใช้งาน

### Prerequisites

- ✅ n8n instance (self-hosted หรือ cloud)
- ✅ Facebook Developer Account
- ✅ Facebook Page
- ✅ Git

### ขั้นตอน

#### 1. Clone Repository

```bash
git clone https://github.com/Tod8boT/Chemicalromance.git
cd Chemicalromance
```

#### 2. ตั้งค่า Facebook App

ดูคู่มือละเอียดที่: [n8n Setup Guide](docs/n8n-setup-guide.md)

สรุป:
1. สร้าง Facebook App ที่ [Meta for Developers](https://developers.facebook.com)
2. เปิดใช้งาน Webhooks และ Instagram API
3. Get App ID และ App Secret
4. สร้าง Page Access Token

#### 3. Import Workflows ใน n8n

**Via n8n UI:**
1. เปิด n8n
2. Workflows → Import from File
3. เลือก workflow จาก `workflows/examples/`
4. ตั้งค่า credentials
5. Activate workflow

**Via CLI:**
```bash
n8n import:workflow --input=workflows/examples/facebook-trigger-webhook.json
```

#### 4. ทดสอบ

```bash
# ทดสอบ webhook to Facebook
curl -X POST https://your-n8n.com/webhook/facebook-post \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello from n8n! 👋",
    "page_id": "your-page-id"
  }'
```

---

## การพัฒนา

### สร้าง Workflow ใหม่

1. **สร้างใน n8n UI**
   - ออกแบบและทดสอบ workflow
   - ตั้งค่า credentials

2. **Export workflow**
   ```
   n8n UI → ... → Export → Save as JSON
   ```

3. **เพิ่มเข้า repo**
   ```bash
   # ย้ายไฟล์เข้า workflows/
   mv my-workflow.json workflows/my-workflow.json

   # ลบข้อมูล sensitive
   # แก้ไข JSON ลบ credentials, tokens

   # Commit
   git add workflows/my-workflow.json
   git commit -m "Add: my-workflow"
   git push
   ```

### Best Practices

#### 1. **Security**
- ❌ ห้าม commit credentials, API keys, tokens
- ✅ ใช้ environment variables
- ✅ ใช้ n8n credential system
- ✅ ใช้ `.gitignore` สำหรับไฟล์ sensitive

#### 2. **Naming**
```
✅ Good: facebook-auto-reply.json
✅ Good: instagram-comment-webhook.json
❌ Bad: workflow1.json
❌ Bad: test.json
```

#### 3. **Documentation**
- เพิ่ม description ใน workflow
- เขียน README สำหรับ workflows ซับซ้อน
- Comment ใน nodes เมื่อจำเป็น

#### 4. **Testing**
- ทดสอบบน test environment ก่อน
- ใช้ test data
- ตรวจสอบ error handling

### Workflow Template

ดูตัวอย่าง template ได้ที่:
- [`workflows/examples/`](workflows/examples/)
- [n8n Workflow Templates](https://n8n.io/workflows)

---

## Resources

### Documentation
- [n8n Setup Guide](docs/n8n-setup-guide.md) - คู่มือการตั้งค่าละเอียด
- [Workflow Examples](workflows/examples/README.md) - คำอธิบาย workflows
- [n8n Official Docs](https://docs.n8n.io)

### APIs
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Instagram API](https://developers.facebook.com/docs/instagram-api)
- [n8n API Reference](https://docs.n8n.io/api/)

### Tools
- [Graph API Explorer](https://developers.facebook.com/tools/explorer)
- [Webhook Tester](https://webhook.site)
- [n8n MCP Server](https://github.com/czlonkowski/n8n-mcp)

### Community
- [n8n Community Forum](https://community.n8n.io)
- [n8n Discord](https://discord.gg/n8n)
- [n8n GitHub](https://github.com/n8n-io/n8n)

---

## Contributing

หากต้องการ contribute:

1. Fork repository
2. สร้าง branch ใหม่
   ```bash
   git checkout -b feature/my-workflow
   ```
3. เพิ่ม workflows หรือ documentation
4. Commit และ push
   ```bash
   git add .
   git commit -m "Add: my awesome workflow"
   git push origin feature/my-workflow
   ```
5. สร้าง Pull Request

---

## License

MIT License - ใช้งานได้อย่างอิสระ

---

## Support

หากมีปัญหาหรือคำถาม:

1. ดู [Documentation](docs/)
2. ตรวจสอบ [Troubleshooting](docs/n8n-setup-guide.md#troubleshooting)
3. เปิด [Issue](https://github.com/Tod8boT/Chemicalromance/issues)
4. ถาม[n8n Community](https://community.n8n.io)

---

## 🎨 Facebook Intelligence System - Phase 1

**NEW!** Text Overlay & Logo Placement System

### Overview

ระบบควบคุม text overlay และ logo placement สำหรับรูปและวิดีโอ โดยใช้:
- **Telegram Bot** - Interface สำหรับผู้ใช้
- **n8n Workflows** - Automation
- **Google Sheets** - เก็บ settings
- **Cloudinary** - Transform รูป/วิดีโอ

### Workflows (Phase 1)

#### WF1: Telegram Text Control ✅
**ตำแหน่ง:** `CC_ID1_TELEGRAM_INTERFACE/workflows/`

**Features:**
- 3 text sets พร้อม overlay แบบซ้อนทับได้
- 8 fonts (Mitr, Kanit, Prompt, Sarabun, etc.)
- Shadow effects (0-100 strength)
- Background color + opacity
- Max width control (600-2000px)
- Position (9-point grid)
- Stroke/outline
- Arc curve (-180° to +180°)
- Video timing support

**Nodes:** 11 nodes

#### WF3: Logo Placement Control ✅
**ตำแหน่ง:** `WF3_LOGO_PLACEMENT/workflows/`

**Features:**
- 3 logo sets (แยกจาก text)
- 6 preset logos + custom upload
- ควบคุม size, position, opacity
- Effects (shadow, border, glow)
- Blend modes
- Video timing

**Nodes:** 10 nodes

#### WF5: Video Text Overlay Integration ✅
**ตำแหน่ง:** `WF3_INTEGRATION/workflows/`

**Features:**
- Auto-detect media type (image/video)
- Apply text settings จาก Google Sheets
- Video timing validation
- ส่งผลลัพธ์ไป Telegram
- รองรับ shadow, background, font_family, max_width

**Nodes:** 11 nodes

### Quick Start (Facebook Intelligence System)

```bash
# 1. Import workflows
Import WF1: CC_ID1_TELEGRAM_INTERFACE/workflows/WF1_Telegram_Text_Control_Complete.json
Import WF3: WF3_LOGO_PLACEMENT/workflows/Logo_Placement_Control.json
Import WF5: WF3_INTEGRATION/workflows/Text_Overlay_Integration_Complete.json

# 2. ตั้งค่า environment variables
TELEGRAM_BOT_TOKEN=your_bot_token
GOOGLE_SHEETS_TEXT_SETTINGS_ID=your_sheet_id
CLOUDINARY_CLOUD_NAME=your_cloud_name

# 3. Create Google Sheets
ใช้ template จาก CC_ID1_TELEGRAM_INTERFACE/templates/

# 4. Test
ส่ง /start ไป Telegram bot
```

### Documentation

- **Logo Guide:** `WF3_LOGO_PLACEMENT/docs/LOGO_PLACEMENT_GUIDE.md`
- **Video Timing:** `WF3_INTEGRATION/docs/VIDEO_TIMING_GUIDE.md`
- **WF5 Enhancement:** `WF3_INTEGRATION/docs/WF5_ENHANCEMENT_GUIDE.md`
- **Collaboration Log:** `ID_Talk.md`

### Stats

- **Total Code:** 2000+ lines
- **Total Workflows:** 3 complete
- **Total Nodes:** 32 nodes
- **Features:** 18 text settings + 10 logo settings
- **Documentation:** 1500+ lines

**Built by:** CC_ID1 & CC_ID2
**Last Updated:** November 10, 2025
**Version:** 1.1.0

---

## Changelog

### v1.1.0 (2025-11-10)
- 🎨 เพิ่ม Facebook Intelligence System Phase 1
- ✅ WF1: Telegram Text Control (11 nodes)
- ✅ WF3: Logo Placement System (10 nodes)
- ✅ WF5: Video Text Overlay Integration (11 nodes)
- ✨ 4 new features: Font family, Shadow, Background, Max width
- 📚 Documentation 1500+ lines

### v1.0.0 (2024-11-08)
- 🎉 Initial release
- ✅ Facebook Trigger workflow
- ✅ Webhook to Facebook workflow
- ✅ Setup documentation

---

**Made with ❤️ and n8n**
