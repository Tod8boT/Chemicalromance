-- =====================================================
-- CREMO Admin Chatbot - Supabase Database Schema
-- =====================================================
-- Created: 2025-11-11
-- Purpose: Enhanced admin chatbot with Smart Batch + Image support
-- Features: Message batching, Session history, RAG, Customer tracking
-- =====================================================

-- =====================================================
-- TABLE 1: enhanced_chat_sessions
-- Purpose: Smart message batching และ session-aware history
-- =====================================================
CREATE TABLE IF NOT EXISTS enhanced_chat_sessions (
  -- Primary key
  id SERIAL PRIMARY KEY,

  -- User identification
  user_id VARCHAR(255) NOT NULL,
  psid VARCHAR(255),  -- Facebook Page-Scoped ID

  -- Message data
  user_text TEXT,  -- Original user message
  merged_message TEXT,  -- Merged message (after batching)
  ai_response TEXT,  -- AI generated response

  -- History tracking (session-aware)
  old_session_history TEXT,  -- Previous days conversations
  now_session_history TEXT,  -- Today's conversation

  -- Classification
  intent_classification VARCHAR(50),  -- Inquiry/Interest/Ready/Objection/Follow_up

  -- Processing status
  processed BOOLEAN DEFAULT false,  -- For smart batching

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT enhanced_chat_sessions_pkey PRIMARY KEY (id)
);

-- Indexes for enhanced_chat_sessions
CREATE INDEX IF NOT EXISTS idx_enhanced_chat_user_processed
  ON enhanced_chat_sessions(user_id, processed);
CREATE INDEX IF NOT EXISTS idx_enhanced_chat_psid
  ON enhanced_chat_sessions(psid);
CREATE INDEX IF NOT EXISTS idx_enhanced_chat_created
  ON enhanced_chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enhanced_chat_intent
  ON enhanced_chat_sessions(intent_classification);

-- Comments for enhanced_chat_sessions
COMMENT ON TABLE enhanced_chat_sessions IS 'Smart batching chat sessions with session-aware history tracking';
COMMENT ON COLUMN enhanced_chat_sessions.user_id IS 'User identifier (Facebook PSID or custom ID)';
COMMENT ON COLUMN enhanced_chat_sessions.merged_message IS 'Multiple messages merged into one (5-second batching window)';
COMMENT ON COLUMN enhanced_chat_sessions.old_session_history IS 'Conversation history from previous days';
COMMENT ON COLUMN enhanced_chat_sessions.now_session_history IS 'Conversation history from today';
COMMENT ON COLUMN enhanced_chat_sessions.processed IS 'TRUE after AI processing, FALSE while waiting for batching';

-- =====================================================
-- TABLE 2: qa_scenarios
-- Purpose: Q&A knowledge base พร้อม image support
-- =====================================================
CREATE TABLE IF NOT EXISTS qa_scenarios (
  -- Primary key
  id SERIAL PRIMARY KEY,

  -- Categorization
  category VARCHAR(100) NOT NULL,  -- location/price_question/freezer_info/contract/school_special/product_info/objection/follow_up

  -- Q&A content
  customer_question TEXT NOT NULL,  -- Sample customer question
  reply TEXT NOT NULL,  -- AI reply template

  -- Image support
  image_url TEXT,  -- Cloudinary image URL
  image_urls TEXT[],  -- Multiple images (array)

  -- Priority and status
  priority INTEGER DEFAULT 1,  -- 1=high, 2=medium, 3=low
  active BOOLEAN DEFAULT true,  -- Can be disabled without deletion

  -- Metadata
  tags TEXT[],  -- Searchable tags
  notes TEXT,  -- Internal notes

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT qa_scenarios_pkey PRIMARY KEY (id)
);

-- Indexes for qa_scenarios
CREATE INDEX IF NOT EXISTS idx_qa_category
  ON qa_scenarios(category);
CREATE INDEX IF NOT EXISTS idx_qa_active
  ON qa_scenarios(active);
CREATE INDEX IF NOT EXISTS idx_qa_priority
  ON qa_scenarios(priority);
CREATE INDEX IF NOT EXISTS idx_qa_tags
  ON qa_scenarios USING GIN(tags);

-- Comments for qa_scenarios
COMMENT ON TABLE qa_scenarios IS 'Q&A knowledge base with image support (43 scenarios)';
COMMENT ON COLUMN qa_scenarios.category IS 'Category: location/price_question/freezer_info/contract/school_special/product_info/objection/follow_up';
COMMENT ON COLUMN qa_scenarios.reply IS 'Can contain placeholders like: (ดึงจาก business_data: variable_name)';
COMMENT ON COLUMN qa_scenarios.image_url IS 'Single image URL (Cloudinary)';
COMMENT ON COLUMN qa_scenarios.image_urls IS 'Multiple images as array';
COMMENT ON COLUMN qa_scenarios.priority IS '1=high (price/location), 2=medium, 3=low (general info)';

-- =====================================================
-- TABLE 3: business_data
-- Purpose: Dynamic business information (CREMO products/services)
-- =====================================================
CREATE TABLE IF NOT EXISTS business_data (
  -- Primary key
  id SERIAL PRIMARY KEY,

  -- Variable identification
  variable VARCHAR(100) UNIQUE NOT NULL,  -- Unique identifier for replacement

  -- Content
  description TEXT NOT NULL,  -- The actual business data

  -- Categorization
  category VARCHAR(50),  -- price/product/freezer/contract/service
  types_of_conversation VARCHAR(50),  -- For filtering by conversation type

  -- Image support
  image_urls TEXT[],  -- Multiple images related to this variable

  -- Metadata
  tags TEXT[],  -- Searchable tags
  notes TEXT,  -- Internal notes

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT business_data_pkey PRIMARY KEY (id),
  CONSTRAINT business_data_variable_key UNIQUE (variable)
);

-- Indexes for business_data
CREATE INDEX IF NOT EXISTS idx_business_variable
  ON business_data(variable);
CREATE INDEX IF NOT EXISTS idx_business_category
  ON business_data(category);
CREATE INDEX IF NOT EXISTS idx_business_updated
  ON business_data(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_tags
  ON business_data USING GIN(tags);

-- Comments for business_data
COMMENT ON TABLE business_data IS 'Dynamic business information for CREMO (29 variables)';
COMMENT ON COLUMN business_data.variable IS 'Unique identifier used in placeholders: (ดึงจาก business_data: variable_name)';
COMMENT ON COLUMN business_data.description IS 'The actual business information that will replace placeholder';
COMMENT ON COLUMN business_data.category IS 'Category: price/product/freezer/contract/service';
COMMENT ON COLUMN business_data.types_of_conversation IS 'Used for filtering: sales/support/inquiry';

-- =====================================================
-- TABLE 4: customer_check
-- Purpose: Customer tracking and status management
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_check (
  -- Primary key
  id SERIAL PRIMARY KEY,

  -- Customer identification
  psid VARCHAR(50) UNIQUE NOT NULL,  -- Facebook Page-Scoped ID

  -- Status tracking
  status VARCHAR(20) DEFAULT 'Normal',  -- Normal/Handoff/success
  customer_status TEXT,  -- Custom status description
  latest_response TEXT,  -- Last message from customer

  -- Intent tracking
  intent_history JSONB,  -- JSON array of past intents
  last_intent VARCHAR(50),  -- Most recent intent

  -- Classification metadata
  decision_reason TEXT,  -- Why this classification was made

  -- Contact information (if provided)
  contact_phone VARCHAR(20),
  contact_name VARCHAR(100),
  contact_address TEXT,

  -- Timestamps
  date_added TIMESTAMP DEFAULT NOW(),
  last_interaction TIMESTAMP DEFAULT NOW(),

  -- Notes
  notes TEXT,  -- Admin notes

  CONSTRAINT customer_check_pkey PRIMARY KEY (id),
  CONSTRAINT customer_check_psid_key UNIQUE (psid)
);

-- Indexes for customer_check
CREATE INDEX IF NOT EXISTS idx_customer_psid
  ON customer_check(psid);
CREATE INDEX IF NOT EXISTS idx_customer_status
  ON customer_check(status);
CREATE INDEX IF NOT EXISTS idx_customer_last_interaction
  ON customer_check(last_interaction DESC);
CREATE INDEX IF NOT EXISTS idx_customer_intent_history
  ON customer_check USING GIN(intent_history);

-- Comments for customer_check
COMMENT ON TABLE customer_check IS 'Customer tracking and status management (PDPA compliant)';
COMMENT ON COLUMN customer_check.psid IS 'Facebook Page-Scoped ID (unique per customer)';
COMMENT ON COLUMN customer_check.status IS 'Normal (ongoing), Handoff (needs human), success (closed sale)';
COMMENT ON COLUMN customer_check.intent_history IS 'JSON array tracking customer intent evolution';
COMMENT ON COLUMN customer_check.decision_reason IS 'Explanation for classification decision';

-- =====================================================
-- VECTOR STORE TABLES (for Supabase Vector Store)
-- =====================================================
-- Note: These are managed by n8n Supabase Vector Store nodes
-- but documented here for reference

-- chat_history_base: For RAG search of chat history
-- Metadata structure: {fileName: "psid", psid: "user_psid"}

-- qa_scenarios_base: For RAG search of Q&A scenarios
-- Metadata structure: {fileName: "qa_scenarios"}

-- business_data_base: For RAG search of business info
-- Metadata structure: {fileName: "business_data"}

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_enhanced_chat_sessions_updated_at
  BEFORE UPDATE ON enhanced_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qa_scenarios_updated_at
  BEFORE UPDATE ON qa_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_data_updated_at
  BEFORE UPDATE ON business_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Update last_interaction on customer_check
CREATE OR REPLACE FUNCTION update_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_interaction = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_last_interaction
  BEFORE UPDATE ON customer_check
  FOR EACH ROW
  EXECUTE FUNCTION update_last_interaction();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Optional
-- =====================================================
-- Uncomment if you need RLS for multi-tenant setup

-- ALTER TABLE enhanced_chat_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE qa_scenarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE business_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customer_check ENABLE ROW LEVEL SECURITY;

-- Example policy (adjust as needed):
-- CREATE POLICY "Public read access" ON qa_scenarios FOR SELECT USING (true);
-- CREATE POLICY "Service role full access" ON qa_scenarios FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- SAMPLE QUERIES FOR VERIFICATION
-- =====================================================

-- Check table structures
-- SELECT table_name, column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name IN ('enhanced_chat_sessions', 'qa_scenarios', 'business_data', 'customer_check')
-- ORDER BY table_name, ordinal_position;

-- Check indexes
-- SELECT tablename, indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('enhanced_chat_sessions', 'qa_scenarios', 'business_data', 'customer_check')
-- ORDER BY tablename, indexname;

-- Count records (after migration)
-- SELECT
--   (SELECT COUNT(*) FROM enhanced_chat_sessions) as chat_sessions,
--   (SELECT COUNT(*) FROM qa_scenarios) as qa_scenarios,
--   (SELECT COUNT(*) FROM business_data) as business_data,
--   (SELECT COUNT(*) FROM customer_check) as customers;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
-- Version: 1.0
-- Last Updated: 2025-11-11
-- =====================================================
