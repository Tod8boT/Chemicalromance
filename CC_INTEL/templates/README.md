# Google Sheets Templates - CC_INTEL Project

## 📋 Files Included

These 5 CSV templates are ready to import into Google Sheets:

1. **1_Facebook_Raw_Data.csv** - Raw data from Facebook scraping
2. **2_AI_Analysis_Results.csv** - AI-generated analysis outputs
3. **3_Strategic_Intelligence.csv** - A/B test recommendations
4. **4_Cost_Analytics.csv** - API usage and cost tracking
5. **5_Market_Trends.csv** - Long-term trend analysis

---

## 🚀 How to Use

### Option 1: Import to Existing Google Sheets

1. Open your Google Sheets spreadsheet
2. Click **File** → **Import**
3. Upload one CSV file
4. Choose **"Insert new sheet"**
5. Repeat for all 5 files
6. Rename sheets to remove numbers (e.g., "1_Facebook_Raw_Data" → "Facebook_Raw_Data")

### Option 2: Create New Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Blank** to create new spreadsheet
3. Follow "Option 1" steps above to import all 5 CSVs
4. Name your spreadsheet: **"CC_INTEL - Facebook Data"**

### Option 3: Import via Google Drive

1. Upload all 5 CSV files to Google Drive
2. Right-click each file → **Open with** → **Google Sheets**
3. Copy each sheet into one master spreadsheet

---

## 📊 Sheet Descriptions

### Sheet 1: Facebook_Raw_Data
**Purpose:** Store all raw data from Facebook Ad Library scraper

**Columns:**
- `timestamp` - When data was collected (ISO 8601 format)
- `page_id` - Facebook page ID
- `page_name` - Page name (supports Thai text)
- `post_id` - Post/Ad ID
- `post_text` - Post content (Thai/English)
- `engagement_rate` - Percentage (0-100)
- `ad_id` - Advertisement ID
- `ad_text` - Ad copy text
- `image_url` - Image asset URL
- `video_url` - Video asset URL
- `target_audience` - Audience targeting description
- `budget` - Ad budget amount
- `performance_data` - JSON string with metrics

**Example Row:**
```
2025-11-08T14:30:00Z,694634120405666,ไอศครีมครีโม,123_456,โปรโมชั่นพิเศษ!,3.5,789_012,ลด 50%,https://...,https://...,Bangkok 18-35,5000,{"clicks":120,"impressions":3500}
```

---

### Sheet 2: AI_Analysis_Results
**Purpose:** Store AI-generated insights and recommendations

**Columns:**
- `analysis_id` - Unique ID (format: ANA_YYYYMMDD_NNN)
- `source_data_id` - Reference to Facebook_Raw_Data (post_id or ad_id)
- `ai_model` - Model used (gpt-4o, claude-3.5-sonnet, gemini-1.5-pro)
- `summary` - Brief analysis summary
- `rewritten_copy` - AI-rewritten ad copy
- `image_prompt` - Prompt for image generation
- `video_prompt` - Prompt for video generation
- `confidence_score` - AI confidence (0-100)
- `created_date` - Analysis timestamp

**Example Row:**
```
ANA_20251108_001,123_456,gpt-4o,Video content performs 70% better,ลิ้มรสความสุข...,Ice cream product shot with golden hour lighting,Happy family enjoying ice cream,87.5,2025-11-08T15:00:00Z
```

---

### Sheet 3: Strategic_Intelligence
**Purpose:** A/B test recommendations and strategic insights

**Columns:**
- `opportunity_id` - Unique ID (format: OPP_YYYYMMDD_NNN)
- `category` - Type (video_content, posting_time, creative_style, etc.)
- `priority` - high/medium/low
- `test_idea` - Description of A/B test
- `expected_impact` - Predicted outcome
- `success_metrics` - KPIs to measure (JSON array)
- `implementation_notes` - How to execute
- `status` - pending/active/completed

**Example Row:**
```
OPP_20251108_001,video_content,high,Test video vs image posts,+30% engagement,["engagement_rate","reach","video_view_rate"],Use n8n video workflow,pending
```

---

### Sheet 4: Cost_Analytics
**Purpose:** Track API usage and costs

**Columns:**
- `date` - Transaction date (YYYY-MM-DD)
- `api_service` - Service name (apify, openai, claude, gemini)
- `requests_count` - Number of API calls
- `cost_usd` - Cost in USD
- `data_processed` - Amount of data (rows, tokens, etc.)
- `efficiency_score` - Cost per unit (0-100 scale)
- `monthly_total` - Running total for month

**Example Row:**
```
2025-11-08,apify,15,0.45,150,98.5,13.50
```

---

### Sheet 5: Market_Trends
**Purpose:** Long-term trend tracking

**Columns:**
- `trend_id` - Unique ID (format: TRD_YYYYMMDD_NNN)
- `trend_name` - Descriptive name
- `start_date` - When trend was first detected
- `strength` - Trend strength (0-100)
- `competitors_using` - Count of competitors using this
- `opportunity_score` - Business opportunity (0-100)
- `seasonal_pattern` - Pattern description or null

**Example Row:**
```
TRD_20251108_001,Short-form video surge,2025-11-01,85,12,90,Winter promotion season
```

---

## ⚙️ Post-Import Setup

After importing to Google Sheets:

### 1. Format Headers
- Bold all header rows
- Freeze first row (View → Freeze → 1 row)
- Add background color to headers (light gray)

### 2. Set Column Types
**Facebook_Raw_Data:**
- `timestamp`, `created_date` → Date/Time
- `engagement_rate` → Percentage
- `budget` → Currency (USD)

**AI_Analysis_Results:**
- `confidence_score` → Number (0-100)
- `created_date` → Date/Time

**Cost_Analytics:**
- `date` → Date
- `cost_usd`, `monthly_total` → Currency (USD)
- `efficiency_score` → Number

**Strategic_Intelligence:**
- No special formatting needed

**Market_Trends:**
- `start_date` → Date
- `strength`, `opportunity_score` → Number (0-100)
- `competitors_using` → Number

### 3. Data Validation (Optional)
Add dropdown lists:
- **AI_Analysis_Results** → `ai_model`: gpt-4o, claude-3.5-sonnet, gemini-1.5-pro
- **Strategic_Intelligence** → `priority`: high, medium, low
- **Strategic_Intelligence** → `status`: pending, active, completed
- **Cost_Analytics** → `api_service`: apify, openai, claude, gemini

### 4. Conditional Formatting (Optional)
- **Strategic_Intelligence** → Highlight `priority=high` rows in red
- **Cost_Analytics** → Highlight when `monthly_total > budget`
- **AI_Analysis_Results** → Color scale for `confidence_score`

---

## 🔗 Integration

### Get Your Spreadsheet ID
After creating the spreadsheet:
1. Copy the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
2. Extract the ID (between `/d/` and `/edit`)
3. Update `CC_INTEL/docs/INTEGRATION_PLANNING.md` with this ID

### Service Account Access
To allow n8n to write data:
1. Go to Google Cloud Console
2. Create service account
3. Share spreadsheet with service account email
4. Give "Editor" permission

---

## 📝 Sample Data

To test the structure, add sample rows:

**Facebook_Raw_Data:**
```
2025-11-08T10:00:00Z,694634120405666,ไอศครีมครีโม,123_456,ลด 70% วันนี้!,4.2,,,https://example.com/img.jpg,,Bangkok 20-40,3000,{"likes":150,"comments":20}
```

**AI_Analysis_Results:**
```
ANA_20251108_001,123_456,gpt-4o,Strong urgency messaging,,,,85,2025-11-08T11:00:00Z
```

**Strategic_Intelligence:**
```
OPP_20251108_001,timing,high,Test 6-8pm posting,Higher reach,["reach","engagement"],Adjust scheduler,pending
```

**Cost_Analytics:**
```
2025-11-08,apify,10,0.30,100,95,0.30
```

**Market_Trends:**
```
TRD_20251108_001,Video-first content,2025-11-01,80,8,85,
```

---

## ✅ Verification Checklist

After import:
- [ ] All 5 sheets created
- [ ] Headers in row 1 for each sheet
- [ ] Column names match specifications
- [ ] Headers frozen (row 1)
- [ ] Date/number formats applied
- [ ] Spreadsheet ID copied
- [ ] Service account access granted (for automation)

---

## 🚀 Next Steps

Once sheets are ready:
1. Copy Spreadsheet ID
2. Share with n8n service account
3. Update workflow configurations
4. Test batch write operation
5. Begin data collection

---

## 📞 Support

For questions:
- See `CC_INTEL/docs/GOOGLE_SHEETS_ARCHITECTURE.md` for detailed schema
- See `CC_INTEL/src/google-sheets-batch-processor.js` for write operations
- See `CC_INTEL/PROJECT_STATUS.md` for overall progress

---

**Templates created:** 2025-11-08
**Version:** 1.0
**Project:** CC_INTEL - Facebook Data Architecture
