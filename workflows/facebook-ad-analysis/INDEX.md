# Facebook Ad Analysis & A/B Testing System

**Complete workflow system for CREMO ice cream franchise marketing intelligence**

---

## 📁 Folder Structure

```
facebook-ad-analysis/
├── workflow.json                    # Main workflow (import this to n8n)
├── docs/
│   ├── README.md                   # Full documentation
│   ├── QUICK_START.md              # 5-minute setup guide
│   ├── SETUP_GUIDE.md              # Detailed setup instructions
│   └── WORKFLOWS_OVERVIEW.md       # Overview of all 3 workflows
├── data/
│   ├── cremo-templates.csv         # CREMO template master data
│   ├── market-intelligence.csv     # Market research data
│   └── google-sheets-template.csv  # Google Sheets structure example
└── reference-workflows/
    ├── apify-scraper.json          # Workflow 1: APIFY scraper
    └── ai-spy-tool.json            # Workflow 2: AI analysis tool
```

---

## 🚀 Quick Start

### 1. Import Main Workflow
```bash
# In n8n: Import from File
workflows/facebook-ad-analysis/workflow.json
```

### 2. Setup Google Sheet
```bash
# Create sheet with 5 tabs:
- Competitor_Data (copy from reference workflows output)
- CREMO_Templates (import from data/cremo-templates.csv)
- Market_Intelligence (import from data/market-intelligence.csv)
- Analysis_Results (empty - for output)
- AB_Test_Queue (empty - for output)
```

### 3. Configure Workflow
```bash
# Edit workflow in n8n:
1. Update all "YOUR_SHEET_ID" → your Google Sheet ID
2. Select Google Sheets credential (5 nodes)
3. Select OpenAI credential (1 node)
```

### 4. Test Run
```bash
# Click "Execute Workflow" button
# Check Google Sheets for results
```

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **QUICK_START.md** | Start using in 5 minutes |
| **SETUP_GUIDE.md** | Step-by-step setup instructions |
| **README.md** | Complete technical documentation |
| **WORKFLOWS_OVERVIEW.md** | Overview of all 3 workflows in the system |

---

## 📊 What This Does

### Input
- Competitor data from Facebook pages (via reference workflows)
- CREMO template library
- Market intelligence research

### Processing
- AI analysis with GPT-4o
- Performance comparison
- Pattern recognition
- Strategic recommendations

### Output
- Performance gap analysis
- 3-5 A/B test recommendations
- Ready-to-use image prompts
- Suggested ad copy
- Strategic insights

---

## 🔗 System Flow

```
[Reference Workflows 1 & 2]
    ↓ (collect competitor data)
[Google Sheets]
    ↓ + CREMO Templates + Market Intel
[This Workflow]
    ↓ (AI analysis)
[A/B Test Queue]
    ↓
Ready to create ads! 🎨
```

---

## 📋 Prerequisites

### Required Credentials
- ✅ Google Sheets OAuth2
- ✅ OpenAI API (GPT-4o access)

### Required Data
- ✅ Competitor data (from reference workflows)
- ✅ CREMO templates (included in `data/`)
- ✅ Market intelligence (included in `data/`)

---

## 💡 Reference Workflows

### 1. APIFY Scraper (`reference-workflows/apify-scraper.json`)
- **Purpose:** Scrape competitor Facebook pages, posts, and ads
- **Output:** Page data, post engagement, ad details
- **Use:** Run this first to collect competitor data

### 2. AI Spy Tool (`reference-workflows/ai-spy-tool.json`)
- **Purpose:** AI analysis of competitor ads
- **Output:** AI summaries, rewritten copy, image prompts
- **Use:** Run after scraper to get AI insights

### 3. This Workflow (`workflow.json`)
- **Purpose:** Strategic analysis and A/B test generation
- **Output:** Performance analysis, test recommendations
- **Use:** Run weekly for strategic planning

---

## 🎯 Success Criteria

After running, you should have:
- ✅ Analysis summary in Google Sheets
- ✅ 3-5 A/B test ideas with prompts
- ✅ Strategic recommendations
- ✅ Ready-to-implement ad concepts

---

## 📞 Support

**Issues?** Check the docs:
1. Start with `QUICK_START.md`
2. Detailed help in `SETUP_GUIDE.md`
3. Technical details in `README.md`

---

**Version:** 1.0.0
**Last Updated:** 2025-11-08
**Status:** ✅ Production Ready
