# Workflow Resource Doc: Facebook Ad Analysis & A/B Testing

---

## 📋 Overview & Quick Access

| Field | Value |
|-------|-------|
| **Workflow ID** | N/A (Import from file) |
| **File** | `workflow.json` |
| **Purpose** | Strategic analysis of competitor data + CREMO templates to generate actionable A/B test recommendations |
| **Status** | ✅ Production Ready |

---

## 🎯 Goal & Success

**Primary Outcome:**  
Combines competitor insights from Workflows 1 & 2 with CREMO brand templates to generate 3-5 A/B test recommendations powered by GPT-4o

**Success Criteria:**
- [x] Reads data from 3 sources: Competitor Data, Templates, Market Intelligence
- [x] AI analysis identifies performance gaps and opportunities
- [x] Generates 3-5 specific A/B test ideas with prompts
- [x] Saves results to 2 Google Sheets tabs: Analysis Summary + A/B Test Queue

**Business Value:**  
⏱️ Time saved: ~5 hours/week (manual strategy planning)  
📊 Data-driven decisions: AI-powered insights from competitor analysis  
🎨 Creative direction: Ready-to-implement test ideas with prompts

---

## 🔄 Workflow Architecture

### Visual Flow

```
[Manual Trigger]
    ↓
[Read 3 Data Sources in Parallel]
├─ Read Competitor Data (from Workflow 1 export)
├─ Read CREMO Templates
└─ Read Market Intelligence
    ↓
[Format Data with Set Nodes]
├─ Set Competitor
├─ Set Templates
└─ Set Intel
    ↓
[Merge Data (combineByPosition)]
    ↓
[AI Analysis (GPT-4o)]
    ↓
[Parse AI Response (error handling)]
    ↓
[Split Output]
├─ Save Analysis Summary → Google Sheets
└─ Split Tests → Save to A/B Test Queue → Google Sheets
```

### Node Purpose Summary

| Node Name | Type | Purpose | Critical Config |
|-----------|------|---------|-----------------|
| When clicking 'Test workflow' | `n8n-nodes-base.manualTrigger` | Entry point for manual execution | - |
| Read Competitor Data | `n8n-nodes-base.googleSheets` | Read competitor data | Tab: `Competitor_Data` |
| Read Templates | `n8n-nodes-base.googleSheets` | Read CREMO templates | Tab: `CREMO_Templates` |
| Read Market Intel | `n8n-nodes-base.googleSheets` | Read market research | Tab: `Market_Intelligence` |
| Set Competitor/Templates/Intel | `n8n-nodes-base.set` | Format data for merge | Wraps data in named object |
| Merge Data | `n8n-nodes-base.merge` | Combine 3 sources | Mode: `combineByPosition` |
| AI Analysis | `@n8n/n8n-nodes-langchain.openAi` | GPT-4o strategic analysis | Model: gpt-4o, JSON output |
| Parse AI Response | `n8n-nodes-base.code` | Parse + error handling | Try-catch with fallback |
| Save Analysis | `n8n-nodes-base.googleSheets` | Save summary | Tab: `Analysis_Results` |
| Split Tests | `n8n-nodes-base.splitOut` | Split A/B test array | Field: `ab_tests` |
| Save Tests | `n8n-nodes-base.googleSheets` | Save test queue | Tab: `AB_Test_Queue` |

### Related Workflows

| Workflow | ID | Relationship |
|----------|----|--------------| 
| APIFY Scraper | `reference-workflows/apify-scraper.json` | Provides competitor data (export to Sheets) |
| AI Spy Tool | `reference-workflows/ai-spy-tool.json` | Provides AI insights (optional input) |

---

## ⚙️ Configuration

### Trigger Setup

**Type:** Manual Trigger  
**Purpose:** Run weekly for strategic planning and A/B test generation

**Recommended Schedule:**
- Weekly on Monday morning
- After running Workflows 1 & 2
- Before weekly marketing planning meeting

### Credentials

| Purpose | Credential Name | Notes |
|---------|----------------|-------|
| Google Sheets | OAuth2 credential | Used in 5 nodes (3 reads, 2 writes) |
| OpenAI API | OpenAI credential | GPT-4o access required |

### Key Settings

**Google Sheets Configuration:**
- **Sheet ID:** Replace all `YOUR_SHEET_ID` with actual ID
- **5 Required Tabs:**
  1. `Competitor_Data` - Input from Workflow 1
  2. `CREMO_Templates` - Brand template library
  3. `Market_Intelligence` - Regional preferences, trends
  4. `Analysis_Results` - Output summary
  5. `AB_Test_Queue` - Output A/B test ideas

**OpenAI Configuration:**
- **Model:** gpt-4o
- **Output Mode:** JSON
- **Temperature:** Default (balanced creativity)

---

## 📊 Data Flow

### Input Schema

**1. Competitor_Data (from Workflow 1 export):**
```csv
page_name, post_text, engagement, ad_type, display_format, cta_type
Walls Thailand, "New flavor!", 1500, Image, IMAGE, LIKE_PAGE
```

**2. CREMO_Templates (brand templates):**
```csv
Template_Name, AI_Instructions, Category, Prompt_Template, Status
Happy Family, "Show families enjoying together", Emotional, "...", Active
Summer Vibes, "Bright colors, beach theme", Seasonal, "...", Active
```

**3. Market_Intelligence (research data):**
```csv
Analysis_ID, Data_Type, Key_Insights, Source, Summary
R001, Regional, "Bangkok prefers premium...", Survey, "..."
```

### Output Schema

**Analysis_Results Tab:**
```csv
timestamp, performance_gap, key_insights, opportunities, regional_focus, ab_test_count
2025-11-08T12:00:00Z, "Competitors use...", ["insight1","insight2"], ["opp1"], Bangkok, 3
```

**AB_Test_Queue Tab:**
```csv
timestamp, test_id, template, variation, image_prompt, ad_copy, cta, expected_impact, status
2025-11-08, A1, Happy Family, "Family eating ice cream", "...", "...", "Shop Now", "15% CTR increase", pending
```

### Critical Expressions

**Merge Data Input:**
```javascript
// Set nodes wrap data:
{ "competitor_data": {...} }
{ "templates": {...} }
{ "market_intel": {...} }
```

**AI Prompt (System Message):**
```
You are a Facebook Ads strategist for CREMO ice cream franchise. Analyze competitor data and provide A/B testing recommendations.

Output must be valid JSON:
{
  "analysis": {
    "performance_gap": "brief description",
    "key_insights": ["insight1", "insight2"],
    "opportunities": ["opp1", "opp2"]
  },
  "recommendations": {
    "template_matches": [{"template": "name", "reason": "why"}],
    "regional_focus": "region",
    "tone_style": "style"
  },
  "ab_tests": [
    {
      "test_id": "A1",
      "variation": "description",
      "template": "template name",
      "image_prompt": "prompt text",
      "ad_copy": "copy text",
      "cta": "CTA",
      "expected_impact": "impact"
    }
  ]
}
```

**Error Handling (Parse Node):**
```javascript
const aiResponse = $json.message?.content || $json;
let parsed;

try {
  parsed = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse;
} catch (e) {
  parsed = {
    analysis: { performance_gap: "Error parsing response", key_insights: [], opportunities: [] },
    recommendations: { template_matches: [], regional_focus: "unknown", tone_style: "unknown" },
    ab_tests: []
  };
}
```

---

## 🛡️ Error Handling

### Error Workflow

**Handler:** Built-in via Parse AI Response node  
**Fallback:** Returns default JSON structure if parsing fails

### Known Error Scenarios

1. **Empty Competitor Data:**
   - Workflow continues but AI may generate generic recommendations
   - Solution: Ensure Workflow 1 ran successfully

2. **GPT-4o JSON Error:**
   - Parse node catches error
   - Returns fallback structure
   - Workflow completes without crashing

3. **Google Sheets Not Found:**
   - Node fails with clear error
   - Solution: Verify Sheet ID and tab names

### Recovery Procedures

- **Missing data:** Check Workflows 1 & 2 completed
- **AI timeout:** Re-run workflow (idempotent)
- **Invalid JSON:** Check Parse node output, use fallback data
- **Sheet write error:** Verify credentials and permissions

---

## ✅ Testing & Validation

### Test Scenarios

| Scenario | Input | Expected | Tested |
|----------|-------|----------|--------|
| Happy path | Full data from all 3 sources | 3-5 A/B tests generated | ✅ |
| Empty competitor data | Only templates + intel | Generic tests created | ⚠️ |
| AI JSON error | Malformed response | Fallback structure used | ✅ |
| Single template | 1 template only | Tests use that template | ✅ |

### Test Data Location

📁 **CSV Files:** `data/cremo-templates.csv`, `data/market-intelligence.csv`  
📊 **Google Sheets:** Import CSVs to test  
📖 **Test Guide:** `TEST_STEPS.md` (Thai language)

**Quick test:**
```
1. Import workflow.json to n8n
2. Create Google Sheet with 5 tabs
3. Import CSV data to tabs
4. Replace YOUR_SHEET_ID (5 nodes)
5. Click "Execute Workflow"
6. Check results in Sheets
```

---

## 🚀 Deployment

### Pre-Deploy Checklist

- [ ] Google Sheet created with 5 tabs
- [ ] CSV data imported to appropriate tabs
- [ ] Sample competitor data added to `Competitor_Data` tab
- [ ] All 5 Google Sheets nodes updated with Sheet ID
- [ ] Google OAuth2 credential configured
- [ ] OpenAI credential configured (GPT-4o access)
- [ ] Test run completed successfully

### Post-Deploy Monitoring

**Monitoring Schedule:** After each weekly run  
**Success Rate Target:** >95% (simple workflow, good error handling)

**Check Points:**
- `Analysis_Results` tab has new row
- `AB_Test_Queue` tab has 3-5 new rows
- All columns filled (no empty data)
- Test ideas are actionable and specific

**Weekly Workflow:**
```
Monday:
1. Run Workflow 1 (APIFY Scraper)
2. Export to Google Sheets `Competitor_Data` tab
3. Run Workflow 2 (AI Spy Tool) [optional]
4. Run Workflow 3 (this workflow)
5. Review A/B Test Queue
6. Select tests to implement
```

---

## 🔐 Security & Compliance

**Sensitive Data:** None (publicly available competitor data)  
**Retention:** Indefinite in Google Sheets  
**Credential Rotation:** Quarterly (Google, OpenAI)  
**Access Control:** Team members with Google Sheets access

**Compliance Notes:** 
- Uses publicly available competitor data
- No PII or sensitive customer data
- AI analysis for business intelligence (legal use)

---

## 📊 Output Data Usage

**Primary Users:**
1. **Marketing Team**
   - Reviews `Analysis_Results` for strategic insights
   - Selects tests from `AB_Test_Queue` to implement
   - Uses `image_prompt` to brief designers

2. **Design Team**
   - Creates assets based on `image_prompt`
   - References `template` column for brand guidelines

3. **Campaign Manager**
   - Implements A/B tests in Facebook Ads Manager
   - Tracks `expected_impact` vs actual results
   - Updates `status` column (pending → running → completed)

**Workflow Integration:**
- Can feed into campaign scheduling workflow (future)
- Can integrate with Cloudinary for asset generation (future)

---

## 📚 Quick Reference

### Important Settings

| Setting | Value |
|---------|-------|
| Sheet ID | `YOUR_SHEET_ID` (replace in 5 nodes) |
| AI Model | gpt-4o |
| Merge Mode | combineByPosition |
| Timezone | Asia/Bangkok (for timestamps) |

### Required Tabs

1. `Competitor_Data` - Input
2. `CREMO_Templates` - Input
3. `Market_Intelligence` - Input
4. `Analysis_Results` - Output
5. `AB_Test_Queue` - Output

### CSV Data Files

- `data/cremo-templates.csv`
- `data/market-intelligence.csv`
- `data/google-sheets-template.csv` (structure example)

---

## 💡 Notes & Known Issues

**Known Issues:**
- None currently identified

**Dependencies:**
- Workflows 1 & 2 must run first
- Google Sheets must be accessible
- OpenAI GPT-4o access required

**Future Improvements:**
- [ ] Add Cloudinary integration for automatic image generation
- [ ] Schedule automatic weekly runs
- [ ] Add Telegram notifications
- [ ] Integrate with Workflow 2 AI insights directly
- [ ] Add budget constraint logic
- [ ] Generate multiple copy variations per test
- [ ] Add campaign scheduling module

---

## 🔍 Troubleshooting

**Common Issues:**

| Problem | Solution |
|---------|----------|
| "Cannot read sheet" error | Verify Sheet ID, tab names, credentials |
| Empty A/B tests | Check competitor data exists |
| AI timeout | Re-run workflow (usually transient) |
| Missing columns in output | Check Parse node fallback triggered |
| Duplicate test IDs | Clear `AB_Test_Queue` tab before run |

**Debug Steps:**
1. Test each Read node individually
2. Check Merge node output has all 3 sources
3. Inspect AI Analysis node response
4. Verify Parse node catches errors
5. Check Google Sheets write permissions

---

## 📖 Documentation Files

**In this package:**
- `INDEX.md` - Navigation and overview
- `README.md` - Package summary
- `TEST_STEPS.md` - Thai language testing guide
- `docs/QUICK_START.md` - 5-minute setup
- `docs/SETUP_GUIDE.md` - Detailed setup
- `docs/README.md` - Technical documentation
- `docs/WORKFLOWS_OVERVIEW.md` - All 3 workflows overview
- `docs/WRD_Workflow1_APIFY_Scraper.md` - Workflow 1 details
- `docs/WRD_Workflow2_AI_Spy_Tool.md` - Workflow 2 details
- `docs/WRD_Workflow3_AB_Testing.md` - This file

---

## 🎨 AI Prompt Engineering

### System Prompt Strategy

The AI is given a clear role (Facebook Ads strategist) and specific output format (JSON schema). This ensures:
- Consistent, structured responses
- Easy parsing and error handling
- Actionable recommendations

### Key Prompt Elements

1. **Context:** "Facebook Ads strategist for CREMO ice cream franchise"
2. **Task:** "Analyze competitor data and provide A/B testing recommendations"
3. **Output Format:** Strict JSON schema with examples
4. **Constraints:** "Provide 3 A/B test recommendations"

### Prompt Improvements (Future)

- Add brand voice guidelines
- Include previous test results for learning
- Add budget constraints to recommendations
- Specify regional targeting preferences

---

**Document Version:** 1.0.0  
**Created:** 2025-11-08  
**Status:** ✅ Production Ready
