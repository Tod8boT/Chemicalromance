# Workflow Resource Doc: APIFY Facebook Ad Library Scraper

---

## 📋 Overview & Quick Access

| Field | Value |
|-------|-------|
| **Workflow ID** | N/A (Import from file) |
| **File** | `reference-workflows/apify-scraper.json` |
| **Purpose** | Scrape competitor Facebook pages, posts, and ads from Facebook Ad Library using Apify |
| **Status** | ✅ Production Ready |

---

## 🎯 Goal & Success

**Primary Outcome:**  
Automates collection of competitor Facebook advertising data in 3 layers: Page Info → Posts → Ad Details

**Success Criteria:**
- [x] Page data scraped and stored in n8n Data Tables
- [x] Post engagement metrics collected
- [x] Ad creative details (images, videos, copy) extracted
- [x] Pricing tracked in Google Sheets

**Business Value:**  
⏱️ Time saved: ~10 hours/week (manual competitor research)  
💰 Cost impact: Apify usage ~$2-5 per run depending on data volume

---

## 🔄 Workflow Architecture

### Visual Flow

```
[Manual Trigger]
    ↓
[Apify: Facebook Pages Scraper] → [Store: Page Data Table]
    ↓
[Apify: Facebook Posts Scraper] → [Store: Post Data Table]
    ↓
[Apify: Facebook Ads Scraper] → [Store: Ad Data Table]
    ↓
[Track Pricing] → [Google Sheets: Expenses]
```

### Node Purpose Summary

| Node Name | Type | Purpose | Critical Config |
|-----------|------|---------|-----------------|
| Manual Trigger | `n8n-nodes-base.manualTrigger` | Entry point for manual execution | - |
| Facebook Pages Scraper | `n8n-nodes-community.apify` | Scrape Facebook page info | Actor: `anchor/facebook-pages-scraper` |
| Facebook Posts Scraper | `n8n-nodes-community.apify` | Scrape posts from pages | Actor: `anchor/facebook-posts-scraper` |
| Facebook Ads Scraper | `n8n-nodes-community.apify` | Scrape ads from Ad Library | Actor: `apify/facebook-ads-scraper` |
| Store Page Data | `@n8n/n8n-nodes-langchain.n8nDataTables` | Store page results | Table: `facebook_pages` |
| Store Post Data | `@n8n/n8n-nodes-langchain.n8nDataTables` | Store post results | Table: `facebook_posts` |
| Store Ad Data | `@n8n/n8n-nodes-langchain.n8nDataTables` | Store ad results | Table: `facebook_ads` |
| price_sheet | `n8n-nodes-base.googleSheets` | Track Apify usage costs | Sheet ID: `1rAFlwhtvKQUr60soudidfkX19rHz9e2uXkfHXTxzdOY` |

### Related Workflows

| Workflow | ID | Relationship |
|----------|----|--------------| 
| AI Spy Tool | `reference-workflows/ai-spy-tool.json` | Consumes ad data for AI analysis |
| Facebook Ad Analysis | `workflow.json` | Reads scraped data for strategic analysis |

---

## ⚙️ Configuration

### Trigger Setup

**Type:** Manual Trigger  
**Purpose:** Run on-demand when competitor research is needed

### Credentials

| Purpose | Credential Name | Notes |
|---------|----------------|-------|
| Apify API | `apify-api` | Required for all Apify actors |
| Google Sheets | `googleSheetsOAuth2Api` | For expense tracking |
| n8n Data Tables | Built-in | No credential needed |

### Key Settings

**Apify Actors Used:**
1. `anchor/facebook-pages-scraper` - Extracts page info
2. `anchor/facebook-posts-scraper` - Extracts posts with engagement
3. `apify/facebook-ads-scraper` - Extracts active ads

**n8n Data Tables:**
- `facebook_pages` - Page information
- `facebook_posts` - Post content and metrics
- `facebook_ads` - Ad creative and targeting

**Google Sheets Config:**
- Tracks: `price`, `used`, `node`, `date`, `objective`
- Format: Bangkok timezone (Asia/Bangkok)
- Pricing model: Cost per compute unit

---

## 📊 Data Flow

### Input Schema

**Manual input** - Competitor page URLs configured in Apify actor settings:
```json
{
  "pageUrls": [
    "https://www.facebook.com/[page-id]",
    "https://www.facebook.com/[another-page]"
  ]
}
```

### Output Schema (Ad Data Example)

```json
{
  "pageID": "694634120405666",
  "pageName": "ไอศครีมครีโม",
  "adArchiveID": "1774534643171041",
  "startDateFormatted": "2025-09-27T07:00:00.000Z",
  "endDateFormatted": "2025-11-03T08:00:00.000Z",
  "snapshot": {
    "displayFormat": "VIDEO|IMAGE|MULTI_IMAGES",
    "ctaType": "LIKE_PAGE|MESSAGE_PAGE",
    "ctaText": "Like Page|Send message",
    "body": {
      "text": "Ad copy text..."
    },
    "videos": [...],
    "images": [...]
  }
}
```

### Critical Data Fields

**From Pages Scraper:**
- `page.name`, `page.id`, `page.category`
- `page.followers`, `page.likes`

**From Posts Scraper:**
- `post.text`, `post.url`, `post.type`
- `engagement.likes`, `engagement.comments`, `engagement.shares`

**From Ads Scraper:**
- `adArchiveID`, `pageID`, `startDate`, `endDate`
- `displayFormat`, `ctaType`, `images[]`, `videos[]`
- `body.text` (ad copy)

### Storage Locations

1. **n8n Data Tables** (primary storage)
   - `facebook_pages`
   - `facebook_posts`
   - `facebook_ads`

2. **Google Sheets** (expense tracking)
   - Sheet: "expenses" / "data"
   - Columns: `node`, `used`, `price`, `objective`, `date`

---

## 🛡️ Error Handling

### Known Limitations

- **Facebook Rate Limits:** May timeout if scraping too many pages
- **Apify Timeouts:** Default 5-minute timeout per actor
- **Data Volume:** Large page scrapes can use significant Apify credits

### Error Workflow

**Handler:** None configured  
**Notifications:** Manual monitoring via Google Sheets pricing

### Recovery Procedures

- **Apify timeout:** Re-run workflow, actors are resumable
- **Missing data:** Check Apify dashboard for run details
- **Cost overrun:** Monitor Google Sheets `price_sheet` regularly

---

## ✅ Testing & Validation

### Test Scenarios

| Scenario | Expected | Notes |
|----------|----------|-------|
| Single page scrape | Page + Posts + Ads stored | Verify in Data Tables |
| Multiple pages | All pages processed sequentially | Check execution time |
| No active ads | Pages/Posts stored, Ads empty | Valid result |
| Apify credit check | Cost logged to Google Sheets | Monitor pricing |

### Test Data Location

📁 **Sample URLs:** Configure in Apify actor settings  
📊 **Results:** n8n Data Tables → View in n8n interface

---

## 🚀 Deployment

### Pre-Deploy Checklist

- [x] Apify credential configured
- [x] Google Sheets credential configured
- [x] n8n Data Tables created (auto-created on first run)
- [x] Page URLs configured in Apify actors
- [ ] Test with 1-2 pages first

### Post-Deploy Monitoring

**Monitoring Schedule:** After each run  
**Success Rate Target:** >90% (some pages may be deleted/restricted)

**Check Points:**
- n8n Data Tables row counts
- Google Sheets pricing data
- Apify dashboard usage

---

## 🔐 Security & Compliance

**Sensitive Data:** Facebook page data is public (Ad Library)  
**Retention:** Indefinite in n8n Data Tables  
**Credential Rotation:** Apify API key (annually)  
**Access Control:** Team members with n8n access

**Compliance Notes:** 
- Data scraped from Facebook Ad Library is publicly available
- Complies with Facebook's Ad Library API Terms of Service

---

## 📊 Output Data Usage

**Consumed By:**
1. **AI Spy Tool** (`ai-spy-tool.json`)
   - Reads `facebook_ads` data
   - Analyzes creative content with AI
   - Generates prompts and recommendations

2. **Facebook Ad Analysis** (`workflow.json`)
   - Reads competitor data from Google Sheets export
   - Compares with CREMO templates
   - Generates A/B test recommendations

**Export Method:**
- Manual export from n8n Data Tables to Google Sheets
- OR read directly via n8n Data Tables nodes

---

## 📚 Quick Reference

### Important Settings

| Setting | Value |
|---------|-------|
| Expense Sheet ID | `1rAFlwhtvKQUr60soudidfkX19rHz9e2uXkfHXTxzdOY` |
| Timezone | Asia/Bangkok |
| Data Tables | `facebook_pages`, `facebook_posts`, `facebook_ads` |

### Apify Actors

- Pages: `anchor/facebook-pages-scraper`
- Posts: `anchor/facebook-posts-scraper`  
- Ads: `apify/facebook-ads-scraper`

### Support Contacts

- **Owner:** CREMO Team
- **Apify Support:** https://apify.com/support

---

## 💡 Notes & Known Issues

**Known Issues:**
- Apify actors may timeout for large pages (100+ active ads)
- Facebook may restrict access to some pages

**Rate Limits:**
- Apify: Based on subscription plan
- Facebook: No official limit, but excessive requests may be throttled

**Dependencies:**
- Active Apify subscription
- Valid Facebook page URLs

**Future Improvements:**
- [ ] Add automatic retry logic for failed scrapes
- [ ] Schedule automatic daily runs
- [ ] Add Telegram notifications for completion
- [ ] Export data directly to Google Sheets (skip Data Tables)

---

## 🔍 Troubleshooting

**Common Issues:**

| Problem | Solution |
|---------|----------|
| Apify timeout | Reduce number of pages per run |
| No ads found | Page may not have active ads - check Ad Library manually |
| Missing data | Check Apify run logs in Apify dashboard |
| High costs | Review Apify pricing model, reduce scrape frequency |
| Data not in Tables | Check node connections and table names |

---

**Document Version:** 1.0.0  
**Created:** 2025-11-08  
**Status:** ✅ Production Ready
