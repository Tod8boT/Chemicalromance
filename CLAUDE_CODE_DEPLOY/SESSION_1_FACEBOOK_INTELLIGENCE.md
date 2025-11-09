# 📊 FACEBOOK INTELLIGENCE WORKFLOWS
**Session 1 Target - 6 Workflows**

---

## 1️⃣ **Facebook_Data_Collector**

### **Function:**
Daily APIFY scraping → Clean data → Store in Google Sheets

### **Workflow Pattern:**
```
Schedule Trigger (Daily 2 AM)
    ↓
APIFY Facebook Ad Library
    ↓
Data Cleaning & Validation
    ↓
Batch Write to Google Sheets (Facebook_Raw_Data)
    ↓
Auto-trigger: Media_Content_Analyzer
```

### **Key Fields:**
- timestamp, page_id, page_name, post_id, post_text
- engagement_rate, ad_id, ad_text, image_url, video_url  
- target_audience, budget, performance_data (JSON)

---

## 2️⃣ **Media_Content_Analyzer**

### **Function:**  
AI Vision analysis → Extract insights → Create prompt templates

### **Workflow Pattern:**
```
Triggered by: Facebook_Data_Collector
    ↓
Read Facebook_Raw_Data (latest batch)
    ↓
For each image/video URL:
    ├─ GPT-4o Vision Analysis
    ├─ Extract: style, colors, composition, text
    └─ Generate: prompt template + insights
    ↓
Write AI_Analysis_Results sheet
    ↓
Auto-trigger: Template_Scoring_System
```

### **AI Analysis Output:**
- analysis_id, source_data_id, ai_model
- summary, rewritten_copy, image_prompt, video_prompt
- confidence_score, created_date

---

## 3️⃣ **Template_Scoring_System**

### **Function:**
Score templates → Rate performance → Store for AI selection

### **Workflow Pattern:**
```
Triggered by: Media_Content_Analyzer
    ↓
Read AI_Analysis_Results (latest)
    ↓
Scoring Algorithm:
    ├─ Engagement prediction (AI)
    ├─ CREMO brand alignment
    ├─ Thai market relevance
    └─ Technical feasibility
    ↓
Write Strategic_Intelligence sheet
    ↓
Update template ratings database
```

### **Scoring Output:**
- opportunity_id, category, priority, test_idea
- expected_impact, success_metrics, implementation_notes
- template_score (0-100), brand_compliance (0-100)

---

## 4️⃣ **Human_Campaign_Input**

### **Function:**
User defines campaign → AI recommends best templates

### **Workflow Pattern:**
```
Telegram Bot Input:
    ├─ Campaign date
    ├─ Objective (sales/awareness/engagement)
    └─ Target audience
    ↓
Query Strategic_Intelligence (by scores)
    ↓
AI Agent Selection:
    ├─ Best performing templates
    ├─ Untested templates for A/B
    └─ Media type recommendations
    ↓
Generate Campaign_Specs
    ↓
Auto-trigger: Content_Stock_Generator
```

### **Campaign Specs:**
- campaign_id, selected_templates[], media_types[]
- target_metrics, budget_recommendation, timeline

---

## 5️⃣ **Content_Stock_Generator**

### **Function:**
Generate images (2 rounds) → Store stock → Notification

### **Workflow Pattern:**
```
Triggered by: Human_Campaign_Input
    ↓
Get Campaign_Specs
    ↓
For each selected template:
    ├─ Round 1: Base image generation
    ├─ Round 2: CREMO template application
    ├─ Store in Google Drive
    └─ Log in Content_Stock sheet
    ↓
All complete → Telegram notification:
"📸 Content stock ready! {count} images generated"
    ↓
Auto-trigger: Performance_Loop_Manager (after 24h)
```

### **Stock Output:**
- stock_id, campaign_id, template_id
- image_url, drive_file_id, generation_date
- status: "generated" → "used" → "analyzed"

---

## 6️⃣ **Performance_Loop_Manager**

### **Function:**
Collect results → Clean poor templates → Start new cycle

### **Workflow Pattern:**
```
Triggered by: Timer (24h after Content_Stock_Generator)
    ↓
Collect Performance Data:
    ├─ Engagement metrics
    ├─ User feedback
    └─ Campaign results
    ↓
Update Template Scores:
    ├─ Boost successful templates (+10 points)
    ├─ Penalize poor templates (-15 points)
    └─ Delete templates < 20 points
    ↓
Generate Weekly Report
    ↓
Store Learning Data
    ↓
Auto-trigger: Facebook_Data_Collector (new cycle)
```

### **Learning Output:**
- performance_report_id, cycle_date
- templates_deleted[], templates_boosted[]
- insights[], recommendations[]
- next_cycle_focus

---

## 🔗 **Integration Flow:**

```
1 → 2 → 3 → 4 (user input) → 5 → 6 → 1 (loop)
```

**Auto-triggers:** Each workflow triggers the next automatically  
**Manual trigger:** Only step 4 (Human_Campaign_Input) requires user interaction  
**Loop completion:** 7-day cycle for continuous improvement

---

## 📋 **Google Sheets Required:**

1. **Facebook_Raw_Data** - APIFY output
2. **AI_Analysis_Results** - Vision analysis
3. **Strategic_Intelligence** - Template ratings
4. **Campaign_Specs** - User campaigns  
5. **Content_Stock** - Generated images
6. **Performance_Analytics** - Results tracking

**All sheets use CSV template structure provided.**