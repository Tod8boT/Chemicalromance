# 🔄 REFERENCE WORKFLOWS - STUDY THESE FIRST
**For Claude Code: Learn from existing patterns before creating new ones**

---

## ✅ **WORKING WORKFLOWS - COPY THESE PATTERNS**

### **1. Text Overlay System (PRIORITY 1 - PERFECT THIS)**
```
Workflow ID: BrEps7QE3eBia4U4
Name: Text Overlay Simple
Status: ✅ WORKING (8 nodes)
Pattern: Form → HTML → Values → Submit → URL → Photo
Key Features: Arc curve (-180° to 180°), Thai text, mobile-optimized
```
**Claude Code Task:** Study this workflow structure and CREATE ENHANCED VERSION with:
- Better UI/UX
- More font options  
- CREMO brand colors (#ffdd17, #17539f)
- Enhanced arc curve precision

### **2. Facebook Intelligence (SESSION 1 - 50% DONE)**

#### **Workflow A: APIFY Facebook Scraper**
```
Workflow ID: EGoXsM5lI8hhGNz3  
Name: APIFY Facebook Ad Library Scraper
Status: ✅ WORKING (24 nodes)
Pattern: APIFY → Process → Google Sheets
```

#### **Workflow B: AI Analysis**
```
Workflow ID: 9AxbvFjt6D5PTQMn
Name: AI Facebook Ad Spy Tool
Status: ✅ WORKING (33 nodes) 
Pattern: Input → AI Vision → AI Text → Google Sheets
Features: Image/Video/Text analysis with OpenAI + Gemini
```

#### **Workflow C: A/B Testing**
```
Workflow ID: tEOYKf88Pi5VzjSO
Name: Facebook Ad Analysis & A/B Testing  
Status: ✅ WORKING (12 nodes)
Pattern: Analysis → Testing → Results
```

**Claude Code Task:** Study these 3 workflows → CREATE 3 NEW workflows to complete the system:
4. Human Campaign Input
5. Content Stock Generator  
6. Performance Monitor + Loop

### **3. Image Generation (SESSION 2 - PATTERNS READY)**

#### **Template-Based Generation:**
```
Workflow ID: FX17QqYlrta6GyaA
Name: create_image_with_templete
Status: ✅ WORKING (35 nodes)
Pattern: Input → Template → Fal.AI → Cloudinary → Output
```

#### **Freeform Generation:**
```
Workflow ID: rbs62NZXnwP3FtPq  
Name: create_image_no_templete
Status: ✅ WORKING (36 nodes)
Pattern: Input → AI Prompt → Fal.AI → Cloudinary → Output
```

**Claude Code Task:** Study these patterns → CREATE INTEGRATED system with Main Router

---

## ❌ **BROKEN WORKFLOWS - FIX OR REPLACE**

### **Main Router (CRITICAL ISSUE)**
```
Workflow ID: QvgQdZ81AemlcpxE
Name: telegram_workflow  
Status: ❌ INACTIVE (18 nodes)
Issue: Missing integration with Text Overlay
```
**Claude Code Task:** Study this workflow → CREATE FIXED VERSION that properly integrates with Text Overlay system

---

## 🎯 **LEARNING STRATEGY**

### **Before Creating Each New Workflow:**
1. **Use:** `n8n_get_workflow_structure(REFERENCE_ID)` to study pattern
2. **Identify:** Input → Process → Output flow
3. **Copy:** Node types and connection patterns  
4. **Enhance:** Add your improvements
5. **Test:** Ensure all connections work

### **Token Optimization:**
- Study reference workflows FIRST (cheaper than experimenting)
- Copy proven node patterns
- Only create NEW logic where needed
- Use `n8n_search_nodes` instead of `n8n_get_workflow` when possible

### **Quality Standards:**
- **Text Overlay:** Must be PERFECT (Arc curve + Thai + Mobile)
- **Facebook Intelligence:** Must handle real data volumes  
- **Image Generation:** Must integrate seamlessly
- **All Workflows:** Must be ready to deploy with just credentials + sheet names

---

## 📋 **REFERENCE DATA**

### **Google Sheets Structure (Use These Names):**
- **Facebook_Raw_Data** - APIFY scraper output
- **AI_Analysis_Results** - AI analysis output  
- **Strategic_Intelligence** - A/B testing output
- **Template_Library** - Template storage
- **Content_Stock** - Generated content storage
- **Performance_Data** - Campaign results

### **Key Credentials (Names to Use):**
- `TELEGRAM_BOT_TOKEN` - For all Telegram nodes
- `GOOGLE_SHEETS_SERVICE_ACCOUNT` - For all Sheets access
- `CLOUDINARY_API` - For image processing
- `FAL_AI_KEY` - For image generation
- `OPENAI_API_KEY` - For AI analysis

---

**Study these workflows thoroughly before creating new ones!** 🚀
