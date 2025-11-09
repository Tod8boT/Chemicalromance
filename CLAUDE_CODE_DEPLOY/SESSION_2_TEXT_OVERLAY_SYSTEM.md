# 🖼️ TEXT OVERLAY + IMAGE SYSTEM WORKFLOWS
**Session 2 Target - 7 Workflows**

---

## 1️⃣ **Main_Telegram_Router** ⭐ FIXED VERSION

### **Function:**
Hub for all user interactions + Work review system

### **Critical Fix Applied:**
- Missing Telegram sendPhoto node added after image generation
- Complete inline keyboard with "➕ เพิ่มข้อความ" button
- Integration with text overlay system

### **Workflow Pattern:**
```
Telegram Message Trigger
    ↓
Switch: Photo/Text input
    ├─ Photo → Image generation flow
    └─ Text → Command routing
    ↓
For Image Flow:
    ├─ Ask: Use template? (Yes/No)
    ├─ Call: create_image_no_template OR create_image_with_template
    └─ Send image + "Add Text" button → Text Overlay
    ↓
For check_post:
    ├─ Display work queue
    ├─ User selects: edit/text overlay/video/schedule
    └─ Route to appropriate workflow
```

### **Integration Points:**
- create_image_no_template → Send image with text overlay button
- create_image_with_template → Send image with text overlay button
- check_post → Work_Review_Manager

---

## 2️⃣ **Create_Image_No_Template**

### **Function:**
Generate base images without template (first round)

### **Workflow Pattern:**
```
Input: Photo from user
    ↓
Fal.AI Image Generation:
    ├─ Base prompt creation
    ├─ Style: CREMO brand colors
    └─ Output: 1:1 aspect ratio
    ↓
Return to Main Router:
    ├─ image_url
    ├─ chat_id
    └─ generation_metadata
```

### **Output Format:**
- image_url, chat_id, prompt_used
- generation_timestamp, file_id
- status: "generated" → "reviewed" → "approved"

---

## 3️⃣ **Create_Image_With_Template**

### **Function:**
Apply CREMO templates → Replace mockup → Real product images

### **Workflow Pattern:**
```
Input: Photo + Template selection
    ↓
Template Processing:
    ├─ Load CREMO template
    ├─ Replace mockup ice cream machine
    └─ Apply brand elements (arc curve, colors)
    ↓
Fal.AI Generation with Template:
    ├─ Enhanced prompt with template
    ├─ CREMO brand compliance
    └─ Multiple aspect ratios (1:1, 16:9, 9:16)
    ↓
Google Drive Storage:
    ├─ Upload to branded folder
    ├─ Generate shareable link
    └─ Log in MEDIA sheet
    ↓
Return to Main Router + Telegram notification
```

### **Template Features:**
- CREMO ice cream machine (real product)
- Brand colors: #ffdd17 (yellow), #17539f (blue)
- Thai text support
- Arc curve branding elements

---

## 4️⃣ **Text_Overlay_Processor** ⭐⭐⭐ CRITICAL BRAND FEATURE

### **Function:**
Add customizable text overlays with arc curve + Thai support

### **MAXIMUM QUALITY REQUIREMENTS:**
- Arc curve: -180° to 180° (brand identity feature)
- Thai language: Full UTF-8 support + cultural context
- Mobile optimization: Touch-friendly interface
- Real-time preview: Live arc curve adjustment

### **Workflow Pattern:**
```
Webhook Trigger: /overlay-form
    ↓
Display HTML Form:
    ├─ Text input (Thai supported)
    ├─ Arc curve slider (-180° to 180°)
    ├─ Font selection (Mitr, Sarabun, Kanit)
    ├─ Color picker (CREMO presets)
    ├─ Position controls
    └─ Real-time preview
    ↓
Form Submit: /overlay-submit
    ↓
Cloudinary Processing:
    ├─ Apply arc curve transformation
    ├─ Add Thai text with proper encoding
    ├─ Brand color application
    └─ Mobile-optimized output
    ↓
Send Final Image to Telegram
```

### **Technical Specifications:**
```javascript
// Arc Curve Implementation
if (arc != 0) {
  url += `e_distort:arc:${arc}/`;
}

// Thai Text Encoding
const encoded = encodeURIComponent(thaiText);

// Brand Colors
const CREMO_COLORS = {
  yellow: "#ffdd17",
  blue: "#17539f"
};
```

### **Mobile UX Features:**
- 20px+ touch targets
- Responsive design
- Touch-friendly sliders
- Instant feedback

---

## 5️⃣ **Work_Review_Manager**

### **Function:**
Manage work review cycles → Prevent infinite loops

### **Workflow Pattern:**
```
Trigger: check_post command
    ↓
Load Pending Work:
    ├─ Query CONTENT sheet (status = "ready")
    ├─ Display work items with thumbnails
    └─ User selection interface
    ↓
Review Options:
    ├─ Edit → Image editing workflow
    ├─ Text Overlay → Text_Overlay_Processor
    ├─ Create Video → Video workflow (future)
    ├─ Schedule Post → Scheduling system
    └─ Approve → Mark as final
    ↓
Loop Prevention:
    ├─ Track revision count (max 3)
    ├─ Auto-approve after limit
    └─ Log review history
    ↓
Update Status → Trigger next workflow if needed
```

### **Anti-Loop Logic:**
```javascript
revision_count = getRevisionCount(content_id);
if (revision_count >= 3) {
  autoApprove(content_id);
  sendNotification("Auto-approved after 3 revisions");
}
```

---

## 6️⃣ **Ad_Boost_Calculator**

### **Function:**
Calculate optimal ad spend based on historical data

### **Workflow Pattern:**
```
Input: Budget + Campaign duration
    ↓
Query Historical Data:
    ├─ Past campaign performance
    ├─ Engagement rates by content type
    ├─ ROI by budget range
    └─ Seasonal patterns
    ↓
AI Analysis:
    ├─ Predict performance
    ├─ Recommend budget allocation
    ├─ Suggest best content for boosting
    └─ Calculate expected ROI
    ↓
Output Recommendations:
    ├─ Optimal budget split
    ├─ Best performing content to boost
    ├─ Expected metrics
    └─ Timeline recommendations
```

### **Recommendation Format:**
- recommended_budget_split: {"image": 60%, "video": 40%}
- top_content_ids: ["day1_content", "day5_content"]
- expected_roi: 3.2x
- confidence_level: 85%

---

## 7️⃣ **Content_Generator**

### **Function:**
Generate content based on campaign specs → Link to image workflows

### **Workflow Pattern:**
```
Input: Campaign specifications
    ↓
Content Strategy:
    ├─ Analyze target audience
    ├─ Select optimal content types
    ├─ Generate captions (Thai + English)
    └─ Plan posting schedule
    ↓
Integration with Image Workflows:
    ├─ Auto-trigger image generation
    ├─ Apply selected templates
    ├─ Generate variations for A/B testing
    └─ Prepare batch for review
    ↓
Quality Control:
    ├─ Brand compliance check
    ├─ Thai language validation
    ├─ Cultural context review
    └─ Legal compliance check
    ↓
Output to Review System
```

### **Content Types:**
- Single image posts (1:1, 16:9)
- Carousel posts (3 images)
- Story content (9:16)
- Video content (future integration)

---

## 🔗 **Integration Flow:**

```
Main Router ← → All workflows
Text Overlay ← → Image Creation
Review Manager ← → All content workflows
Ad Calculator ← → Facebook Intelligence data
Content Generator ← → Campaign specs
```

**Critical Dependencies:**
- Text Overlay must integrate with all image workflows
- Review Manager prevents infinite loops
- Main Router routes all user interactions

---

## ⚠️ **CRITICAL REQUIREMENTS:**

### **Text Overlay System:**
- Must support full arc curve range (-180° to 180°)
- Perfect Thai language rendering
- Mobile-first responsive design
- Integration with Cloudinary API
- Real-time preview functionality

### **Integration Quality:**
- All workflows must connect seamlessly
- Error handling for all API calls
- Proper status tracking throughout system
- User feedback at every step

This system restores CREMO's critical brand feature (arc curve text) while providing complete content workflow management.