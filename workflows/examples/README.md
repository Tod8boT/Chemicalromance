# n8n Workflow Examples

ตัวอย่าง workflows ที่พร้อมใช้งาน

---

## 📱 1. Facebook Trigger - Instagram Comments Webhook

**ไฟล์:** `facebook-trigger-webhook.json`

### คำอธิบาย
Workflow นี้ใช้ Facebook Trigger เพื่อตรวจจับ comments และ mentions บน Instagram แล้วตอบกลับอัตโนมัติ

### Flow
```
Facebook Trigger (Instagram)
    ↓
Extract Data (ดึงข้อมูล event)
    ↓
Is Comment? (ตรวจสอบว่าเป็น comment ไหม)
    ├─ Yes → Auto Reply Comment (ตอบกลับ)
    └─ No → Send Response
```

### Nodes ที่ใช้
1. **Facebook Trigger** - รับ webhook จาก Facebook/Instagram
2. **Set (Extract Data)** - แปลงข้อมูล event
3. **If (Is Comment?)** - ตรวจสอบประเภท event
4. **Facebook Graph API** - ตอบกลับ comment
5. **Respond to Webhook** - ส่ง response กลับ

### การตั้งค่า

#### ก่อน Import:
1. **สร้าง Facebook App**
   - ไปที่ [Meta for Developers](https://developers.facebook.com)
   - สร้าง app ใหม่
   - เปิดใช้งาน Instagram API
   - คัดลอก **App ID** และ **App Secret**

2. **ตั้งค่า Webhook**
   - ใน Facebook App Settings
   - เพิ่ม Callback URL จาก n8n
   - Subscribe to: `comments`, `mentions`

3. **สร้าง Credentials ใน n8n**
   - Facebook App credentials
   - Facebook Graph API credentials (Page Access Token)

#### หลัง Import:
1. เปิดไฟล์ใน n8n
2. เชื่อม credentials กับ nodes
3. Execute workflow เพื่อดู webhook URL
4. คัดลอก URL ไปใส่ใน Facebook App
5. Activate workflow

### ทดสอบ
```bash
# ส่ง webhook ตัวอย่าง
curl -X POST https://your-n8n.com/webhook/... \
  -H "Content-Type: application/json" \
  -d '{
    "field": "comments",
    "time": 1234567890,
    "value": {
      "from": {"id": "user123"},
      "text": "Hello!",
      "post_id": "post123"
    }
  }'
```

### การปรับแต่ง
- แก้ไขข้อความตอบกลับใน node **Auto Reply Comment**
- เพิ่มเงื่อนไขใน node **Is Comment?**
- เพิ่ม AI/ChatGPT เพื่อสร้างคำตอบอัตโนมัติ

---

## 🌐 2. Webhook to Facebook Post

**ไฟล์:** `webhook-to-facebook.json`

### คำอธิบาย
Workflow นี้รับ HTTP POST request แล้วสร้างโพสต์บน Facebook Page อัตโนมัติ

### Flow
```
Webhook (รับ POST request)
    ↓
Parse Webhook Data (แปลงข้อมูล)
    ↓
Has Message? (ตรวจสอบข้อความ)
    ├─ Yes → Create Facebook Post → Success Response
    └─ No → Error Response (400)
```

### Nodes ที่ใช้
1. **Webhook** - รับ HTTP POST
2. **Set (Parse Data)** - แปลงข้อมูล
3. **If (Validation)** - ตรวจสอบข้อมูล
4. **Facebook Graph API** - สร้างโพสต์
5. **Respond to Webhook** - ส่ง response

### การตั้งค่า

#### ก่อน Import:
1. **สร้าง Facebook Page Access Token**
   - ไปที่ [Graph API Explorer](https://developers.facebook.com/tools/explorer)
   - เลือก Page
   - Generate Access Token
   - ขอ permissions: `pages_manage_posts`, `pages_read_engagement`

2. **สร้าง Credentials ใน n8n**
   - Facebook Graph API
   - ใส่ Access Token

3. **(Optional) Set Environment Variable**
   ```bash
   export FACEBOOK_PAGE_ID="your-page-id"
   ```

#### หลัง Import:
1. เปิดไฟล์ใน n8n
2. เชื่อม Facebook Graph API credentials
3. Execute workflow เพื่อดู webhook URL
4. Activate workflow

### ทดสอบ
```bash
# ส่ง POST request เพื่อสร้างโพสต์
curl -X POST https://your-n8n.com/webhook/facebook-post \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello from n8n! 👋",
    "image_url": "https://example.com/image.jpg",
    "page_id": "your-page-id"
  }'

# Response สำเร็จ:
{
  "status": "success",
  "post_id": "123456789_987654321",
  "message": "Post created successfully"
}

# Response ผิดพลาด:
{
  "status": "error",
  "message": "Message is required"
}
```

### Request Body Parameters
```json
{
  "message": "ข้อความที่จะโพสต์ (required)",
  "image_url": "URL รูปภาพ (optional)",
  "page_id": "Facebook Page ID (optional if env var set)"
}
```

### การปรับแต่ง
- เพิ่ม authentication (API key validation)
- เพิ่มการ schedule posts
- รองรับ multiple images
- เพิ่ม video upload
- เชื่อมกับ Google Sheets/Airtable

---

## 🔧 การใช้งานทั่วไป

### Import Workflow
1. เปิด n8n
2. Workflows → Import from File
3. เลือกไฟล์ `.json`
4. ตั้งค่า credentials
5. Activate

### Export Workflow
1. เปิด workflow
2. ... → Export
3. Save ไฟล์

### Credentials ที่ต้องมี
- **Facebook App** (สำหรับ Trigger)
- **Facebook Graph API** (สำหรับ actions)

---

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Instagram API](https://developers.facebook.com/docs/instagram-api)
- [n8n Community](https://community.n8n.io)

---

## ⚠️ หมายเหตุ

1. **API Keys และ Tokens**
   - ไม่ควร commit credentials ลง GitHub
   - ใช้ environment variables
   - ใช้ n8n credential system

2. **Rate Limits**
   - Facebook API มี rate limits
   - ควรเพิ่ม error handling
   - ใช้ retry logic

3. **Webhook Security**
   - ใช้ webhook signature validation
   - ตั้ง IP whitelist
   - ใช้ HTTPS

4. **Testing**
   - ทดสอบบน test mode ก่อน
   - ใช้ test Facebook Page
   - ตรวจสอบ logs

---

## 🆘 การแก้ปัญหา

### Webhook ไม่ทำงาน
- ตรวจสอบว่า workflow activate แล้ว
- ตรวจสอบ webhook URL ถูกต้อง
- ดู execution logs ใน n8n

### Facebook API Error
- ตรวจสอบ Access Token ยังใช้ได้
- ตรวจสอบ permissions
- ดู error message จาก Facebook

### Credentials ไม่ทำงาน
- Re-authenticate
- ตรวจสอบ App ID/Secret
- ตรวจสอบ token expiration
