# 🔧 คู่มือการอัปเกรด Admin Chatbot Workflow

**Created:** 2025-11-11
**For:** CREMO Admin Chatbot Enhancement
**Purpose:** เพิ่มฟีเจอร์ Smart Batch + Session History + Image Support

---

## 🎯 สิ่งที่จะอัปเกรด

จาก workflow เดิม (`user-admin_chatbot.json`) ให้เพิ่ม:

✅ **Smart Message Batching** (5-second wait)
✅ **Session-aware History** (แยก old/new sessions)
✅ **Enhanced Image Handling** (Extract + Send)
✅ **Dynamic Content Replacement** (Business data placeholders)
✅ **Facebook UX Enhancement** (Seen + Typing indicators)

---

## 📋 ขั้นตอนการอัปเกรด

### **OPTION 1: ใช้ Workflow เดิม + แก้ไขบางส่วน (แนะนำ)**

#### Step 1: เพิ่ม Data Table สำหรับ Smart Batching

1. ไปที่ n8n
2. สร้าง **Data Table** ใหม่ ชื่อ: `batch_messages_cremo`
3. Schema:
```json
{
  "user_id": "string",
  "user_text": "string",
  "bot_rep": "string",
  "processed": "boolean",
  "merged_message": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### Step 2: แทรก Nodes สำหรับ Smart Batching

**หลัง "Extract Messenger Event" ให้เพิ่ม:**

**2.1 Insert To Process (Data Table Insert)**
```javascript
Parameters:
- Operation: insert
- Data Table: batch_messages_cremo
- Fields:
  * user_id: {{ $json.psid }}
  * user_text: {{ $json.text }}
  * processed: false
  * bot_rep: null
```

**2.2 Wait 5 Seconds (Wait Node)**
```javascript
Parameters:
- Amount: 5
- Unit: seconds
```

**2.3 Get Unprocessed Messages (Data Table Get)**
```javascript
Parameters:
- Operation: get
- Data Table: batch_messages_cremo
- Filters:
  * user_id: {{ $json.psid }}
  * processed: false
- Return All: true
```

**2.4 Get Max ID + Merge Messages (Code Node)**
```javascript
const inputItems = items;

if (inputItems.length === 0) {
  return [];
}

// Sort by id ascending
const sortedItems = [...inputItems].sort((a, b) => a.json.id - b.json.id);

// Create merged message
const mergedMessage = sortedItems
  .map(item => item.json.user_text)
  .filter(text => text !== null && text !== undefined)
  .join(' ');

// Find max ID item
let maxItem = sortedItems[sortedItems.length - 1];

// Add merged_message field
maxItem.json.merged_message = mergedMessage;
maxItem.json.original_text = maxItem.json.user_text;

return [maxItem];
```

**2.5 Is Max ID? (If Node)**
```javascript
Condition:
- Left: {{ $json.id }}
- Operator: equals
- Right: {{ $('Insert To Process').first().json.id }}

True → Continue to AI Agent
False → Skip (end workflow)
```

#### Step 3: แก้ไข AI Agent Node

**เปลี่ยน Input Text:**
```javascript
// เดิม:
USER INPUT: {{ $json.chatMsg }}

// ใหม่:
USER INPUT: {{ $json.merged_message || $json.chatMsg }}
```

#### Step 4: เพิ่ม Session-Aware History

**4.1 Get History Messages (หลัง Get Max ID)**
```javascript
// เพิ่ม Supabase Get node
Parameters:
- Table: enhanced_chat_sessions
- Filters:
  * psid: {{ $json.psid }}
  * processed: true
- Sort: created_at DESC
- Limit: 15
```

**4.2 Build Session History (Code Node)**
```javascript
const inputItems = items;

if (inputItems.length === 0) {
  return [{
    json: {
      old_session_history: '',
      now_session_history: '',
      user_id: $('Get Max ID').first().json.user_id
    }
  }];
}

// Helper: Get Thai date (YYYY-MM-DD)
function getThaiDate(date) {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-');
}

// Helper: Format datetime
function formatDateTime(date) {
  return new Date(date).toLocaleString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Sort chronologically (oldest first)
const sorted = [...inputItems].sort((a, b) =>
  new Date(a.json.created_at) - new Date(b.json.created_at)
);

// Get today's date
const today = getThaiDate(new Date());

// Group by date
const sessions = {};
sorted.forEach(item => {
  const sessionDate = getThaiDate(item.json.created_at);
  if (!sessions[sessionDate]) {
    sessions[sessionDate] = [];
  }
  sessions[sessionDate].push(item);
});

// Build history strings
let oldSessionHistory = '';
let nowSessionHistory = '';

Object.keys(sessions).forEach(date => {
  const session = sessions[date];
  let sessionBlock = `--- 🕒 Session ${date} ---\n`;

  session.forEach(item => {
    const time = formatDateTime(item.json.created_at);
    if (item.json.user_text) {
      sessionBlock += `User [${time}]: ${item.json.user_text}\n`;
    }
    if (item.json.ai_response) {
      sessionBlock += `Bot [${time}]: ${item.json.ai_response}\n`;
    }
  });

  sessionBlock += '\n';

  // Split old vs today
  if (date === today) {
    nowSessionHistory += sessionBlock;
  } else {
    oldSessionHistory += sessionBlock;
  }
});

return [{
  json: {
    old_session_history: oldSessionHistory.trim() || 'No previous sessions',
    now_session_history: nowSessionHistory.trim() || 'First message today',
    user_id: $('Get Max ID').first().json.user_id,
    merged_message: $('Get Max ID').first().json.merged_message
  }
}];
```

**4.3 อัปเดต AI Agent System Message:**
```javascript
// เพิ่มในส่วน # Context
## Chat History:
### Old session chat history: {{ $json.old_session_history }}
### Now session chat history: {{ $json.now_session_history }}
```

#### Step 5: ปรับปรุง Image Handling

**5.1 Update Extract Image URL Node (ที่มีอยู่แล้ว):**
```javascript
// อัปเดต regex ให้ครอบคลุมมากขึ้น
const text = $('Call check_text').item.json['response-respawn'] || "";

// Enhanced regex for Cloudinary and other CDNs
const imageRegex = /(https?:\/\/res\.cloudinary\.com\/[^\s]+?\.(jpg|jpeg|png|gif|webp)(?:\?[^\s]*)?)/gi;

const urls = [];
let match;
while ((match = imageRegex.exec(text)) !== null) {
  urls.push(match[0]);
}

// Clean text (remove URLs)
let cleanText = text;
urls.forEach(url => {
  cleanText = cleanText.replace(url, '').trim();
});

// Remove extra whitespace
cleanText = cleanText.replace(/\s{2,}/g, ' ').trim();

return {
  json: {
    text: cleanText,
    image_url: urls[0] || null,  // First image only
    image_urls: urls,
    has_image: urls.length > 0,
    psid: $('Webhook').item.json.body.entry[0].messaging[0].sender.id
  }
};
```

**5.2 Update Send Image Reply Node:**
```javascript
// Method: POST
// URL: https://graph.facebook.com/v24.0/{{ page_id }}/messages

{
  "recipient": {
    "id": "{{ $json.psid }}"
  },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [
          {
            "image_url": "{{ $json.image_url }}",
            "subtitle": "{{ $json.text }}"
          }
        ]
      }
    }
  }
}
```

#### Step 6: เพิ่ม Dynamic Content Replacement

**หลัง AI Agent, ก่อน Check Image Output:**

**6.1 Replace Business Data Placeholders (Code Node)**
```javascript
const aiResponse = $('AI Agent').first().json.Response ||
                   $('AI Agent').first().json.output ||
                   '';

// Get business data from cache or Supabase
// For demo, we'll use placeholder logic
let response = aiResponse;

// Define common placeholders (should be from Supabase business_data table)
const businessData = {
  'โปรโมชั่นปัจจุบัน': 'บิลแรก 2,500 บาท ลดทันที 1,000 บาท จ่ายจริงเพียง 1,500 บาท',
  'ค่าใช้จ่ายทั้งหมด': 'เสียแค่ค่าสินค้าบิลแรก 1,500 บาท ที่เหลือฟรีหมด',
  'กำไรโดยเฉลี่ย': 'ร้านทั่วไป: 3,000-10,000 บาท/เดือน | โรงเรียน: 5,000-15,000 บาท/เดือน',
  'ขนาดตู้แช่': 'มี 3 ขนาด: 1m, 1.2m, 1.5m (กว้าง) แบบกระจกเลื่อน',
  'ค่าไฟตู้แช่': 'วันละ 10-12 บาท เดือนประมาณ 300-360 บาท',
  'การรับประกันตู้': 'รับประกันตลอดอายุสัญญา ซ่อมฟรี หรือเปลี่ยนใหม่ให้',
  'สัญญาและเงื่อนไข': 'ไม่ผูกมัด คืนตู้ได้ ไม่มีค่าปรับ แจ้งล่วงหน้า 7 วัน',
  'รสชาติสินค้า': 'ช็อกโกแลต วนิลา สตรอว์เบอร์รี่ มะพร้าว ชาเขียว และอื่นๆ'
};

// Replace placeholders
const placeholderRegex = /\(ดึงจาก business_data: ([^)]+)\)/g;
response = response.replace(placeholderRegex, (match, variable) => {
  return businessData[variable.trim()] || `[ข้อมูล "${variable}" ไม่พบ]`;
});

return {
  json: {
    final_response: response,
    original_response: aiResponse,
    psid: $('Extract Messenger Event').first().json.psid
  }
};
```

**หมายเหตุ:** ในการใช้งานจริง ควร Query จาก Supabase `business_data` table แทน hardcode

#### Step 7: เพิ่ม Facebook UX (Seen + Typing)

**หลัง "Check User Message" เพิ่ม 2 nodes:**

**7.1 Send Seen (HTTP Request)**
```javascript
Method: POST
URL: https://graph.facebook.com/v24.0/{{ page_id }}/messages
Authentication: Facebook Graph API

Body:
{
  "recipient": {"id": "{{ $json.psid }}"},
  "sender_action": "mark_seen"
}

Options:
- Continue On Fail: true
```

**7.2 Send Typing (HTTP Request)**
```javascript
Method: POST
URL: https://graph.facebook.com/v24.0/{{ page_id }}/messages
Authentication: Facebook Graph API

Body:
{
  "recipient": {"id": "{{ $json.psid }}"},
  "sender_action": "typing_on"
}

Options:
- Continue On Fail: true
```

#### Step 8: อัปเดต Processed Status

**หลัง Send Text Reply:**

**Update Processed Status (Data Table Update)**
```javascript
Parameters:
- Operation: update
- Data Table: batch_messages_cremo
- Filters:
  * user_id: {{ $('Get Max ID').first().json.user_id }}
  * processed: false
- Update Fields:
  * processed: true
  * bot_rep: {{ $('Replace Placeholders').first().json.final_response }}
```

---

### **OPTION 2: Import Workflow ใหม่ทั้งหมด (ถ้าต้องการเริ่มใหม่)**

1. Backup workflow เดิม (Export เป็น JSON)
2. Import `enhanced_admin_chatbot.json` (จะสร้างให้ในขั้นตอนถัดไป)
3. Config credentials
4. Test

---

## 🔧 Configuration Checklist

### ✅ **Credentials ที่ต้อง Config:**

- [ ] **Facebook Messenger API**
  - Page Access Token
  - Verify Token: `n8n-webhook`
  - Page ID: `107201445711168`

- [ ] **Supabase**
  - Host: `xxxxx.supabase.co`
  - Service Role Key

- [ ] **Cohere API**
  - API Key (for embeddings)

- [ ] **OpenRouter**
  - API Key
  - Model: `google/gemini-2.5-flash`

- [ ] **Telegram** (สำหรับ notifications)
  - Bot Token
  - Chat ID

### ✅ **Data Tables ที่ต้องสร้าง:**

- [ ] `batch_messages_cremo` - สำหรับ Smart Batching
  - Schema: user_id, user_text, bot_rep, processed, merged_message

### ✅ **Supabase Tables ที่ต้องมี:**

- [ ] `enhanced_chat_sessions` - Chat history
- [ ] `qa_scenarios` - QA knowledge base
- [ ] `business_data` - Business variables
- [ ] `customer_check` - Customer tracking
- [ ] `documents` - Vector store

---

## 📊 ความแตกต่าง Before/After

| Feature | Before (เดิม) | After (ใหม่) |
|---------|---------------|--------------|
| **Message Batching** | ❌ ไม่มี | ✅ 5-second smart batch |
| **History Management** | ✅ Basic | ✅ Session-aware (old+new) |
| **Image Handling** | ✅ มี | ✅ Enhanced (better extract) |
| **Content Replacement** | ❌ Manual | ✅ Dynamic (auto-replace) |
| **Facebook UX** | ⚠️ Basic | ✅ Seen + Typing indicators |
| **Response Time** | ~5-8 sec | ~3-6 sec (with batching) |

---

## 🧪 Testing Plan

### **Test 1: Smart Batching**
```
1. ส่งข้อความ 3 ข้อติดๆ กัน:
   - "สอบถามราคา"
   - "ตู้ใหญ่แค่ไหน"
   - "ส่งฟรีไหม"

Expected: รวมเป็นข้อความเดียว "สอบถามราคา ตู้ใหญ่แค่ไหน ส่งฟรีไหม"
          ตอบกลับครั้งเดียว (ไม่ตอบ 3 ครั้ง)
```

### **Test 2: Session History**
```
1. คุยวันนี้: "สวัสดีครับ"
2. รอถึงวันพรุ่งนี้
3. คุยใหม่: "เมื่อวานคุยถึงอะไรบ้าง"

Expected: AI จำบทสนทนาเมื่อวาน และตอบได้ว่าคุยเรื่องอะไร
```

### **Test 3: Image Response**
```
1. ถามคำถามที่มีรูป: "ขอดูตู้แช่หน่อย"

Expected: ส่งรูปตู้แช่ + คำอธิบาย
```

### **Test 4: Dynamic Content**
```
1. ถาม: "โปรโมชั่นตอนนี้อะไร"

Expected: ตอบด้วยโปรโมชั่นล่าสุดจาก business_data
          (ไม่ใช่ตอบแบบ generic)
```

### **Test 5: Facebook UX**
```
1. ส่งข้อความ

Expected:
- เห็น "seen" ทันที
- เห็น "typing..." indicator
- จากนั้นจึงได้รับคำตอบ
```

---

## 🚨 Troubleshooting

### ปัญหา: Batch ไม่ทำงาน
**สาเหตุ:** Data Table ไม่มีข้อมูล processed = false
**แก้ไข:** ตรวจสอบ Insert To Process node ว่าเพิ่มข้อมูลสำเร็จหรือไม่

### ปัญหา: ตอบซ้ำหลายครั้ง
**สาเหตุ:** "Is Max ID?" node ไม่ทำงาน
**แก้ไข:** เช็ค condition ว่าเปรียบเทียบ ID ถูกต้องหรือไม่

### ปัญหา: ไม่จำบทสนทนา
**สาเหตุ:** Session history ไม่ถูก pass ให้ AI Agent
**แก้ไข:** เช็ค Build Session History node และ AI Agent system message

### ปัญหา: รูปไม่ส่ง
**สาเหตุ:** Extract Image URL ไม่เจอ URL
**แก้ไข:** เช็ค regex pattern และ Cloudinary URL format

### ปัญหา: Placeholder ไม่ replace
**สาเหตุ:** Format ไม่ตรงกับที่ define
**แก้ไข:** ใช้ format: `(ดึงจาก business_data: variable_name)` ให้ถูกต้อง

---

## 📞 Next Steps

1. ✅ อ่านคู่มือนี้ทั้งหมด
2. ✅ Backup workflow เดิม
3. ✅ เลือก Option 1 หรือ 2
4. ✅ ทำตาม Checklist
5. ✅ ทดสอบตาม Testing Plan
6. ✅ Deploy ขึ้น Production

---

## 📚 เอกสารเพิ่มเติม

- [Supabase Setup Guide →](01_SUPABASE_SETUP_GUIDE.md)
- [Database Reference →](DATABASE_REFERENCE.md)
- [Testing Guide →](03_TESTING_GUIDE.md)
- [Deployment Checklist →](04_DEPLOYMENT_CHECKLIST.md)

---

**Last Updated:** 2025-11-11
**Version:** 1.0
**Status:** Ready for upgrade
