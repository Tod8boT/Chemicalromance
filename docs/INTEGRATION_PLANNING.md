# Integration Planning - CC_INTEL Facebook Workflows
**Project:** CC_INTEL - Facebook Data Architecture
**Version:** 1.0
**Last Updated:** 2025-11-08
**Status:** Planning Complete

---

## 🎯 Integration Overview

This document outlines how the 3 Facebook workflows integrate with Google Sheets storage and the AI Market Intelligence Agent.

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    FACEBOOK DATA SOURCES                        │
├─────────────────────────────────────────────────────────────────┤
│  • Facebook Ad Library (via Apify)                              │
│  • Facebook Pages API                                           │
│  • Facebook Ads API                                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    N8N WORKFLOWS (3)                            │
├─────────────────────────────────────────────────────────────────┤
│  1. APIFY Facebook Ad Library Scraper (EGoXsM5lI8hhGNz3)        │
│  2. AI Facebook Ad Spy Tool (9AxbvFjt6D5PTQMn)                  │
│  3. Facebook Ad Analysis & A/B Testing (tEOYKf88Pi5VzjSO)       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  BATCH PROCESSOR LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  • Data validation & cleaning                                   │
│  • Thai text encoding                                           │
│  • Deduplication                                                │
│  • Batch creation (100 rows)                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  GOOGLE SHEETS STORAGE                          │
├─────────────────────────────────────────────────────────────────┤
│  • Facebook_Raw_Data                                            │
│  • AI_Analysis_Results                                          │
│  • Strategic_Intelligence                                       │
│  • Cost_Analytics                                               │
│  • Market_Trends                                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│               AI MARKET INTELLIGENCE AGENT                      │
├─────────────────────────────────────────────────────────────────┤
│  • Competitive analysis                                         │
│  • Creative performance analysis                                │
│  • Trend prediction                                             │
│  • A/B test generation                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                       OUTPUTS                                   │
├─────────────────────────────────────────────────────────────────┤
│  • Weekly Market Reports                                        │
│  • Real-time Alerts                                             │
│  • A/B Test Queue                                               │
│  • Strategic Dashboards                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Workflow Integration Details

### Workflow 1: APIFY Facebook Ad Library Scraper

**Workflow ID:** `EGoXsM5lI8hhGNz3`

**Current State:**
- Scrapes Facebook Ad Library via Apify
- Collects pages, posts, ads, engagement data
- Currently saves to Data Tables (deprecated)

**New Architecture:**

```javascript
// Workflow nodes:
1. Schedule Trigger (daily at 2 AM)
   ↓
2. Apify - Fetch Facebook Data
   ↓
3. Code Node - Process & Validate Data
   ↓
4. Code Node - Batch Processor
   ↓
5. Google Sheets - Write Batches (loop)
   ↓
6. Code Node - Log Cost Analytics
   ↓
7. Google Sheets - Write Cost Data
   ↓
8. Webhook - Trigger AI Analysis (if new data)
```

**Implementation:**

**Node 3: Process & Validate Data**
```javascript
// Process Apify output
const apifyData = $input.all();
const processedRows = [];

for (const item of apifyData) {
  // Extract page data
  if (item.json.pageInfo) {
    processedRows.push([
      new Date().toISOString(),           // timestamp
      'page',                              // data_type
      item.json.pageInfo.id,              // page_id
      item.json.pageInfo.name,            // page_name
      item.json.pageInfo.followers || 0,  // followers
      item.json.pageInfo.likes || 0,      // likes
      item.json.pageInfo.category,        // category
      '',                                  // post_id (empty for pages)
      '',                                  // post_text
      0,                                   // engagement_total
      0,                                   // engagement_likes
      0,                                   // engagement_comments
      0,                                   // engagement_shares
      '',                                  // media_type
      '',                                  // media_url
      '',                                  // ad_copy
      'active',                            // archive_status
      ''                                   // archive_date
    ]);
  }

  // Extract post data
  if (item.json.posts) {
    for (const post of item.json.posts) {
      processedRows.push([
        new Date().toISOString(),
        'post',
        item.json.pageInfo.id,
        item.json.pageInfo.name,
        0, 0, '', // page-level fields (empty)
        post.id,
        post.text || '',
        post.engagement.total || 0,
        post.engagement.likes || 0,
        post.engagement.comments || 0,
        post.engagement.shares || 0,
        post.mediaType || '',
        post.mediaUrl || '',
        '',
        'active',
        ''
      ]);
    }
  }

  // Extract ad data
  if (item.json.ads) {
    for (const ad of item.json.ads) {
      processedRows.push([
        new Date().toISOString(),
        'ad',
        item.json.pageInfo.id,
        item.json.pageInfo.name,
        0, 0, '', // page-level fields
        ad.id,
        ad.adText || '',
        0, 0, 0, 0, // engagement (may not be available)
        ad.mediaType || '',
        ad.mediaUrl || '',
        ad.adCopy || '',
        'active',
        ''
      ]);
    }
  }
}

return [{ json: { rows: processedRows } }];
```

**Node 4: Batch Processor**
```javascript
// Import batch processor logic
const { ensureThaiTextSafe, chunkArray } = require('./google-sheets-batch-processor');

const allRows = $input.first().json.rows;

// Clean Thai text
const cleanedRows = allRows.map(row =>
  row.map(cell =>
    typeof cell === 'string' ? ensureThaiTextSafe(cell) : cell
  )
);

// Create batches
const batches = chunkArray(cleanedRows, 100);

// Return batches for loop node
return batches.map((batch, index) => ({
  json: {
    batch_number: index + 1,
    total_batches: batches.length,
    rows: batch,
    sheet_name: 'Facebook_Raw_Data',
    range: `Facebook_Raw_Data!A${2 + index * 100}:Q${2 + index * 100 + batch.length - 1}`
  }
}));
```

**Node 5: Google Sheets - Write Batches**
```
Type: Google Sheets (Loop)
Operation: Append
Sheet: {{ $json.sheet_name }}
Range: {{ $json.range }}
Data: {{ $json.rows }}

Options:
  - Value Input Option: RAW
  - Insert Data Option: INSERT_ROWS

Loop Settings:
  - For Each Output Item: Yes
  - Delay Between Items: 1200ms (rate limiting)
```

**Node 6: Log Cost Analytics**
```javascript
const apifyRun = $node["Apify"].json;

const costRow = [
  new Date().toISOString(),              // timestamp
  'apify',                               // service_type
  'EGoXsM5lI8hhGNz3',                   // workflow_id
  'APIFY Facebook Scraper',             // workflow_name
  'page_scrape',                        // operation_type
  $json.total_records || 0,             // records_processed
  apifyRun.usage?.requestCount || 0,    // api_calls_made
  0,                                     // tokens_used (N/A)
  apifyRun.usage?.computeUnits * 0.03 || 0, // cost_usd
  JSON.stringify(apifyRun.usage || {}), // cost_breakdown
  100,                                   // success_rate
  0,                                     // error_count
  apifyRun.runtime || 0,                // performance_ms
  new Date().toISOString().slice(0, 7), // month (YYYY-MM)
  5.00,                                  // daily_budget_usd
  150.00,                                // monthly_budget_usd
  0                                      // budget_remaining (calculate separately)
];

return [{ json: { cost_row: [costRow] } }];
```

---

### Workflow 2: AI Facebook Ad Spy Tool

**Workflow ID:** `9AxbvFjt6D5PTQMn`

**Purpose:**
- Takes raw Facebook ad data
- Analyzes with AI (GPT-4o/Claude)
- Generates strategic insights and rewritten copy

**New Architecture:**

```javascript
// Workflow nodes:
1. Schedule Trigger (daily at 3 AM, after scraper)
   ↓
2. Google Sheets - Read New Ads (last 24h)
   ↓
3. Filter - Only unanalyzed ads
   ↓
4. Loop - Process Each Ad
   ├─ 4a. OpenAI GPT-4o - Analyze Creative
   ├─ 4b. Claude - Strategic Analysis
   └─ 4c. Code - Generate Rewritten Copy
   ↓
5. Code Node - Format Results
   ↓
6. Code Node - Batch Processor
   ↓
7. Google Sheets - Write Analysis Results
   ↓
8. Code Node - Update Market Trends
   ↓
9. Google Sheets - Write Trends
```

**Implementation:**

**Node 2: Read New Ads**
```
Type: Google Sheets
Operation: Read
Sheet: Facebook_Raw_Data
Range: A:Q
Filter:
  - data_type = "ad"
  - timestamp > (now - 24 hours)
  - NOT IN analyzed_ids (query from AI_Analysis_Results)
```

**Node 4a: Analyze Creative**
```javascript
// For each ad
const ad = $input.first().json;

const prompt = `
Analyze this Facebook ad creative:

Ad Copy: "${ad.ad_copy}"
Media Type: ${ad.media_type}
Media URL: ${ad.media_url}
Page: ${ad.page_name}

Provide analysis:
1. Visual effectiveness (if image/video)
2. Copy effectiveness
3. Value proposition clarity
4. CTA strength
5. Overall score (0-100)
6. Success factors
7. Improvement suggestions

JSON format:
{
  "visual_score": 0-100,
  "copy_score": 0-100,
  "overall_score": 0-100,
  "success_factors": [...],
  "improvements": [...]
}
`;

// Call OpenAI
const response = await $http.request({
  method: 'POST',
  url: 'https://api.openai.com/v1/chat/completions',
  headers: {
    'Authorization': `Bearer ${$credentials.openAiApi.apiKey}`,
    'Content-Type': 'application/json'
  },
  body: {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a Facebook ads expert.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  }
});

return [{
  json: {
    ad_id: ad.post_id,
    creative_analysis: JSON.parse(response.choices[0].message.content),
    tokens_used: response.usage.total_tokens,
    cost: response.usage.total_tokens * 0.00001 // $0.01/1k tokens
  }
}];
```

**Node 4b: Strategic Analysis**
```javascript
const ad = $input.first().json;
const creativeAnalysis = $node["OpenAI GPT-4o"].json.creative_analysis;

const prompt = `
Provide strategic analysis for this ad:

Ad: "${ad.ad_copy}"
Page: ${ad.page_name}
Creative Analysis: ${JSON.stringify(creativeAnalysis)}

Strategic questions:
1. What market positioning does this suggest?
2. What audience is this targeting?
3. What competitive advantages are highlighted?
4. What gaps or weaknesses exist?
5. How should we respond strategically?

JSON format:
{
  "market_positioning": "...",
  "target_audience": "...",
  "competitive_advantages": [...],
  "gaps_weaknesses": [...],
  "strategic_response": "..."
}
`;

const response = await $http.request({
  method: 'POST',
  url: 'https://api.anthropic.com/v1/messages',
  headers: {
    'x-api-key': $credentials.claudeApi.apiKey,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json'
  },
  body: {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [
      { role: 'user', content: prompt }
    ]
  }
});

return [{
  json: {
    strategic_analysis: JSON.parse(response.content[0].text),
    tokens_used: response.usage.input_tokens + response.usage.output_tokens,
    cost: (response.usage.input_tokens * 0.000003) + (response.usage.output_tokens * 0.000015)
  }
}];
```

**Node 5: Format Results**
```javascript
const ad = $input.first().json;
const creative = $node["OpenAI GPT-4o"].json;
const strategic = $node["Claude"].json;

const analysisRow = [
  `ANA_${Date.now()}`,                          // analysis_id
  new Date().toISOString(),                     // timestamp
  'competitor',                                 // analysis_type
  ad.post_id,                                   // source_data_id
  ad.page_name,                                 // competitor_page
  strategic.strategic_analysis.market_positioning, // summary
  JSON.stringify(creative.creative_analysis.success_factors), // strategic_insights
  JSON.stringify(strategic.strategic_analysis.gaps_weaknesses), // opportunity_gaps
  '',                                           // rewritten_ad_copy (generate separately)
  '',                                           // image_prompt
  '',                                           // video_prompt
  creative.creative_analysis.overall_score,    // confidence_score
  'gpt-4o + claude-3.5-sonnet',               // model_used
  creative.tokens_used + strategic.tokens_used, // tokens_used
  creative.cost + strategic.cost               // cost_usd
];

return [{ json: { analysis_row: analysisRow } }];
```

---

### Workflow 3: Facebook Ad Analysis & A/B Testing

**Workflow ID:** `tEOYKf88Pi5VzjSO`

**Purpose:**
- Aggregate analysis results
- Generate A/B test recommendations
- Identify regional opportunities
- Match CREMO templates

**New Architecture:**

```javascript
// Workflow nodes:
1. Schedule Trigger (daily at 4 AM)
   ↓
2. Google Sheets - Read Analysis Results (last 7 days)
   ↓
3. Google Sheets - Read Raw Data (last 7 days)
   ↓
4. Code Node - Aggregate Performance Data
   ↓
5. Code Node - Identify Patterns & Gaps
   ↓
6. AI Agent - Generate A/B Tests
   ↓
7. Code Node - Format Strategic Intelligence
   ↓
8. Google Sheets - Write Strategic Intelligence
   ↓
9. Code Node - Check Alert Conditions
   ↓
10. IF Node - Alerts Triggered?
    ├─ Yes → Send Notifications
    └─ No → End
```

**Implementation:**

**Node 4: Aggregate Performance**
```javascript
const analysisData = $node["Read Analysis Results"].json;
const rawData = $node["Read Raw Data"].json;

// Group by page
const pagePerformance = {};

rawData.forEach(row => {
  const page = row.page_name;
  if (!pagePerformance[page]) {
    pagePerformance[page] = {
      total_posts: 0,
      total_engagement: 0,
      formats: {},
      posting_times: [],
      best_performing: [],
      worst_performing: []
    };
  }

  pagePerformance[page].total_posts++;
  pagePerformance[page].total_engagement += row.engagement_total;

  // Track format distribution
  if (row.media_type) {
    pagePerformance[page].formats[row.media_type] =
      (pagePerformance[page].formats[row.media_type] || 0) + 1;
  }

  // Track posting times
  const hour = new Date(row.timestamp).getHours();
  pagePerformance[page].posting_times.push(hour);

  // Track high performers
  if (row.engagement_total > 500) {
    pagePerformance[page].best_performing.push({
      post_id: row.post_id,
      engagement: row.engagement_total,
      format: row.media_type,
      text: row.post_text
    });
  }
});

// Calculate averages and insights
for (const page in pagePerformance) {
  const data = pagePerformance[page];

  data.avg_engagement = data.total_engagement / data.total_posts;

  // Find peak posting hours
  const hourCounts = {};
  data.posting_times.forEach(hour => {
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  data.peak_hours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => `${hour}:00`);

  // Sort best/worst
  data.best_performing.sort((a, b) => b.engagement - a.engagement);
  data.best_performing = data.best_performing.slice(0, 10);
}

return [{ json: { page_performance: pagePerformance } }];
```

**Node 6: Generate A/B Tests**
```javascript
const performance = $node["Aggregate Performance"].json.page_performance;
const ourStrategy = {
  video_ratio: 0.30,
  posting_times: ['09:00', '13:00', '17:00'],
  avg_engagement: 250
};

const tests = [];

// Analyze each competitor
for (const [page, data] of Object.entries(performance)) {
  // Skip if not performing better than us
  if (data.avg_engagement <= ourStrategy.avg_engagement) continue;

  // Format test
  const videoRatio = (data.formats.video || 0) / data.total_posts;
  if (videoRatio > ourStrategy.video_ratio + 0.15) {
    tests.push({
      intelligence_id: `INT_${Date.now()}_${tests.length}`,
      timestamp: new Date().toISOString(),
      intelligence_type: 'ab_test',
      priority: 'high',
      category: 'video_content',
      insight_title: 'Increase video content ratio',
      insight_detail: `${page} uses ${(videoRatio * 100).toFixed(0)}% video vs our ${(ourStrategy.video_ratio * 100).toFixed(0)}%`,
      recommended_action: `Test increasing video ratio to ${((videoRatio + ourStrategy.video_ratio) / 2 * 100).toFixed(0)}%`,
      expected_impact: 'high',
      ab_test_hypothesis: 'More video content will increase engagement',
      ab_test_variant_a: JSON.stringify({ video_ratio: ourStrategy.video_ratio }),
      ab_test_variant_b: JSON.stringify({ video_ratio: (videoRatio + ourStrategy.video_ratio) / 2 }),
      success_metrics: JSON.stringify(['engagement_rate', 'video_view_rate']),
      regional_focus: 'Bangkok',
      template_recommendation: 'video_testimonial',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      implementation_notes: 'Use n8n video content workflow'
    });
  }

  // Timing test
  const peakHours = data.peak_hours;
  const overlap = peakHours.filter(h => ourStrategy.posting_times.includes(h));
  if (overlap.length === 0) {
    tests.push({
      intelligence_id: `INT_${Date.now()}_${tests.length}`,
      timestamp: new Date().toISOString(),
      intelligence_type: 'ab_test',
      priority: 'high',
      category: 'posting_time',
      insight_title: 'Test competitor peak posting times',
      insight_detail: `${page} gets best engagement at ${peakHours.join(', ')}`,
      recommended_action: `Test posting at ${peakHours[0]}`,
      expected_impact: 'medium',
      ab_test_hypothesis: 'Posting at competitor peak times will increase reach',
      ab_test_variant_a: JSON.stringify({ posting_times: ourStrategy.posting_times }),
      ab_test_variant_b: JSON.stringify({ posting_times: peakHours }),
      success_metrics: JSON.stringify(['reach', 'engagement_rate']),
      regional_focus: 'Bangkok',
      template_recommendation: '',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      implementation_notes: 'Adjust scheduler workflow'
    });
  }
}

// Sort by priority
tests.sort((a, b) => {
  const priority = { high: 3, medium: 2, low: 1 };
  return priority[b.priority] - priority[a.priority];
});

// Return top 5 tests
return [{ json: { tests: tests.slice(0, 5) } }];
```

---

## 🤖 AI Agent Integration

### Weekly Analysis Trigger

**Workflow:** `AI_Weekly_Market_Report`

```javascript
// Schedule: Every Monday at 9 AM

1. Schedule Trigger
   ↓
2. Google Sheets - Read Last Week Data
   ├─ Facebook_Raw_Data (7 days)
   ├─ AI_Analysis_Results (7 days)
   └─ Strategic_Intelligence (7 days)
   ↓
3. Code Node - Prepare Analysis Input
   ↓
4. AI Agent - Generate Market Report
   ├─ Competitive Analysis (Claude)
   ├─ Trend Prediction (GPT-4o)
   └─ A/B Test Prioritization (Claude)
   ↓
5. Code Node - Format Report
   ↓
6. Google Sheets - Write Market Trends
   ↓
7. Email - Send Report to Team
```

**Node 4: AI Agent Call**
```javascript
const weekData = $node["Prepare Analysis Input"].json;

// Call AI Agent API (internal endpoint)
const report = await $http.request({
  method: 'POST',
  url: 'https://your-ai-agent-endpoint.com/generate-weekly-report',
  headers: {
    'Authorization': `Bearer ${$credentials.aiAgentApi.apiKey}`,
    'Content-Type': 'application/json'
  },
  body: {
    week_start: weekData.week_start,
    week_end: weekData.week_end,
    data: {
      raw_facebook_data: weekData.raw_data,
      analysis_results: weekData.analysis,
      strategic_intelligence: weekData.strategic
    },
    options: {
      include_predictions: true,
      include_ab_tests: true,
      generate_visualizations: false
    }
  }
});

return [{ json: report }];
```

---

## 📊 Data Flow Diagram

### Daily Data Flow

```
02:00 AM - APIFY Scraper Runs
  ↓
  Collect Facebook data
  ↓
  Process & batch (100 rows)
  ↓
  Write to Facebook_Raw_Data
  ↓
  Log to Cost_Analytics
  ↓
03:00 AM - AI Spy Tool Runs
  ↓
  Read unanalyzed ads
  ↓
  AI analysis (GPT-4o + Claude)
  ↓
  Write to AI_Analysis_Results
  ↓
04:00 AM - A/B Test Generator Runs
  ↓
  Aggregate performance data
  ↓
  Identify patterns
  ↓
  Generate test recommendations
  ↓
  Write to Strategic_Intelligence
  ↓
  Check alert conditions
  ↓
  Send alerts if needed
```

### Weekly Data Flow

```
Monday 09:00 AM - Weekly Report
  ↓
  Read last 7 days data
  ↓
  AI Market Intelligence Agent
  ↓
  Generate comprehensive report
  ↓
  Write to Market_Trends
  ↓
  Email to team
```

---

## 🔐 Configuration & Credentials

### Required Credentials

**Google Sheets:**
```javascript
{
  name: "Google Sheets CC_INTEL",
  type: "googleSheetsOAuth2Api",
  data: {
    clientId: "...",
    clientSecret: "...",
    spreadsheetId: "YOUR_SPREADSHEET_ID"
  }
}
```

**OpenAI API:**
```javascript
{
  name: "OpenAI CC_INTEL",
  type: "openAiApi",
  data: {
    apiKey: "sk-..."
  }
}
```

**Claude API:**
```javascript
{
  name: "Claude CC_INTEL",
  type: "claudeApi",
  data: {
    apiKey: "sk-ant-..."
  }
}
```

**Apify:**
```javascript
{
  name: "Apify CC_INTEL",
  type: "apifyApi",
  data: {
    apiKey: "apify_api_..."
  }
}
```

### Environment Variables

```bash
# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID="1A2B3C4D5E..."

# API Keys
OPENAI_API_KEY="sk-..."
CLAUDE_API_KEY="sk-ant-..."
APIFY_API_KEY="apify_api_..."
GEMINI_API_KEY="AI..."

# Configuration
BATCH_SIZE=100
API_DELAY_MS=1200
MAX_RETRIES=3

# Budgets
MONTHLY_AI_BUDGET_USD=500
MONTHLY_APIFY_BUDGET_USD=150
ALERT_THRESHOLD=0.8
```

---

## 🧪 Testing Plan

### Integration Tests

**Test 1: End-to-End Data Flow**
```javascript
// Trigger APIFY scraper manually
// Verify:
// 1. Data appears in Facebook_Raw_Data
// 2. No duplicates
// 3. Thai text properly encoded
// 4. Cost logged in Cost_Analytics
// 5. AI Spy Tool triggered
// 6. Analysis results in AI_Analysis_Results
// 7. A/B tests generated in Strategic_Intelligence
```

**Test 2: API Rate Limiting**
```javascript
// Insert 1000 test records
// Verify:
// 1. Batched into 10 batches
// 2. 1.2s delay between batches
// 3. No rate limit errors
// 4. All data written successfully
```

**Test 3: AI Agent Integration**
```javascript
// Trigger weekly report manually
// Verify:
// 1. Reads correct date range
// 2. AI analysis completes
// 3. Report generated
// 4. Written to Market_Trends
// 5. Email sent
```

---

## 📈 Monitoring & Alerts

### Key Metrics to Monitor

```javascript
const MONITORING_METRICS = {
  // Data flow health
  daily_records_collected: {
    target: '>= 100',
    alert_if: '< 50'
  },

  api_error_rate: {
    target: '< 1%',
    alert_if: '> 5%'
  },

  // Performance
  workflow_execution_time: {
    target: '< 300s',
    alert_if: '> 600s'
  },

  sheet_write_latency: {
    target: '< 2s per batch',
    alert_if: '> 5s per batch'
  },

  // Cost
  daily_ai_cost: {
    target: '< $20',
    alert_if: '> $30'
  },

  monthly_total_cost: {
    target: '< $650',
    alert_if: '> $800'
  },

  // Data quality
  duplicate_rate: {
    target: '0%',
    alert_if: '> 1%'
  },

  thai_encoding_errors: {
    target: '0',
    alert_if: '> 5'
  }
};
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Create Google Spreadsheet with 5 sheets
- [ ] Configure all credentials in n8n
- [ ] Set environment variables
- [ ] Test batch processor with sample data
- [ ] Verify Thai text encoding
- [ ] Test API rate limiting

### Workflow Deployment

- [ ] Update Workflow 1 (APIFY Scraper) with new nodes
- [ ] Update Workflow 2 (AI Spy Tool) with new nodes
- [ ] Update Workflow 3 (A/B Testing) with new nodes
- [ ] Create new Workflow 4 (Weekly Report)
- [ ] Set up schedule triggers

### Post-Deployment

- [ ] Monitor first execution of each workflow
- [ ] Verify data in all 5 sheets
- [ ] Check cost tracking
- [ ] Test alert system
- [ ] Generate first weekly report
- [ ] Review and adjust parameters

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue: Rate limit errors**
```
Solution: Increase DELAY_BETWEEN_BATCHES from 1200ms to 1500ms
Check: Ensure BATCH_SIZE is not > 100
```

**Issue: Thai text showing as ����**
```
Solution: Apply ensureThaiTextSafe() to all text fields
Check: UTF-8 encoding at each step
```

**Issue: Duplicate data**
```
Solution: Run deduplication script
Check: Key column uniqueness validation
```

**Issue: AI costs too high**
```
Solution: Reduce analysis frequency or use cheaper models
Check: Token usage per request, optimize prompts
```

---

**Integration Status:** ✅ PLANNING COMPLETE
**Next Steps:** Implementation & Testing
**Owner:** Claude Sonnet 4 + n8n MCP
