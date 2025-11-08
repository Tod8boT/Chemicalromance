# Communication Templates

## 📤 OUTPUT Format - Teams → Coordinator

### **Progress Report Template:**
```markdown
# [TEAM_ID] Progress Report - [Date]

## Completed
- [x] Task description - Brief outcome

## In Progress  
- [ ] Task description - Current status, % complete

## Blockers
- Issue: Description
- Impact: How it affects timeline  
- Request: Specific help needed

## Questions
1. Question about workflow validation
2. Question about integration requirements

## Next Steps
- Priority task for next period
- Dependencies needed from other teams
```

### **Deliverable Handoff Template:**
```markdown
# [TEAM_ID] Deliverable - [Date]

## Summary
Brief description of completed work

## Files Ready for Deployment
- [ ] workflow.json - Tested locally ✅
- [ ] component.js - Error handling added ✅
- [ ] config.md - Requirements documented ✅

## Integration Points
- Connects to: [other workflows]
- Requires: [credentials/environment]
- Outputs: [data format/destination]

## Testing Completed
- [ ] Logic validation ✅
- [ ] Error scenarios ✅  
- [ ] Performance testing ✅

## Deployment Notes
Critical setup instructions for coordinator

## Post-Deployment Testing
How to verify it works in production
```

---

## 📥 INPUT Format - Coordinator → Teams

### **Assignment Template:**
```markdown
# [TEAM_ID] Assignment - [Date]

## Priority Task
**What:** Clear task description
**Why:** Business impact/urgency
**When:** Deadline and dependencies

## Requirements
- Technical specifications
- Integration requirements  
- Performance targets

## Resources Provided
- Data access granted
- Credentials available
- Reference documentation

## Success Criteria
How we'll know it's done correctly

## Questions/Clarifications
Coordinator responses to team questions
```

### **Data Request Template:**
```markdown
# Data Request for [TEAM_ID] - [Date]

## Data Provided
- File: [filename.csv] 
- Structure: [column descriptions]
- Sample: [preview of data]

## Access Instructions
- Location: [path/URL]
- Permissions: [what team can do]
- Updates: [how often data refreshes]

## Usage Guidelines
- Privacy requirements
- Data retention policies
- Sharing restrictions

## Support
Contact method for data issues
```

---

## 🔄 Status Update Cycle

### **Daily (CC_CREATIVE)**
- Update PROJECT_STATUS.md
- Report progress on UI/UX work
- Flag any integration questions

### **Weekly (CC_INTEL)**  
- Update PROJECT_STATUS.md
- Share insights discovered
- Request additional data if needed

### **As Needed (Coordinator)**
- Update STATUS_UPDATE.md
- Respond to team questions
- Provide data access and validation

---

## 🚨 Emergency Communication

### **Critical Issues:**
Create: `URGENT_[issue]_[date].md`

**Format:**
```markdown
# URGENT: [Issue Description]

## Impact
What's broken and business effect

## Attempted Solutions
What has been tried already

## Immediate Need
Specific help required from coordinator

## Timeline
How urgent (hours/days)
```

---

**Use these templates consistently to maintain clear communication between all teams.**