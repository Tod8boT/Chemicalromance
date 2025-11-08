# Facebook Ad Analysis & A/B Testing System

Complete n8n workflow system for CREMO ice cream franchise marketing intelligence.

## 📁 What's Inside

```
facebook-ad-analysis/
├── workflow.json                    ⭐ Main workflow (import to n8n)
├── INDEX.md                         📖 Start here
├── docs/
│   ├── QUICK_START.md              🚀 5-minute setup
│   ├── SETUP_GUIDE.md              📋 Detailed setup
│   ├── README.md                   📚 Full documentation
│   └── WORKFLOWS_OVERVIEW.md       🔍 System overview
├── data/
│   ├── cremo-templates.csv         🎨 Template library
│   ├── market-intelligence.csv     📊 Market research
│   └── google-sheets-template.csv  📄 Sheet structure
└── reference-workflows/
    ├── apify-scraper.json          🔧 Workflow 1
    └── ai-spy-tool.json            🤖 Workflow 2
```

## 🚀 Quick Start

### 1. Import Workflow
```
n8n → Import from File → workflow.json
```

### 2. Setup Google Sheet
- Create sheet with 5 tabs
- Import data from `data/` folder
- Copy Sheet ID

### 3. Configure
- Update `YOUR_SHEET_ID` in all Google Sheets nodes
- Select credentials

### 4. Run
- Click "Execute Workflow"
- Check results in Google Sheets

## 📚 Documentation

| File | When to Read |
|------|--------------|
| **INDEX.md** | Overview and navigation |
| **docs/QUICK_START.md** | First-time setup (5 min) |
| **docs/SETUP_GUIDE.md** | Detailed instructions |
| **docs/README.md** | Technical documentation |
| **docs/WORKFLOWS_OVERVIEW.md** | System architecture |

## 🎯 What It Does

**Input:**
- Competitor Facebook data
- CREMO templates
- Market intelligence

**Output:**
- Performance analysis
- 3-5 A/B test recommendations
- Ready-to-use image prompts
- Strategic insights

## 💡 System Flow

```
Reference Workflows (1 & 2)
    ↓
Collect competitor data
    ↓
This Workflow (3)
    ↓
AI Analysis → A/B Tests
    ↓
Ready to create ads! 🎨
```

## 📞 Need Help?

1. Start with `INDEX.md`
2. Follow `docs/QUICK_START.md`
3. Check `docs/SETUP_GUIDE.md` for details

---

**Version:** 1.0.0
**Status:** ✅ Production Ready
**Last Updated:** 2025-11-08
