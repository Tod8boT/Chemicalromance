# n8n Setup Guide

คู่มือการตั้งค่า n8n workflows สำหรับโปรเจคนี้

---

## 📋 สารบัญ

1. [Prerequisites](#prerequisites)
2. [Facebook App Setup](#facebook-app-setup)
3. [n8n Credentials](#n8n-credentials)
4. [Workflow Import](#workflow-import)
5. [Testing](#testing)
6. [Deployment](#deployment)

---

## Prerequisites

### ต้องมี:
- ✅ n8n instance (self-hosted หรือ cloud)
- ✅ Facebook Developer Account
- ✅ Facebook Page (สำหรับโพสต์)
- ✅ Instagram Business Account (ถ้าใช้ Instagram features)

### เครื่องมือ:
- Node.js 18+ (สำหรับ local development)
- Git
- curl หรือ Postman (สำหรับทดสอบ)

---

## Facebook App Setup

### 1. สร้าง Facebook App

1. ไปที่ [Meta for Developers](https://developers.facebook.com)
2. คลิก **My Apps** → **Create App**
3. เลือก **Business** type
4. ใส่ชื่อ app และข้อมูล

### 2. เพิ่ม Products

เพิ่ม products ที่ต้องการ:
- **Webhooks** (สำหรับ trigger)
- **Instagram** (ถ้าใช้ Instagram)
- **Facebook Login** (สำหรับ authentication)

### 3. ตั้งค่า Webhooks

1. ไปที่ **Webhooks** → **Instagram** (หรือ Page)
2. คลิก **Edit Subscription**
3. ใส่ข้อมูล:
   ```
   Callback URL: https://your-n8n.com/webhook/facebook-trigger
   Verify Token: your-secret-token
   ```
4. Subscribe to fields:
   - ✅ comments
   - ✅ mentions
   - ✅ messages (ถ้าต้องการ)

### 4. Get App Credentials

คัดลอกข้อมูลเหล่านี้:
```
App ID: 1234567890
App Secret: abc123def456
```

---

## n8n Credentials

### 1. Facebook App Credentials

ใน n8n:
1. ไปที่ **Credentials** → **New**
2. เลือก **Facebook App**
3. ใส่:
   ```
   App ID: [จาก Facebook App]
   App Secret: [จาก Facebook App]
   ```
4. Save

### 2. Facebook Graph API Credentials

#### วิธีที่ 1: Manual Token

1. ไปที่ [Graph API Explorer](https://developers.facebook.com/tools/explorer)
2. เลือก app และ page
3. Get Token → Get Page Access Token
4. Copy token

ใน n8n:
1. **Credentials** → **New** → **Facebook Graph API**
2. เลือก **Access Token** method
3. Paste token
4. Save

#### วิธีที่ 2: OAuth2

1. ใน n8n: **Credentials** → **New** → **Facebook Graph API**
2. เลือก **OAuth2** method
3. Client ID: [App ID]
4. Client Secret: [App Secret]
5. คลิก **Connect**
6. Authorize app

### 3. Environment Variables (Optional)

สร้างไฟล์ `.env` ใน n8n:
```bash
FACEBOOK_PAGE_ID=your-page-id
N8N_WEBHOOK_URL=https://your-n8n.com
FACEBOOK_VERIFY_TOKEN=your-secret-token
```

---

## Workflow Import

### 1. Clone Repository

```bash
git clone https://github.com/Tod8boT/Chemicalromance.git
cd Chemicalromance
```

### 2. Import ใน n8n

#### Via UI:
1. เปิด n8n
2. **Workflows** → **Import from File**
3. เลือก `workflows/examples/facebook-trigger-webhook.json`
4. คลิก **Import**

#### Via CLI (ถ้าใช้ self-hosted):
```bash
n8n import:workflow --input=workflows/examples/facebook-trigger-webhook.json
```

### 3. Configure Workflow

1. เปิด workflow ที่ import มา
2. คลิกที่แต่ละ node ที่มี credential
3. เลือก credential ที่สร้างไว้:
   - **Facebook Trigger** → Facebook App
   - **Facebook Graph API nodes** → Facebook Graph API
4. Save workflow

### 4. Activate Workflow

1. Toggle **Active** switch ที่มุมขวาบน
2. คลิก **Execute Workflow** เพื่อเริ่ม listening
3. Copy webhook URL ที่แสดง

### 5. Update Facebook Webhook

1. กลับไปที่ Facebook App Settings → Webhooks
2. Update **Callback URL** เป็น URL จาก n8n
3. Verify connection

---

## Testing

### 1. Test Facebook Trigger

#### วิธีที่ 1: Comment จริง
1. ไปที่ Instagram post
2. Comment อะไรก็ได้
3. ดู execution log ใน n8n

#### วิธีที่ 2: Test Webhook
```bash
curl -X POST https://your-n8n.com/webhook/facebook-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "id": "instagram-account-id",
      "time": 1234567890,
      "changes": [{
        "field": "comments",
        "value": {
          "from": {
            "id": "user123",
            "username": "testuser"
          },
          "text": "Test comment",
          "id": "comment123"
        }
      }]
    }]
  }'
```

### 2. Test Webhook to Facebook

```bash
# ทดสอบสร้างโพสต์
curl -X POST https://your-n8n.com/webhook/facebook-post \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test post from n8n! 🚀",
    "page_id": "your-page-id"
  }'
```

### 3. ตรวจสอบ Logs

ใน n8n:
1. **Executions** tab
2. ดู execution logs
3. ตรวจสอบ input/output ของแต่ละ node

---

## Deployment

### Production Checklist

- [ ] ใช้ HTTPS สำหรับ webhook URLs
- [ ] ตั้งค่า webhook signature validation
- [ ] เพิ่ม error handling และ retry logic
- [ ] ตั้งค่า rate limiting
- [ ] ใช้ long-lived access tokens
- [ ] Backup workflows เป็นประจำ
- [ ] Monitor execution logs
- [ ] ตั้งค่า alerts สำหรับ errors

### Security Best Practices

1. **Credentials**
   ```bash
   # ห้าม commit credentials!
   echo "*.credentials" >> .gitignore
   ```

2. **Webhook Validation**
   - ใช้ verify token
   - ตรวจสอบ signature จาก Facebook
   - IP whitelist (ถ้าทำได้)

3. **Access Tokens**
   - ใช้ page access tokens ที่มี scope จำกัด
   - Refresh tokens เป็นระยะ
   - ใช้ environment variables

4. **Error Handling**
   - Catch และ log errors
   - Retry logic สำหรับ API failures
   - Alert notifications

---

## Troubleshooting

### Webhook ไม่รับข้อมูล

**ตรวจสอบ:**
1. Workflow active หรือไม่?
2. URL ใน Facebook App ถูกต้องไหม?
3. HTTPS ใช้งานได้ไหม?
4. Firewall block port ไหม?

**แก้ไข:**
```bash
# ตรวจสอบ webhook accessible
curl https://your-n8n.com/webhook/facebook-trigger

# ควรได้ response (ไม่ใช่ 404)
```

### Facebook API Errors

**Error: "Invalid OAuth access token"**
- Token หมดอายุ → regenerate
- Permissions ไม่พอ → request ใหม่

**Error: "Rate limit exceeded"**
- รอ rate limit reset
- ลด request frequency
- ใช้ exponential backoff

**Error: "Missing permissions"**
- ใน Graph API Explorer: ตรวจสอบ permissions
- Request: `pages_manage_posts`, `instagram_basic`, etc.

### n8n Execution Errors

**ดู execution logs:**
1. n8n → Executions
2. คลิกที่ execution ที่ error
3. ดู error message ในแต่ละ node

**Common fixes:**
- Reconnect credentials
- Update node parameters
- Check data format

---

## Resources

### Documentation
- [n8n Docs](https://docs.n8n.io)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Instagram API](https://developers.facebook.com/docs/instagram-api)
- [Webhooks Guide](https://developers.facebook.com/docs/graph-api/webhooks)

### Tools
- [Graph API Explorer](https://developers.facebook.com/tools/explorer)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken)
- [Webhook Test Tool](https://webhook.site)

### Community
- [n8n Community Forum](https://community.n8n.io)
- [n8n Discord](https://discord.gg/n8n)
- [GitHub Discussions](https://github.com/n8n-io/n8n/discussions)

---

## Support

หากมีปัญหา:
1. ตรวจสอบ [Troubleshooting](#troubleshooting)
2. ดู [n8n Community](https://community.n8n.io)
3. เปิด issue ใน GitHub repo นี้
