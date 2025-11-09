# 🔗 Integration Guide - Text Overlay with Image Generation

> **Step-by-step guide for integrating Text Overlay workflow with existing Cremo image generation system**

**Target Workflows:**
- `create_image_no_templete` (36 nodes)
- `create_image_with_templete` (35 nodes)
- `telegram_workflow` (Main Router)

---

## 🎯 Integration Overview

### Current Flow

```
User Input (Telegram)
    ↓
Main Router (telegram_workflow)
    ↓
Switch: Template or No Template
    ↓
Execute Sub-Workflow
    ↓
Fal.AI Image Generation
    ↓
Send to Telegram
    ↓
[END]
```

### New Flow with Text Overlay

```
User Input (Telegram)
    ↓
Main Router (telegram_workflow)
    ↓
Switch: Template or No Template
    ↓
Execute Sub-Workflow
    ↓
Fal.AI Image Generation
    ↓
Send to Telegram WITH "Add Text" button ← NEW
    ↓
User clicks "Add Text" ← NEW
    ↓
Text Overlay Workflow ← NEW
    ↓
Final Image to Telegram ← NEW
```

---

## 📋 Step-by-Step Integration

### Step 1: Locate the Final Message Node

**In both workflows:**
- `create_image_no_templete.json`
- `create_image_with_templete.json`

**Find the node that sends the final image to Telegram**

Look for:
- Node type: `n8n-nodes-base.httpRequest` or `n8n-nodes-base.telegram`
- URL: Contains `sendPhoto` or `sendMessage`
- Position: Near the end of the workflow

**Example node name:**
- "Send Image to User"
- "Telegram Send Photo"
- "Send Result"

### Step 2: Get Webhook URL

**From Text Overlay Workflow:**

1. Open workflow: `Cloudinary Text Overlay - Interactive Complete`
2. Click node: `Webhook: Display Form`
3. Copy the **Production URL** (not Test URL)
4. Example: `https://n8n.your-domain.com/webhook/text-overlay`

**Save this URL - you'll use it in Step 3**

### Step 3: Modify the Final Message Node

**Original message node (simplified):**

```json
{
  "chat_id": "{{ $json.chat_id }}",
  "photo": "{{ $json.images[0].url }}",
  "caption": "✨ รูปภาพของคุณพร้อมแล้ว!"
}
```

**New message node WITH inline keyboard:**

```json
{
  "chat_id": "{{ $json.chat_id }}",
  "photo": "{{ $json.images[0].url }}",
  "caption": "✨ รูปภาพของคุณพร้อมแล้ว!\n\n💡 ต้องการเพิ่มข้อความบนรูปไหม? คลิกปุ่มด้านล่างเลย",
  "parse_mode": "Markdown",
  "reply_markup": {
    "inline_keyboard": [[
      {
        "text": "✨ เพิ่มข้อความบนรูป",
        "url": "YOUR_WEBHOOK_URL_HERE?image_url={{ $json.images[0].url }}&chat_id={{ $json.chat_id }}"
      },
      {
        "text": "✅ ใช้รูปนี้เลย",
        "callback_data": "use_image_{{ $json.images[0].url }}"
      }
    ]]
  }
}
```

**Replace `YOUR_WEBHOOK_URL_HERE` with your actual webhook URL from Step 2**

### Step 4: Handle URL Encoding

**Problem:** Image URLs have special characters that need encoding

**Solution A: Add Code Node Before Send Message**

```javascript
// Add this Code node before the Send Message node
const imageUrl = $json.images[0].url;
const chatId = $json.chat_id;
const webhookBaseUrl = "https://n8n.your-domain.com/webhook/text-overlay";

// Encode the image URL
const encodedImageUrl = encodeURIComponent(imageUrl);

// Build the complete webhook URL
const textOverlayUrl = `${webhookBaseUrl}?image_url=${encodedImageUrl}&chat_id=${chatId}`;

return [{
  ...$json,
  text_overlay_button_url: textOverlayUrl
}];
```

**Then in Send Message node:**

```json
{
  "reply_markup": {
    "inline_keyboard": [[
      {
        "text": "✨ เพิ่มข้อความบนรูป",
        "url": "={{ $json.text_overlay_button_url }}"
      }
    ]]
  }
}
```

**Solution B: Use n8n Expression (Simpler)**

If your n8n version supports it:

```
{{ $env.N8N_WEBHOOK_URL }}/webhook/text-overlay?image_url={{ $json.images[0].url | urlencode }}&chat_id={{ $json.chat_id }}
```

### Step 5: Test Integration

**Test Sequence:**

```bash
1. ✓ Generate an image through normal flow
2. ✓ Image sends to Telegram
3. ✓ Verify "Add Text" button appears
4. ✓ Click button
5. ✓ Form loads with image preview
6. ✓ Fill form and submit
7. ✓ Final image with text arrives in Telegram
```

---

## 🔧 Detailed Implementation

### Option 1: Minimal Integration (Recommended)

**Add these 2 nodes to EACH image generation workflow:**

**Node 1: Build Text Overlay URL (Code)**

```javascript
// Node name: "Build Text Overlay URL"
// Position: After Fal.AI generation, before Send to Telegram

const falaiResponse = $input.first().json;
const imageUrl = falaiResponse.images[0].url;
const chatId = falaiResponse.chat_id || $('Telegram Trigger').first().json.message.chat.id;

// Your webhook base URL
const webhookBase = $env.N8N_WEBHOOK_URL || "https://n8n.your-domain.com";

// Build URL with encoded parameters
const textOverlayUrl = `${webhookBase}/webhook/text-overlay?` +
  `image_url=${encodeURIComponent(imageUrl)}&` +
  `chat_id=${chatId}`;

return [{
  ...falaiResponse,
  chat_id: chatId,
  text_overlay_url: textOverlayUrl
}];
```

**Node 2: Send with Inline Keyboard (HTTP Request)**

```javascript
// Node name: "Send Image with Text Option"
// Type: HTTP Request
// Method: POST
// URL: https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/sendPhoto

// Body (JSON):
{
  "chat_id": "={{ $json.chat_id }}",
  "photo": "={{ $json.images[0].url }}",
  "caption": "✨ รูปภาพของคุณพร้อมแล้ว!\n\n💡 คลิกปุ่มด้านล่างเพื่อเพิ่มข้อความบนรูป หรือใช้รูปนี้เลย",
  "parse_mode": "Markdown",
  "reply_markup": {
    "inline_keyboard": [[
      {
        "text": "✨ เพิ่มข้อความ",
        "url": "={{ $json.text_overlay_url }}"
      },
      {
        "text": "✅ ใช้รูปนี้",
        "callback_data": "use_image"
      }
    ]]
  }
}
```

### Option 2: Advanced Integration

**Add conditional flow:**

```javascript
// Check if user wants text overlay capability
const userPreferences = $('Get User Settings').first().json;

if (userPreferences.enable_text_overlay === true) {
  // Send with "Add Text" button
  return [{ ...data, show_text_button: true }];
} else {
  // Send without button (old behavior)
  return [{ ...data, show_text_button: false }];
}
```

Then use IF node to route to appropriate send message node.

---

## 📊 Workflow Modifications

### Workflow: `create_image_no_templete`

**Current nodes:** 36
**New nodes:** 38 (+2)

**Changes:**
1. **After "Generate Image (Fal.AI)"** → Add "Build Text Overlay URL" (Code)
2. **Modify "Send to Telegram"** → Add inline keyboard
3. **Alternative:** Replace "Send to Telegram" → Add new "Send with Buttons" node

**Node IDs to modify:**
- Look for node with `sendPhoto` in URL
- Usually near position `[2000, 600]` or end of workflow

### Workflow: `create_image_with_templete`

**Current nodes:** 35
**New nodes:** 37 (+2)

**Same changes as above**

### Workflow: `telegram_workflow` (Main Router)

**No changes required** - integration happens in sub-workflows

**Optional enhancement:**
Add menu option: "🎨 Text Overlay Only"
- Allows adding text to existing images
- Prompts user to send image
- Routes directly to Text Overlay workflow

---

## 🧪 Testing Checklist

### Pre-Integration Tests

```bash
✓ Text Overlay workflow is ACTIVE
✓ Webhook URLs are accessible
✓ Google Sheets templates are loaded
✓ Telegram bot token is configured
✓ Cloudinary cloud name is set
```

### Post-Integration Tests

```bash
✓ Image generation still works (no breaking changes)
✓ "Add Text" button appears on messages
✓ Button URL is correctly formatted
✓ Clicking button opens form
✓ Image loads in form preview
✓ Form submission works
✓ Final image arrives in Telegram
✓ Error handling works (invalid URLs, etc.)
```

### End-to-End Test

**Complete user flow:**

```
1. User: "สร้างรูป Success Story"
2. Bot: Generates image via Fal.AI
3. Bot: Sends image with 2 buttons
4. User: Clicks "✨ เพิ่มข้อความ"
5. Form: Opens with image preview
6. User: Types "ธุรกิจเติบโต 200%"
7. User: Selects template "success_story"
8. User: Adjusts arc: 30°
9. User: Enables stroke, color: black
10. User: Submits form
11. Bot: Processes (3-5 seconds)
12. Bot: Sends final image with text
13. ✓ Success!
```

---

## 🚨 Common Issues

### Issue 1: Button doesn't appear

**Cause:** Inline keyboard not properly formatted

**Fix:**
```javascript
// Ensure reply_markup is in the request body
// Check that inline_keyboard is an array of arrays
{
  "reply_markup": {
    "inline_keyboard": [[
      { "text": "Button", "url": "https://..." }
    ]]
  }
}
```

### Issue 2: Button URL is broken

**Cause:** Image URL not properly encoded

**Fix:**
```javascript
// Use encodeURIComponent
const encoded = encodeURIComponent(imageUrl);
// URL should look like:
// https://n8n.com/webhook/text-overlay?image_url=https%3A%2F%2Ffal.media%2F...
```

### Issue 3: Form shows "No Image"

**Cause:** Image URL parameter not passed correctly

**Fix:**
```javascript
// Verify URL structure:
?image_url=https%3A%2F%2F...&chat_id=123456789

// Check that image_url contains full HTTPS URL
// Check that URL is properly encoded
```

### Issue 4: "Add Text" but nothing happens

**Cause:** Text Overlay workflow is INACTIVE

**Fix:**
```bash
1. Open Text Overlay workflow
2. Toggle "Active" switch to ON
3. Save
4. Test webhook URL in browser
```

---

## 📝 Example Code Snippets

### Complete Integration Node

```javascript
// === Build Text Overlay Button ===
// Type: Code Node
// Position: Before final Telegram send

// Get image data
const imageData = $input.first().json;
const imageUrl = imageData.images?.[0]?.url || imageData.image_url;
const chatId = imageData.chat_id || $('Telegram Trigger').first().json.message.chat.id;

// Validate image URL
if (!imageUrl || !imageUrl.startsWith('http')) {
  throw new Error('Invalid image URL');
}

// Build webhook URL
const webhookBase = $env.N8N_WEBHOOK_URL || 'https://n8n.your-domain.com';
const textOverlayUrl = `${webhookBase}/webhook/text-overlay?` +
  `image_url=${encodeURIComponent(imageUrl)}&` +
  `chat_id=${chatId}`;

// Build Telegram message
const telegramMessage = {
  chat_id: chatId,
  photo: imageUrl,
  caption: '✨ รูปภาพของคุณพร้อมแล้ว!\n\n' +
           '💡 คลิกปุ่มด้านล่างเพื่อเพิ่มข้อความบนรูป\n' +
           'หรือใช้รูปนี้เลยก็ได้',
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [[
      {
        text: '✨ เพิ่มข้อความบนรูป',
        url: textOverlayUrl
      },
      {
        text: '✅ ใช้รูปนี้เลย',
        callback_data: `use_image_${Date.now()}`
      }
    ]]
  }
};

return [{
  ...imageData,
  telegram_message: telegramMessage,
  text_overlay_url: textOverlayUrl
}];
```

### Send Message Node (HTTP Request)

```javascript
// Type: HTTP Request
// Method: POST
// URL: https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/sendPhoto

// Send Body: Yes
// Body Content Type: JSON

// Body:
={{ $json.telegram_message }}
```

---

## 🎯 Best Practices

### 1. Error Handling

```javascript
try {
  // Build URL
  const url = buildTextOverlayUrl(imageUrl, chatId);
  return [{ success: true, url }];
} catch (error) {
  // Fallback: Send without button
  return [{
    success: false,
    error: error.message,
    fallback_message: {
      chat_id: chatId,
      photo: imageUrl,
      caption: '✨ รูปภาพของคุณพร้อมแล้ว!'
    }
  }];
}
```

### 2. User Feedback

```javascript
// After clicking "Use Image", acknowledge
// Using callback_query handler:
{
  "method": "answerCallbackQuery",
  "callback_query_id": "{{ $json.callback_query.id }}",
  "text": "✅ รูปภาพถูกบันทึกแล้ว!",
  "show_alert": false
}
```

### 3. Analytics

```javascript
// Log text overlay usage
{
  timestamp: new Date().toISOString(),
  user_id: chatId,
  action: 'text_overlay_button_clicked',
  image_url: imageUrl,
  workflow: 'create_image_no_templete'
}
// Save to Google Sheets or database
```

---

## 📚 Resources

- **Text Overlay README**: See main README.md
- **Test Data**: See test_overlay_data.json
- **Troubleshooting**: See main README.md

---

## ✅ Integration Checklist

**Before you start:**

- [ ] Text Overlay workflow imported and active
- [ ] Webhook URLs copied
- [ ] Environment variables set

**Integration steps:**

- [ ] Locate final message nodes in both workflows
- [ ] Add "Build Text Overlay URL" Code node
- [ ] Modify send message to include inline keyboard
- [ ] Test URL encoding
- [ ] Test button click
- [ ] Test form display
- [ ] Test form submission
- [ ] Test end-to-end flow

**Post-integration:**

- [ ] Monitor execution logs
- [ ] Gather user feedback
- [ ] Optimize button text (A/B test)
- [ ] Add analytics tracking

---

**Integration Time:** ~30 minutes
**Difficulty:** Medium
**Impact:** High - Enables powerful text overlay feature

**Good luck! 🚀**
