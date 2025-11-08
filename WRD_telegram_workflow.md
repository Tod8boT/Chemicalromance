# Workflow Resource Doc – telegram_workflow
**Type:** Main Telegram Bot Router
**Nodes:** 14 nodes
**Status:** ✅ Production

---

## 📋 Overview & Quick Access

| Field | Value |
|-------|-------|
| **Workflow File** | `telegram_workflow.json` |
| **Purpose** | Main entry point for Telegram bot - routes messages to appropriate handlers |
| **Trigger Type** | Telegram Webhook |
| **Status** | ✅ Production |
| **Dependencies** | create_image_with_templete, create_image_no_templete |

---

## 🎯 Goal & Success

**Primary Outcome:**
Routes incoming Telegram messages (text, photos, commands) to appropriate sub-workflows for processing

**Success Criteria:**
- [x] Photo messages detected and processed
- [x] Text commands parsed and routed correctly
- [x] /create command triggers image generation flow
- [x] Error messages sent back to user

**Business Value:**
⏱️ **Time saved:** Automated message routing (no manual intervention)
🎯 **User Experience:** Instant response to user commands

---

## 🔄 Workflow Architecture

### Visual Flow

```
[Telegram Webhook]
    ↓
[Switch: Message Type]
    ├── Photo → [Extract Photo Data]
    ├── Text → [Parse Command]
    └── Other → [Default Handler]
         ↓
[Route to Sub-Workflow]
    ├── /create with template → create_image_with_templete
    ├── /create no template → create_image_no_templete
    └── Other commands → [Response Handler]
```

### Node Purpose Summary

| Node Name | Purpose | Critical Config |
|-----------|---------|-----------------|
| Telegram Trigger | Receives webhook from Telegram | Webhook endpoint configured |
| Switch (Message Type) | Routes by message.photo or message.text | Checks array existence |
| IF (Template Choice) | Determines template usage | User preference |
| Execute Workflow Nodes | Calls sub-workflows | Workflow IDs configured |
| Response Nodes | Sends results back to Telegram | chat_id required |

### Related Workflows

| Workflow | Relationship |
|----------|--------------|
| create_image_with_templete | Called when user chooses template |
| create_image_no_templete | Called when user skips template |
| keep_data_price | Called by sub-workflows |

---

## ⚙️ Configuration

### Trigger Setup
**Type:** Telegram Webhook
**Critical Details:**
- Bot Token: Set via environment variable `TELEGRAM_BOT_TOKEN`
- Webhook registered with Telegram API
- Receives all message types (text, photo, commands)

### Key Settings

**Message Type Detection:**
```javascript
// Photo detection
$json.message.photo (array exists check)

// Text detection
$json.message.text (string exists check)
```

**Command Parsing:**
```javascript
// Extract command from text
/create → triggers image generation
/help → shows help message
```

---

## 📊 Data Flow

### Input Schema (Telegram Message)
```json
{
  "message": {
    "message_id": 123,
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "text": "/create a cat",
    "photo": [
      {
        "file_id": "xxx",
        "file_size": 12345
      }
    ]
  }
}
```

### Output Schema (To Sub-Workflow)
```json
{
  "message_chat_id": 123456789,
  "command": "create",
  "prompt": "a cat",
  "use_template": true
}
```

### Critical Expressions

**Extract Chat ID:**
```javascript
{{ $json.message.chat.id }}
```

**Check Photo Exists:**
```javascript
{{ $json.message.photo }} // Array exists
```

**Parse Text Command:**
```javascript
{{ $json.message.text }} // String exists
```

---

## 🛡️ Error Handling

### Critical Node Error Configs

| Node | Error Behavior | Reason |
|------|----------------|--------|
| Telegram Trigger | Always on | Main entry point |
| Execute Workflow | Continue on fail | Don't block other messages |
| Response Node | Retry 3x | Ensure user gets response |

### Error Workflow
**Handler:** None (errors logged in n8n)
**Notification:** User receives error message in Telegram

### Recovery Procedures
- **Webhook timeout:** Telegram retries automatically
- **Sub-workflow failure:** Error message sent to user
- **Invalid command:** Help message displayed

---

## ✅ Testing & Validation

### Test Scenarios

| Scenario | Input | Expected | Tested |
|----------|-------|----------|--------|
| Photo upload | Send photo via Telegram | Photo processed | ✅ |
| Text command | "/create a cat" | Image generation starts | ✅ |
| Invalid command | "/unknown" | Help message | ☐ |
| Empty message | "" | Default response | ☐ |

### Test Commands
```bash
# Send test message via Telegram
# (Use Telegram app directly)

# Or use Telegram Bot API:
curl -X POST https://api.telegram.org/bot$TOKEN/sendMessage \
  -d "chat_id=123456789" \
  -d "text=/create test image"
```

---

## 🚀 Deployment

### Pre-Deploy Checklist
- [x] Telegram bot created via @BotFather
- [x] TELEGRAM_BOT_TOKEN environment variable set
- [x] Webhook registered with Telegram
- [x] Sub-workflows activated (create_image_*)
- [x] Test with /create command

### Post-Deploy Monitoring

**Quick status check:**
- Monitor incoming messages in n8n executions
- Check sub-workflow execution logs
- Verify users receive responses

**Success Rate Target:** >98% (excluding invalid commands)

---

## 💡 Notes & Known Issues

**Known Issues:**
- None currently

**Rate Limits:**
- Telegram Bot API: 30 messages/second (per bot)
- Fal.AI (in sub-workflows): Check their limits

**Dependencies:**
- Requires create_image_with_templete and create_image_no_templete to be active
- Requires valid TELEGRAM_BOT_TOKEN

**Future Improvements:**
- [ ] Add /help command handler
- [ ] Add /status command to check bot health
- [ ] Implement conversation state management
- [ ] Add multilingual support

---

## 📝 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-08 | 1.0.0 | Initial documentation | Claude Code |

---

**Document Version:** 1.0.0
**Last Updated:** 2025-01-08
