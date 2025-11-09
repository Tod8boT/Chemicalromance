# 📱 Telegram Text Control Interface - User Guide

> **CC_ID1 - Phase 1 Deliverable**
>
> Telegram Bot Interface สำหรับควบคุม text overlay settings
> **NO IMAGE PROCESSING** - Interface controls only!

**Version:** 1.0.0
**Created:** 2025-11-09
**Author:** CC_ID1
**Status:** Phase 1 Complete

---

## 🎯 Mission Statement

**สร้างเฉพาะ:** Telegram bot interface ที่ให้ user ปรับแต่ง text settings ผ่าน inline keyboards

**ห้ามทำ:**
- ❌ Image processing
- ❌ Text overlay rendering
- ❌ Cloudinary integration
- ❌ Image generation

**ทำเท่านี้:**
- ✅ Telegram inline keyboards
- ✅ Setting controls (font size, position, color, stroke, arc)
- ✅ Google Sheets integration (save settings only)
- ✅ 3 text sets support

---

## 📦 What's Included

### 1. Telegram_Text_Control_Interface.json
**Main n8n workflow** - 10 nodes

**Nodes:**
1. Telegram Trigger - รับ message และ callback queries
2. Route: Message or Callback - แยก message type
3. Handle Command - จัดการคำสั่ง /start, /text
4. Handle Callback Query - จัดการ button clicks
5. Send Message - ส่ง message ใหม่
6. Edit Message - แก้ไข message เดิม (update keyboards)
7. Answer Callback Query - ตอบ callback
8. Check if Save Needed - ตรวจสอบว่าต้อง save หรือไม่
9. Save to Google Sheets - บันทึก settings
10. Load from Google Sheets - โหลด settings

### 2. telegram_interface_controller.js
**Helper JavaScript code** for:
- State management
- Keyboard builders
- Validation
- Google Sheets formatting

### 3. Text_Settings_GoogleSheet_Template.csv
**Google Sheets template** with columns:
- user_id
- text_set (1, 2, or 3)
- setting_type (fontsize, position, color, stroke, strokecolor, arc, text)
- value
- updated_at

---

## 🎛️ Interface Features

### Main Menu

```
🎨 Text Overlay Control Panel

เลือก Text Set ที่ต้องการปรับแต่ง (รองรับ 3 ชุด):

[📝 Text Set 1] [📝 Text Set 2] [📝 Text Set 3]
[👁️ Preview Settings] [💾 Save to Sheets]
[🗑️ Clear All] [ℹ️ Help]
```

### Text Set Settings Menu

```
📝 Text Set 1 Settings

เลือกส่วนที่ต้องการปรับแต่ง:

[✏️ Enter Text]
[📏 Font Size] [📍 Position]
[🎨 Text Color] [🖍️ Stroke]
[🌀 Arc Curve]
[👁️ Preview This Set]
[🔙 Back to Menu]
```

### Setting Controls

#### 1. Font Size Control
```
📏 Font Size (Text Set 1)

เลือกขนาดตัวอักษร:

[Small (40px)] [Medium (60px)] [Large (80px)]
[X-Large (100px)] [XX-Large (120px)]
[🔙 Back]
```

#### 2. Position Control (3x3 Grid)
```
📍 Position (Text Set 1)

เลือกตำแหน่งข้อความ:

[↖️] [⬆️] [↗️]
[⬅️] [🎯] [➡️]
[↙️] [⬇️] [↘️]
[🔙 Back]
```

#### 3. Color Control
```
🎨 Text Color (Text Set 1)

เลือกสี:

[⚪ White] [⚫ Black] [🔴 Red]
[🔵 Blue] [🟢 Green] [🟡 Yellow]
[🟠 Orange] [🟣 Purple] [🟤 Brown]
[💛 Cremo Yellow] [💙 Cremo Blue]
[✏️ Custom Hex]
[🔙 Back]
```

#### 4. Stroke Control
```
🖍️ Stroke Settings (Text Set 1)

เลือกความหนาของขอบ:

[❌ No Stroke]
[Thin (3px)] [Medium (5px)] [Thick (8px)]
[X-Thick (12px)] [XX-Thick (15px)]
[🎨 Stroke Color]
[🔙 Back]
```

#### 5. Arc Curve Control
```
🌀 Arc Curve (Text Set 1)

เลือกมุมโค้ง (-180° ถึง 180°):

[-180°] [-90°] [-60°]
[-30°] [0° (Flat)] [+30°]
[+60°] [+90°] [+180°]
[✏️ Custom Value]
[🔙 Back]
```

---

## 🚀 Installation

### Prerequisites

- n8n instance running
- Telegram Bot Token
- Google Sheets account
- Google OAuth2 credentials for n8n

### Step 1: Create Telegram Bot

```bash
1. Open Telegram
2. Search for @BotFather
3. Send: /newbot
4. Follow instructions
5. Copy Bot Token
```

### Step 2: Create Google Sheets

```
1. Go to Google Sheets
2. Create new spreadsheet: "Text Settings"
3. Create sheet named: "text_settings"
4. Add headers: user_id, text_set, setting_type, value, updated_at
5. Copy Spreadsheet ID from URL
```

### Step 3: Import Workflow

```
1. Open n8n
2. Workflows → Import from File
3. Select: Telegram_Text_Control_Interface.json
4. Import
```

### Step 4: Configure Credentials

**Telegram Credential:**
```
Type: Telegram API
Bot Token: [Your bot token from BotFather]
```

**Google Sheets Credential:**
```
Type: Google Sheets OAuth2 API
Authorize with Google account
```

### Step 5: Set Environment Variables

```bash
TELEGRAM_BOT_TOKEN=your_telegram_token
GOOGLE_SHEETS_TEXT_SETTINGS_ID=your_spreadsheet_id
```

### Step 6: Activate Workflow

```
1. Open workflow in n8n
2. Toggle "Active" switch
3. Test with /start command in Telegram
```

---

## 📊 Data Flow

```
User clicks button in Telegram
    ↓
Callback query received
    ↓
Parse callback data (action_textset_value)
    ↓
Build appropriate keyboard
    ↓
Edit message with new keyboard
    ↓
If setting selected → Save to Google Sheets
    ↓
Answer callback query (show checkmark)
```

### Google Sheets Structure

**Each setting stored as separate row:**

| user_id | text_set | setting_type | value | updated_at |
|---------|----------|--------------|-------|------------|
| 123 | 1 | fontsize | 80 | 2025-11-09... |
| 123 | 1 | position | north | 2025-11-09... |
| 123 | 1 | color | FF0000 | 2025-11-09... |
| 123 | 1 | stroke | 8 | 2025-11-09... |
| 123 | 1 | strokecolor | FFD700 | 2025-11-09... |
| 123 | 1 | arc | -15 | 2025-11-09... |
| 123 | 1 | text | ลด 70%! | 2025-11-09... |

**Why this structure?**
- ✅ Easy to update individual settings
- ✅ Query by user_id + text_set
- ✅ Track changes with updated_at
- ✅ Simple for CC_ID2 to read

---

## 🎮 User Flow

### Scenario: User wants to create Text Set 1

**Step 1: Start**
```
User: /start
Bot: Shows main menu
```

**Step 2: Select Text Set**
```
User: Clicks "📝 Text Set 1"
Bot: Shows Text Set 1 settings menu
```

**Step 3: Set Font Size**
```
User: Clicks "📏 Font Size"
Bot: Shows font size options
User: Clicks "Large (80px)"
Bot: ✅ Setting Updated - fontsize: 80
     Saves to Google Sheets
```

**Step 4: Set Position**
```
User: Clicks "📍 Position"
Bot: Shows 3x3 position grid
User: Clicks "⬆️" (north)
Bot: ✅ Setting Updated - position: north
     Saves to Google Sheets
```

**Step 5: Set Color**
```
User: Clicks "🎨 Text Color"
Bot: Shows color options
User: Clicks "🔴 Red"
Bot: ✅ Setting Updated - color: FF0000
     Saves to Google Sheets
```

**Step 6: Set Arc Curve**
```
User: Clicks "🌀 Arc Curve"
Bot: Shows arc options
User: Clicks "-30°"
Bot: ✅ Setting Updated - arc: -30
     Saves to Google Sheets
```

**Step 7: Preview**
```
User: Clicks "👁️ Preview This Set"
Bot: Shows formatted preview:

📝 Text Set 1
✏️ Text: (not set)
📏 Font Size: 80px
📍 Position: north
🎨 Color: #FF0000
🖍️ Stroke: 0px (#000000)
🌀 Arc: -30°
🕒 Updated: 9/11/2025 12:00:00
```

**Step 8: Save to Sheets**
```
User: Clicks "💾 Save to Sheets"
Bot: 💾 Saving to Google Sheets...
     ✅ Settings saved!
```

---

## 🔧 Technical Details

### Callback Data Format

**Pattern:** `{action}_{textset}_{value}`

**Examples:**
```
edit_text_1          → Open Text Set 1 menu
fontsize_1           → Show font size options for Set 1
set_fontsize_1_80    → Set font size to 80px for Set 1
set_position_2_north → Set position to north for Set 2
set_color_3_FF0000   → Set color to red for Set 3
```

### State Management

**Current state stored in:**
- Google Sheets (persistent)
- Workflow execution data (temporary)

**No external database needed!**

### 3 Text Sets

Each user can configure **3 independent text sets**:

**Use Cases:**
- Text Set 1: Main headline
- Text Set 2: Subheadline
- Text Set 3: Call-to-action

**Settings per set:**
- Text content
- Font size (20-200px)
- Position (9 options)
- Color (hex code)
- Stroke width (0-30px)
- Stroke color (hex code)
- Arc curve (-180° to 180°)

---

## 📋 Integration with CC_ID2

### What CC_ID1 Provides

**Output to Google Sheets:**
```csv
user_id,text_set,setting_type,value,updated_at
123,1,fontsize,80,2025-11-09T12:00:00Z
123,1,position,north,2025-11-09T12:00:00Z
123,1,color,FF0000,2025-11-09T12:00:00Z
...
```

### What CC_ID2 Should Do

**Read from Google Sheets** and **generate Cloudinary URLs**:

```javascript
// CC_ID2 reads:
{
  text_set: 1,
  fontSize: 80,
  position: "north",
  color: "FF0000",
  stroke: 8,
  strokeColor: "FFD700",
  arc: -15,
  text: "ลด 70%!"
}

// CC_ID2 generates:
// l_text:Mitr_80_bold:ลด%2070%25!,co_rgb:FF0000/
// co_rgb:FFD700,e_outline:8/e_distort:arc:-15/fl_layer_apply,g_north
```

**No overlap - clean separation of concerns!**

---

## ✅ Testing

### Test Case 1: Basic Flow

```
1. Send /start
2. Click "Text Set 1"
3. Click "Font Size"
4. Select "Medium (60px)"
5. Verify: Google Sheets updated
6. Verify: Confirmation message shown
```

### Test Case 2: All Settings

```
1. Configure all settings for Text Set 1
2. Click "Preview This Set"
3. Verify: All values display correctly
4. Click "Save to Sheets"
5. Verify: All rows in Google Sheets
```

### Test Case 3: Three Text Sets

```
1. Configure Text Set 1 (different settings)
2. Configure Text Set 2 (different settings)
3. Configure Text Set 3 (different settings)
4. Click "Preview All"
5. Verify: Shows all 3 sets correctly
```

### Test Case 4: Position Grid

```
1. Click "Position"
2. Try all 9 positions
3. Verify: Each position saves correctly
4. Verify: Position names match Cloudinary gravity values
```

### Test Case 5: Arc Curve Range

```
1. Click "Arc Curve"
2. Test: -180°, -90°, 0°, +90°, +180°
3. Verify: All values accepted
4. Verify: Values saved as integers
```

---

## 🎯 Success Criteria

**Phase 1 Complete if:**

- ✅ Telegram bot responds to /start
- ✅ Main menu shows 3 text set buttons
- ✅ Each text set has 5 setting controls
- ✅ Font size: 5 options (40, 60, 80, 100, 120)
- ✅ Position: 9 grid buttons work
- ✅ Color: 12+ color options
- ✅ Stroke: 5 thickness options
- ✅ Arc: 9 angle options
- ✅ Settings save to Google Sheets
- ✅ Preview shows current settings
- ✅ Supports 3 independent text sets
- ✅ NO image processing
- ✅ NO Cloudinary integration
- ✅ Clean data for CC_ID2

---

## 🚨 Important Notes

### What This Does NOT Do

**❌ Does NOT:**
- Process images
- Generate text overlays
- Call Cloudinary API
- Render any images
- Create final output

**✅ Only Does:**
- Show Telegram menus
- Save user preferences
- Validate settings
- Store in Google Sheets

### Handoff to CC_ID2

**CC_ID1 → Google Sheets → CC_ID2**

```
CC_ID1 saves:     {fontsize: 80, position: "north", ...}
                             ↓
                  Google Sheets (shared data)
                             ↓
CC_ID2 reads:     {fontsize: 80, position: "north", ...}
CC_ID2 generates: l_text:Mitr_80_bold:...,g_north/...
```

**Clean handoff - no coupling!**

---

## 📚 Code Examples

### Example: Reading Settings (for CC_ID2)

```javascript
// CC_ID2 workflow: Load from Google Sheets
const rows = $input.all(); // All rows for this user
const textSet1 = rows.filter(r => r.json.text_set === '1');

const settings = {};
textSet1.forEach(row => {
  settings[row.json.setting_type] = row.json.value;
});

// Result:
// {
//   fontsize: "80",
//   position: "north",
//   color: "FF0000",
//   stroke: "8",
//   strokecolor: "FFD700",
//   arc: "-15",
//   text: "ลด 70%!"
// }
```

---

## 🏆 Deliverables Summary

### Files Created

```
CC_ID1_TELEGRAM_INTERFACE/
├── workflows/
│   └── Telegram_Text_Control_Interface.json ✅
├── code/
│   └── telegram_interface_controller.js ✅
├── templates/
│   └── Text_Settings_GoogleSheet_Template.csv ✅
└── docs/
    └── TELEGRAM_INTERFACE_GUIDE.md ✅ (this file)
```

### What CC_ID1 Learned

**From user perspective:**
- Font size ranges (40-120px common)
- 9 position options needed
- Color picker with presets + custom
- Stroke 0-15px range
- Arc -180° to +180° range
- 3 text sets = flexible layouts

**Cloudinary parameters learned:**
- `g_{gravity}` for position
- `co_rgb:{hex}` for color
- `e_outline:{width}` for stroke
- `e_distort:arc:{angle}` for curve
- Font size mapping to Mitr fonts

---

## 🔗 Next Steps (Phase 2)

**After CC_ID2 completes their part:**

1. CC_ID2 creates Cloudinary URL generator
2. Both outputs go to Phase 2 integration
3. Integration workflow combines:
   - Telegram settings (CC_ID1)
   - URL generation (CC_ID2)
   - Existing text overlay system

**Phase 2 = Full system integration**

---

**Created by:** CC_ID1
**For:** Cremo Ice Cream - Phase 1
**Date:** 2025-11-09
**Status:** ✅ Ready for handoff to CC_ID2

**Mission accomplished! Interface-only, no image processing! 🎯**
