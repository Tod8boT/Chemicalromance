# Testing Strategy - CC_INTEL Facebook Data Architecture
**Project:** CC_INTEL - Facebook Data Architecture & AI Agent
**Version:** 1.0
**Last Updated:** 2025-11-08
**Status:** Test Plan Ready

---

## 🎯 Testing Overview

### Objectives
- Validate Google Sheets architecture handles 1000+ records
- Ensure API rate limits are respected
- Verify Thai text encoding works correctly
- Confirm AI agent generates accurate insights
- Test end-to-end workflow integration

### Test Levels
1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - Workflow connections and data flow
3. **Load Tests** - High volume data processing
4. **End-to-End Tests** - Complete system validation
5. **User Acceptance Tests** - Business value validation

---

## 🧪 Unit Tests

### Test Suite 1: Batch Processor Functions

**Test 1.1: Chunk Array**
```javascript
const { chunkArray } = require('../src/google-sheets-batch-processor');

describe('chunkArray', () => {
  test('should split array into batches of specified size', () => {
    const data = Array.from({ length: 250 }, (_, i) => i);
    const chunks = chunkArray(data, 100);

    expect(chunks.length).toBe(3);
    expect(chunks[0].length).toBe(100);
    expect(chunks[1].length).toBe(100);
    expect(chunks[2].length).toBe(50);
  });

  test('should handle empty array', () => {
    const chunks = chunkArray([], 100);
    expect(chunks.length).toBe(0);
  });

  test('should handle array smaller than chunk size', () => {
    const data = [1, 2, 3];
    const chunks = chunkArray(data, 100);

    expect(chunks.length).toBe(1);
    expect(chunks[0].length).toBe(3);
  });
});
```

**Test 1.2: Thai Text Encoding**
```javascript
const { ensureThaiTextSafe } = require('../src/google-sheets-batch-processor');

describe('ensureThaiTextSafe', () => {
  test('should preserve Thai text correctly', () => {
    const input = 'สวัสดี โปรโมชั่นพิเศษ 50%';
    const output = ensureThaiTextSafe(input);

    expect(output).toBe(input);
    expect(/[\u0E00-\u0E7F]/.test(output)).toBe(true);
  });

  test('should remove control characters', () => {
    const input = 'Hello\x00World\x1F';
    const output = ensureThaiTextSafe(input);

    expect(output).toBe('HelloWorld');
    expect(/[\u0000-\u001F]/.test(output)).toBe(false);
  });

  test('should handle mixed Thai-English', () => {
    const input = 'ไอศครีม Ice Cream ลด 70%';
    const output = ensureThaiTextSafe(input);

    expect(output).toBe(input);
  });

  test('should handle null and undefined', () => {
    expect(ensureThaiTextSafe(null)).toBe('');
    expect(ensureThaiTextSafe(undefined)).toBe('');
  });

  test('should convert non-strings', () => {
    expect(ensureThaiTextSafe(123)).toBe('123');
    expect(ensureThaiTextSafe(true)).toBe('true');
  });
});
```

**Test 1.3: Retry with Backoff**
```javascript
const { retryWithBackoff } = require('../src/google-sheets-batch-processor');

describe('retryWithBackoff', () => {
  test('should succeed on first try if function succeeds', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(fn, 3);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('should retry on failure and eventually succeed', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const result = await retryWithBackoff(fn, 3);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('should throw after max retries', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Always fail'));

    await expect(retryWithBackoff(fn, 3)).rejects.toThrow('Always fail');
    expect(fn).toHaveBeenCalledTimes(4); // initial + 3 retries
  });

  test('should not retry on 400 errors', async () => {
    const error = new Error('Bad request');
    error.code = 400;
    const fn = jest.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, 3)).rejects.toThrow('Bad request');
    expect(fn).toHaveBeenCalledTimes(1); // no retries
  });
});
```

**Test 1.4: Row Validation**
```javascript
const { validateRow } = require('../src/google-sheets-batch-processor');

describe('validateRow', () => {
  test('should accept valid row', () => {
    const row = ['2025-11-08', 'page', '12345', 'Test Page', 1000];
    const errors = validateRow(row, 0);

    expect(errors).toHaveLength(0);
  });

  test('should reject non-array rows', () => {
    const errors = validateRow('not an array', 0);

    expect(errors).toContain('Row 0: Must be an array');
  });

  test('should reject rows with too many columns', () => {
    const row = new Array(101).fill('data');
    const errors = validateRow(row, 0);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('Too many columns');
  });

  test('should reject cells exceeding size limit', () => {
    const largeCell = 'x'.repeat(60000);
    const row = ['normal', largeCell];
    const errors = validateRow(row, 0);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('Exceeds max size');
  });
});
```

---

## 🔗 Integration Tests

### Test Suite 2: Google Sheets Integration

**Test 2.1: Batch Write Operation**
```javascript
const { writeBatchData } = require('../src/google-sheets-batch-processor');
const { google } = require('googleapis');

describe('writeBatchData Integration', () => {
  let sheets;
  let testSpreadsheetId;

  beforeAll(async () => {
    // Set up test Google Sheets connection
    const auth = new google.auth.GoogleAuth({
      keyFile: './test-credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheets = google.sheets({ version: 'v4', auth });

    // Create test spreadsheet
    const response = await sheets.spreadsheets.create({
      resource: {
        properties: { title: 'Test Spreadsheet' },
        sheets: [{ properties: { title: 'Test_Data' } }]
      }
    });

    testSpreadsheetId = response.data.spreadsheetId;
  });

  afterAll(async () => {
    // Clean up: delete test spreadsheet
    const drive = google.drive({ version: 'v3', auth: sheets._options.auth });
    await drive.files.delete({ fileId: testSpreadsheetId });
  });

  test('should write 100 rows successfully', async () => {
    const testData = Array.from({ length: 100 }, (_, i) => [
      new Date().toISOString(),
      `row_${i}`,
      Math.floor(Math.random() * 1000)
    ]);

    const result = await writeBatchData(
      testData,
      sheets,
      testSpreadsheetId,
      'Test_Data'
    );

    expect(result.successfulBatches).toBe(1);
    expect(result.failedBatches).toBe(0);

    // Verify data was written
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: testSpreadsheetId,
      range: 'Test_Data!A2:C101'
    });

    expect(response.data.values.length).toBe(100);
  });

  test('should write 250 rows in batches with rate limiting', async () => {
    const testData = Array.from({ length: 250 }, (_, i) => [
      new Date().toISOString(),
      `row_${i}`,
      Math.floor(Math.random() * 1000)
    ]);

    const startTime = Date.now();

    const result = await writeBatchData(
      testData,
      sheets,
      testSpreadsheetId,
      'Test_Data'
    );

    const duration = Date.now() - startTime;

    expect(result.successfulBatches).toBe(3); // 100, 100, 50
    expect(result.failedBatches).toBe(0);

    // Should have delays between batches (2 * 1200ms = 2400ms minimum)
    expect(duration).toBeGreaterThan(2400);
  });

  test('should handle Thai text correctly', async () => {
    const thaiData = [
      [new Date().toISOString(), 'ไอศครีมครีโม', 'โปรโมชั่น 50%'],
      [new Date().toISOString(), 'สินค้าใหม่', 'ลด 70% วันนี้!']
    ];

    await writeBatchData(
      thaiData,
      sheets,
      testSpreadsheetId,
      'Test_Data'
    );

    // Read back and verify
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: testSpreadsheetId,
      range: 'Test_Data!A2:C3'
    });

    expect(response.data.values[0][1]).toBe('ไอศครีมครีโม');
    expect(response.data.values[1][2]).toBe('ลด 70% วันนี้!');
  });

  test('should remove duplicates when enabled', async () => {
    const dataWithDupes = [
      ['id_1', 'data_1'],
      ['id_2', 'data_2'],
      ['id_1', 'data_duplicate'], // duplicate
      ['id_3', 'data_3']
    ];

    const result = await writeBatchData(
      dataWithDupes,
      sheets,
      testSpreadsheetId,
      'Test_Data',
      {
        removeDuplicates: true,
        duplicateKeyColumn: 0
      }
    );

    // Should have written 3 rows (removed 1 duplicate)
    expect(result.totalRows).toBe(3);
  });
});
```

**Test 2.2: Read Operations**
```javascript
const { readBatchData } = require('../src/google-sheets-batch-processor');

describe('readBatchData Integration', () => {
  test('should read all data from sheet', async () => {
    // Assuming test sheet has 50 rows
    const data = await readBatchData(
      sheets,
      testSpreadsheetId,
      'Test_Data'
    );

    expect(data.length).toBeGreaterThan(0);
    expect(Array.isArray(data)).toBe(true);
    expect(Array.isArray(data[0])).toBe(true);
  });

  test('should read specific range', async () => {
    const data = await readBatchData(
      sheets,
      testSpreadsheetId,
      'Test_Data',
      {
        startRow: 2,
        endRow: 10,
        columns: 'A:C'
      }
    );

    expect(data.length).toBeLessThanOrEqual(9); // rows 2-10 = 9 rows
  });
});
```

---

## ⚡ Load Tests

### Test Suite 3: High Volume Data Processing

**Test 3.1: 1000 Records Write**
```javascript
describe('Load Test: 1000 Records', () => {
  test('should handle 1000 records without errors', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => [
      new Date().toISOString(),
      `page_${i % 50}`, // 50 unique pages
      `post_${i}`,
      `โปรโมชั่นที่ ${i}`,
      Math.floor(Math.random() * 1000),
      Math.floor(Math.random() * 100),
      Math.floor(Math.random() * 50),
      Math.floor(Math.random() * 20)
    ]);

    const result = await writeBatchData(
      largeDataset,
      sheets,
      testSpreadsheetId,
      'Load_Test',
      { validateData: true }
    );

    expect(result.successfulBatches).toBe(10); // 1000/100 = 10
    expect(result.failedBatches).toBe(0);
    expect(result.totalRows).toBe(1000);
  }, 60000); // 60s timeout
});
```

**Test 3.2: API Rate Limit Compliance**
```javascript
describe('Load Test: API Rate Limits', () => {
  test('should not exceed 90 writes per 100 seconds', async () => {
    const data = Array.from({ length: 9000 }, (_, i) => [`row_${i}`]);

    const startTime = Date.now();

    const result = await writeBatchData(
      data,
      sheets,
      testSpreadsheetId,
      'Rate_Limit_Test'
    );

    const duration = Date.now() - startTime;

    // 9000 rows = 90 batches
    // With 1.2s delay, should take ~108 seconds minimum
    expect(duration).toBeGreaterThan(100000); // > 100s
    expect(result.successfulBatches).toBe(90);
  }, 180000); // 3 min timeout
});
```

**Test 3.3: Concurrent Workflow Simulation**
```javascript
describe('Load Test: Concurrent Workflows', () => {
  test('should handle 3 workflows writing simultaneously', async () => {
    const workflow1Data = Array.from({ length: 200 }, () => ['workflow1_data']);
    const workflow2Data = Array.from({ length: 200 }, () => ['workflow2_data']);
    const workflow3Data = Array.from({ length: 200 }, () => ['workflow3_data']);

    // Run all 3 in parallel
    const results = await Promise.all([
      writeBatchData(workflow1Data, sheets, testSpreadsheetId, 'Sheet1'),
      writeBatchData(workflow2Data, sheets, testSpreadsheetId, 'Sheet2'),
      writeBatchData(workflow3Data, sheets, testSpreadsheetId, 'Sheet3')
    ]);

    // All should succeed
    results.forEach(result => {
      expect(result.failedBatches).toBe(0);
    });

    // Verify data integrity
    const sheet1Data = await readBatchData(sheets, testSpreadsheetId, 'Sheet1');
    expect(sheet1Data.length).toBe(200);
  }, 120000); // 2 min timeout
});
```

---

## 🔄 End-to-End Tests

### Test Suite 4: Complete Workflow Tests

**Test 4.1: APIFY Scraper → Google Sheets**
```javascript
describe('E2E Test: APIFY Workflow', () => {
  test('should scrape data and write to Google Sheets', async () => {
    // Mock Apify response
    const mockApifyData = {
      pageInfo: {
        id: '694634120405666',
        name: 'ไอศครีมครีโม',
        followers: 2480,
        likes: 2350,
        category: 'Food & Beverage'
      },
      posts: [
        {
          id: '123_456',
          text: 'โปรโมชั่นพิเศษ!',
          engagement: { total: 450, likes: 320, comments: 85, shares: 45 },
          mediaType: 'image',
          mediaUrl: 'https://example.com/image.jpg'
        }
      ],
      ads: [
        {
          id: '789_012',
          adText: 'ลด 50% วันนี้!',
          adCopy: 'สั่งเลย!',
          mediaType: 'video',
          mediaUrl: 'https://example.com/video.mp4'
        }
      ]
    };

    // Process (simulating n8n Code Node logic)
    const processedRows = processApifyData(mockApifyData);

    // Write to sheets
    const result = await writeBatchData(
      processedRows,
      sheets,
      testSpreadsheetId,
      'Facebook_Raw_Data'
    );

    expect(result.successfulBatches).toBeGreaterThan(0);

    // Verify data
    const savedData = await readBatchData(
      sheets,
      testSpreadsheetId,
      'Facebook_Raw_Data'
    );

    // Should have page + posts + ads
    expect(savedData.length).toBeGreaterThanOrEqual(3);

    // Verify Thai text preserved
    const postRow = savedData.find(row => row[7].includes('โปรโมชั่น'));
    expect(postRow).toBeDefined();
    expect(postRow[7]).toBe('โปรโมชั่นพิเศษ!');
  });
});
```

**Test 4.2: AI Spy Tool → Analysis Results**
```javascript
describe('E2E Test: AI Spy Workflow', () => {
  test('should analyze ad and write to AI_Analysis_Results', async () => {
    // Mock ad data
    const adData = {
      post_id: '123_456',
      page_name: 'ไอศครีมครีโม',
      ad_copy: 'ลด 70% วันนี้เท่านั้น! สั่งเลย!',
      media_type: 'image',
      media_url: 'https://example.com/ad.jpg'
    };

    // Mock AI analysis (would call real API in actual test)
    const aiAnalysis = {
      creative_score: 85,
      copy_score: 78,
      overall_score: 82,
      success_factors: ['urgency', 'clear_cta', 'discount_focus'],
      improvements: ['add_social_proof', 'improve_visual_hierarchy']
    };

    // Format result
    const analysisRow = formatAnalysisResult(adData, aiAnalysis);

    // Write to sheets
    const result = await writeBatchData(
      [analysisRow],
      sheets,
      testSpreadsheetId,
      'AI_Analysis_Results'
    );

    expect(result.successfulBatches).toBe(1);

    // Verify
    const savedData = await readBatchData(
      sheets,
      testSpreadsheetId,
      'AI_Analysis_Results'
    );

    const analysis = savedData.find(row => row[3] === '123_456');
    expect(analysis).toBeDefined();
    expect(analysis[11]).toBe(82); // confidence_score
  });
});
```

**Test 4.3: A/B Test Generator → Strategic Intelligence**
```javascript
describe('E2E Test: A/B Test Workflow', () => {
  test('should generate A/B tests from performance data', async () => {
    // Mock performance data
    const performanceData = {
      'ไอศครีมครีโม': {
        total_posts: 50,
        video_ratio: 0.70,
        avg_engagement: 450,
        peak_hours: ['18:00', '19:00', '20:00']
      }
    };

    const ourStrategy = {
      video_ratio: 0.30,
      avg_engagement: 250,
      posting_times: ['09:00', '13:00', '17:00']
    };

    // Generate tests
    const tests = generateABTests(performanceData, ourStrategy);

    expect(tests.length).toBeGreaterThan(0);

    // Write to sheets
    const result = await writeBatchData(
      tests.map(formatTestRow),
      sheets,
      testSpreadsheetId,
      'Strategic_Intelligence'
    );

    expect(result.successfulBatches).toBeGreaterThan(0);

    // Verify
    const savedData = await readBatchData(
      sheets,
      testSpreadsheetId,
      'Strategic_Intelligence'
    );

    // Should have at least video test
    const videoTest = savedData.find(row => row[5].includes('video'));
    expect(videoTest).toBeDefined();
    expect(videoTest[3]).toBe('high'); // priority
  });
});
```

---

## 🤖 AI Agent Tests

### Test Suite 5: AI Analysis Quality

**Test 5.1: Competitive Analysis Accuracy**
```javascript
describe('AI Agent: Competitive Analysis', () => {
  test('should identify key competitive patterns', async () => {
    const competitorData = loadTestData('competitor_sample.json');

    const analysis = await analyzeCompetitor(competitorData);

    // Should detect video content focus
    expect(analysis.content_strategy.video_ratio).toBeGreaterThan(0.5);

    // Should identify posting patterns
    expect(analysis.posting_patterns.posts_per_week).toBeGreaterThan(0);
    expect(analysis.posting_patterns.peak_hours).toHaveLength(3);

    // Should provide actionable insights
    expect(analysis.strategic_gaps.length).toBeGreaterThan(0);
    analysis.strategic_gaps.forEach(gap => {
      expect(gap).toHaveProperty('gap');
      expect(gap).toHaveProperty('opportunity_score');
      expect(gap).toHaveProperty('recommendation');
    });
  });
});
```

**Test 5.2: Creative Analysis Consistency**
```javascript
describe('AI Agent: Creative Analysis', () => {
  test('should provide consistent scores for similar creatives', async () => {
    const creative1 = loadTestCreative('high_performer_1.jpg');
    const creative2 = loadTestCreative('high_performer_2.jpg'); // similar

    const analysis1 = await analyzeCreativeWithAI(creative1);
    const analysis2 = await analyzeCreativeWithAI(creative2);

    // Scores should be similar (within 15 points)
    const scoreDiff = Math.abs(analysis1.overall_score - analysis2.overall_score);
    expect(scoreDiff).toBeLessThan(15);

    // Should identify similar success factors
    const commonFactors = analysis1.success_factors.filter(f =>
      analysis2.success_factors.includes(f)
    );
    expect(commonFactors.length).toBeGreaterThan(0);
  });

  test('should score high performers higher than low performers', async () => {
    const highPerformer = loadTestCreative('high_performer.jpg');
    const lowPerformer = loadTestCreative('low_performer.jpg');

    const highAnalysis = await analyzeCreativeWithAI(highPerformer);
    const lowAnalysis = await analyzeCreativeWithAI(lowPerformer);

    expect(highAnalysis.overall_score).toBeGreaterThan(lowAnalysis.overall_score);
  });
});
```

**Test 5.3: Prediction Accuracy**
```javascript
describe('AI Agent: Trend Predictions', () => {
  test('should predict trends with >= 70% accuracy', async () => {
    // Use historical data with known outcomes
    const historicalData = loadTestData('historical_with_outcomes.json');

    const predictions = await predictMarketTrends(historicalData.past);
    const actualOutcomes = historicalData.actual;

    // Calculate accuracy
    let correctPredictions = 0;
    predictions.emerging_topics.forEach(topic => {
      if (actualOutcomes.topics.includes(topic.name)) {
        correctPredictions++;
      }
    });

    const accuracy = correctPredictions / predictions.emerging_topics.length;
    expect(accuracy).toBeGreaterThanOrEqual(0.70);
  });
});
```

---

## 📊 User Acceptance Tests

### Test Suite 6: Business Value Validation

**Test 6.1: Weekly Report Completeness**
```javascript
describe('UAT: Weekly Report', () => {
  test('report should contain all required sections', async () => {
    const weekData = loadTestData('sample_week.json');

    const report = await generateWeeklyReport(weekData);

    // Required sections
    expect(report).toHaveProperty('executive_summary');
    expect(report).toHaveProperty('competitive_landscape');
    expect(report).toHaveProperty('content_performance');
    expect(report).toHaveProperty('threats_opportunities');
    expect(report).toHaveProperty('ab_test_recommendations');
    expect(report).toHaveProperty('predictions');

    // Executive summary should be concise
    expect(report.executive_summary.length).toBeGreaterThan(100);
    expect(report.executive_summary.length).toBeLessThan(1000);

    // Should have at least 3 A/B test recommendations
    expect(report.ab_test_recommendations.length).toBeGreaterThanOrEqual(3);

    // Tests should be prioritized
    const priorities = report.ab_test_recommendations.map(t => t.priority);
    expect(priorities[0]).toBe('high');
  });
});
```

**Test 6.2: Alert Relevance**
```javascript
describe('UAT: Alert System', () => {
  test('should only trigger alerts for significant events', async () => {
    const normalData = loadTestData('normal_activity.json');
    const alertData = loadTestData('alert_conditions.json');

    // Normal data should not trigger alerts
    const normalAlerts = await checkAlerts(normalData);
    expect(normalAlerts.length).toBe(0);

    // Alert data should trigger relevant alerts
    const alerts = await checkAlerts(alertData);
    expect(alerts.length).toBeGreaterThan(0);

    // Alerts should be actionable
    alerts.forEach(alert => {
      expect(alert).toHaveProperty('recommended_action');
      expect(alert.recommended_action.length).toBeGreaterThan(10);
    });
  });
});
```

**Test 6.3: ROI Tracking**
```javascript
describe('UAT: Cost Analytics', () => {
  test('should accurately track costs and calculate ROI', async () => {
    const costData = loadTestData('monthly_costs.json');

    const analytics = await analyzeCosts(costData);

    // Should break down by service
    expect(analytics).toHaveProperty('by_service');
    expect(analytics.by_service).toHaveProperty('apify');
    expect(analytics.by_service).toHaveProperty('openai');

    // Should calculate ROI
    expect(analytics).toHaveProperty('roi_multiplier');
    expect(analytics.roi_multiplier).toBeGreaterThan(1); // Positive ROI

    // Should track budget usage
    expect(analytics).toHaveProperty('budget_utilization');
    expect(analytics.budget_utilization).toBeGreaterThan(0);
    expect(analytics.budget_utilization).toBeLessThanOrEqual(1);
  });
});
```

---

## 🎯 Test Execution Plan

### Phase 1: Unit Tests (Day 1-2)
```bash
# Run all unit tests
npm test -- --testPathPattern=unit

# Expected: 100% pass rate
# Coverage target: > 80%
```

### Phase 2: Integration Tests (Day 3-4)
```bash
# Run integration tests (requires test Google Sheets)
npm test -- --testPathPattern=integration

# Expected: > 95% pass rate
# May have some rate limit edge cases
```

### Phase 3: Load Tests (Day 5)
```bash
# Run load tests (long-running)
npm test -- --testPathPattern=load --timeout=300000

# Expected: All tests pass
# Monitor: API usage, response times
```

### Phase 4: E2E Tests (Day 6-7)
```bash
# Run end-to-end workflow tests
npm test -- --testPathPattern=e2e

# Expected: All workflows complete successfully
# Verify: Data in all 5 Google Sheets
```

### Phase 5: UAT (Day 8-10)
```bash
# Manual testing with real data
# Stakeholder review of:
# - Weekly reports
# - A/B test recommendations
# - Alert accuracy
# - Dashboard usability
```

---

## 📈 Success Metrics

### Technical Metrics
| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Unit test pass rate | 100% | > 95% |
| Integration test pass rate | > 95% | > 90% |
| Load test pass rate | 100% | > 95% |
| E2E test pass rate | 100% | > 90% |
| Code coverage | > 80% | > 70% |
| API error rate | < 1% | < 5% |
| Data accuracy | 99.9% | > 99% |

### Business Metrics
| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Report completeness | 100% | 100% |
| Alert relevance | > 80% | > 70% |
| A/B test success rate | > 60% | > 50% |
| Prediction accuracy | > 70% | > 60% |
| User satisfaction | > 4/5 | > 3.5/5 |

---

## 🐛 Bug Tracking

### Bug Severity Levels

**Critical (P0):**
- Data loss or corruption
- System completely down
- Security vulnerabilities

**High (P1):**
- Major functionality broken
- API limits consistently exceeded
- Thai text encoding failures

**Medium (P2):**
- Minor functionality issues
- Performance degradation
- UI/UX problems

**Low (P3):**
- Cosmetic issues
- Enhancement requests
- Documentation errors

### Bug Report Template

```markdown
## Bug Report

**Title:** [Brief description]

**Severity:** [P0/P1/P2/P3]

**Component:** [Batch Processor / AI Agent / Workflow / etc.]

**Description:**
[Detailed description of the bug]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Result]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- n8n version:
- Node version:
- Google Sheets API version:

**Logs:**
```
[Relevant error logs]
```

**Screenshots:**
[If applicable]

**Proposed Solution:**
[If known]
```

---

## ✅ Test Completion Checklist

### Pre-Testing
- [ ] Test environment set up
- [ ] Test Google Spreadsheet created
- [ ] Test credentials configured
- [ ] Test data prepared
- [ ] Mock APIs set up

### Testing Execution
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Load tests completed successfully
- [ ] E2E tests validated
- [ ] UAT completed with stakeholders

### Post-Testing
- [ ] All critical bugs fixed
- [ ] Performance metrics documented
- [ ] Test coverage report generated
- [ ] Regression test suite created
- [ ] Documentation updated

---

**Testing Status:** ✅ STRATEGY COMPLETE
**Next Steps:** Execute test plan
**Owner:** QA Team + Claude Sonnet 4
