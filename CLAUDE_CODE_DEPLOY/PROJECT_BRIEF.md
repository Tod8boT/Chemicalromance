# 🚀 CREMO PROJECT - WORKFLOW DEPLOYMENT
**Target:** Claude Code AI Agent  
**Mission:** Create Complete Facebook Intelligence + Text Overlay System  
**Budget:** 150 credits (75 per session)  
**Timeline:** 2 sessions, immediate deployment

---

## 🎯 **PROJECT OVERVIEW**

### **Business Goal:**
Transform CREMO ice cream brand from manual content creation → AI-driven market intelligence + automated content generation with text overlay customization.

### **System Architecture:**
```
Facebook Intelligence → AI Analysis → Template Selection → Content Generation → Text Overlay → Performance Loop
```

---

## 📊 **SESSION 1: FACEBOOK INTELLIGENCE SYSTEM**
**Budget: ~75 credits**  
**Priority: P1 - Strategic Intelligence**

### **6 Workflows to Create:**

#### **1. Facebook_Data_Collector**
- **Function:** APIFY → Google Sheets (Facebook_Raw_Data)
- **Pattern:** Like WF1 (Read source → Process → Write destination)
- **Schedule:** Daily 2 AM
- **Fields:** page_id, ad_id, post_text, image_url, engagement_rate

#### **2. Media_Content_Analyzer** 
- **Function:** AI Vision analysis → Template creation
- **Pattern:** Like WF2 (Read → AI Process → Auto-trigger next)
- **AI Models:** GPT-4o for image/video analysis
- **Output:** AI_Analysis_Results sheet

#### **3. Template_Scoring_System**
- **Function:** Rate templates → Store ratings → Performance tracking
- **Pattern:** Validation logic like WF2
- **Output:** Strategic_Intelligence sheet with scores

#### **4. Human_Campaign_Input**
- **Function:** User input (date + objective) → AI selects best templates
- **Trigger:** Manual via Telegram
- **Process:** Query ratings → Recommend template/test options

#### **5. Content_Stock_Generator**
- **Function:** Generate 2x images → Store in Drive → Telegram notification  
- **Pattern:** Like WF2 image generation
- **Output:** Stock images ready for campaigns

#### **6. Performance_Loop_Manager**
- **Function:** Analyze results → Delete poor templates → Start new cycle
- **Pattern:** Validation + Auto-trigger like WF2
- **Features:** Auto-cleanup + learning loop

---

## 🖼️ **SESSION 2: TEXT OVERLAY + REVIEW SYSTEM**
**Budget: ~75 credits**  
**Priority: P0 - Critical Brand Feature**

### **Key Requirements for Text Overlay:**
⭐ **CRITICAL FEATURE - Build with Maximum Quality**
- Arc curve (-180° to 180°) - Brand identity feature
- Thai language support (UTF-8)
- Mobile-optimized touch interface
- Integration with existing workflow patterns

### **7 Workflows to Create:**

#### **1. Main_Telegram_Router (FIXED)**
- **Function:** Hub + Check_post functionality  
- **Base:** Existing workflow patterns from WF1-WF2
- **Integration:** Route to all subsystems

#### **2. Create_Image_No_Template**
- **Function:** Base image generation (first round)
- **Pattern:** Follow WF2 image creation logic

#### **3. Create_Image_With_Template**  
- **Function:** Apply templates → Replace mockup → Real product
- **Pattern:** WF2 + Drive storage integration

#### **4. Text_Overlay_Processor ⭐⭐⭐**
- **Function:** Add text to images with arc curve + Thai support
- **Priority:** MAXIMUM QUALITY - This is the core brand feature
- **Features:** Arc curve, Thai fonts, mobile UX, Cloudinary integration

#### **5. Work_Review_Manager**
- **Function:** Review cycle → Prevent infinite loops
- **Features:** Max 3 cycles → Auto-approve → Track history

#### **6. Ad_Boost_Calculator** 
- **Function:** Budget recommendation based on historical data
- **Integration:** Facebook Intelligence data analysis

#### **7. Content_Generator**
- **Function:** Create content → Link to image workflows
- **Integration:** Campaign specs → Content creation

---

## 🛠️ **TECHNICAL SPECIFICATIONS**

### **Google Sheets Integration:**
```javascript
// Use these PLACEHOLDER values - we'll update after
const SPREADSHEET_ID = "PLACEHOLDER_SPREADSHEET_ID";
const SHEETS = {
  facebook_raw: "Facebook_Raw_Data",
  ai_analysis: "AI_Analysis_Results", 
  strategic: "Strategic_Intelligence",
  cost_analytics: "Cost_Analytics",
  market_trends: "Market_Trends"
};
```

### **Credentials (we'll configure):**
- google_sheets_oauth
- telegram_bot_token
- cloudinary_api  
- apify_token
- openai_api_key
- claude_api_key

### **Field Patterns (from existing WFs):**
```javascript
// Follow WF1-WF2 patterns:
content_id: `day${date}_content`
linked_image_group: `day${date}_img_group`  
status: "pending" → "ready" → "approved"
```

---

## 📋 **IMPORTANT INSTRUCTIONS**

### **🔍 Before Creating Each Workflow:**
```
1. Use n8n-mcp:search_nodes to find 5 similar template workflows
2. Study existing patterns before building new logic
3. Follow WF1-WF2 integration patterns exactly
4. Test all field mappings against sheet structures
```

### **💡 Development Strategy:**
- **Session 1:** Focus on data flow and AI integration
- **Session 2:** Focus on user interface and text overlay quality
- **Integration:** Use executeWorkflow patterns from WF1→WF2
- **Error Handling:** Include retry logic and validation

### **⚠️ Token Management:**
- Use search_nodes instead of get_workflow when possible
- Reference provided patterns instead of recreating logic
- Batch workflow creation to minimize API calls
- Focus on core functionality first

### **🎯 Success Criteria:**
- All workflows deployable with only credential + sheet name updates
- Text overlay system working with arc curve + Thai support
- Facebook intelligence system providing weekly reports
- Complete integration between all components

---

## 📁 **FILES PROVIDED:**
- wf1_detail.md - Content creation pattern
- wf2_detail.md - Image generation pattern  
- wf_master_index.md - System overview
- CSV templates - Google Sheets structure
- Integration specifications

---

**🚀 Ready to build the complete CREMO automation system!**
**Start with Session 1 (Facebook Intelligence) when ready.**