# 🛠️ TECHNICAL IMPLEMENTATION GUIDE
**For Claude Code Development**

---

## 📋 **ESSENTIAL REFERENCES**

### **Required Reading Order:**
1. **PROJECT_BRIEF.md** - Overall mission and constraints
2. **wf1_detail.md** - Content creation pattern (proven)
3. **wf2_detail.md** - Image generation pattern (proven)  
4. **SESSION_1_FACEBOOK_INTELLIGENCE.md** - 6 workflows spec
5. **SESSION_2_TEXT_OVERLAY_SYSTEM.md** - 7 workflows spec

### **Google Sheets Templates:**
- All 5 CSV files provided
- Import instructions in README
- Use existing field structures

---

## 🔧 **N8N MCP USAGE STRATEGY**

### **Token Conservation:**
```
❌ Avoid: n8n_get_workflow (expensive)
✅ Use: n8n_search_nodes (cheaper)
✅ Use: n8n_get_node_essentials (targeted)
✅ Use: n8n_list_nodes (overview)
```

### **Before Building Each Workflow:**
```javascript
// 1. Find similar templates
await n8n_search_nodes({
  query: "google sheets telegram ai",
  limit: 5,
  includeExamples: true
});

// 2. Get specific node info
await n8n_get_node_essentials({
  nodeType: "nodes-base.googleSheets",
  includeExamples: true
});

// 3. Validate configuration
await n8n_validate_node_operation({
  nodeType: "nodes-base.telegram", 
  config: {operation: "sendPhoto"}
});
```

---

## 🎯 **WORKFLOW PATTERNS TO FOLLOW**

### **Pattern 1: Data Collection (Like WF1)**
```
Schedule/Trigger
    ↓
Read Source (Google Sheets/API)
    ↓  
Process/Transform Data
    ↓
Write Destination (Google Sheets)
    ↓
Auto-trigger Next Workflow
```

**Example Nodes:**
- Schedule Trigger
- Google Sheets (Read)
- Function (data processing)
- Google Sheets (Write)  
- Execute Workflow

### **Pattern 2: AI Processing (Like WF2)**
```
Execute Workflow Trigger
    ↓
Read Configuration Data
    ↓
AI API Call (OpenAI/Claude)
    ↓
Process AI Response
    ↓
Write Results + Status Update
    ↓
Conditional Auto-trigger
```

**Example Nodes:**
- Execute Workflow Trigger
- Google Sheets (Read)
- HTTP Request (AI API)
- Function (response processing)
- Google Sheets (Write)
- IF (conditional trigger)

### **Pattern 3: User Interface (Telegram)**
```
Telegram Trigger
    ↓
Switch (command routing)
    ↓
Process User Input
    ↓
Generate Response
    ↓
Telegram Send + Inline Keyboard
```

**Example Nodes:**
- Telegram Trigger
- Switch
- Function
- Telegram (sendMessage/sendPhoto)

---

## 📊 **GOOGLE SHEETS INTEGRATION**

### **Connection Pattern:**
```javascript
// Standard read operation
{
  "resource": "sheet",
  "operation": "read",
  "documentId": "PLACEHOLDER_SPREADSHEET_ID",
  "sheetName": "Facebook_Raw_Data",
  "range": "A:Z",
  "options": {
    "valueInputOption": "RAW"
  }
}

// Standard write operation  
{
  "resource": "sheet",
  "operation": "append",
  "documentId": "PLACEHOLDER_SPREADSHEET_ID", 
  "sheetName": "AI_Analysis_Results",
  "options": {
    "valueInputOption": "RAW"
  }
}
```

### **Field Naming Convention:**
Follow WF1-WF2 patterns:
- Primary keys: `content_id`, `analysis_id`, `campaign_id`
- Status fields: `status`, `content_create`, `image_create`
- Linking fields: `linked_content_id`, `linked_image_group`

---

## 🔗 **AUTO-TRIGGER IMPLEMENTATION**

### **Chain Pattern (WF1→WF2 style):**
```javascript
// At end of workflow
{
  "type": "n8n-nodes-base.executeWorkflow",
  "parameters": {
    "workflowId": "NEXT_WORKFLOW_ID",
    "workflowInputs": {
      "mappingMode": "defineBelow",
      "value": {
        "campaign_id": "={{ $json.campaign_id }}",
        "status": "={{ $json.status }}"
      }
    }
  }
}
```

### **Conditional Triggers:**
```javascript
// Only trigger if complete
{
  "type": "n8n-nodes-base.if",
  "parameters": {
    "conditions": {
      "string": [
        {
          "value1": "={{ $json.status }}",
          "value2": "ready"
        }
      ]
    }
  }
}
```

---

## 🎨 **TEXT OVERLAY SPECIFICATIONS**

### **Critical Brand Requirements:**
```javascript
// Arc curve range
const ARC_RANGE = {
  min: -180,
  max: 180,
  step: 5,
  default: 0,
  brand_optimal: "30-60" // CREMO preference
};

// Thai fonts
const THAI_FONTS = [
  "Mitr",      // Primary CREMO font
  "Sarabun",   // Secondary
  "Kanit"      // Alternative
];

// Brand colors
const CREMO_COLORS = {
  primary: "#ffdd17",   // CREMO Yellow
  secondary: "#17539f", // CREMO Blue
  white: "#ffffff",
  black: "#000000"
};
```

### **Cloudinary Integration:**
```javascript
// URL building pattern
function buildCloudinaryURL(imageUrl, options) {
  let url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`;
  
  // Arc curve transformation
  if (options.arc && options.arc !== 0) {
    url += `e_distort:arc:${options.arc}/`;
  }
  
  // Text overlay  
  if (options.text) {
    const encoded = encodeURIComponent(options.text);
    url += `l_text:${options.font}_${options.size}:${encoded}/`;
    url += `co_rgb:${options.color}/`;
  }
  
  url += imageUrl;
  return url;
}
```

---

## 🛡️ **ERROR HANDLING & VALIDATION**

### **Standard Error Pattern:**
```javascript
{
  "type": "n8n-nodes-base.function",
  "parameters": {
    "functionCode": `
      try {
        // Main logic here
        const result = processData($input.all());
        return result;
      } catch (error) {
        console.error('Error in workflow:', error);
        // Send error notification
        return [{
          json: {
            error: true,
            message: error.message,
            timestamp: new Date().toISOString()
          }
        }];
      }
    `
  }
}
```

### **Validation Patterns:**
```javascript
// Validate required fields
function validateInput(data) {
  const required = ['content_id', 'image_url', 'chat_id'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  return true;
}

// Validate Thai text encoding
function validateThaiText(text) {
  const thaiRegex = /[\u0E00-\u0E7F]/;
  if (thaiRegex.test(text)) {
    return encodeURIComponent(text);
  }
  return text;
}
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Before Creating Workflows:**
- [ ] Search 5 similar templates using n8n MCP
- [ ] Validate node configurations
- [ ] Test Google Sheets connections
- [ ] Verify credential requirements

### **After Creating Each Workflow:**
- [ ] Validate workflow structure
- [ ] Test all node connections  
- [ ] Verify auto-trigger chains
- [ ] Check error handling paths

### **Session Completion:**
- [ ] All workflows validate successfully
- [ ] Integration points tested
- [ ] Only credential + sheet name updates needed
- [ ] Documentation complete

---

**🎯 Build for immediate deployment success!**