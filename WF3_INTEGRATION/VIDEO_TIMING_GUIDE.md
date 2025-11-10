# 🎬 Video Text Overlay - Timing Implementation Guide

> **How to use Telegram to specify timing for video text overlays**

---

## 🎯 Overview

ฟีเจอร์นี้ช่วยให้ user สามารถ:
- ✅ ระบุเวลาที่ข้อความจะแสดงใน video
- ✅ แสดงข้อความหลายชุดในเวลาต่างกัน
- ✅ Preview เวลาก่อนส่ง

---

## 📱 Telegram UI Flow

### Step 1: User เลือก Text Set

```
🎨 Text Overlay Control Panel

[📝 Text Set 1] [📝 Text Set 2] [📝 Text Set 3]
```

### Step 2: กรอกข้อความ + เลือก styling

```
📝 Text Set 1 Settings

[✏️ Enter Text]
[📏 Font Size] [📍 Position]
[🎨 Text Color] [🖍️ Stroke]
[🌀 Arc Curve]

⏱️ NEW: [⏱️ Timing (Video only)]  ← คลิกตรงนี้!

[🔙 Back to Menu]
```

### Step 3: เลือกช่วงเวลา

```
⏱️ Timing (Text Set 1)

เลือกช่วงเวลาที่ข้อความจะแสดง:

[📺 Full Video] ← แสดงตลอด video

--- หรือเลือกช่วงเวลา ---
[0-5s]   [5-10s]  [10-15s]
[15-20s] [20-30s] [30-60s]

[✏️ Custom Time] ← ระบุเอง

[🔙 Back]
```

### Step 4: ถ้าเลือก "Custom Time"

```
✏️ กรุณาพิมพ์ช่วงเวลา (วินาที)

Format: start-end
ตัวอย่าง:
- 5.5-10.2 (วินาทีที่ 5.5 ถึง 10.2)
- 0-15 (วินาทีที่ 0 ถึง 15)
- 8-12.5 (วินาทีที่ 8 ถึง 12.5)

พิมพ์เวลา:
```

User types: `5-10`

Bot responds:
```
✅ บันทึกแล้ว!
Text Set 1: แสดงวินาทีที่ 5.0 - 10.0

[✅ ยืนยัน] [🔄 แก้ไข]
```

---

## 💾 Google Sheets Structure

### New columns added:

```csv
user_id,text_set,setting_type,value,updated_at
123,1,text,FLASH SALE,2025-11-09T12:00:00Z
123,1,fontsize,80,2025-11-09T12:00:00Z
123,1,position,center,2025-11-09T12:00:00Z
123,1,color,FF0000,2025-11-09T12:00:00Z

# NEW: Timing settings
123,1,timing_mode,range,2025-11-09T12:00:00Z
123,1,start_time,5.0,2025-11-09T12:00:00Z
123,1,end_time,10.0,2025-11-09T12:00:00Z
```

### Timing Modes:

| Mode | Description | start_time | end_time |
|------|-------------|------------|----------|
| `full` | แสดงตลอด video | null | null |
| `range` | แสดงช่วงเวลาหนึ่ง | required | required |
| `none` | image (ไม่มี timing) | null | null |

---

## 🎨 Cloudinary Video Transformation

### Syntax:

```
https://res.cloudinary.com/{cloud}/video/upload/
  w_1080,h_1080,c_fill,q_auto:good/

  # Text Layer 1 (5-10 seconds)
  l_text:Mitr_80_bold:FLASH%20SALE,co_rgb:FF0000,w_900,c_fit/
  so_5.0,eo_10.0/                        ← timing!
  fl_layer_apply,g_center/

  # Text Layer 2 (10-15 seconds)
  l_text:Mitr_60_bold:Limited%20Time,co_rgb:FFFFFF,w_800,c_fit/
  so_10.0,eo_15.0/                       ← timing!
  fl_layer_apply,g_south/

  f_auto/
  {video_url}
```

### Parameters:

- `so_{seconds}` - **Start Offset** (เริ่มแสดงวินาทีที่)
- `eo_{seconds}` - **End Offset** (หยุดแสดงวินาทีที่)
- `du_{seconds}` - **Duration** (แสดงนาน X วินาที) - alternative

### Examples:

```javascript
// Text แสดง 5-10 วินาที
so_5.0,eo_10.0

// Text แสดง 0-3 วินาที
so_0.0,eo_3.0

// Text แสดง 10-20 วินาที
so_10.0,eo_20.0

// Text แสดงตลอด video (ไม่มี so/eo)
(no parameters)
```

---

## 🎬 Use Cases

### Use Case 1: Product Demo Video

```
Video: 30 seconds product demo

Text Set 1: "ผลิตภัณฑ์ใหม่" (0-5s)
  - แสดงตอนเริ่มวีดีโอ

Text Set 2: "คุณภาพพรีเมียม" (10-15s)
  - แสดงตอนกลางวีดีโอ

Text Set 3: "สั่งเลย!" (25-30s)
  - แสดงตอนจบวีดีโอ (CTA)
```

### Use Case 2: Promotional Video

```
Video: 15 seconds flash sale

Text Set 1: "ลด 70%" (Full video)
  - แสดงตลอด video

Text Set 2: "วันนี้เท่านั้น!" (Full video)
  - แสดงตลอด video
```

### Use Case 3: Tutorial Video

```
Video: 60 seconds tutorial

Text Set 1: "Step 1: เปิดแอป" (0-10s)
Text Set 2: "Step 2: เลือกเมนู" (10-25s)
Text Set 3: "Step 3: เสร็จสิ้น" (25-40s)
```

---

## 🔧 Technical Implementation

### In CC_ID1 (Telegram Interface):

**New keyboard builder:**

```javascript
function buildTimingKeyboard(textSetNum) {
  return {
    inline_keyboard: [
      [
        { text: '📺 Full Video', callback_data: `set_timing_${textSetNum}_full` }
      ],
      [
        { text: '0-5s', callback_data: `set_timing_${textSetNum}_0-5` },
        { text: '5-10s', callback_data: `set_timing_${textSetNum}_5-10` },
        { text: '10-15s', callback_data: `set_timing_${textSetNum}_10-15` }
      ],
      [
        { text: '15-20s', callback_data: `set_timing_${textSetNum}_15-20` },
        { text: '20-30s', callback_data: `set_timing_${textSetNum}_20-30` },
        { text: '30-60s', callback_data: `set_timing_${textSetNum}_30-60` }
      ],
      [
        { text: '✏️ Custom Time', callback_data: `input_timing_${textSetNum}` }
      ],
      [
        { text: '🔙 Back', callback_data: `edit_text_${textSetNum}` }
      ]
    ]
  };
}
```

**Parse timing callback:**

```javascript
// Handle callback: set_timing_1_5-10
const [action, textSetNum, timing] = callbackData.split('_');

if (action === 'set' && timing) {
  if (timing === 'full') {
    // Save timing_mode = 'full'
    await saveToSheets(userId, textSetNum, 'timing_mode', 'full');
    // No start/end time
  } else {
    // Parse "5-10" → start: 5, end: 10
    const [start, end] = timing.split('-').map(parseFloat);

    await saveToSheets(userId, textSetNum, 'timing_mode', 'range');
    await saveToSheets(userId, textSetNum, 'start_time', start.toString());
    await saveToSheets(userId, textSetNum, 'end_time', end.toString());
  }
}
```

### In WF3 (Integration Workflow):

**Read timing from Google Sheets:**

```javascript
// In "Organize Settings" node
switch(setting) {
  case 'start_time':
    textSets[textSet].start_time = parseFloat(value);
    break;
  case 'end_time':
    textSets[textSet].end_time = parseFloat(value);
    break;
  case 'timing_mode':
    textSets[textSet].timing_mode = value; // 'full', 'range', 'none'
    break;
}
```

**Build Cloudinary URL with timing:**

```javascript
// In buildTextLayer function
if (mediaType === 'video' && timing_mode === 'range') {
  // Add start/end offsets
  layer += `/so_${start_time.toFixed(1)},eo_${end_time.toFixed(1)}`;
}
// If timing_mode === 'full', don't add so/eo (shows entire video)
```

---

## ✅ Validation

### Time Range Validation:

```javascript
// Validate timing ranges
if (mediaType === 'video' && videoDuration) {
  textSetsArray.forEach(ts => {
    if (ts.timing_mode === 'range') {
      // Clamp to video duration
      if (ts.start_time < 0) ts.start_time = 0;
      if (ts.end_time > videoDuration) ts.end_time = videoDuration;

      // Validate start < end
      if (ts.start_time >= ts.end_time) {
        // Invalid - use full video instead
        ts.timing_mode = 'full';
        ts.start_time = null;
        ts.end_time = null;
      }
    }
  });
}
```

### User Input Validation (Custom Time):

```javascript
// Parse user input: "5-10" or "5.5-10.2"
function parseCustomTiming(input) {
  const regex = /^(\d+\.?\d*)-(\d+\.?\d*)$/;
  const match = input.match(regex);

  if (!match) {
    return { error: 'รูปแบบไม่ถูกต้อง กรุณาใช้ start-end (เช่น 5-10)' };
  }

  const start = parseFloat(match[1]);
  const end = parseFloat(match[2]);

  if (start >= end) {
    return { error: 'เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด' };
  }

  if (start < 0 || end < 0) {
    return { error: 'เวลาต้องเป็นค่าบวก' };
  }

  return { start, end };
}
```

---

## 🎯 Example Scenarios

### Scenario 1: CREMO Flash Sale Video (15s)

```
User uploads: 15s video
User configures:

Text Set 1:
  text: "ลด 70%"
  timing: 0-5s
  position: north
  color: red

Text Set 2:
  text: "วันนี้เท่านั้น!"
  timing: 5-10s
  position: center
  color: yellow

Text Set 3:
  text: "สั่งเลย!"
  timing: 10-15s
  position: south
  color: green

Result:
  0-5s:   "ลด 70%" (top, red)
  5-10s:  "วันนี้เท่านั้น!" (center, yellow)
  10-15s: "สั่งเลย!" (bottom, green)
```

### Scenario 2: Product Demo (30s)

```
User uploads: 30s product demo video
User configures:

Text Set 1:
  text: "CREMO ICE CREAM"
  timing: Full Video
  position: north
  color: white

Text Set 2:
  text: "Premium Quality"
  timing: 10-20s
  position: center
  color: gold

Result:
  0-30s:  "CREMO ICE CREAM" (top, white) - ตลอดเวลา
  10-20s: "Premium Quality" (center, gold) - แค่ 10 วิ
```

---

## 📊 Summary

### ✅ Benefits:

- User ควบคุมเวลาที่ข้อความแสดงได้
- รองรับ multiple texts ในเวลาต่างกัน
- Flexible - ใช้ preset หรือ custom time ได้
- Validation ป้องกัน invalid ranges

### ⚠️ Limitations:

- ต้องรู้ video duration (ส่งมาจาก Fal.AI หรือ Telegram)
- Telegram อาจมีข้อจำกัดขนาด video
- Cloudinary มี processing time สำหรับ video

### 🚀 Future Enhancements:

- Auto-detect video duration
- Visual timeline editor
- Fade in/out effects
- Multiple text animations

---

**Created by:** CC_ID1
**Date:** 2025-11-09
**Status:** ✅ Ready for Implementation
