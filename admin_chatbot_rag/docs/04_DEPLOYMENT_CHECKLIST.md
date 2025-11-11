# ✅ Deployment Checklist - CREMO Admin Chatbot

**Created:** 2025-11-11
**Purpose:** ตรวจสอบความพร้อมก่อน Deploy Production
**Time Required:** 15-20 นาที

---

## 🎯 Pre-Deployment Checklist

### **Section 1: Database Setup**

- [ ] **Supabase Project Created**
  - Project URL: `https://xxxxx.supabase.co`
  - Service Role Key: ได้รับและเก็บไว้ปลอดภัย

- [ ] **Tables Created (4 tables)**
  - [ ] `enhanced_chat_sessions` - 11 columns
  - [ ] `qa_scenarios` - 11 columns
  - [ ] `business_data` - 9 columns
  - [ ] `customer_check` - 13 columns

- [ ] **Vector Extension Enabled**
  - [ ] `pgvector` extension enabled
  - [ ] `documents` table created (by n8n)

- [ ] **Data Migrated**
  - [ ] 43 QA scenarios imported
  - [ ] 29 business variables imported
  - [ ] Sample customer data (optional)

- [ ] **Indexes Created**
  - [ ] Run verification query: 15-20 indexes should exist

- [ ] **Test Queries Successful**
  ```sql
  SELECT COUNT(*) FROM qa_scenarios;  -- Should return 43
  SELECT COUNT(*) FROM business_data; -- Should return 29
  ```

---

### **Section 2: n8n Configuration**

- [ ] **n8n Instance Ready**
  - [ ] Version: 1.x.x or higher
  - [ ] Accessible: http://your-n8n-instance:5678

- [ ] **Credentials Configured**
  - [ ] **Facebook Messenger**
    - Page Access Token (valid)
    - Verify Token: `n8n-webhook`
    - Page ID: `107201445711168`
  - [ ] **Supabase**
    - Host: `xxxxx.supabase.co`
    - Service Role Key
  - [ ] **Cohere API**
    - API Key (for embeddings)
  - [ ] **OpenRouter**
    - API Key
    - Model: `google/gemini-2.5-flash`
  - [ ] **Telegram** (optional)
    - Bot Token
    - Chat ID

- [ ] **Data Tables Created (n8n)**
  - [ ] `batch_messages_cremo` (for Smart Batching)

- [ ] **Workflow Imported/Upgraded**
  - [ ] Main workflow active
  - [ ] Sub-workflows active (if any)
  - [ ] All nodes connected properly

---

### **Section 3: Facebook Integration**

- [ ] **Facebook App Setup**
  - [ ] App created and approved
  - [ ] Messenger product added

- [ ] **Webhook Configuration**
  - [ ] Webhook URL set: `https://your-domain/webhook/n8n-webhook`
  - [ ] Verify Token: `n8n-webhook`
  - [ ] Webhook verified successfully

- [ ] **Subscriptions Enabled**
  - [ ] `messages` subscription
  - [ ] `messaging_postbacks` subscription (optional)

- [ ] **Page Access Token**
  - [ ] Token generated
  - [ ] Token has required permissions:
    - `pages_messaging`
    - `pages_read_engagement`
  - [ ] Token expiration: Check and set reminder

---

### **Section 4: Testing**

- [ ] **Unit Tests Passed**
  - [ ] Test 1: Smart Batching (3 tests)
  - [ ] Test 2: Session History (3 tests)
  - [ ] Test 3: Image Response (3 tests)
  - [ ] Test 4: Dynamic Content (3 tests)
  - [ ] Test 5: Facebook UX (3 tests)
  - [ ] Test 6: Intent Classification (2 tests)
  - [ ] Test 7: Thai Context (3 tests)
  - [ ] Test 8: Edge Cases (3 tests)

- [ ] **Integration Tests Passed**
  - [ ] End-to-end message flow
  - [ ] Multi-user concurrent test
  - [ ] Load test (10+ messages/min)

- [ ] **Performance Benchmarks**
  - [ ] Response time: < 6 sec (with batching)
  - [ ] Memory usage: < 512 MB
  - [ ] No memory leaks (test 1 hour)

---

### **Section 5: Monitoring & Logging**

- [ ] **Logging Configured**
  - [ ] n8n execution logs enabled
  - [ ] Supabase logs accessible
  - [ ] Facebook webhook logs monitored

- [ ] **Error Tracking**
  - [ ] Error notification setup (Email/Telegram)
  - [ ] Critical node error alerts

- [ ] **Analytics Setup**
  - [ ] Dashboard for:
    - Message volume
    - Response time
    - Intent distribution
    - Customer status

---

### **Section 6: Security**

- [ ] **Credentials Security**
  - [ ] All API keys stored in environment variables
  - [ ] No hardcoded credentials in workflow
  - [ ] Service role key NOT in version control

- [ ] **HTTPS Enabled**
  - [ ] Webhook URL uses HTTPS
  - [ ] SSL certificate valid

- [ ] **Rate Limiting**
  - [ ] Facebook rate limits understood
  - [ ] n8n rate limiting configured (optional)

- [ ] **PDPA Compliance**
  - [ ] Customer data consent mechanism
  - [ ] Data deletion procedure documented

---

### **Section 7: Backup & Recovery**

- [ ] **Workflow Backup**
  - [ ] Export workflow JSON
  - [ ] Store in version control (GitHub)

- [ ] **Database Backup**
  - [ ] Supabase auto-backup enabled
  - [ ] Manual backup created

- [ ] **Rollback Plan**
  - [ ] Previous workflow version available
  - [ ] Database restore procedure documented

---

### **Section 8: Documentation**

- [ ] **User Documentation**
  - [ ] Setup Guide available
  - [ ] Testing Guide available
  - [ ] Troubleshooting Guide available

- [ ] **Technical Documentation**
  - [ ] Database schema documented
  - [ ] API endpoints documented
  - [ ] Architecture diagram available

- [ ] **Operations Runbook**
  - [ ] Restart procedure
  - [ ] Emergency contact list
  - [ ] Escalation procedure

---

## 🚀 Deployment Steps

### **Step 1: Final Verification (5 min)**
```bash
1. Run all tests one more time
2. Check all credentials are valid
3. Verify webhook connection
4. Test with 5 sample messages
```

### **Step 2: Activate Workflow (1 min)**
```bash
1. Go to n8n
2. Open enhanced_admin_chatbot workflow
3. Click "Active" toggle
4. Confirm activation
```

### **Step 3: Monitor Initial Period (30 min)**
```bash
1. Send test messages from multiple accounts
2. Monitor n8n execution logs
3. Check Supabase for data updates
4. Verify Facebook message delivery
5. Watch for errors
```

### **Step 4: Soft Launch (24 hours)**
```bash
1. Announce to limited users (beta testers)
2. Monitor closely for first 24 hours
3. Collect feedback
4. Fix critical issues immediately
```

### **Step 5: Full Launch**
```bash
1. If soft launch successful, announce to all
2. Continue monitoring for first week
3. Adjust based on real usage patterns
4. Optimize as needed
```

---

## 📊 Success Criteria

### **Technical Metrics:**
- ✅ Uptime: > 99% (24 hours)
- ✅ Response time: < 6 sec (95th percentile)
- ✅ Error rate: < 2%
- ✅ Message delivery: > 98%

### **Business Metrics:**
- ✅ Customer satisfaction: > 4/5
- ✅ Automation rate: > 80%
- ✅ Lead capture: Track numbers
- ✅ Intent classification accuracy: > 90%

---

## 🚨 Rollback Procedure

### **If Critical Issues Found:**

**Step 1: Immediate Action**
```bash
1. Deactivate workflow in n8n
2. Notify team via Telegram/Email
3. Switch to backup/manual response
```

**Step 2: Investigation**
```bash
1. Check n8n execution logs
2. Check Supabase logs
3. Check Facebook webhook logs
4. Identify root cause
```

**Step 3: Fix or Rollback**
```bash
Option A: Quick fix possible
  → Fix issue
  → Test thoroughly
  → Redeploy

Option B: Complex issue
  → Rollback to previous version
  → Fix offline
  → Schedule new deployment
```

---

## 📞 Emergency Contacts

### **Technical Issues:**
```
Primary: [Your Name]
- Email: your@email.com
- Phone: 081-XXX-XXXX
- Telegram: @yourhandle

Secondary: [Backup Person]
- Email: backup@email.com
- Phone: 082-XXX-XXXX
```

### **Service Providers:**
```
Supabase Support: support@supabase.io
n8n Community: community.n8n.io
Facebook Developer: developers.facebook.com/support
```

---

## 📋 Post-Deployment Tasks

### **Day 1:**
- [ ] Monitor all metrics closely
- [ ] Respond to any issues immediately
- [ ] Collect initial feedback

### **Week 1:**
- [ ] Review analytics daily
- [ ] Fine-tune AI prompts if needed
- [ ] Adjust business data content
- [ ] Update QA scenarios based on real queries

### **Week 2-4:**
- [ ] Performance optimization
- [ ] Add missing features (if any)
- [ ] Improve based on user feedback
- [ ] Document lessons learned

---

## ✅ Final Sign-Off

```
===========================================
Deployment Sign-Off
===========================================

Project: CREMO Admin Chatbot Enhanced
Date: _______________
Version: 1.0

Checklist Completed: [ ] Yes [ ] No
All Tests Passed: [ ] Yes [ ] No
Backup Created: [ ] Yes [ ] No
Documentation Complete: [ ] Yes [ ] No

Deployed By: _______________
Signature: _______________

Approved By: _______________
Signature: _______________

Production Start Time: _______________
===========================================
```

---

## 📚 Next Steps After Deployment

1. ✅ Monitor for 7 days continuously
2. ✅ Collect user feedback systematically
3. ✅ Create improvement backlog
4. ✅ Schedule monthly optimization review
5. ✅ Plan for feature updates

---

**Last Updated:** 2025-11-11
**Version:** 1.0
**Status:** Ready for Production Deployment

**Good luck! 🚀**
