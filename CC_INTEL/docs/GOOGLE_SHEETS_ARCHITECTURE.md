# Google Sheets Architecture Design
**Project:** CC_INTEL - Facebook Data Architecture
**Version:** 1.0
**Last Updated:** 2025-11-08
**Status:** Design Complete

---

## 📊 Overview

This document specifies the Google Sheets architecture for storing and managing Facebook workflow data, designed to handle large data volumes while respecting API rate limits.

### Design Principles
- **Scalability:** Support 1000+ records without performance degradation
- **API Efficiency:** Stay within Google Sheets API limits (100 requests/100s/user)
- **Data Integrity:** Prevent duplicates, validate formats, handle Thai text
- **Maintainability:** Clear structure, easy archival, simple recovery

---

## 🗂️ Sheet Structure

### Sheet 1: Facebook_Raw_Data

**Purpose:** Store all raw data from Facebook Ad Library scraper

**Columns:**
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| timestamp | datetime | Collection time | 2025-11-08T12:00:00Z |
| data_type | enum | pages/posts/ads | "ads" |
| page_id | string | Facebook page ID | "694634120405666" |
| page_name | string | Page name | "ไอศครีมครีโม" |
| followers | integer | Follower count | 2480 |
| likes | integer | Page likes | 2350 |
| category | string | Business category | "Food & Beverage" |
| post_id | string | Post/Ad ID | "123456789_987654321" |
| post_text | text | Content text (Thai/English) | "ลด 70% วันนี้!" |
| engagement_total | integer | Total engagement | 450 |
| engagement_likes | integer | Like count | 320 |
| engagement_comments | integer | Comment count | 85 |
| engagement_shares | integer | Share count | 45 |
| media_type | enum | image/video/carousel | "video" |
| media_url | url | Media file URL | "https://..." |
| ad_copy | text | Ad copywriting | "สนุกกับไอศครีม..." |
| archive_status | enum | active/archived | "active" |
| archive_date | date | When archived | 2025-10-01 |

**Data Retention:**
- **Daily Data:** Keep 30 days in active sheet
- **Weekly Rollup:** Keep 12 weeks
- **Monthly Archive:** Keep indefinitely in archive sheet

**Sheet Naming Convention:**
- `Facebook_Raw_Data` (active - last 30 days)
- `Facebook_Raw_Data_Archive_2025_10` (monthly archives)
- `Facebook_Raw_Data_Archive_2025_Q3` (quarterly rollups)

---

### Sheet 2: AI_Analysis_Results

**Purpose:** Store AI-generated analysis and strategic insights

**Columns:**
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| analysis_id | string | Unique ID | "ANA_20251108_001" |
| timestamp | datetime | Analysis time | 2025-11-08T14:30:00Z |
| analysis_type | enum | competitor/creative/market | "competitor" |
| source_data_id | string | Reference to raw data | "POST_123456" |
| competitor_page | string | Analyzed page | "ไอศครีมครีโม" |
| summary | text | Executive summary | "3 key insights detected..." |
| strategic_insights | json | Array of insights | ["video 70%", "post 6-8pm"] |
| opportunity_gaps | json | Missing strategies | ["no UGC", "no seasonal"] |
| rewritten_ad_copy | text | AI-generated copy | "ลิ้มรสความสุข..." |
| image_prompt | text | Visual generation prompt | "ice cream product shot..." |
| video_prompt | text | Video concept prompt | "happy family enjoying..." |
| confidence_score | float | AI confidence 0-100 | 87.5 |
| model_used | string | AI model name | "gpt-4o" |
| tokens_used | integer | API usage | 1250 |
| cost_usd | float | Analysis cost | 0.025 |

**Indexing:**
- Primary: `analysis_id`
- Secondary: `timestamp`, `competitor_page`
- Foreign Key: `source_data_id` → Facebook_Raw_Data

---

### Sheet 3: Strategic_Intelligence

**Purpose:** Actionable insights and A/B test recommendations

**Columns:**
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| intelligence_id | string | Unique ID | "INT_20251108_001" |
| timestamp | datetime | Created time | 2025-11-08T15:00:00Z |
| intelligence_type | enum | ab_test/insight/trend | "ab_test" |
| priority | enum | high/medium/low | "high" |
| category | string | Content category | "video_content" |
| insight_title | string | Short description | "Video timing optimization" |
| insight_detail | text | Full description | "Videos posted 6-8pm get..." |
| recommended_action | text | What to do | "Schedule videos at 7pm..." |
| expected_impact | enum | high/medium/low | "high" |
| ab_test_hypothesis | text | Test theory | "Evening videos > morning" |
| ab_test_variant_a | json | Control variant | {"time": "9am", "format": "video"} |
| ab_test_variant_b | json | Test variant | {"time": "7pm", "format": "video"} |
| success_metrics | json | KPIs to track | ["engagement", "reach"] |
| regional_focus | string | Target region | "Bangkok" |
| template_recommendation | string | CREMO template | "flash_sale" |
| deadline | date | Action deadline | 2025-11-15 |
| status | enum | pending/active/completed | "pending" |
| implementation_notes | text | How to execute | "Use n8n workflow..." |

**Workflow Integration:**
- Auto-generated from AI_Analysis_Results
- Feeds into A/B Testing workflow
- Updates status when tests run

---

### Sheet 4: Cost_Analytics

**Purpose:** Track API usage, costs, and ROI

**Columns:**
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| record_id | string | Unique ID | "COST_20251108_001" |
| timestamp | datetime | Transaction time | 2025-11-08T12:00:00Z |
| service_type | enum | apify/openai/claude/gemini | "apify" |
| workflow_id | string | n8n workflow | "EGoXsM5lI8hhGNz3" |
| workflow_name | string | Workflow name | "APIFY Facebook Scraper" |
| operation_type | string | What was done | "page_scrape" |
| records_processed | integer | Data volume | 150 |
| api_calls_made | integer | Request count | 15 |
| tokens_used | integer | AI tokens (if applicable) | 2500 |
| cost_usd | float | Total cost | 0.45 |
| cost_breakdown | json | Cost details | {"compute": 0.30, "api": 0.15} |
| success_rate | float | % successful | 98.5 |
| error_count | integer | Failed operations | 2 |
| performance_ms | integer | Execution time | 45000 |
| month | string | Billing period | "2025-11" |
| daily_budget_usd | float | Daily limit | 5.00 |
| monthly_budget_usd | float | Monthly limit | 150.00 |
| budget_remaining | float | Available funds | 120.50 |

**Analytics Queries:**
```
- Daily cost trend: GROUP BY DATE(timestamp)
- Cost per workflow: GROUP BY workflow_name
- ROI calculation: (value_generated - cost) / cost
- Budget burn rate: SUM(cost) / days_in_month
```

---

### Sheet 5: Market_Trends

**Purpose:** Long-term pattern tracking and competitive intelligence

**Columns:**
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| trend_id | string | Unique ID | "TREND_20251108_001" |
| timestamp | datetime | Recorded time | 2025-11-08T16:00:00Z |
| trend_type | enum | competitor/seasonal/format | "seasonal" |
| trend_category | string | Content category | "promotional_content" |
| trend_description | text | What's happening | "Ice cream promos surge..." |
| time_period | string | Analysis window | "2025-11-01 to 2025-11-07" |
| competitor_pages | json | Pages analyzed | ["page1", "page2"] |
| pattern_detected | text | Pattern description | "50% increase in video ads" |
| engagement_benchmark | float | Industry average | 3.5 |
| our_performance | float | Our metrics | 4.2 |
| performance_gap | float | Difference % | +20.0 |
| seasonal_factor | string | Season/event | "Winter promotion season" |
| regional_variation | json | Regional differences | {"Bangkok": +30%, "Chiang Mai": +15%} |
| content_format_trend | json | Format distribution | {"video": 70%, "image": 25%} |
| posting_time_trend | json | Optimal times | {"peak": "6-8pm", "low": "2-4am"} |
| prediction_next_week | text | Forecast | "Video content to increase..." |
| confidence_level | enum | high/medium/low | "high" |
| data_source_count | integer | Sample size | 450 |

**Trend Analysis:**
- Weekly reports: Aggregate 7-day windows
- Monthly reports: Aggregate 30-day windows
- YoY comparison: Same period last year

---

## 🔄 Data Flow Architecture

### Write Operations Flow

```
n8n Workflow → Batch Processor → Validation Layer → Google Sheets API → Sheet Storage
     ↓              ↓                    ↓                    ↓                ↓
  Raw data    Group 100 rows    Check duplicates    Rate limited    Append rows
  from API    per batch         Validate formats     1 req/second    Update index
```

### Read Operations Flow

```
Query Request → Index Lookup → Cached Data Check → Google Sheets API → Data Return
      ↓              ↓                ↓                     ↓               ↓
  Filter spec   Find range      Hit/Miss cache      Batch read      JSON format
  Date range    Calculate size  Reduce API calls    100 rows/req    Thai text safe
```

---

## ⚙️ API Optimization Strategy

### Rate Limiting Configuration

**Google Sheets API Limits:**
- Read: 100 requests / 100 seconds / user
- Write: 100 requests / 100 seconds / user
- Total: 300 requests / 100 seconds / project

**Our Strategy:**
```javascript
const API_LIMITS = {
  MAX_READS_PER_100S: 90,      // Leave buffer
  MAX_WRITES_PER_100S: 90,     // Leave buffer
  BATCH_SIZE: 100,              // Rows per write
  DELAY_BETWEEN_BATCHES: 1200,  // 1.2 seconds
  MAX_RETRIES: 3,
  BACKOFF_MULTIPLIER: 2
};
```

### Batch Processing Logic

```javascript
async function writeBatchData(data, sheetId, sheetName) {
  const batchSize = API_LIMITS.BATCH_SIZE;
  const batches = chunkArray(data, batchSize);

  console.log(`Processing ${data.length} rows in ${batches.length} batches`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const startRow = (i * batchSize) + 2; // +2 for header
    const range = `${sheetName}!A${startRow}:Z${startRow + batch.length - 1}`;

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: batch }
      });

      console.log(`✓ Batch ${i + 1}/${batches.length} written`);

      // Rate limiting delay
      if (i < batches.length - 1) {
        await sleep(API_LIMITS.DELAY_BETWEEN_BATCHES);
      }

    } catch (error) {
      console.error(`✗ Batch ${i + 1} failed:`, error.message);

      // Retry with exponential backoff
      await retryWithBackoff(async () => {
        await sheets.spreadsheets.values.append({...});
      }, API_LIMITS.MAX_RETRIES);
    }
  }
}
```

### Deduplication Strategy

```javascript
async function checkDuplicates(newData, sheetId, sheetName, keyColumn) {
  // Read existing keys (optimized single query)
  const existingKeys = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetName}!${keyColumn}:${keyColumn}`
  });

  const keySet = new Set(existingKeys.data.values.flat());

  // Filter out duplicates
  const uniqueData = newData.filter(row => {
    const key = row[0]; // Assuming first column is key
    return !keySet.has(key);
  });

  console.log(`Filtered ${newData.length - uniqueData.length} duplicates`);
  return uniqueData;
}
```

---

## 📦 Archival System

### Monthly Archive Process

**Trigger:** First day of each month (automated n8n workflow)

**Steps:**
1. **Identify old data:** Records older than 30 days
2. **Create archive sheet:** `Facebook_Raw_Data_Archive_YYYY_MM`
3. **Copy data:** Batch copy to archive sheet
4. **Verify integrity:** Check row counts match
5. **Delete from active:** Remove archived rows
6. **Update index:** Log archive operation

**Implementation:**
```javascript
async function archiveOldData(sheetId, cutoffDate) {
  const activeSheet = 'Facebook_Raw_Data';
  const archiveSheet = `Facebook_Raw_Data_Archive_${cutoffDate.format('YYYY_MM')}`;

  // 1. Read old data
  const oldData = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${activeSheet}!A:Z`
  });

  const rowsToArchive = oldData.data.values.filter(row => {
    const timestamp = new Date(row[0]);
    return timestamp < cutoffDate;
  });

  // 2. Create archive sheet (if not exists)
  await createSheetIfNotExists(sheetId, archiveSheet);

  // 3. Write to archive (batched)
  await writeBatchData(rowsToArchive, sheetId, archiveSheet);

  // 4. Delete from active (keep header)
  await deleteOldRows(sheetId, activeSheet, cutoffDate);

  console.log(`✓ Archived ${rowsToArchive.length} rows to ${archiveSheet}`);
}
```

---

## 🔒 Data Validation Rules

### Field Validation

```javascript
const VALIDATION_RULES = {
  timestamp: {
    type: 'datetime',
    format: 'ISO8601',
    required: true,
    validate: (val) => !isNaN(Date.parse(val))
  },

  page_id: {
    type: 'string',
    pattern: /^\d{10,20}$/,
    required: true
  },

  page_name: {
    type: 'string',
    maxLength: 200,
    allowThai: true,
    required: true
  },

  followers: {
    type: 'integer',
    min: 0,
    max: 100000000
  },

  engagement_total: {
    type: 'integer',
    min: 0,
    calculated: (row) => {
      return row.engagement_likes +
             row.engagement_comments +
             row.engagement_shares;
    }
  },

  media_url: {
    type: 'url',
    pattern: /^https?:\/\/.+/,
    allowNull: true
  }
};

function validateRow(row, rules) {
  const errors = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = row[field];

    // Required check
    if (rule.required && (value === null || value === undefined)) {
      errors.push(`${field} is required`);
      continue;
    }

    // Type check
    if (value !== null && rule.type) {
      if (rule.type === 'integer' && !Number.isInteger(value)) {
        errors.push(`${field} must be integer`);
      }
      if (rule.type === 'url' && !rule.pattern.test(value)) {
        errors.push(`${field} must be valid URL`);
      }
    }

    // Range check
    if (rule.min !== undefined && value < rule.min) {
      errors.push(`${field} must be >= ${rule.min}`);
    }
    if (rule.max !== undefined && value > rule.max) {
      errors.push(`${field} must be <= ${rule.max}`);
    }
  }

  return errors.length > 0 ? errors : null;
}
```

### Thai Text Encoding

```javascript
function ensureThaiTextSafe(text) {
  if (!text) return '';

  // Ensure UTF-8 encoding
  const encoded = Buffer.from(text, 'utf8').toString('utf8');

  // Validate Thai characters (Unicode range: 0E00-0E7F)
  const hasValidThai = /[\u0E00-\u0E7F]/.test(encoded);

  // Remove problematic characters
  const cleaned = encoded
    .replace(/[\u0000-\u001F]/g, '') // Control characters
    .replace(/[\uFFFD]/g, '');        // Replacement character

  return cleaned;
}
```

---

## 📊 Query Optimization

### Indexed Queries

**Problem:** Reading entire sheet is slow for large datasets

**Solution:** Create index sheets for fast lookups

```javascript
// Index Sheet: Facebook_Raw_Data_Index
// Columns: page_id, first_row, last_row, record_count, min_date, max_date

async function queryByPageId(pageId, sheetId) {
  // 1. Query index (1 API call)
  const index = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Facebook_Raw_Data_Index!A:F'
  });

  const pageIndex = index.data.values.find(row => row[0] === pageId);

  if (!pageIndex) {
    return [];
  }

  // 2. Query only relevant rows (1 API call)
  const [, firstRow, lastRow] = pageIndex;
  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `Facebook_Raw_Data!A${firstRow}:Z${lastRow}`
  });

  return data.data.values;
}
```

---

## 🧪 Testing & Validation

### Load Testing

**Test Case 1: High Volume Write**
```javascript
// Simulate 1000 records write
const testData = generateMockData(1000);
await writeBatchData(testData, SHEET_ID, 'Facebook_Raw_Data');

// Verify:
// - All records written
// - No duplicates
// - Thai text intact
// - API limits not exceeded
```

**Test Case 2: Concurrent Workflows**
```javascript
// Run 3 workflows simultaneously
await Promise.all([
  writeApifyData(data1),
  writeAIAnalysis(data2),
  writeStrategicInsights(data3)
]);

// Verify:
// - No rate limit errors
// - All data committed
// - No data corruption
```

### Data Integrity Tests

```javascript
async function verifyDataIntegrity(sheetId) {
  const tests = {
    noDuplicates: await checkNoDuplicateIds(sheetId),
    thaiTextValid: await checkThaiTextEncoding(sheetId),
    foreignKeysValid: await checkForeignKeyIntegrity(sheetId),
    calculatedFieldsCorrect: await checkCalculatedFields(sheetId),
    timestampsValid: await checkTimestampFormats(sheetId)
  };

  return tests;
}
```

---

## 📈 Performance Metrics

### Target Performance

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Write 100 rows | < 2 seconds | TBD | 🟡 Pending |
| Read 1000 rows | < 3 seconds | TBD | 🟡 Pending |
| API errors | < 1% | TBD | 🟡 Pending |
| Data accuracy | 99.9% | TBD | 🟡 Pending |
| Thai text success | 100% | TBD | 🟡 Pending |
| Archive speed | < 5 min/month | TBD | 🟡 Pending |

### Monitoring Dashboard

**Key Metrics to Track:**
- API calls per minute
- Error rate by operation type
- Average response time
- Data volume growth rate
- Storage utilization
- Cost per 1000 records

---

## 🚀 Deployment Checklist

- [ ] Create Google Sheets with 5 tabs
- [ ] Set up service account authentication
- [ ] Configure API rate limiting
- [ ] Implement batch processing functions
- [ ] Add validation rules
- [ ] Create archival automation
- [ ] Set up monitoring alerts
- [ ] Test with 100 records
- [ ] Test with 1000 records
- [ ] Load test with 10,000 records
- [ ] Document API keys and credentials
- [ ] Train team on maintenance procedures

---

## 📞 Support & Maintenance

### Common Issues

**Issue: Rate limit exceeded**
- Solution: Increase delay between batches
- Check: DELAY_BETWEEN_BATCHES setting

**Issue: Thai text corrupted**
- Solution: Apply ensureThaiTextSafe() before write
- Check: UTF-8 encoding at all stages

**Issue: Duplicate data**
- Solution: Run deduplication script
- Check: Key column uniqueness

### Maintenance Schedule

- **Daily:** Monitor API usage
- **Weekly:** Check error logs
- **Monthly:** Run archival process
- **Quarterly:** Review and optimize queries

---

**Architecture Status:** ✅ DESIGN COMPLETE
**Next Step:** Implementation & Testing
**Owner:** Claude Sonnet 4 + n8n MCP
