# 📋 Check Post System - คู่มือระบบตรวจงาน

**Version:** 2.0
**สร้างเมื่อ:** 2025-11-09
**Loop Protection:** ✅ เปิดใช้งาน

---

## 🎯 ภาพรวมระบบ

ระบบ Check Post คือระบบตรวจงานโพสต์ที่มี **Loop Protection** ป้องกันไม่ให้เกิด infinite loop เมื่อผู้ใช้แก้ไขซ้ำหลายครั้ง

### 🔄 Workflow หลัก

```
Main Router → Check Post Request
    ↓
Process & Validate (with iteration check)
    ↓
Update State Tracking (Google Sheets)
    ↓
Send Inspection UI (Telegram)
    [✏️ Edit] [🎨 Text Overlay] [🎬 Video] [⏰ Schedule] [✅ Approve]
    ↓
User makes changes
    ↓
Callback → Increment iteration_count
    ↓
Check iteration_count < MAX (5)?
    YES → Loop back to Check Post
    NO → Show error & require reset
```

---

## 🛡️ Loop Protection Mechanism

### ⚙️ การทำงาน

**1. Iteration Counter**
- เริ่มที่ 0
- เพิ่ม +1 ทุกครั้งที่แก้ไข
- Max = 5 ครั้ง

**2. State Tracking**
- บันทึกใน Google Sheets (`Post_State_Tracking.csv`)
- ติดตาม post_id, iteration_count, remaining_iterations

**3. Warning System**
- เมื่อเหลือ ≤ 2 ครั้ง → แจ้งเตือน
- เมื่อถึง 5 ครั้ง → บล็อกและต้อง reset

**4. Reset Option**
- ผู้ใช้สามารถ reset iteration เป็น 0 ได้
- เริ่มนับใหม่

---

## 📊 Flow Chart

### Initial Request Flow
```
┌─────────────────────────────┐
│ User: "ตรวจงาน" + Photo     │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Process Check Request       │
│ - Generate post_id          │
│ - Set iteration_count = 0   │
│ - Check MAX_ITERATIONS      │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Update Google Sheets        │
│ (Post_State_Tracking)       │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Send Inspection UI          │
│ + Inline Keyboard Choices   │
└─────────────────────────────┘
```

### Edit Loop Flow
```
┌────────────────────────┐
│ User clicks button     │
│ (e.g. Text Overlay)    │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│ User makes changes     │
│ (edit image/text)      │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│ Callback Webhook       │
│ POST /check-post-      │
│      callback          │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│ Increment iteration    │
│ iteration_count += 1   │
└───────────┬────────────┘
            ↓
      ┌────┴────┐
      │   IF    │
      │ Count   │
      │ < MAX?  │
      └─┬────┬──┘
        │    │
       YES   NO
        │    │
        │    └──→ ┌──────────────┐
        │         │ Show Error   │
        │         │ Must Reset   │
        │         └──────────────┘
        ↓
┌────────────────────────┐
│ Loop Back to           │
│ Check Post System      │
│ (Recursive Call)       │
└────────────────────────┘
```

---

## 🔧 Technical Details

### Node Structure

**1. Check Post Request Webhook**
- Endpoint: `/webhook/check-post`
- Method: POST
- Accepts: `post_id`, `chat_id`, `image_url`, `iteration_count`

**2. Process Check Request**
```javascript
// Key logic
const MAX_ITERATIONS = 5;
const currentIteration = data.iteration_count || 0;

if (currentIteration >= MAX_ITERATIONS) {
  throw new Error('Max iterations exceeded');
}

return {
  ...data,
  iteration_count: currentIteration,
  remaining_iterations: MAX_ITERATIONS - currentIteration
};
```

**3. Update State Tracking**
- Google Sheets operation: `appendOrUpdate`
- Columns: `post_id`, `status`, `iteration_count`, `remaining_iterations`

**4. Send Inspection UI**
- Telegram operation: `sendPhoto`
- Inline Keyboard with 6 options:
  - ✏️ Edit Image
  - 🎨 Text Overlay (Arc Curve)
  - 🎬 Create Video
  - 📹 Ext Overlay Video
  - ⏰ กำหนดเวลาโพสต์
  - ✅ อนุมัติโพสต์เลย
  - 🔄 รีเซ็ตและเริ่มใหม่

**5. Callback Webhook**
- Endpoint: `/webhook/check-post-callback`
- Increments `iteration_count`
- Routes to loop or reset

**6. Loop Back**
- HTTP Request to `/webhook/check-post` (recursive)
- Passes incremented iteration_count

---

## 📋 State Tracking CSV

**File:** `Post_State_Tracking.csv`

**Columns:**
```csv
post_id,chat_id,status,iteration_count,max_iterations,remaining_iterations,previous_action,created_at,last_modified,image_url,caption,notes
```

**Example:**
```csv
POST_001,123456,inspection_requested,0,5,5,initial,2025-11-09T03:00:00Z,2025-11-09T03:00:00Z,https://...,Caption here,Initial
POST_002,123456,editing,2,5,3,text_overlay,2025-11-09T03:10:00Z,2025-11-09T03:25:00Z,https://...,Updated,Added arc curve
POST_003,789012,max_iterations_reached,5,5,0,edit_image,2025-11-09T03:15:00Z,2025-11-09T03:45:00Z,https://...,Final,Reached max - needs admin
```

---

## 🎨 User Experience

### ขั้นตอนการใช้งาน

**1. เริ่มต้น**
```
User: ส่งรูปภาพ + กด "📋 ตรวจงาน"
Bot: แสดงรูปพร้อม choices
     🔄 Iteration: 1/5
```

**2. แก้ไข (ครั้งที่ 1)**
```
User: กด "🎨 Text Overlay"
User: เพิ่ม arc curve text
Bot: รับรูปใหม่ → Loop back
     🔄 Iteration: 2/5
```

**3. แก้ไขต่อ (ครั้งที่ 2-3)**
```
User: กด "✏️ Edit Image"
User: ปรับสี
Bot: Loop back
     🔄 Iteration: 3/5
```

**4. เตือน (เหลือ 2 ครั้ง)**
```
Bot: ⚠️ คำเตือน: ใกล้ถึงขีดจำกัด
     เหลือการแก้ไขอีก 2 ครั้ง
```

**5. ถึงลิมิต (ครั้งที่ 5)**
```
Bot: ❌ ถึงขีดจำกัดแล้ว!
     กรุณา:
     - กด "🔄 รีเซ็ต" เพื่อเริ่มใหม่
     - หรือติดต่อแอดมิน
```

**6. รีเซ็ต**
```
User: กด "🔄 รีเซ็ตและเริ่มใหม่"
Bot: ✅ รีเซ็ตสำเร็จ
     iteration_count = 0
     เริ่มนับใหม่ 1/5
```

---

## 🔒 Error Handling

### Errors ที่จัดการได้

**1. Max Iterations Exceeded**
```javascript
// Error thrown
Error: 'Max iterations (5) exceeded for post POST_123. Please review manually.'

// User sees
❌ เกิดข้อผิดพลาด
ถึงขีดจำกัดการแก้ไขแล้ว (5 ครั้ง)
กรุณารีเซ็ตหรือติดต่อแอดมิน
```

**2. Network Timeout**
```javascript
// HTTP Request options
{
  timeout: 30000,
  retry: {
    enabled: true,
    maxRetries: 3,
    retryInterval: 2000
  }
}
```

**3. Invalid Data**
```javascript
// Validation in Process Check Request
if (!data.chat_id || !data.image_url) {
  throw new Error('Missing required fields');
}
```

---

## ⚙️ Configuration

### Environment Variables

```bash
N8N_HOST=https://your-n8n-instance.com
TELEGRAM_BOT_TOKEN=your_bot_token
POST_STATE_TRACKING_SHEET_ID=your_google_sheet_id
```

### Workflow Settings

```json
{
  "MAX_ITERATIONS": 5,
  "WARNING_THRESHOLD": 2,
  "TIMEOUT_MS": 30000,
  "RETRY_COUNT": 3,
  "RETRY_INTERVAL_MS": 2000
}
```

---

## 🚀 Deployment

### 1. Import Workflows

```bash
# Import to n8n
1. Check_Post_System.json
2. Main_Router_Enhanced.json
```

### 2. Setup Google Sheets

```bash
# Create Sheet: "Post_State_Tracking"
# Import CSV: Post_State_Tracking.csv
# Get Sheet ID
# Update in workflow
```

### 3. Configure Credentials

```bash
# n8n Credentials
- Telegram Bot API
- Google Sheets OAuth2
```

### 4. Test

```bash
# Test flow:
1. Send photo to bot
2. Click "📋 ตรวจงาน"
3. Make edits (< 5 times)
4. Check Google Sheets for state
5. Try exceeding 5 times
6. Verify error + reset works
```

---

## 📊 Monitoring

### Key Metrics to Track

**1. Iteration Distribution**
```sql
-- How many posts reach which iteration?
SELECT iteration_count, COUNT(*)
FROM Post_States
GROUP BY iteration_count
```

**2. Max Iterations Reached**
```sql
-- Posts that hit the limit
SELECT post_id, chat_id, notes
FROM Post_States
WHERE iteration_count >= 5
```

**3. Average Iterations**
```sql
-- Average edits per post
SELECT AVG(iteration_count) as avg_iterations
FROM Post_States
WHERE status = 'approved'
```

**4. Reset Frequency**
```sql
-- How often users reset
SELECT COUNT(*) as reset_count
FROM Post_States
WHERE previous_action = 'reset'
```

---

## 🐛 Troubleshooting

### ปัญหาที่พบบ่อย

**Q1: Loop ไม่หยุด**
```
A: ตรวจสอบ:
   1. iteration_count ถูกส่งใน callback หรือไม่
   2. Google Sheets update สำเร็จหรือไม่
   3. MAX_ITERATIONS ตั้งค่าถูกต้องหรือไม่
```

**Q2: ไม่แสดงคำเตือน**
```
A: ตรวจสอบ:
   1. Check Iteration Warning node เชื่อมต่อหรือไม่
   2. remaining_iterations คำนวณถูกต้องหรือไม่
   3. WARNING_THRESHOLD = 2 หรือไม่
```

**Q3: รีเซ็ตไม่ทำงาน**
```
A: ตรวจสอบ:
   1. Reset callback routing ถูกต้องหรือไม่
   2. iteration_count ถูกเซ็ตเป็น 0 หรือไม่
   3. Google Sheets update สำเร็จหรือไม่
```

**Q4: Error: Max iterations exceeded ทันที**
```
A: สาเหตุ:
   1. iteration_count ไม่ reset จาก previous session
   2. Google Sheets มี stale data

   แก้ไข:
   - ลบ row ใน Google Sheets
   - หรือ force reset ผ่าน manual update
```

---

## 🎯 Best Practices

### สำหรับผู้ใช้

1. **ตรวจสอบก่อนแก้ไข** - ดูให้ละเอียดก่อนกดแก้
2. **ใช้ Text Overlay สำคัญสุด** - Arc Curve เป็น brand critical
3. **เช็ค iteration count** - ดูว่าเหลือกี่ครั้ง
4. **รีเซ็ตถ้าจำเป็น** - อย่ากลัวกดรีเซ็ต

### สำหรับแอดมิน

1. **Monitor Google Sheets** - ดู state tracking เป็นประจำ
2. **Review max iterations posts** - ตรวจโพสต์ที่ถึง limit
3. **Adjust MAX_ITERATIONS** - ปรับค่าตามความเหมาะสม
4. **Backup state data** - สำรองข้อมูล state เป็นประจำ

---

## 📚 Related Workflows

**1. Main_Router_Enhanced.json**
- ใช้ Check Post System
- มี error handling
- Integration point

**2. Text Overlay (Arc Curve)**
- เรียกจาก Check Post
- ไม่นับ iteration (เพราะเป็น external link)

**3. Image Generation Workflows**
- ส่งผลลัพธ์มาที่ Check Post
- พร้อม inline keyboard

---

## 🔮 Future Enhancements

**Planned Features:**

1. **Admin Override**
   - Allow admin to extend iterations
   - Manual approval for >5 iterations

2. **Auto-save Versions**
   - Save each iteration as version
   - Allow rollback to previous version

3. **AI Quality Check**
   - Auto-check image quality
   - Suggest improvements

4. **Batch Check**
   - Check multiple posts at once
   - Batch approval

5. **Analytics Dashboard**
   - Real-time metrics
   - Iteration patterns
   - User behavior analysis

---

**คู่มือนี้จะช่วยให้คุณใช้งาน Check Post System ได้อย่างมีประสิทธิภาพ!** 🎉

หากมีคำถามหรือพบปัญหา กรุณาติดต่อแอดมิน
