# Workflow Resource Doc (WRD) – update_chat_history

---

## 📋 Overview & Quick Access

| Field | Value |
|-------|-------|
| **Workflow ID** | `ivH0Zqdu7MxRctyx` |
| **n8n Instance** | `http://localhost:5678` |
| **Purpose** | Stores chat conversations to Google Sheets and Supabase vector DB for AI retrieval, manages customer status updates |
| **Status** | ☐ Development ☑ Testing ☐ Production |

> 💡 **Auto-fetch:** `n8n_get_workflow_minimal("ivH0Zqdu7MxRctyx")`

---

## 🎯 Goal & Success

**Primary Outcome:**  
Maintains dual-storage conversation history (Google Sheets + Supabase Vector DB) enabling AI context retrieval and automated customer status tracking.

**Success Criteria:**
- [x] Stores every conversation in Chat_History sheet
- [x] Embeds conversations in Supabase for RAG retrieval
- [x] Updates customer status based on intent
- [x] Sends Telegram alerts for critical events

**Business Value:**  
⏱️ Time saved: Automated history vs manual logging  
🧠 AI context: Personalized responses based on history  
🎯 Sales tracking: Automatic status updates

---

## 🔄 Workflow Architecture

> 💡 **Auto-fetch:** `n8n_get_workflow_structure("ivH0Zqdu7MxRctyx")`

### Visual Flow

```
[Start] → [If2: Intent Valid?]
            ↓ YES                    ↓ NO
          [If1]              [change_human + Notify handoff]
      ↙️        ↘️                     ↓
[clear sale]  [chat_update]     [chat_update]
     ↓             ↓
[Close sale   [Code JS: Clean text] → [merge_chat_data]
 notify]            ↓                        ↓
                [return]          [Supabase Vector Store]
                                        ↓
                                    [return]
```

### Node Purpose Summary

| Node | Purpose | Critical Config |
|------|---------|-----------------|
| **If2** | Filters valid intents | Excludes: Unknown/No info/Meaningless |
| **If1** | Detects close sale | Intent === "customer_provides_contact" |
| **clear sale** | Updates status | Google Sheets → "success" |
| **change_human** | Updates status | Google Sheets → "Handoff" |
| **chat_update** | Stores conversation | Appends to Chat_History sheet |
| **Supabase Vector Store** | Embeds conversation | Table: documents, Mode: insert |

**Total nodes:** 14 → Use `n8n_get_workflow_structure()` for complete list

### Related Workflows

| Workflow | ID | Relationship |
|----------|----|--------------| 
| admin_chatbot | d2eLn9JqPAFVEewg | Calls this workflow after AI response |
| check_customer | pfjGV4IDkfGR10YP | Provides intent classification |

---

## ⚙️ Configuration

### Trigger Setup
**Type:** Execute Workflow Trigger (Sub-workflow)  
**Input Schema:**
```json
{
  "output_Response": "AI response text",
  "output_intent": "Intent classification", 
  "chatMsg": "Customer message",
  "psid": "Facebook user ID"
}
```

### Credentials (Reference only)

| Purpose | Credential Name | Notes |
|---------|----------------|-------|
| Google Sheets | Google Sheets account | adminpage spreadsheet |
| Supabase | Supabase account | Vector database |
| Cohere API | CohereApi account | Embeddings: embed-multilingual-v3.0 |
| Telegram | Telegram callbacl | Team notifications |

### Key Settings

**Google Sheets:**
- Document ID: `1qIBK-mLcjRxW4yKunqr4pFIlj42MQdAx0Op8KFR338M`
- Sheets: Chat_History (gid=1271080263), customer_check (gid=0)

**Supabase Vector Store:**
- Table: `documents`
- Metadata: `{psid, date, fileName: "psid"}`

**Intent Filtering:**
- VALID: All except exclusion list → Store in history
- EXCLUDED: Unknown/No info/Meaningless → Trigger handoff
- SPECIAL: customer_provides_contact → Status "success"

---

## 📊 Data Flow

### Output Schema
```json
{
  "psid": "string",
  "message": "string",
  "intent": "string",
  "response-respawn": "string"
}
```

### Critical Logic

**Text Cleaning (Code JS):**
```javascript
text.replace(/\|/g, '')      // Remove pipes
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
```

**Customer Status Updates:**
- `customer_provides_contact` → "success" + Telegram alert
- `Unknown/No info/Meaningless` → "Handoff" + Telegram alert

### Decision Paths

**If2:** Valid intent → Continue | Invalid → change_human  
**If1:** Close sale → clear sale | Other → chat_update only

---

## 🛡️ Error Handling

> 💡 **Validate:** `n8n_validate_workflow("ivH0Zqdu7MxRctyx")`

### Current Status
**No critical errors detected**

### Critical Node Configs

| Node | Error Behavior | Reason |
|------|----------------|--------|
| Google Sheets | Default (fail) | Data consistency critical |
| Telegram | continueOnFail: true | Non-blocking notifications |
| Supabase | Default (fail) | Essential for AI retrieval |

**Standard:** Retry 3x, 1s wait

### Recovery
- **Google Sheets failure:** Retry 3x → Escalate (data loss risk)
- **Supabase failure:** Retry 3x, Sheets remains backup
- **Telegram failure:** Log but continue

---

## ✅ Testing & Validation

> 💡 **Pre-test:** `n8n_validate_workflow("ivH0Zqdu7MxRctyx")`

### Test Scenarios

| Scenario | Input Intent | Expected Outcome |
|----------|-------------|------------------|
| Normal conversation | "Inquiry" | Stored in both systems |
| Close sale | "customer_provides_contact" | Status→success, Telegram alert |
| Invalid intent | "Unknown intention" | Status→Handoff, Telegram alert |
| Text with formatting | Response: "Hello\|World" | Cleaned before storage |

### Quick Test
```bash
n8n_get_workflow_minimal("ivH0Zqdu7MxRctyx")
n8n_list_executions({workflowId: "ivH0Zqdu7MxRctyx", limit: 10})
```

---

## 🚀 Deployment

### Pre-Deploy Checklist
- [ ] `n8n_validate_workflow("ivH0Zqdu7MxRctyx")` → No errors
- [ ] Google Sheets accessible (Chat_History columns correct)
- [ ] Supabase configured (documents table exists)
- [ ] Cohere API valid (quota available)
- [ ] Telegram bot configured
- [ ] Test dual storage functionality

### Activation
```bash
n8n_update_partial_workflow({
  id: "ivH0Zqdu7MxRctyx",
  operations: [{
    type: "updateSettings",
    settings: { active: true, executionOrder: "v1" }
  }]
})
```

### Monitoring
**Target:** >99% success (data integrity critical)  
**Alerts:**
- Storage failure >1% → Check credentials
- Vector embedding fails → Check Cohere quota
- Google Sheets errors → Check permissions

---

## 🔐 Security & Compliance

**Sensitive Data:** Complete conversation history, customer PSIDs, intent classifications  
**Retention:** Indefinite (manual cleanup required)  
**Access:** mamon avarice (greed2mamon@gmail.com)  
**Compliance:** PDPA (Thailand) - customer data stored

---

## 📚 Quick Reference

### Management Commands
```bash
# Status check
n8n_get_workflow_minimal("ivH0Zqdu7MxRctyx")

# Validation
n8n_validate_workflow("ivH0Zqdu7MxRctyx")

# Recent activity
n8n_list_executions({workflowId: "ivH0Zqdu7MxRctyx", limit: 10})
```

### Links
- 📊 **Workflow:** http://localhost:5678/workflow/ivH0Zqdu7MxRctyx
- 📋 **Google Sheet:** [Link](https://docs.google.com/spreadsheets/d/1qIBK-mLcjRxW4yKunqr4pFIlj42MQdAx0Op8KFR338M/)
- 💬 **Telegram:** -1002924884874

### Critical Settings

| Setting | Value |
|---------|-------|
| Workflow ID | `ivH0Zqdu7MxRctyx` |
| Google Sheet ID | `1qIBK-mLcjRxW4yKunqr4pFIlj42MQdAx0Op8KFR338M` |
| Supabase Table | `documents` |
| Embedding Model | `embed-multilingual-v3.0` |

---

## 💡 Notes & Known Issues

**Rate Limits:**
- Cohere: 1000 req/min (free tier)
- Google Sheets: 300 req/min per project

**Future Improvements:**
- [ ] Auto data retention policy
- [ ] Conversation analytics
- [ ] GDPR/PDPA deletion workflow

**Dependencies:**
1. Supabase accessible (AI context)
2. Cohere API quota (embeddings)
3. Google Sheets writable (persistence)

---

## 🔍 Troubleshooting

| Problem | Check | Solution |
|---------|-------|----------|
| History not stored | Execution logs | Verify input format |
| Vector search fails | Query Supabase | Check embeddings |
| Sheets permission error | Test credentials | Renew OAuth |
| Duplicate entries | Check Chat_History | Expected behavior |

**Debug:**
```bash
n8n_get_execution({id: "last-id", mode: "full"})
```

---

**Template Version:** 2.0.0  
**Created:** 2025-10-31  
**Owner:** mamon avarice

Conceived by Romuald Członkowski - [www.aiadvisors.pl/en](https://www.aiadvisors.pl/en)
