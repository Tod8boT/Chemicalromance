# 📋 DEPLOYMENT INSTRUCTION SUMMARY
**Quick Reference for Claude Code**

---

## 🎯 **MISSION:**
Create 13 complete n8n workflows (6 + 7) for CREMO automation system in 2 sessions.

---

## 📁 **FILES TO READ:**
1. **PROJECT_BRIEF.md** - Full project context
2. **SESSION_1_FACEBOOK_INTELLIGENCE.md** - 6 workflows (75 credits)
3. **SESSION_2_TEXT_OVERLAY_SYSTEM.md** - 7 workflows (75 credits)  
4. **TECHNICAL_IMPLEMENTATION.md** - Patterns and code examples
5. **wf1_detail.md** + **wf2_detail.md** - Proven workflow patterns

---

## ⚠️ **CRITICAL INSTRUCTIONS:**

### **🔍 Before Each Workflow:**
```
1. Use: n8n_search_nodes("relevant keywords", {limit: 5})
2. Study: 5 similar template workflows  
3. Use: n8n_get_node_essentials for specific nodes
4. Avoid: n8n_get_workflow (too expensive)
```

### **⭐ TEXT OVERLAY PRIORITY:**
- **Maximum quality required** - Core brand feature
- Arc curve (-180° to 180°) = Brand identity
- Thai language support = Business requirement
- Mobile optimization = User experience critical

### **💰 Token Management:**
- Session 1: ~75 credits (Facebook Intelligence)
- Session 2: ~75 credits (Text Overlay + Review)
- Use search/essentials instead of get_workflow
- Batch operations when possible

---

## 🎯 **SUCCESS CRITERIA:**
- All workflows deployable with only:
  - Credential configuration  
  - Google Sheet names
- Text overlay working perfectly
- Auto-trigger chains complete
- Error handling included

---

## 📊 **GOOGLE SHEETS:**
Use PLACEHOLDER_SPREADSHEET_ID - we'll update after CSV import.

**Sheets:** Facebook_Raw_Data, AI_Analysis_Results, Strategic_Intelligence, Cost_Analytics, Market_Trends

---

## 🔗 **PATTERN REFERENCES:**
Follow WF1→WF2 auto-trigger pattern:
- Read source → Process → Write destination → Auto-trigger next
- Status tracking: "pending" → "ready" → "approved"
- Field naming: content_id, linked_image_group, status

---

**🚀 START SESSION 1 WHEN READY!**