# 💬 CLAUDE CODE SESSION 1 - START PROMPT
**Copy this prompt to start Claude Code ID #1**

---

Hi Claude Code! I need you to create 6 complete n8n workflows for CREMO's Facebook Intelligence system. This is Session 1 of a 2-part project.

## 🎯 **Your Mission:**
Build Facebook Intelligence automation system using provided patterns and specifications. Budget: ~75 credits.

## 📁 **Files You Must Read First:**
1. **QUICK_START.md** - Mission overview
2. **wf1_detail.md** - Content creation pattern (study this carefully)
3. **wf2_detail.md** - Image generation pattern (study this carefully)  
4. **SESSION_1_FACEBOOK_INTELLIGENCE.md** - Your 6 workflows to build
5. **TECHNICAL_IMPLEMENTATION.md** - Code patterns and examples

## 🛠️ **Important Instructions:**

### **Before Building Each Workflow:**
```
1. Use: n8n_search_nodes("relevant keywords", {limit: 5})
2. Study: 5 similar template workflows first
3. Use: n8n_get_node_essentials for specific nodes
4. DON'T use: n8n_get_workflow (too expensive)
```

### **Follow These Patterns Exactly:**
- WF1→WF2 auto-trigger chains (from wf1_detail.md and wf2_detail.md)
- Google Sheets integration patterns
- Status tracking: "pending" → "ready" → "approved"
- Field naming: content_id, linked_image_group, status

### **Your 6 Workflows to Build:**
1. **Facebook_Data_Collector** - APIFY → Google Sheets
2. **Media_Content_Analyzer** - AI Vision → Template creation
3. **Template_Scoring_System** - Rate templates → Store ratings
4. **Human_Campaign_Input** - User input → AI template selection
5. **Content_Stock_Generator** - Generate images → Drive storage
6. **Performance_Loop_Manager** - Analyze results → Learning loop

## 📊 **Google Sheets Integration:**
```javascript
// Use these placeholders (we'll update later):
SPREADSHEET_ID: "PLACEHOLDER_SPREADSHEET_ID"
Sheets: Facebook_Raw_Data, AI_Analysis_Results, Strategic_Intelligence, etc.
```

## 🎯 **Success Criteria:**
- All 6 workflows complete and validated
- Auto-trigger chains working (like WF1→WF2)
- Ready for deployment with only credential + sheet name updates
- Follow patterns from wf1_detail.md and wf2_detail.md exactly

## ❓ **Questions for You:**
1. Have you read all the required files?
2. Do you understand the WF1→WF2 pattern from the examples?
3. Are you ready to start with Facebook_Data_Collector workflow?

**Start when ready! Focus on following the proven patterns and ask if you need clarification on any specifications.**

---
Budget: ~75 credits | Session: 1 of 2 | Priority: Facebook Intelligence System