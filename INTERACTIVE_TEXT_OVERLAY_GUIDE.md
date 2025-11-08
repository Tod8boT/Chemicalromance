# 🎨 Interactive Text Overlay System - คู่มือการใช้งาน

## 📋 สารบัญ
1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [การติดตั้ง](#การติดตั้ง)
3. [การใช้งาน](#การใช้งาน)
4. [Integration กับ Workflow เดิม](#integration-กับ-workflow-เดิม)
5. [Cloudinary Parameters](#cloudinary-parameters)
6. [Troubleshooting](#troubleshooting)

---

## ภาพรวมระบบ

ระบบนี้แก้ปัญหา **"template-based approach ที่จำกัดเกินไป"** โดยให้ผู้ใช้ปรับแต่งข้อความบนรูปภาพ/วิดีโอได้อย่างละเอียดผ่าน **HTML Form แบบ Interactive**

### ✨ Features

**1. Dynamic Parameter Control**
- ✅ Slider + Number Input (ปรับละเอียดได้ ไม่ติด S/M/L)
- ✅ Arc Curve Slider (-180° ถึง 180°) - **สำคัญสำหรับแบรนด์**
- ✅ Color Picker พร้อม Hex Input
- ✅ Position Grid + Fine-tune X/Y Offsets

**2. รองรับทั้งรูปภาพและวิดีโอ**
- ✅ Image: ใส่ข้อความ Static
- ✅ Video: ใส่ข้อความพร้อม Timestamp (start/end)
- ✅ Fade In/Out Effect (1 วินาที)

**3. Preview ก่อนสร้างจริง**
- ✅ ปุ่ม "ดูตัวอย่าง" เปิดรูป preview ใน tab ใหม่
- ✅ Real-time Cloudinary URL generation

**4. ส่งกลับ Telegram อัตโนมัติ**
- ✅ หลังกด "สร้างเลย" จะส่งรูปกลับไปที่ chat ทันที
- ✅ พร้อม caption แสดงข้อความและ URL

---

## การติดตั้ง

### 1. Import Workflow

1. เปิด n8n
2. ไปที่ **Workflows** → **Import from File**
3. เลือกไฟล์ `text_overlay_interactive.json`
4. Activate workflow

### 2. ตั้งค่า Environment Variables

ใน n8n settings, เพิ่ม environment variable:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### 3. ทดสอบ Webhook URLs

หลัง activate workflow จะได้ URL 2 อัน:

**Form Display URL:**
```
https://your-n8n-domain.com/webhook/text-overlay-form?image_url=IMAGE_URL&chat_id=CHAT_ID
```

**Form Submit URL:** (ใช้ภายใน form)
```
https://your-n8n-domain.com/webhook/text-overlay-submit
```

---

## การใช้งาน

### วิธีที่ 1: ทดสอบตรงๆ

เปิด browser แล้วเข้า:
```
https://your-n8n-domain.com/webhook/text-overlay-form?image_url=https://fal.ai/files/your-image.jpg&chat_id=123456789
```

**Parameters:**
- `image_url` - URL รูปภาพที่ต้องการใส่ข้อความ
- `chat_id` - Telegram Chat ID ที่จะส่งรูปกลับไป

### วิธีที่ 2: Integration กับ Workflow เดิม

ดู section ถัดไป

---

## Integration กับ Workflow เดิม

### เพิ่ม Inline Keyboard หลัง Fal.AI Generate รูป

ในไฟล์ `create_image_no_templete.json` หรือ `create_image_with_templete.json`:

#### Step 1: เพิ่ม HTTP Request Node หลัง Fal.AI

```json
{
  "parameters": {
    "method": "POST",
    "url": "=https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/sendPhoto",
    "sendBody": true,
    "contentType": "json",
    "bodyParameters": {
      "parameters": [
        {
          "name": "chat_id",
          "value": "={{ $json.chat_id }}"
        },
        {
          "name": "photo",
          "value": "={{ $json.fal_image_url }}"
        },
        {
          "name": "caption",
          "value": "✅ สร้างรูปภาพเสร็จแล้ว! คุณต้องการทำอะไรต่อ?"
        },
        {
          "name": "reply_markup",
          "value": "={{ JSON.stringify({\n  \"inline_keyboard\": [\n    [\n      {\n        \"text\": \"📝 ใส่ตัวอักษร\",\n        \"url\": \"https://your-n8n-domain.com/webhook/text-overlay-form?image_url=\" + encodeURIComponent($json.fal_image_url) + \"&chat_id=\" + $json.chat_id\n      }\n    ],\n    [\n      {\n        \"text\": \"🎬 สร้างวิดีโอ\",\n        \"callback_data\": \"create_video\"\n      },\n      {\n        \"text\": \"📤 โพสเลย\",\n        \"callback_data\": \"post_now\"\n      }\n    ]\n  ]\n}) }}"
        }
      ]
    }
  },
  "name": "Send with Inline Keyboard",
  "type": "n8n-nodes-base.httpRequest"
}
```

#### Step 2: ตัวอย่าง Flow แบบเต็ม

```
Fal.AI Generate Image
  ↓
Store Image URL
  ↓
HTTP Request: Send Photo with Inline Keyboard
  [ใส่ตัวอักษร] [สร้างวิดีโอ] [โพสเลย]
  ↓
(User คลิก "ใส่ตัวอักษร")
  ↓
เปิด HTML Form → ปรับแต่ง → สร้างเลย
  ↓
Cloudinary Process
  ↓
Send back to Telegram ✅
```

---

## Cloudinary Parameters

### Text Layer Parameters

| Parameter | Type | Range | Description |
|-----------|------|-------|-------------|
| `text_content` | string | - | ข้อความที่ต้องการใส่ |
| `font_size` | number | 10-200 | ขนาดตัวอักษร |
| `arc_curve` | number | -180 to 180 | โค้งตัวอักษร (degrees) |
| `text_color` | hex | - | สีตัวอักษร (เช่น "ffffff") |
| `font_weight` | string | normal/bold | น้ำหนักตัวอักษร |
| `text_align` | string | left/center/right | การจัดตำแหน่ง |
| `position` | string | north/south/center/etc. | ตำแหน่งบนรูป |
| `x_offset` | number | -500 to 500 | ปรับตำแหน่งแนวนอน |
| `y_offset` | number | -500 to 500 | ปรับตำแหน่งแนวตั้ง |

### Stroke/Border

| Parameter | Type | Description |
|-----------|------|-------------|
| `stroke_enabled` | boolean | เปิด/ปิดขอบตัวอักษร |
| `stroke_color` | hex | สีขอบ |
| `stroke_width` | number | ความหนาขอบ (1-20) |

### Shadow

| Parameter | Type | Description |
|-----------|------|-------------|
| `shadow_enabled` | boolean | เปิด/ปิดเงา |
| `shadow_strength` | number | ความเข้มเงา (0-100) |

### Background Box

| Parameter | Type | Description |
|-----------|------|-------------|
| `background_enabled` | boolean | เปิด/ปิดพื้นหลังข้อความ |
| `background_color` | hex | สีพื้นหลัง |
| `background_opacity` | number | ความโปร่งใส (0-100) |

### Video Timing

| Parameter | Type | Description |
|-----------|------|-------------|
| `media_type` | string | "image" หรือ "video" |
| `start_time` | number | เริ่มแสดงข้อความ (วินาที) |
| `end_time` | number | หยุดแสดงข้อความ (วินาที) |
| `fade_effect` | boolean | Fade In/Out (1 วินาที) |

---

## Cloudinary URL Syntax Examples

### ตัวอย่างที่ 1: Basic Text

```
https://res.cloudinary.com/dz3cmaxnc/image/upload/
l_text:Arial_60_center:Hello,w_800,c_fit,co_rgb:ffffff/
fl_layer_apply,g_center/
sample.jpg
```

### ตัวอย่างที่ 2: Text with Stroke + Shadow

```
https://res.cloudinary.com/dz3cmaxnc/image/upload/
l_text:Arial_80_bold_center:SALE,w_800,c_fit,co_rgb:ff0000/
co_rgb:000000,e_outline:5/
e_shadow:60/
fl_layer_apply,g_north,y_50/
sample.jpg
```

### ตัวอย่างที่ 3: Arc Curve (สำคัญสำหรับแบรนด์!)

```
https://res.cloudinary.com/dz3cmaxnc/image/upload/
l_text:Arial_70_bold_center:CREMO,w_800,c_fit,co_rgb:ffffff/
co_rgb:FFD700,e_outline:8/
e_distort:arc:45/
fl_layer_apply,g_north,y_100/
sample.jpg
```

### ตัวอย่างที่ 4: Video with Timestamp

```
https://res.cloudinary.com/dz3cmaxnc/video/upload/
l_text:Arial_60_center:Limited%20Time,w_800,c_fit,co_rgb:ffffff/
e_shadow:50/
fl_layer_apply,g_center/
so_2/eo_8/e_fade:1000/e_fade:-1000/
sample.mp4
```

**อธิบาย:**
- `so_2` = เริ่มแสดงที่วินาทีที่ 2
- `eo_8` = หยุดแสดงที่วินาทีที่ 8
- `e_fade:1000` = Fade in 1 วินาที
- `e_fade:-1000` = Fade out 1 วินาที

---

## Troubleshooting

### ปัญหา 1: Form ไม่แสดงรูป Preview

**สาเหตุ:** `image_url` parameter ไม่ถูกส่งมา

**แก้ไข:**
```
ตรวจสอบ URL:
https://your-n8n-domain.com/webhook/text-overlay-form?image_url=FULL_URL&chat_id=123456789

ต้องมี image_url และ chat_id
```

### ปัญหา 2: กด "สร้างเลย" แล้วไม่ส่งกลับ Telegram

**สาเหตุ:** `TELEGRAM_BOT_TOKEN` ไม่ได้ตั้งค่า

**แก้ไข:**
1. ตรวจสอบ n8n → Settings → Environment Variables
2. เพิ่ม `TELEGRAM_BOT_TOKEN=your_token`
3. Restart n8n workflow

### ปัญหา 3: Cloudinary URL ใช้งานไม่ได้

**สาเหตุ:** External image URL ไม่สามารถ fetch ได้

**แก้ไข:**
```javascript
// ใน Build Cloudinary URL node
// เปลี่ยนจาก fetch:base64 เป็น upload image ไปที่ Cloudinary ก่อน

// Option 1: Upload to Cloudinary first
// Option 2: ใช้ public URL ที่ Cloudinary เข้าถึงได้
```

### ปัญหา 4: Thai Text ไม่แสดง

**สาเหตุ:** Font ไม่รองรับภาษาไทย

**แก้ไข:**
- Cloudinary default fonts (Arial, Helvetica) รองรับภาษาไทยบางส่วน
- แนะนำใช้ custom fonts หรือ upload font ไปที่ Cloudinary
- ดูเพิ่มเติม: https://cloudinary.com/documentation/layers#custom_fonts

### ปัญหา 5: Arc Curve ไม่ทำงาน

**ตรวจสอบ:**
```javascript
// ต้องมี e_distort:arc:VALUE
url += `e_distort:arc:${arc}/`;

// VALUE = -180 ถึง 180
// ค่าบวก = โค้งขึ้น
// ค่าลบ = โค้งลง
```

---

## 🎯 Best Practices

### 1. ขนาดตัวอักษรที่แนะนำ

| ขนาดรูป | ขนาดตัวอักษร |
|---------|--------------|
| 1080x1080 | 60-80 |
| 1920x1080 | 80-120 |
| 3840x2160 (4K) | 150-200 |

### 2. Arc Curve สำหรับแบรนด์

```
Logo ด้านบน: arc = 30 ถึง 60
Logo ด้านล่าง: arc = -30 ถึง -60
Text โค้งรอบวงกลม: arc = 90 ถึง 180
```

### 3. Stroke + Shadow Combination

```javascript
// สำหรับข้อความที่อ่านง่าย บนพื้นหลังวุ่นวาย
stroke_color: "000000" (ดำ)
stroke_width: 5-8
shadow_enabled: true
shadow_strength: 40-60
```

### 4. Video Timing

```javascript
// Intro text
start_time: 0
end_time: 3
fade_effect: true

// Mid text
start_time: 5
end_time: 10

// Outro text
start_time: 12
end_time: 15
fade_effect: true
```

---

## 📚 เอกสารเพิ่มเติม

- [Cloudinary Text Overlay Documentation](https://cloudinary.com/documentation/layers#text_layer_options)
- [Cloudinary Video Transformation](https://cloudinary.com/documentation/video_transformation_reference)
- [n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Telegram Bot API - Inline Keyboard](https://core.telegram.org/bots/api#inlinekeyboardmarkup)

---

## 🤝 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. ตรวจสอบ [Troubleshooting](#troubleshooting) ก่อน
2. ดู n8n execution logs
3. ทดสอบ Cloudinary URL ใน browser ก่อน

---

**Version:** 1.0
**Last Updated:** 2025-01-08
**Created by:** Claude Code
