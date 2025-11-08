# AI Market Intelligence Agent - Design Specification
**Project:** CC_INTEL - Facebook Data Architecture
**Version:** 1.0
**Last Updated:** 2025-11-08
**Status:** Design Complete

---

## 🎯 Agent Overview

### Purpose
Automate competitive analysis of Facebook advertising data to generate actionable market intelligence, creative insights, and A/B test recommendations.

### Core Mission
Transform raw Facebook data into strategic business intelligence without human intervention, providing weekly reports and real-time opportunity alerts.

### Key Differentiator
**This is NOT an admin bot** - It's a strategic intelligence system that:
- Identifies market patterns humans might miss
- Predicts upcoming trends before competitors
- Generates data-driven creative recommendations
- Prioritizes A/B tests by expected ROI

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   DATA INPUT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  • Facebook_Raw_Data (Pages, Posts, Ads)                    │
│  • Historical Performance Data                              │
│  • Cost Analytics                                           │
│  • External Market Signals (optional)                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 DATA PROCESSING LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  • Normalization & Cleaning                                 │
│  • Time Series Preparation                                  │
│  • Feature Engineering                                      │
│  • Trend Detection                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    AI ANALYSIS LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ GPT-4o       │  │ Claude 3.5   │  │ Gemini Pro   │      │
│  │ Vision+Text  │  │ Strategic    │  │ Video        │      │
│  │ Analysis     │  │ Reasoning    │  │ Analysis     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│               INTELLIGENCE SYNTHESIS LAYER                  │
├─────────────────────────────────────────────────────────────┤
│  • Pattern Recognition                                      │
│  • Competitive Positioning                                  │
│  • Opportunity Identification                               │
│  • Risk Assessment                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  OUTPUT GENERATION LAYER                    │
├─────────────────────────────────────────────────────────────┤
│  • Weekly Market Reports                                    │
│  • A/B Test Queue                                           │
│  • Alert Notifications                                      │
│  • Strategic Dashboards                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 AI Model Configuration

### Primary Models

**1. GPT-4o (Text + Vision Analysis)**
```javascript
{
  model: "gpt-4o",
  use_cases: [
    "Image ad creative analysis",
    "Text sentiment analysis",
    "Multi-modal content understanding",
    "Creative effectiveness scoring"
  ],
  strengths: [
    "Excellent vision capabilities",
    "Understands Thai language well",
    "Fast response times",
    "Good at pattern recognition"
  ],
  cost: "$2.50 / 1M input tokens, $10 / 1M output tokens",
  rate_limit: "10,000 TPM"
}
```

**2. Claude 3.5 Sonnet (Strategic Reasoning)**
```javascript
{
  model: "claude-3-5-sonnet-20241022",
  use_cases: [
    "Strategic analysis",
    "Competitive intelligence",
    "Long-form report generation",
    "Complex reasoning tasks"
  ],
  strengths: [
    "Superior strategic thinking",
    "Long context window (200k)",
    "Nuanced analysis",
    "High-quality writing"
  ],
  cost: "$3 / 1M input tokens, $15 / 1M output tokens",
  rate_limit: "40,000 TPM"
}
```

**3. Gemini 1.5 Pro (Video Analysis)**
```javascript
{
  model: "gemini-1.5-pro",
  use_cases: [
    "Video ad analysis",
    "Scene detection",
    "Motion pattern recognition",
    "Video engagement prediction"
  ],
  strengths: [
    "Native video understanding",
    "Long video support",
    "Audio + visual analysis",
    "Cost-effective for video"
  ],
  cost: "$1.25 / 1M input tokens, $5 / 1M output tokens",
  rate_limit: "1000 RPM"
}
```

### Model Selection Logic

```javascript
function selectModel(analysisType, contentType) {
  // Video content → Gemini
  if (contentType === 'video') {
    return {
      model: 'gemini-1.5-pro',
      reason: 'Native video understanding'
    };
  }

  // Image creative analysis → GPT-4o
  if (contentType === 'image' && analysisType === 'creative') {
    return {
      model: 'gpt-4o',
      reason: 'Superior vision + Thai text OCR'
    };
  }

  // Strategic analysis → Claude
  if (analysisType === 'strategic' || analysisType === 'report') {
    return {
      model: 'claude-3-5-sonnet-20241022',
      reason: 'Best strategic reasoning'
    };
  }

  // Default → GPT-4o
  return {
    model: 'gpt-4o',
    reason: 'Balanced performance'
  };
}
```

---

## 📊 Analysis Capabilities

### 1. Competitive Intelligence Analysis

**Input Data:**
- Competitor Facebook pages
- Post frequency and timing
- Engagement metrics over time
- Content format distribution
- Ad creative patterns

**Analysis Process:**
```javascript
async function analyzeCompetitor(competitorData) {
  const insights = {
    content_strategy: {},
    posting_patterns: {},
    engagement_trends: {},
    creative_approach: {},
    strategic_gaps: [],
    threats: [],
    opportunities: []
  };

  // 1. Content Strategy Analysis
  insights.content_strategy = {
    video_ratio: calculateRatio(competitorData, 'video'),
    image_ratio: calculateRatio(competitorData, 'image'),
    carousel_ratio: calculateRatio(competitorData, 'carousel'),
    text_only_ratio: calculateRatio(competitorData, 'text'),

    avg_text_length: calculateAverage(competitorData, 'text_length'),
    emoji_usage: calculateEmojiDensity(competitorData),
    hashtag_strategy: analyzeHashtags(competitorData),
    cta_patterns: extractCTAPatterns(competitorData)
  };

  // 2. Posting Pattern Analysis
  insights.posting_patterns = {
    posts_per_week: calculateFrequency(competitorData, 'week'),
    optimal_times: findPeakEngagementTimes(competitorData),
    daypart_distribution: analyzeDayparts(competitorData),
    weekend_vs_weekday: compareWeekendWeekday(competitorData)
  };

  // 3. Engagement Trend Analysis
  insights.engagement_trends = {
    growth_rate: calculateGrowthRate(competitorData),
    engagement_per_format: groupByFormat(competitorData),
    viral_content_patterns: findViralPatterns(competitorData),
    declining_formats: identifyDecliningFormats(competitorData)
  };

  // 4. Creative Approach (AI-powered)
  const creativeAnalysis = await analyzeCreativeWithAI(
    competitorData.ads,
    {
      model: 'gpt-4o',
      prompt: CREATIVE_ANALYSIS_PROMPT
    }
  );

  insights.creative_approach = creativeAnalysis;

  // 5. Identify Strategic Gaps
  insights.strategic_gaps = compareToOurStrategy(insights, ourData);

  // 6. Threat Assessment
  insights.threats = identifyThreats(insights, competitorData);

  // 7. Opportunity Identification
  insights.opportunities = identifyOpportunities(insights, marketData);

  return insights;
}
```

**Output Format:**
```json
{
  "competitor_page": "ไอศครีมครีโม",
  "analysis_date": "2025-11-08",
  "executive_summary": "Competitor increasing video content by 40% week-over-week...",

  "content_strategy": {
    "video_ratio": 0.70,
    "image_ratio": 0.25,
    "avg_text_length": 180,
    "primary_cta": "สั่งเลย",
    "tone": "casual_fun"
  },

  "posting_patterns": {
    "posts_per_week": 14,
    "optimal_times": ["18:00-20:00", "12:00-13:00"],
    "peak_day": "Friday"
  },

  "engagement_trends": {
    "growth_rate_30d": "+25%",
    "best_performing_format": "short_video",
    "engagement_per_post_avg": 450
  },

  "strategic_gaps": [
    {
      "gap": "No user-generated content",
      "competitor_doing": "15% of posts are UGC",
      "our_status": "0% UGC",
      "opportunity_score": 85,
      "recommendation": "Launch UGC campaign"
    }
  ],

  "threats": [
    {
      "threat": "Aggressive promotional calendar",
      "severity": "high",
      "details": "Running 2-3 promotions per week",
      "our_response": "Increase promo frequency to match"
    }
  ],

  "opportunities": [
    {
      "opportunity": "Underutilized evening posts",
      "potential": "high",
      "details": "Competitor not posting 8-10pm",
      "action": "Test evening content slots"
    }
  ]
}
```

---

### 2. Creative Performance Analysis

**Input Data:**
- Ad creatives (images/videos)
- Engagement metrics per creative
- Text copy variations
- Visual elements (colors, composition)

**AI Vision Analysis:**
```javascript
async function analyzeCreativePerformance(creatives) {
  const results = [];

  for (const creative of creatives) {
    let analysis;

    // Route to appropriate model
    if (creative.type === 'video') {
      analysis = await analyzeWithGemini(creative);
    } else {
      analysis = await analyzeWithGPT4o(creative);
    }

    results.push({
      creative_id: creative.id,
      visual_analysis: analysis.visual,
      text_analysis: analysis.text,
      performance_score: analysis.score,
      success_factors: analysis.factors,
      improvement_suggestions: analysis.suggestions
    });
  }

  return synthesizeCreativeInsights(results);
}

async function analyzeWithGPT4o(creative) {
  const prompt = `
Analyze this Facebook ad creative for effectiveness.

Image: ${creative.image_url}
Ad Copy: ${creative.text}
Engagement: ${creative.engagement}
CTR: ${creative.ctr}%

Provide analysis in JSON format:
{
  "visual": {
    "composition": "...",
    "color_palette": [...],
    "focal_points": [...],
    "text_readability": "high/medium/low",
    "brand_visibility": "high/medium/low"
  },
  "text": {
    "hook_strength": "high/medium/low",
    "value_proposition_clarity": "...",
    "cta_effectiveness": "...",
    "emotional_appeal": "..."
  },
  "score": 0-100,
  "factors": ["factor1", "factor2"],
  "suggestions": ["improve1", "improve2"]
}
`;

  const response = await callOpenAI({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a Facebook ads creative analyst.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}
```

**Creative Pattern Recognition:**
```javascript
function findCreativePatterns(creatives, performanceData) {
  const patterns = {
    high_performers: [],
    low_performers: [],
    winning_elements: {},
    losing_elements: {},
    format_effectiveness: {}
  };

  // Group by performance quartile
  const sorted = sortByEngagement(creatives);
  const topQuartile = sorted.slice(0, Math.floor(sorted.length / 4));
  const bottomQuartile = sorted.slice(-Math.floor(sorted.length / 4));

  // Extract common elements from top performers
  patterns.winning_elements = {
    colors: findCommonColors(topQuartile),
    composition: findCommonComposition(topQuartile),
    text_patterns: findCommonTextPatterns(topQuartile),
    emotional_themes: findCommonEmotions(topQuartile)
  };

  // Extract anti-patterns from low performers
  patterns.losing_elements = {
    colors: findCommonColors(bottomQuartile),
    composition: findCommonComposition(bottomQuartile),
    text_patterns: findCommonTextPatterns(bottomQuartile)
  };

  // Format effectiveness
  patterns.format_effectiveness = {
    video_short: calculateAvgEngagement(creatives, 'video_short'),
    video_long: calculateAvgEngagement(creatives, 'video_long'),
    image_product: calculateAvgEngagement(creatives, 'image_product'),
    image_lifestyle: calculateAvgEngagement(creatives, 'image_lifestyle'),
    carousel: calculateAvgEngagement(creatives, 'carousel')
  };

  return patterns;
}
```

---

### 3. Market Trend Prediction

**Time Series Analysis:**
```javascript
async function predictMarketTrends(historicalData) {
  const predictions = {
    engagement_forecast: {},
    content_trends: {},
    seasonal_patterns: {},
    emerging_topics: [],
    risk_signals: []
  };

  // 1. Engagement Forecast (next 30 days)
  predictions.engagement_forecast = await forecastEngagement(
    historicalData.engagement_time_series,
    { periods: 30 }
  );

  // 2. Content Trend Detection
  const recentPeriod = filterLast30Days(historicalData);
  const previousPeriod = filterPrevious30Days(historicalData);

  predictions.content_trends = {
    format_shifts: detectFormatShifts(recentPeriod, previousPeriod),
    topic_evolution: detectTopicChanges(recentPeriod, previousPeriod),
    sentiment_changes: detectSentimentShifts(recentPeriod, previousPeriod)
  };

  // 3. Seasonal Pattern Recognition
  predictions.seasonal_patterns = identifySeasonalPatterns(
    historicalData,
    { lookback_months: 12 }
  );

  // 4. Emerging Topic Detection (AI-powered)
  const topicAnalysis = await analyzeTopicsWithAI(recentPeriod);
  predictions.emerging_topics = topicAnalysis.emerging;

  // 5. Risk Signal Detection
  predictions.risk_signals = detectRiskSignals(historicalData, {
    engagement_drop_threshold: 0.20,
    follower_loss_threshold: 0.10,
    negative_sentiment_threshold: 0.30
  });

  return predictions;
}

function detectFormatShifts(recent, previous) {
  const recentDist = calculateFormatDistribution(recent);
  const prevDist = calculateFormatDistribution(previous);

  const shifts = [];

  for (const format in recentDist) {
    const change = recentDist[format] - (prevDist[format] || 0);

    if (Math.abs(change) > 0.10) { // 10% threshold
      shifts.push({
        format,
        direction: change > 0 ? 'increasing' : 'decreasing',
        magnitude: Math.abs(change),
        current_share: recentDist[format],
        previous_share: prevDist[format] || 0
      });
    }
  }

  return shifts.sort((a, b) => b.magnitude - a.magnitude);
}
```

---

### 4. A/B Test Recommendation Engine

**Test Generation Logic:**
```javascript
async function generateABTests(marketIntelligence, ourCurrentStrategy) {
  const testQueue = [];

  // 1. Format Tests (based on competitor success)
  if (marketIntelligence.content_strategy.video_ratio > ourCurrentStrategy.video_ratio + 0.20) {
    testQueue.push({
      test_id: generateTestId(),
      priority: 'high',
      category: 'format',
      hypothesis: 'Increasing video content will improve engagement',

      variant_a: {
        name: 'Control',
        video_ratio: ourCurrentStrategy.video_ratio,
        image_ratio: ourCurrentStrategy.image_ratio
      },

      variant_b: {
        name: 'More Video',
        video_ratio: ourCurrentStrategy.video_ratio + 0.20,
        image_ratio: ourCurrentStrategy.image_ratio - 0.20
      },

      success_metrics: ['engagement_rate', 'reach', 'video_view_rate'],
      sample_size: 50, // posts per variant
      duration_days: 14,
      expected_impact: 'high',
      confidence_score: 85,

      implementation: {
        workflow: 'content_scheduler',
        parameters: { ... }
      }
    });
  }

  // 2. Timing Tests
  const competitorOptimalTimes = marketIntelligence.posting_patterns.optimal_times;
  const ourCurrentTimes = ourCurrentStrategy.posting_times;

  if (!arraysOverlap(competitorOptimalTimes, ourCurrentTimes)) {
    testQueue.push({
      test_id: generateTestId(),
      priority: 'high',
      category: 'timing',
      hypothesis: 'Posting at competitor peak times will increase reach',

      variant_a: {
        name: 'Current Schedule',
        posting_times: ourCurrentTimes
      },

      variant_b: {
        name: 'Peak Times',
        posting_times: competitorOptimalTimes
      },

      success_metrics: ['reach', 'engagement_rate', 'engagement_per_hour'],
      sample_size: 30,
      duration_days: 14,
      expected_impact: 'medium',
      confidence_score: 75
    });
  }

  // 3. Creative Tests (AI-generated variations)
  const creativeTests = await generateCreativeTests(
    marketIntelligence.creative_approach,
    ourCurrentStrategy.top_creatives
  );

  testQueue.push(...creativeTests);

  // 4. Copy Tests
  const copyTests = await generateCopyTests(
    marketIntelligence.content_strategy,
    ourCurrentStrategy.copy_patterns
  );

  testQueue.push(...copyTests);

  // Sort by priority and expected impact
  return testQueue.sort((a, b) => {
    const priorityScore = { high: 3, medium: 2, low: 1 };
    return (priorityScore[b.priority] - priorityScore[a.priority]) ||
           (b.confidence_score - a.confidence_score);
  });
}

async function generateCreativeTests(competitorCreatives, ourCreatives) {
  const tests = [];

  // Analyze what competitors do differently
  const competitorPatterns = await analyzeCreativePatterns(competitorCreatives);
  const ourPatterns = await analyzeCreativePatterns(ourCreatives);

  // Color scheme test
  if (competitorPatterns.dominant_colors !== ourPatterns.dominant_colors) {
    tests.push({
      test_id: generateTestId(),
      priority: 'medium',
      category: 'creative_color',
      hypothesis: `Testing ${competitorPatterns.dominant_colors} color scheme`,

      variant_a: {
        name: 'Current Colors',
        color_scheme: ourPatterns.dominant_colors
      },

      variant_b: {
        name: 'Competitor Colors',
        color_scheme: competitorPatterns.dominant_colors
      },

      success_metrics: ['engagement_rate', 'ctr'],
      sample_size: 20,
      duration_days: 7,
      expected_impact: 'low',
      confidence_score: 60
    });
  }

  // Composition test
  if (competitorPatterns.composition_style !== ourPatterns.composition_style) {
    tests.push({
      test_id: generateTestId(),
      priority: 'medium',
      category: 'creative_composition',
      hypothesis: 'Testing different visual composition approach',

      variant_a: { /* current */ },
      variant_b: { /* competitor style */ },

      success_metrics: ['engagement_rate', 'time_on_content'],
      sample_size: 20,
      duration_days: 7,
      expected_impact: 'medium',
      confidence_score: 70
    });
  }

  return tests;
}
```

---

## 📋 Report Generation

### Weekly Market Intelligence Report

**Structure:**
```markdown
# Weekly Market Intelligence Report
**Week:** 2025-11-01 to 2025-11-07
**Generated:** 2025-11-08 09:00 AM

## 📊 Executive Summary

[3-5 key takeaways from the week]

## 🔍 Competitive Landscape

### Top Movers
- **ไอศครีมครีโม**: +40% engagement (video strategy shift)
- **คู่แข่ง B**: +25% followers (influencer collaboration)

### Market Share Trends
[Chart: Engagement share by competitor]

## 📈 Content Performance Analysis

### Format Effectiveness
- Video: 450 avg engagement (+15% vs last week)
- Image: 280 avg engagement (-5% vs last week)
- Carousel: 320 avg engagement (+stable)

### Winning Content Patterns
1. Short-form videos (15-30s) performing best
2. User testimonials getting 2x engagement
3. Product demonstrations vs lifestyle shots

## 🚨 Threats & Opportunities

### Threats
- Competitor launching new promo series
- Market shifting to video-first content
- Declining engagement on image posts

### Opportunities
- Underutilized 8-10pm posting window
- Growing demand for behind-the-scenes content
- Regional expansion potential (Chiang Mai)

## 🧪 Recommended A/B Tests

### Priority 1: Video Format Test
**Hypothesis:** Short videos will outperform long videos
**Expected Impact:** High (+30% engagement)
**Resource Required:** 20 video creatives
**Timeline:** 2 weeks

### Priority 2: Posting Time Test
**Hypothesis:** Evening posts (7-9pm) will get higher reach
**Expected Impact:** Medium (+20% reach)
**Resource Required:** Schedule adjustment
**Timeline:** 2 weeks

## 📊 Next Week Predictions

- Video content to increase 10-15% across market
- Promotional activity to intensify (approaching holiday)
- Expect 5-10% engagement increase overall

## 🎯 Action Items

- [ ] Launch video format A/B test by Monday
- [ ] Adjust posting schedule to include evening slots
- [ ] Prepare counter-campaign for competitor promo
- [ ] Monitor regional engagement trends
```

**Report Generation Code:**
```javascript
async function generateWeeklyReport(weekData, historicalData) {
  const report = {
    metadata: {
      week_start: weekData.start_date,
      week_end: weekData.end_date,
      generated_at: new Date().toISOString(),
      data_points: weekData.total_records
    },

    executive_summary: '',
    competitive_landscape: {},
    content_performance: {},
    threats_opportunities: {},
    ab_test_recommendations: [],
    predictions: {},
    action_items: []
  };

  // 1. Competitive Analysis
  report.competitive_landscape = await analyzeCompetitiveLandscape(
    weekData.competitors,
    historicalData.competitors
  );

  // 2. Content Performance
  report.content_performance = await analyzeContentPerformance(
    weekData.our_content,
    historicalData.our_content
  );

  // 3. Threats & Opportunities
  report.threats_opportunities = await identifyThreatsOpportunities(
    report.competitive_landscape,
    report.content_performance,
    weekData.market_signals
  );

  // 4. A/B Test Recommendations
  report.ab_test_recommendations = await generateABTests(
    report.competitive_landscape,
    report.content_performance
  );

  // 5. Predictions
  report.predictions = await predictNextWeek(
    weekData,
    historicalData
  );

  // 6. Executive Summary (AI-generated)
  report.executive_summary = await generateExecutiveSummary(report, {
    model: 'claude-3-5-sonnet-20241022',
    max_length: 500
  });

  // 7. Action Items (AI-prioritized)
  report.action_items = await generateActionItems(report);

  return report;
}

async function generateExecutiveSummary(reportData, options) {
  const prompt = `
Generate a concise executive summary (3-5 key points) from this market intelligence data:

Competitive Landscape:
${JSON.stringify(reportData.competitive_landscape, null, 2)}

Content Performance:
${JSON.stringify(reportData.content_performance, null, 2)}

Threats & Opportunities:
${JSON.stringify(reportData.threats_opportunities, null, 2)}

Focus on actionable insights and strategic implications.
Use bullet points. Be specific and quantitative.
`;

  const response = await callClaude({
    model: options.model,
    max_tokens: 1000,
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  return response.content[0].text;
}
```

---

## 🔔 Real-Time Alerts

### Alert Triggers

```javascript
const ALERT_RULES = {
  // Competitor activity
  competitor_viral_content: {
    condition: (post) => post.engagement > 1000 && post.growth_rate > 5.0,
    severity: 'high',
    notify: ['strategy_team', 'content_team']
  },

  competitor_new_campaign: {
    condition: (activity) => activity.new_ad_count > 5,
    severity: 'medium',
    notify: ['strategy_team']
  },

  // Performance issues
  engagement_drop: {
    condition: (metrics) => metrics.engagement_rate < metrics.avg_30d * 0.7,
    severity: 'high',
    notify: ['strategy_team', 'analytics_team']
  },

  negative_sentiment_spike: {
    condition: (sentiment) => sentiment.negative_ratio > 0.3,
    severity: 'high',
    notify: ['strategy_team', 'customer_service']
  },

  // Opportunities
  trending_topic: {
    condition: (topic) => topic.growth_rate > 3.0 && topic.relevance_score > 0.7,
    severity: 'medium',
    notify: ['content_team']
  },

  untapped_time_slot: {
    condition: (analysis) => analysis.opportunity_score > 80,
    severity: 'low',
    notify: ['content_team']
  }
};

async function checkAlerts(currentData, historicalData) {
  const alerts = [];

  for (const [alertName, rule] of Object.entries(ALERT_RULES)) {
    const triggered = await evaluateAlertRule(rule, currentData, historicalData);

    if (triggered) {
      alerts.push({
        alert_id: generateAlertId(),
        alert_name: alertName,
        severity: rule.severity,
        timestamp: new Date().toISOString(),
        details: triggered.details,
        recommended_action: triggered.action,
        notify: rule.notify
      });
    }
  }

  return alerts;
}
```

---

## 💰 Cost Management

### Token Usage Optimization

```javascript
const COST_OPTIMIZATION = {
  // Cache frequently analyzed content
  enable_caching: true,
  cache_ttl: 3600, // 1 hour

  // Batch similar requests
  batch_size: 10,
  batch_delay: 100, // ms

  // Use cheaper models when appropriate
  model_selection: {
    simple_classification: 'gpt-3.5-turbo',
    complex_analysis: 'gpt-4o',
    strategic_thinking: 'claude-3-5-sonnet',
    video_analysis: 'gemini-1.5-pro'
  },

  // Limit context size
  max_context_tokens: 4000,
  summarize_long_content: true,

  // Monthly budget
  monthly_budget_usd: 500,
  alert_threshold: 0.8 // Alert at 80%
};

async function trackAICosts(operation, tokens, model) {
  const cost = calculateCost(tokens, model);

  await logCost({
    timestamp: new Date().toISOString(),
    operation,
    model,
    tokens_input: tokens.input,
    tokens_output: tokens.output,
    cost_usd: cost
  });

  // Check budget
  const monthlySpend = await getMonthlySpend();
  if (monthlySpend > COST_OPTIMIZATION.monthly_budget_usd * COST_OPTIMIZATION.alert_threshold) {
    await sendBudgetAlert({
      current_spend: monthlySpend,
      budget: COST_OPTIMIZATION.monthly_budget_usd,
      days_remaining: getDaysRemainingInMonth()
    });
  }
}
```

---

## 🧪 Testing & Validation

### Agent Performance Metrics

```javascript
const AGENT_KPI = {
  // Accuracy metrics
  prediction_accuracy: {
    target: 0.75,
    measure: 'Percentage of predictions that materialized'
  },

  insight_actionability: {
    target: 0.80,
    measure: 'Percentage of insights that led to action'
  },

  // Speed metrics
  report_generation_time: {
    target: 300, // 5 minutes
    measure: 'Seconds to generate weekly report'
  },

  alert_latency: {
    target: 60, // 1 minute
    measure: 'Seconds from event to alert'
  },

  // Business impact
  ab_test_success_rate: {
    target: 0.60,
    measure: 'Percentage of recommended tests that showed improvement'
  },

  roi_impact: {
    target: 5.0,
    measure: 'ROI multiplier (value generated / agent cost)'
  }
};

async function validateAgentPerformance(timeframe) {
  const metrics = {};

  // Validate predictions
  const predictions = await getPredictions(timeframe);
  const outcomes = await getActualOutcomes(timeframe);
  metrics.prediction_accuracy = calculateAccuracy(predictions, outcomes);

  // Validate insights
  const insights = await getInsights(timeframe);
  const actions = await getActionsFromInsights(timeframe);
  metrics.insight_actionability = actions.length / insights.length;

  // Measure speed
  const reports = await getReports(timeframe);
  metrics.avg_report_time = calculateAverage(reports, 'generation_time');

  // Measure business impact
  const tests = await getABTests(timeframe);
  const successfulTests = tests.filter(t => t.result === 'success');
  metrics.ab_test_success_rate = successfulTests.length / tests.length;

  return metrics;
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Core Intelligence (Week 1-2)
- [ ] Set up AI model integrations (GPT-4o, Claude, Gemini)
- [ ] Implement competitive analysis engine
- [ ] Build content performance analyzer
- [ ] Create basic reporting system

### Phase 2: Advanced Analytics (Week 3-4)
- [ ] Add trend prediction models
- [ ] Implement A/B test generator
- [ ] Build real-time alert system
- [ ] Create cost tracking

### Phase 3: Optimization (Week 5-6)
- [ ] Fine-tune model selection
- [ ] Optimize prompt engineering
- [ ] Implement caching layer
- [ ] Add performance monitoring

### Phase 4: Scaling (Week 7-8)
- [ ] Multi-brand support
- [ ] Regional analysis
- [ ] Integration with other systems
- [ ] Advanced visualization

---

## 📚 Prompts Library

### Competitive Analysis Prompt

```javascript
const COMPETITIVE_ANALYSIS_PROMPT = `
You are a strategic market analyst specializing in Facebook advertising.

Analyze this competitor's Facebook activity:

Data:
${JSON.stringify(competitorData, null, 2)}

Provide comprehensive analysis covering:
1. Content Strategy (formats, themes, frequency)
2. Engagement Patterns (what works, what doesn't)
3. Creative Approach (visual style, messaging)
4. Strategic Positioning (market position, differentiation)
5. Gaps & Opportunities (what they're missing)
6. Threats to Us (what they do better)

Output JSON format:
{
  "executive_summary": "...",
  "content_strategy": {...},
  "engagement_patterns": {...},
  "creative_approach": {...},
  "strategic_positioning": {...},
  "gaps_opportunities": [...],
  "threats": [...]
}

Be specific, quantitative, and actionable.
`;
```

### Creative Analysis Prompt

```javascript
const CREATIVE_ANALYSIS_PROMPT = `
You are a Facebook ads creative expert.

Analyze this ad creative for effectiveness:

Image: [attached]
Copy: "${adCopy}"
Performance: ${engagement} engagement, ${ctr}% CTR

Evaluate:
1. Visual Impact (composition, colors, readability)
2. Message Clarity (value prop, CTA strength)
3. Emotional Appeal (what emotion it triggers)
4. Brand Alignment (fits brand guidelines?)
5. Success Factors (why it works/doesn't work)
6. Improvement Ideas (specific suggestions)

JSON output:
{
  "overall_score": 0-100,
  "visual_impact": {...},
  "message_clarity": {...},
  "emotional_appeal": {...},
  "success_factors": [...],
  "improvement_ideas": [...]
}
`;
```

---

**Design Status:** ✅ COMPLETE
**Next Steps:** Implementation & Integration
**Owner:** Claude Sonnet 4 + n8n MCP
