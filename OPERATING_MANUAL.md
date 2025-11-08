# n8n Workflow Coordinator - Operating Manual
**Role:** n8n Workflow Architect & MCP Integration Specialist  
**Updated:** 2025-11-08  
**For:** Other Claude chats handling this project

---

## 🎯 My Primary Role & Responsibilities

### **WHO I AM:**
- **ONLY person** with n8n MCP tools access
- **Workflow validation** specialist before deployment
- **System integration** coordinator
- **Final quality gate** before production

### **WHAT I DO:**
1. ✅ **Receive deliverables** from Claude Code teams
2. ✅ **Validate & Review** all workflows before deploy  
3. ✅ **Deploy to n8n** via MCP tools
4. ✅ **Test & Debug** in production environment
5. ✅ **Create documentation** (WRD format)
6. ✅ **Coordinate** between teams

### **WHAT I DON'T DO:**
- ❌ Write JavaScript from scratch (Claude Code's job)
- ❌ Create Excel/CSV files (Claude Code's job)
- ❌ Design UI/UX (not my responsibility)
- ❌ Deploy without validation

---

## 📂 Project Structure

```
D:\Claude-project\n8n_Claude\
├── CC_CREATIVE/           ← Claude Code Creative Team
├── CC_INTEL/              ← Claude Code Intelligence Team
├── COORDINATOR/           ← My workspace
├── JOB_*.md               ← Job documentation  
├── WORKFLOW_QUICK_REFERENCE.md
└── CLAUDE_CODE_TEMPLATE.md
```

---

## 🔄 Workflow Process

### **Phase 1: Team Assignment**
Claude Code teams work in parallel:
- **CC_CREATIVE:** Image/video/overlay workflows
- **CC_INTEL:** Analytics/research/optimization workflows

### **Phase 2: Development & Handoff**
Teams deliver via standardized files in their folders:
- `DELIVERABLE_[date].md` - Main deliverable description
- `[workflow_name].json` - n8n workflow files
- `[code_name].js` - JavaScript files (if needed)
- `CONFIG_REQUIREMENTS.md` - Setup requirements

### **Phase 3: My Validation Process**
1. **Read** team deliverables
2. **Validate** workflow JSON structure
3. **Test** logic and connections  
4. **Deploy** to n8n via MCP
5. **Document** in WRD format
6. **Report** back to teams

### **Phase 4: Integration & Testing**
1. **Cross-team** dependency testing
2. **End-to-end** user journey validation
3. **Performance** optimization
4. **Production** deployment

---

## 📋 Current Job Categories

### **TELEGRAM_ROUTER** 
- `ROUTER_MAIN_TG` - Main telegram message router
- Status: ❌ Inactive (Priority 1)

### **TEXT_OVERLAY**
- `TEXT_OVERLAY_SIMPLE_FORM` - Interactive text overlay system  
- Status: ❌ Inactive (Brand-critical)

### **IMAGE_GENERATION** 
- Managed by CC_CREATIVE team
- Integration with ROUTER & TEXT_OVERLAY

### **DATA_INTELLIGENCE**
- Managed by CC_INTEL team
- Analytics, A/B testing, optimization

---

## 🚨 Critical Status

**SYSTEM DOWN:** All workflows currently inactive
- Telegram bot not responding to users
- Image generation not working  
- Text overlay feature missing
- No analytics data collection

**IMMEDIATE PRIORITIES:**
1. Activate ROUTER_MAIN_TG
2. Activate TEXT_OVERLAY_SIMPLE_FORM
3. Coordinate team deliverables
4. Test end-to-end integration

---

## 🤝 How to Work with Me

### **If you're coordinating workflows:**
1. Check `COORDINATOR/STATUS_UPDATE.md` for current state
2. Read team deliverables in `CC_*/` folders
3. Update me via new files, don't modify existing ones
4. Use standardized communication format

### **If you're handling Claude Code coordination:**
1. Use `CC_CREATIVE/` and `CC_INTEL/` folder templates
2. Follow deliverable format requirements
3. Include all necessary files and documentation
4. Test locally before handoff to me

### **Communication Protocol:**
- ✅ **Create new files** for updates
- ✅ **Use standardized formats**
- ✅ **Include complete context**
- ❌ **Don't modify** my working files
- ❌ **Don't assume** previous context

---

## 🎯 Success Criteria

**My job is successful when:**
1. ✅ All workflows deployed without errors
2. ✅ End-to-end user journey works
3. ✅ Teams can work independently  
4. ✅ System runs at >80% performance
5. ✅ Documentation complete and accurate

**Project is successful when:**
- 📱 Telegram bot responds instantly
- 🎨 Users can create images with brand-consistent overlays
- 📊 Analytics provide actionable insights
- 🔄 System self-optimizes based on data

---

## 📞 Emergency Contact

**If workflows are broken:**
1. Check execution logs in n8n
2. Verify credentials and environment variables
3. Test individual nodes before full workflow
4. Document errors with specific node details

**If teams need coordination:**
1. Create status update in COORDINATOR/ 
2. Include specific blockers and dependencies
3. Provide timeline estimates
4. Request specific resources needed

---

**Remember:** I'm the **only one** with n8n MCP access. All workflow changes MUST go through me for deployment. Teams focus on development, I handle production deployment and validation.

---

**Last Updated:** 2025-11-08  
**Next Review:** After team deliverables received