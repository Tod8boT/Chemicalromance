# Workflow Resource Doc (WRD) – Medium Template
**Best for:** 3-10 node workflows, workflows with sub-workflows, team collaboration

---

## 📋 Overview & Quick Access

| Field | Value |
|-------|-------|
| **Workflow ID** | `[workflow-id]` → Use `n8n_get_workflow_minimal(id)` |
| **n8n Instance** | `http://localhost:5678` or `https://your-instance.com` |
| **Purpose** | [One clear sentence: what problem does this solve?] |
| **Status** | ☐ Development ☐ Testing ☐ Production |

> 💡 **Auto-fetch basic info:** `n8n_get_workflow_minimal(id)` → Name, Active, Tags, Created/Updated dates

---

## 🎯 Goal & Success

**Primary Outcome:**  
[Measurable result - e.g., "Automates invoice processing, reducing time from 2 hours to 5 minutes"]

**Success Criteria:**
- [ ] [How do you know it worked? e.g., "Data appears in Google Sheets"]
- [ ] [What validates completion? e.g., "Slack notification sent"]

**Business Value:**  
⏱️ Time saved: [X hours/week]  
💰 Cost impact: [if applicable]

---

## 🔄 Workflow Architecture

> 💡 **Auto-fetch structure:** `n8n_get_workflow_structure(id)` → All nodes, connections, positions

### Visual Flow (Manual - draw from structure data)

```
[Trigger] → [Node 1] → [Node 2] → [Decision] → [Output]
              ↓                       ↓
         [Sub-WF 1]            [Sub-WF 2]
```

### Node Purpose Summary (Key nodes only)

| Node Name | Purpose | Critical Config |
|-----------|---------|-----------------|
| [Trigger] | Entry point | [e.g., Webhook path: /api/v1/data] |
| [Decision Node] | Routes logic | [e.g., IF status === 'active'] |
| [Key Integration] | Main action | [e.g., Saves to Google Sheets] |
| [Sub-WF Call] | Calls child workflow | [e.g., Workflow ID: abc123] |

**Full node list:** Use `n8n_get_workflow_structure(id)` - no need to duplicate here

### Related Workflows

| Workflow | ID | Relationship |
|----------|----|--------------| 
| [Sub-WF 1 Name] | `[id]` | Called by main workflow |
| [Sub-WF 2 Name] | `[id]` | Called conditionally |
| [Parent WF Name] | `[id]` | Calls this workflow |

---

## ⚙️ Configuration

### Trigger Setup
**Type:** [Webhook / Schedule / Event]  
**Critical Details:**
- Webhook path: `/webhook/[unique-path]`
- OR Schedule: `0 9 * * 1-5` (9 AM weekdays)

```bash
# Test command
curl -X POST https://[instance]/webhook/[path] \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Credentials (Reference only - stored in n8n)

| Purpose | Credential Name in n8n | Notes |
|---------|------------------------|-------|
| Google Sheets | `google-sheets-prod` | [Team/project shared] |
| Slack Bot | `slack-bot-cremo` | [Channel access needed] |
| API Key | `external-api-v2` | [Expires: YYYY-MM-DD] |

> ⚠️ **Don't store actual credentials here** - just reference names

### Key Settings

**Environment Variables:**
- `API_BASE_URL` = `https://api.example.com`
- `NOTIFICATION_CHANNEL` = `#alerts`

**Critical Node Configs:**
- [Node name]: timeout = 30s, retry = 3x
- [Node name]: batch size = 100 items

---

## 📊 Data Flow

### Input Schema (Document expected input)
```json
{
  "id": "string",
  "status": "active|inactive",
  "data": {
    "field1": "string",
    "field2": "number"
  }
}
```

### Output Schema (Document expected output)
```json
{
  "processed_id": "string",
  "result": "success|failed",
  "timestamp": "ISO8601"
}
```

### Critical Expressions (Document complex logic only)

> 💡 **Full expression audit:** Use `validate_workflow_expressions(workflow)` to check all expressions

**Key transformations:**
- [Node]: `{{ $json.data.field1.toUpperCase() }}`
- [Node]: `{{ $node["HTTP Request"].json.response.items }}`

### Decision Logic (Critical paths only)

**IF Node:** `[Node Name]`
- **TRUE** → [destination/action]
- **FALSE** → [destination/action]

**Switch Node:** `[Node Name]` (if applicable)
- Route [name]: [condition] → [destination]

> 💡 **Verify connections:** `validate_workflow_connections(workflow)` checks all paths

---

## 🛡️ Error Handling

> 💡 **Auto-detect issues:** `n8n_validate_workflow(id)` shows all error handling gaps

### Current Issues (from validation)
- [ ] [List critical errors from validator]
- [ ] [List warnings to address]

### Critical Node Error Configs (Non-standard only)

| Node | Error Behavior | Reason |
|------|----------------|--------|
| [Node] | Continue on fail | [Why? e.g., "Non-critical notification"] |
| [Node] | Retry 5x, 2s wait | [Why? e.g., "API rate limits"] |

**Standard nodes:** Default retry 3x, 1s wait (no need to list)

### Error Workflow
**Handler Workflow ID:** `[id]` or "None"  
**Notification Channel:** `#errors` or [email]

### Recovery Procedures
- **HTTP timeout:** [Action, e.g., "Use cached data"]
- **DB failure:** [Action, e.g., "Write to backup file"]
- **Auth failure:** [Action, e.g., "Alert admin immediately"]

---

## ✅ Testing & Validation

> 💡 **Pre-deploy check:** Run `n8n_validate_workflow(id)` before testing

### Test Scenarios (Document edge cases only)

| Scenario | Input | Expected | Tested |
|----------|-------|----------|--------|
| Happy path | [Sample] | [Result] | ☐ |
| Edge case 1 | [Sample] | [Result] | ☐ |
| Error case | [Sample] | [Error caught] | ☐ |

### Test Data Location
📁 **Files:** [Path/URL]  
🔗 **Collection:** [Postman/Insomnia URL]

**Quick test commands:**
```bash
# Test webhook
curl -X POST [webhook-url] -d '{"test":"data"}'

# Check last execution
n8n_list_executions({workflowId: "id", limit: 1})
```

---

## 🚀 Deployment

### Pre-Deploy Checklist
> Run these tools before activating:
- [ ] `n8n_validate_workflow(id)` → No critical errors
- [ ] `validate_workflow_connections(workflow)` → All paths valid
- [ ] `validate_workflow_expressions(workflow)` → Expressions correct
- [ ] Test with sample data → Success
- [ ] Sub-workflows activated (if any)

### Post-Deploy Monitoring

**Quick status check:**
```bash
n8n_get_workflow_minimal(id)  # Check active status
n8n_list_executions({workflowId: "id", limit: 5})  # Recent runs
```

**Monitoring Schedule:** [Daily / Weekly]  
**Success Rate Target:** >95%  
**Alert Rules:**
- Exec time >X min → [Action]
- Error rate >5% → [Action]

**Dashboard:** [URL to n8n/monitoring tool]

---

## 🔐 Security & Compliance

**Sensitive Data:** [List PII fields: email, phone, etc.]  
**Retention:** [Days/Weeks/Months]  
**Credential Rotation:** [Schedule]  
**Access Control:** [Team/Individuals with edit rights]

**Compliance Notes:** [GDPR / HIPAA / other requirements]

---

## 📚 Quick Reference & Tools

### Workflow Management Tools

```bash
# Get basic info
n8n_get_workflow_minimal("workflow-id")
# → Name, active status, tags, dates

# Get structure (nodes + connections)
n8n_get_workflow_structure("workflow-id")
# → Full architecture, no parameters

# Validate before deploy
n8n_validate_workflow("workflow-id")
# → Errors, warnings, suggestions

# Check connections only
validate_workflow_connections(workflow)
# → Connection issues

# Check expressions only  
validate_workflow_expressions(workflow)
# → Expression syntax errors

# Recent executions
n8n_list_executions({workflowId: "id", limit: 10})
# → Execution history
```

### Important Links

- 🔗 **n8n Instance:** [URL]
- 📊 **Dashboard:** [URL]
- 📖 **API Docs:** [URL]
- 🎯 **Project:** [Jira/Notion/etc]

### Support Contacts

- **Owner:** [Name] - [email] - [Slack]
- **Backup:** [Name] - [email]

### Critical Settings Reference

| Setting | Value |
|---------|-------|
| Workflow ID | `[id]` |
| Webhook Path | `/webhook/[path]` |
| Error Channel | `#errors` |
| Sub-Workflow IDs | `[id1]`, `[id2]` |

---

## 💡 Notes & Known Issues

> 💡 **Get current issues:** Run `n8n_validate_workflow(id)` for live status

**Known Issues:**
- [Issue from validator with fix plan]

**Rate Limits:**
- [System]: [limit] per [time]

**Dependencies:**
- [Critical dependency that must run first]

**Future Improvements:**
- [ ] [Planned enhancement]

---

## 📝 Change Log

| Date | Version | Changes | Author | Validation |
|------|---------|---------|--------|------------|
| YYYY-MM-DD | 1.0.0 | Initial creation | [Name] | ☐ Tools run ☐ Approved |

**After each change:**
1. Run `n8n_validate_workflow(id)`
2. Update version number
3. Document changes here

---

## 🔍 Troubleshooting

**Common Issues:**

| Problem | Check Command | Solution |
|---------|---------------|----------|
| Workflow not running | `n8n_get_workflow_minimal(id)` check `active` | Activate workflow |
| Connection errors | `validate_workflow_connections(workflow)` | Fix connection paths |
| Expression errors | `validate_workflow_expressions(workflow)` | Fix syntax |
| Missing validation | `n8n_validate_workflow(id)` | Address errors/warnings |

---

**Template Version:** 2.0.0 (Optimized - Tool-First Approach)  
**Key Change:** Removed redundant data - use MCP tools instead  
**Token Savings:** ~60% reduction in file size
