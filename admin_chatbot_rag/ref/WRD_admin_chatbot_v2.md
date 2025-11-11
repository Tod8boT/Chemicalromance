# Workflow Resource Doc (WRD) – admin_chatbot

---

## 📋 Overview & Quick Access

| Field | Value |
|-------|-------|
| **Workflow ID** | `d2eLn9JqPAFVEewg` |
| **n8n Instance** | `http://localhost:5678` |
| **Purpose** | AI-powered Facebook Messenger chatbot for Cremo Ice Cream - handles customer inquiries, provides product info, assists with sales through intelligent classification and RAG-powered responses |
| **Status** | ☐ Development ☑ Testing ☐ Production |

> 💡 **Auto-fetch:** `n8n_get_workflow_minimal("d2eLn9JqPAFVEewg")`

---

## 🎯 Goal & Success

**Primary Outcome:**  
Complete automated customer service system that:
1. Classifies customer messages (close sale/sales signals/inquiries/spam)
2. Provides context-aware AI responses using RAG
3. Maintains conversation history for personalization
4. Routes critical events to human team
5. Handles multimedia responses

**Success Criteria:**
- [x] Responds automatically via Facebook Messenger
- [x] Classifies messages using check_customer sub-workflow
- [x] Searches multiple knowledge bases (business data, QA, history)
- [x] Maintains context in Supabase vector database
- [x] Routes sales-ready customers with Telegram notifications
- [x] Handles image attachments
- [x] Stores conversations in dual storage

**Business Value:**  
⏱️ ~15-20 hours/week saved  
💰 Reduces 24/7 support needs  
📈 Instant context-aware responses  
🎯 Automated lead qualification

---

## 🔄 Three-Workflow System Architecture

> 💡 **Auto-fetch:** `n8n_get_workflow_structure("d2eLn9JqPAFVEewg")`

### System Overview

```
┌───────────────────────────────────────────────────┐
│              admin_chatbot (Main)                 │
│  Webhook → Extract → Classify → AI → Store → Send│
└────────┬─────────────────────┬──────────────────┘
         ↓                     ↓
┌────────────────────┐  ┌─────────────────────┐
│   check_customer   │  │ update_chat_history │
│  (Classifier)      │  │  (Persistence)      │
│                    │  │                     │
│ • Detects contact  │  │ • Google Sheets     │
│ • IDs sales intent │  │ • Supabase vectors  │
│ • Filters spam     │  │ • Status updates    │
│ • Routes messages  │  │ • Telegram alerts   │
└────────────────────┘  └─────────────────────┘
```

### Main Workflow Flow

```
[Webhook] → [Verify Token] → [Extract Event] → [Check Message]
    ↓                                               ↓
[Respond]                              [Call check_customer]
                                                   ↓
                                       [If chat msg exists]
                                       ↙️         ↓        ↘️
                            [close sale]  [AI Agent]  [set answer]
                                 ↓            ↓            ↓
                               [data]    [merge]       [data]
                                              ↓
                                [Call update_chat_history]
                                              ↓
                                    [Check Image Output]
                                    ↙️               ↘️
                            [Extract URL]      [Send Text]
                                 ↓
                            [Send Image] → [Send Text]
```

### Node Purpose Summary

| Node | Purpose | Critical Config |
|------|---------|-----------------|
| **Webhook** | Receives FB events | Path: /n8n-webhook, Page: 107201445711168 |
| **Extract Event** | Filters echoes/receipts | Removes is_echo, delivery, read |
| **Call check** | Message classification | Calls pfjGV4IDkfGR10YP |
| **Switch** | Routes by classification | 4 paths: close/meaningless/normal/sale |
| **AI Agent** | RAG orchestrator | 3 tools: chat_history, QA, business_data |
| **Call check_text** | Stores conversation | Calls ivH0Zqdu7MxRctyx |
| **Send Image/Text** | Messenger API | Facebook Page Access Token |

**Total:** 35 nodes → Use `n8n_get_workflow_structure()` for complete list

### Related Workflows

| Workflow | ID | Relationship | Documentation |
|----------|--|--------------|--------------| 
| check_customer | pfjGV4IDkfGR10YP | Sub-workflow (called) | WRD_check_customer.md |
| update_chat_history | ivH0Zqdu7MxRctyx | Sub-workflow (called) | WRD_update_chat_history.md |

---

## ⚙️ Configuration

### Trigger Setup
**Type:** Webhook  
**Methods:** GET (verification), POST (messages)  
**Page ID:** 107201445711168

```bash
# Test verification
curl "http://localhost:5678/webhook/n8n-webhook?hub.mode=subscribe&hub.verify_token=n8n-webhook&hub.challenge=test123"

# Test message
curl -X POST http://localhost:5678/webhook/n8n-webhook \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"messaging":[{"sender":{"id":"test"},"message":{"text":"สอบถามราคา"}}]}]}'
```

### Credentials (Reference only)

| Purpose | Credential Name | Notes |
|---------|----------------|-------|
| Facebook Messenger | Cremo Facebook Messenger | Page access token (60-day rotation) |
| OpenRouter AI | OpenRouter account | Primary: google/gemini-2.5-flash |
| Cohere | CohereApi account | Embeddings + reranking |
| Supabase | Supabase account | 3 vector databases |
| Google Sheets | Google Sheets account | Via sub-workflows |
| Telegram | Telegram callbacl | Via sub-workflows |

### Key Settings

**AI Configuration:**
- Model: `google/gemini-2.5-flash`
- Embeddings: `embed-multilingual-v3.0` (Cohere)
- Top K: 5 results per search

**Vector Databases (Supabase):**
- `chat_history_base`: Metadata `{fileName:"psid", psid:"..."}`
- `qa_scenarios_base`: Metadata `{fileName:"qa_scenarios"}`
- `business_data_base`: Metadata `{fileName:"business_data"}`

**Classification Categories (from check_customer):**
- `ปิดการขาย`: Contact info provided
- `sale_signal`: Strong buying interest
- `ข้อความปกติ`: General inquiry (→ AI)
- `Meaningless words`: Spam (fallback)

---

## 📊 Data Flow

### Input (Facebook Webhook)
```json
{
  "entry": [{
    "messaging": [{
      "sender": {"id": "string"},
      "message": {"text": "string", "is_echo": false}
    }]
  }]
}
```

### Processing Pipeline

**1. Extract & Filter**
```javascript
// Removes: echoes, delivery receipts, page-sent messages
Output: {text, psid, proceed: true}
```

**2. Classify (check_customer)**
```javascript
// Priority: phone → address → name → sale signals → keywords
Output: {finalDecision, chatMsg, psid, decisionReason}
```

**3. Route & Respond (Switch)**
- Route 0: `ปิดการขาย` → Pre-defined response
- Route 1: `Meaningless` → Fallback
- Route 2+3: `ปกติ|sale_signal` → AI Agent

**4. AI Processing**
```javascript
// System prompt: "น้องโม - แอดมินเพจไอศกรีมครีโม"
// Tools (executed in parallel):
1. search_chat_history({query, filter: {psid}}) → Top 3
2. search_QA_scenarios({query}) → Top 3
3. search_business_data({query}) → Top 3

Output: {Response: "Thai text", intent: "Inquiry|..."}
```

**5. Store (update_chat_history)**
```javascript
// Dual storage: Google Sheets + Supabase vectors
// Status updates: contact→"success", unknown→"Handoff"
// Telegram alerts: Close sale, Handoff
```

**6. Send (Check Image)**
```javascript
// If Cloudinary URLs: Extract → Send image → Send text
// Else: Send text only
```

### Output (Messenger API)
```json
{
  "recipient": {"id": "psid"},
  "message": {
    "text": "string",
    "attachment": {"type": "template", "payload": {...}}
  }
}
```

---

## 🛡️ Error Handling

> 💡 **Validate:** `n8n_validate_workflow("d2eLn9JqPAFVEewg")`

### Current Issues

**CRITICAL (FIXED):**
- [x] ✅ Webhook error handling (2025-10-31)
  - Fixed: Added `onError: "continueRegularOutput"`

**KNOWN (Non-Critical):**
- [ ] ⚠️ Extract Event - False positive validation error
  - Status: Code correct, validation false positive
- [ ] ⚠️ No error response path (Future enhancement)

### Critical Node Configs

| Node | Error Behavior | Reason |
|------|----------------|--------|
| Webhook | continueOnError (fixed) | Must respond to Facebook |
| HTTP Requests | Default (fail) | Message delivery critical |
| AI Agent | Continue recommended | Prevent stoppage |
| Sub-workflows | Per sub-workflow config | See respective WRDs |

### Recovery
- **Webhook verification fails:** Check verify token = `n8n-webhook`
- **AI timeout:** Fallback response
- **Vector DB fails:** Sub-workflow retry (3x)
- **Facebook rate limit:** Queue needed (future)

---

## ✅ Testing & Validation

> 💡 **Pre-test:** `n8n_validate_workflow("d2eLn9JqPAFVEewg")`

### Complete System Tests

| Scenario | Input | Expected Path | Tested |
|----------|-------|---------------|--------|
| Webhook verification | GET hub.challenge | Verify Token → Respond | ☐ |
| Phone number | "0812345678" | check→ปิด→data→update→send | ☐ |
| Sales interest | "สนใจครับ" | check→sale→AI→update→send | ☐ |
| Normal inquiry | "สอบถามราคา" | check→ปกติ→AI→update→send | ☐ |
| Meaningless | "asdasd" | check→Meaningless→data→send | ☐ |
| Echo message | is_echo: true | Extract (filtered)→End | ☐ |
| Image response | Cloudinary URL | merge→Extract→Send Image+Text | ☐ |
| Context retrieval | Follow-up | AI uses search_chat_history | ☐ |
| Close sale | "ชื่อสมชาย 081..." | Telegram alert, status→success | ☐ |
| Handoff | Unknown intent | Telegram alert, status→Handoff | ☐ |

### Quick Test
```bash
# System status
n8n_get_workflow_minimal("d2eLn9JqPAFVEewg")  # Main
n8n_get_workflow_minimal("pfjGV4IDkfGR10YP")  # check_customer
n8n_get_workflow_minimal("ivH0Zqdu7MxRctyx")  # update_chat_history

# Validate all
n8n_validate_workflow("d2eLn9JqPAFVEewg")
n8n_validate_workflow("pfjGV4IDkfGR10YP")
n8n_validate_workflow("ivH0Zqdu7MxRctyx")

# Recent executions
n8n_list_executions({workflowId: "d2eLn9JqPAFVEewg", limit: 5})
```

---

## 🚀 Deployment

### Pre-Deploy Checklist

**Main Workflow:**
- [ ] `n8n_validate_workflow("d2eLn9JqPAFVEewg")` → No errors
- [ ] All credentials valid (Facebook, OpenRouter, Cohere, Supabase)
- [ ] Test webhook verification

**Sub-Workflows (Activate First):**
- [ ] check_customer (pfjGV4IDkfGR10YP) active
- [ ] update_chat_history (ivH0Zqdu7MxRctyx) active
- [ ] Google Sheets populated (Keyword_Router, quick_responses)
- [ ] Supabase DBs populated (qa_scenarios, business_data)

### Deployment Steps

**1. Activate Sub-Workflows (Order Matters)**
```bash
# 1. check_customer
n8n_update_partial_workflow({
  id: "pfjGV4IDkfGR10YP",
  operations: [{type: "updateSettings", settings: {active: true}}]
})

# 2. update_chat_history
n8n_update_partial_workflow({
  id: "ivH0Zqdu7MxRctyx",
  operations: [{type: "updateSettings", settings: {active: true}}]
})
```

**2. Configure Facebook Webhook**
1. Facebook App Dashboard → Webhooks
2. URL: `http://localhost:5678/webhook/n8n-webhook` (use HTTPS in prod)
3. Verify token: `n8n-webhook`
4. Subscribe: `messages`, `messaging_postbacks`

**3. Activate Main Workflow**
```bash
n8n_update_partial_workflow({
  id: "d2eLn9JqPAFVEewg",
  operations: [{type: "updateSettings", settings: {active: true}}]
})
```

**4. Verify**
```bash
# Test full flow
curl -X POST http://localhost:5678/webhook/n8n-webhook \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"messaging":[{"sender":{"id":"test"},"message":{"text":"สอบถามราคา"}}]}]}'

# Check all executed
n8n_list_executions({limit: 3})
```

### Monitoring

**Health Check:**
```bash
# All workflow statuses
n8n_get_workflow_minimal("d2eLn9JqPAFVEewg")
n8n_get_workflow_minimal("pfjGV4IDkfGR10YP")
n8n_get_workflow_minimal("ivH0Zqdu7MxRctyx")
```

**Targets:**
- Main workflow: >95% success
- Sub-workflows: >98% success
- Response time: <5s (95th percentile)

**Alert Rules:**
- Main error >5% → Check webhook/AI
- check_customer fails → Verify Google Sheets
- update_chat_history fails → Check Supabase/Cohere
- Response >10s → Investigate AI performance
- No executions 2hrs → Check Facebook webhook

---

## 🔐 Security & Compliance

**Sensitive Data:** Customer PSIDs, conversations, phone/address/names, intents  
**Storage:** Supabase (vectors), Google Sheets (history/status), n8n logs (30 days)  
**Retention:** Indefinite (manual cleanup required)  
**Credential Rotation:** Facebook token (60 days), API keys (quarterly)  
**Access:** mamon avarice (greed2mamon@gmail.com)  
**Compliance:** PDPA (Thailand), Facebook Platform Policy

---

## 📚 Quick Reference

### System Management
```bash
# === STATUS ===
n8n_get_workflow_minimal("d2eLn9JqPAFVEewg")  # Main
n8n_get_workflow_minimal("pfjGV4IDkfGR10YP")  # Classifier
n8n_get_workflow_minimal("ivH0Zqdu7MxRctyx")  # Storage

# === VALIDATION ===
n8n_validate_workflow("d2eLn9JqPAFVEewg")
n8n_validate_workflow("pfjGV4IDkfGR10YP")
n8n_validate_workflow("ivH0Zqdu7MxRctyx")

# === MONITORING ===
n8n_list_executions({limit: 20})  # Recent activity
n8n_list_executions({workflowId: "d2eLn9JqPAFVEewg", limit: 10})

# === DEBUGGING ===
n8n_get_execution({id: "exec-id", mode: "full"})
```

### Links
- 🔗 **Main:** http://localhost:5678/workflow/d2eLn9JqPAFVEewg
- 🔗 **Classifier:** http://localhost:5678/workflow/pfjGV4IDkfGR10YP
- 🔗 **Storage:** http://localhost:5678/workflow/ivH0Zqdu7MxRctyx
- 📋 **Google Sheet:** [Link](https://docs.google.com/spreadsheets/d/1qIBK-mLcjRxW4yKunqr4pFIlj42MQdAx0Op8KFR338M/)
- 🗄️ **Supabase:** https://app.supabase.com
- 💬 **Telegram:** -1002924884874

### Critical Settings

| Setting | Value |
|---------|-------|
| **Main ID** | `d2eLn9JqPAFVEewg` |
| **check_customer ID** | `pfjGV4IDkfGR10YP` |
| **update_chat_history ID** | `ivH0Zqdu7MxRctyx` |
| **Webhook Path** | `/n8n-webhook` |
| **Verify Token** | `n8n-webhook` |
| **Page ID** | `107201445711168` |
| **AI Model** | `google/gemini-2.5-flash` |
| **Embedding Model** | `embed-multilingual-v3.0` |

---

## 💡 Notes & Known Issues

**Known Issues:**
1. ✅ Webhook error handling (FIXED 2025-10-31)
2. ⚠️ Extract Event validation false positive (Code correct)
3. ⚠️ No error response path (Future enhancement)

**Rate Limits:**
- Facebook: 2000 messages/day
- OpenRouter: Per plan
- Cohere: 1000 req/min (free)
- Supabase: 60 connections (free)
- Google Sheets: 300 req/min per project

**System Dependencies:**
1. Facebook Messenger (entry point)
2. Supabase (AI context)
3. Cohere (embeddings)
4. OpenRouter (AI generation)
5. Google Sheets (status/rules/backup)

**Future Improvements:**
- [ ] Centralized error monitoring
- [ ] A/B testing for AI prompts
- [ ] Admin panel for keywords
- [ ] Conversation analytics
- [ ] Message queueing for rate limits

---

## 🔍 Troubleshooting

| Problem | Check | Solution |
|---------|-------|----------|
| No bot response | All 3 workflow statuses | Activate in order: check→update→main |
| Webhook not receiving | curl webhook URL | Verify Facebook subscription |
| Classification fails | check_customer executions | Verify Google Sheets keywords |
| No AI response | AI Agent logs | Check OpenRouter + Cohere + Supabase |
| History not stored | update_chat_history logs | Check Supabase + Sheets access |
| No Telegram alerts | Bot credentials | Verify token + chat ID |

**Debug:**
```bash
# Last execution
n8n_get_execution({id: "last-id", mode: "summary"})

# Validate specific node
validate_node_operation("n8n-nodes-base.webhook", {...}, "runtime")
```

**Common Patterns:**
- Sub-workflow not found → Activate sub-workflows first
- Vector search empty → Populate Supabase DBs
- Status not updating → Check update_chat_history If1/If2
- Duplicate messages → Facebook retry (need idempotency)

---

**Template Version:** 2.0.0  
**System Version:** 1.0.2  
**Created:** 2025-10-31  
**Owner:** mamon avarice

**IMPORTANT:** Three-workflow system - all must be active and configured before production.

Conceived by Romuald Członkowski - [www.aiadvisors.pl/en](https://www.aiadvisors.pl/en)
