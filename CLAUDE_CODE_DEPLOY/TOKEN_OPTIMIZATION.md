# ⚡ TOKEN OPTIMIZATION GUIDE
**Save Credits & Work Efficiently**

---

## 🎯 **CREDIT BUDGET:**
- **Total Available:** ~200 credits
- **Session 1:** 75 credits (Facebook Intelligence)  
- **Session 2:** 75 credits (Image + Text System)
- **Buffer:** 50 credits (debugging/testing)

---

## 💰 **EXPENSIVE OPERATIONS (AVOID):**

### **❌ DON'T USE:**
```
n8n_get_workflow(id)                    # 10-15 credits
n8n_get_workflow_details(id)           # 8-12 credits  
n8n_update_full_workflow(id, data)     # 15-20 credits
```

### **✅ USE INSTEAD:**
```
n8n_get_workflow_structure(id)         # 3-5 credits
n8n_search_nodes("keyword", limit=5)   # 2-3 credits
n8n_get_node_essentials(nodeType)      # 1-2 credits
n8n_create_workflow(data)              # 5-8 credits
```

---

## 🧠 **LEARNING STRATEGY:**

### **1. Study Reference Workflows FIRST (Session Start):**
```python
# Do this ONCE at session start:
for workflow_id in ['BrEps7QE3eBia4U4', 'EGoXsM5lI8hhGNz3', '9AxbvFjt6D5PTQMn']:
    structure = n8n_get_workflow_structure(workflow_id)
    # Learn the patterns - 12-15 credits total
```

### **2. Search for Similar Workflows:**
```python  
# Before creating each new workflow:
templates = n8n_search_nodes("facebook data", limit=5)  # 2 credits
templates = n8n_search_nodes("telegram webhook", limit=5)  # 2 credits
```

### **3. Get Node Details When Needed:**
```python
# Only when you need specific node configuration:
node_info = n8n_get_node_essentials("nodes-base.googleSheets")  # 1 credit
```

---

## 🏗️ **WORKFLOW CREATION STRATEGY:**

### **Build from Templates:**
1. **Study reference workflow structure** (3-5 credits)
2. **Search for similar node patterns** (2-3 credits)  
3. **Copy proven node configurations** (0 credits)
4. **Create new workflow** (5-8 credits)
5. **Test with minimal data** (2-3 credits)

**Total per workflow:** 12-19 credits

### **6 workflows × 15 credits = 90 credits (over budget!)**
### **SOLUTION: Batch operations**

---

## 📦 **BATCH OPTIMIZATION:**

### **Session 1 Plan:**
```
1. Study 3 reference workflows (15 credits)
2. Search for common patterns (10 credits)  
3. Create 6 new workflows (48 credits)
4. Basic testing (5 credits)
TOTAL: 78 credits ✅
```

### **Session 2 Plan:**
```  
1. Study 2 image workflows (10 credits)
2. Search for integration patterns (8 credits)
3. Create 7 enhanced workflows (56 credits)  
4. Integration testing (5 credits)
TOTAL: 79 credits ✅
```

---

## 🎯 **EFFICIENCY TIPS:**

### **1. Copy Don't Reinvent:**
- Use reference workflow node types exactly
- Copy connection patterns
- Reuse parameter structures
- Only modify what's necessary

### **2. Group Similar Operations:**
```python
# Do this:
for node_type in ['googleSheets', 'telegram', 'httpRequest']:
    info = n8n_get_node_essentials(f"nodes-base.{node_type}")

# Not this:
info1 = n8n_get_node_essentials("nodes-base.googleSheets")  
info2 = n8n_get_node_essentials("nodes-base.telegram")
info3 = n8n_get_node_essentials("nodes-base.httpRequest")
```

### **3. Minimal Testing:**
- Test workflows with simple data first
- Full testing after all workflows created
- Use validation tools instead of execution

### **4. Reference Documentation:**
- Study REFERENCE_WORKFLOWS.md thoroughly
- Use TECHNICAL_SPECS.md for parameters
- Don't experiment - follow proven patterns

---

## 📊 **CREDIT TRACKING:**

### **Session 1 Checkpoint:**
- **After 25 credits:** Should have studied all references
- **After 50 credits:** Should have created 3-4 workflows
- **After 75 credits:** Should have complete system

### **Session 2 Checkpoint:**
- **After 25 credits:** Should have studied image patterns  
- **After 50 credits:** Should have created main router + 3 workflows
- **After 75 credits:** Should have complete integrated system

---

## 🚨 **EMERGENCY PROTOCOL:**

### **If Running Over Budget:**
1. **Stop creating new workflows**
2. **Focus on core functionality**  
3. **Use simpler node patterns**
4. **Ask for priority guidance**

### **Minimum Viable System:**
- **Session 1:** Facebook data collection + basic AI analysis
- **Session 2:** Main router + text overlay (arc curve essential)

---

**Stay within budget = Success! 🎯**
