-- =====================================================
-- CREMO Admin Chatbot - Data Migration Scripts
-- =====================================================
-- Created: 2025-11-11
-- Purpose: Migrate CSV data to Supabase tables
-- Order: Run after supabase_schema.sql
-- =====================================================

-- =====================================================
-- STEP 1: Migrate QA Scenarios
-- =====================================================
-- Source: adminpage - QA_scenarios.csv (43 rows)
-- Target: qa_scenarios table

INSERT INTO qa_scenarios (category, customer_question, reply, priority, image_url) VALUES
-- Location queries (7 scenarios) - High priority
('location', 'ให้บริการกรุงเทพไหม', 'ให้บริการทั่วไทยค่ะ กทม.ก็ได้ พี่อยู่แถวไหนคะ จะให้เซลส์ในพื้นที่ติดต่อกลับเลย', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-thailand-map.jpg'),
('location', 'ต่างจังหวัดได้ไหม', 'ได้เลยค่ะ เราให้บริการทุกจังหวัด พี่อยู่จังหวัดไหนคะ ขอเบอร์หน่อยจะให้เซลส์ติดต่อกลับ', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-thailand-map.jpg'),
('location', 'ภาคอีสานมีบริการไหม', 'มีค่ะ ทุกจังหวัดได้เลย พี่ช่วยบอกจังหวัดกับเบอร์ได้ไหมคะ จะให้ทีมติดต่อกลับทันที', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-thailand-map.jpg'),
('location', 'เซลส์มาถึงบ้านไหม', 'มาค่ะ เรามีเซลส์ทุกจังหวัด ติดตั้งตู้ให้ฟรีถึงที่ พี่ช่วยแชร์ที่อยู่กับเบอร์ได้ไหมคะ', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-service-areas.jpg'),
('location', 'ไปไกลมีค่าส่งไหม', 'ไม่มีค่ะ ส่งฟรีทุกจังหวัด พี่อยู่ที่ไหนคะ ขอเบอร์ติดต่อหน่อยจะจัดการให้เลย', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-free-delivery.jpg'),
('location', 'พื้นที่ไหนบ้างที่มีบริการ', 'ทั่วไทยเลยค่ะ เน้นภาคกลาง แต่ทุกจังหวัดรับได้ พี่อยู่แถวไหนคะ', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-thailand-map.jpg'),

-- Price questions (10 scenarios) - High priority
('price_question', 'เปิดบิลแรกเท่าไร', 'ขอเช็คโปรโมชั่นล่าสุดให้นะคะ สักครู่... (ดึงจาก business_data: โปรโมชั่นปัจจุบัน) พี่เหมาะกับโปรนี้ไหมคะ ขอเบอร์หน่อยจะโทรไปอธิบายเพิ่ม', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-promotion.jpg'),
('price_question', 'โปรตอนนี้อะไร', 'ขอเช็คโปรล่าสุดให้นะคะ... (ดึงจาก business_data: โปรโมชั่นปัจจุบัน) คุ้มมากเลยค่ะ พี่ช่วยให้เบอร์ได้ไหมคะ', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-promotion.jpg'),
('price_question', 'มีค่ามัดจำไหม', 'ไม่มีค่ะ ไม่มีมัดจำเลย (ดึงจาก business_data: ค่าใช้จ่ายทั้งหมด) พี่พร้อมเริ่มเมื่อไหร่คะ', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-no-deposit.jpg'),
('price_question', 'ค่าใช้จ่ายทั้งหมดเท่าไร', 'ขอเช็คข้อมูลให้แน่ใจนะคะ... (ดึงจาก business_data: ค่าใช้จ่ายทั้งหมด) พี่สะดวกช่วงไหนให้โทรไปคุยคะ', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-pricing-table.jpg'),
('price_question', 'แพงไหม', 'ไม่แพงเลยค่ะ (ดึงจาก business_data: ค่าใช้จ่ายทั้งหมด) คุ้มมากค่ะ พี่ต้องการทราบอะไรเพิ่มไหมคะ', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-value.jpg'),
('price_question', 'ถ้าขายดีต้องซื้อเท่าไร', 'สั่งตามยอดขายเลยค่ะ ไม่มีบังคับขั้นต่ำ ขายดีก็สั่งเยอะ ขายน้อยก็สั่งน้อย พี่เหมาะกับแบบนี้ไหมคะ', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-flexible-order.jpg'),
('price_question', 'ราคาสินค้าขายออกเท่าไร', 'ขอเช็คราคาล่าสุดให้นะคะ... (ดึงจาก business_data: ราคาขายออก) พี่ช่วยให้เบอร์ได้ไหมคะ จะส่งรายละเอียดให้', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-retail-price.jpg'),
('price_question', 'กำไรเท่าไร', '(ดึงจาก business_data: กำไรโดยเฉลี่ย) พี่ร้านเป็นแบบไหนคะ จะประเมินกำไรให้คร่าวๆ', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-profit.jpg'),
('price_question', 'คุ้มไหม', 'คุ้มค่ะ ไม่ต้องลงทุน ได้กำไรเพิ่ม พี่ช่วงไหนสะดวกให้โทรไปคุยคะ', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-value.jpg'),
('price_question', 'มีส่วนลดไหม', 'ขอเช็คโปรล่าสุดให้นะคะ... (ดึงจาก business_data: โปรโมชั่นปัจจุบัน) พี่ช่วยให้เบอร์หน่อยจะโทรไปอธิบายเพิ่ม', 1, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-promotion.jpg'),

-- Freezer info (8 scenarios) - Medium priority
('freezer_info', 'ตู้ใหญ่แค่ไหน', '(ดึงจาก business_data: ขนาดตู้แช่) พี่ร้านกว้างประมาณเท่าไหร่คะ จะแนะนำให้', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-large-freezer.jpg'),
('freezer_info', 'ค่าไฟเท่าไร', '(ดึงจาก business_data: ค่าไฟตู้แช่) ไม่แพงเลย พี่เหมาะกับตู้ขนาดไหนคะ', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-energy-cost.jpg'),
('freezer_info', 'ตู้เสียต้องทำยังไง', '(ดึงจาก business_data: เคลมตู้เสีย) พี่สบายใจได้นะคะ ช่วงไหนสะดวกให้ติดตั้ง', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-warranty.jpg'),
('freezer_info', 'ตู้มีรับประกันไหม', '(ดึงจาก business_data: การรับประกันตู้) พี่มั่นใจได้เลย ต้องการเริ่มเมื่อไหร่คะ', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-warranty.jpg'),
('freezer_info', 'ติดตั้งนานไหม', '(ดึงจาก business_data: การติดตั้งตู้) พี่ช่วงไหนสะดวกให้ไปติดตั้ง', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-installation.jpg'),
('freezer_info', 'มีค่าติดตั้งไหม', 'ไม่มีค่ะ (ดึงจาก business_data: การติดตั้งตู้) พี่พร้อมเริ่มไหมคะ ช่วยให้เบอร์หน่อย', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-free-installation.jpg'),
('freezer_info', 'ดูตู้ได้ที่ไหน', 'ให้เซลส์เอาตัวอย่างไปให้ดูที่ร้านเลยค่ะ พี่อยู่ที่ไหนคะ ขอเบอร์หน่อยจะนัดให้', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-large-freezer.jpg'),
('freezer_info', 'เปลี่ยนตู้ได้ไหม', 'ได้ค่ะ ถ้าขนาดไม่เหมาะเปลี่ยนได้เลย ไม่เสียค่าใช้จ่าย พี่ต้องการขนาดไหนคะ', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-flexible.jpg'),

-- Contract (5 scenarios) - Medium priority
('contract', 'สัญญาผูกมัดไหม', '(ดึงจาก business_data: สัญญาและเงื่อนไข) พี่สบายใจได้เลยค่ะ ช่วงไหนสะดวกให้เริ่ม', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-contract.jpg'),
('contract', 'ขายไม่ดีทำยังไง', '(ดึงจาก business_data: สัญญาและเงื่อนไข) แต่ลูกค้าส่วนใหญ่ขายดีนะคะ พี่ช่วยให้เบอร์หน่อย', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-flexible.jpg'),
('contract', 'ไม่อยากขายแล้วทำยังไง', '(ดึงจาก business_data: การยกเลิกสัญญา) ง่ายมาก ไม่มีค่าใช้จ่าย พี่ต้องการเริ่มไหมคะ', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-easy-cancel.jpg'),
('contract', 'มีเงื่อนไขอะไรบ้าง', '(ดึงจาก business_data: สัญญาและเงื่อนไข) พี่พร้อมเริ่มไหมคะ ขอเบอร์หน่อย', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-contract.jpg'),
('contract', 'ต้องสั่งขั้นต่ำไหม', '(ดึงจาก business_data: การสั่งซื้อ) ไม่บังคับ พี่ต้องการทราบอะไรเพิ่มไหมคะ', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-flexible-order.jpg'),

-- School special (3 scenarios) - Medium priority
('school_special', 'โรงเรียนทำได้ไหม', 'ได้เลยค่ะ เรามีลูกค้าโรงเรียนเยอะมาก นักเรียนชอบมาก พี่ช่วยให้เบอร์ได้ไหมคะ จะให้เซลส์ไปคุย', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-school.jpg'),
('school_special', 'โรงเรียนเหมาะไหม', 'เหมาะมากค่ะ ขายดีแน่นอน นักเรียนชอบซื้อช่วงพัก พี่ช่วงไหนสะดวกให้เซลส์ไปคุย', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-school-success.jpg'),
('school_special', 'โรงเรียนได้กำไรเท่าไร', '(ดึงจาก business_data: กำไรโดยเฉลี่ย) พี่ช่วยให้เบอร์ได้ไหมคะ', 2, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-profit.jpg'),

-- Product info (3 scenarios) - Low priority
('product_info', 'มีรสอะไรบ้าง', '(ดึงจาก business_data: รสชาติสินค้า) พี่ต้องการเริ่มไหมคะ ช่วยให้เบอร์หน่อย', 3, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-flavors.jpg'),
('product_info', 'ลูกค้าชอบรสไหน', 'ช็อกโกแลตกับสตรอว์เบอร์รี่ขายดีสุดค่ะ แต่มีให้เลือกหลายรส พี่ต้องการทราบอะไรเพิ่มไหมคะ', 3, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-bestsellers.jpg'),
('product_info', 'สินค้าดีไหม', 'ดีค่ะ อร่อย คุณภาพดี ลูกค้าชอบมาก พี่มั่นใจได้เลย ช่วยให้เบอร์หน่อยคะ', 3, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-quality.jpg'),

-- Objection (3 scenarios) - Low priority
('objection', 'ยังไม่พร้อม', 'ไม่เป็นไรค่ะ พอดูข้อมูลก่อนก็ได้ ช่วยให้เบอร์ไว้นะคะ จะส่งรายละเอียดให้ดู', 3, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-info.jpg'),
('objection', 'กลัวขายไม่ดี', 'เข้าใจค่ะ แต่พอดูก็ไม่เสียหาย (ดึงจาก business_data: สัญญาและเงื่อนไข) พี่ช่วยให้เบอร์ได้ไหมคะ', 3, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-no-risk.jpg'),
('objection', 'ยังไม่แน่ใจ', 'ไม่เป็นไรค่ะ ให้เซลส์ไปอธิบายให้ฟังก่อนก็ได้ ไม่มีค่าใช้จ่าย พี่ช่วงไหนสะดวกคะ', 3, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-consultation.jpg'),

-- Follow-up (4 scenarios) - Low priority
('follow_up', 'ขอคิดก่อน', 'ได้เลยค่ะ ช่วยให้เบอร์ไว้นะคะ จะส่งข้อมูลเพิ่มให้ดู พี่สะดวกเวลาไหนให้โทรกลับ', 3, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-followup.jpg'),
('follow_up', 'เดี๋ยวโทรกลับ', 'ได้ค่ะ หรือให้เบอร์ไว้จะให้เซลส์โทรไปคุยก็ได้นะคะ สะดวกกว่า', 3, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-callback.jpg'),
('follow_up', 'ให้เซลส์โทรมา', 'ได้เลยค่ะ ช่วยให้เบอร์กับช่วงเวลาที่สะดวกหน่อยนะคะ จะให้โทรไปเลย', 3, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-sales-call.jpg'),
('follow_up', 'ส่งรายละเอียดมาหน่อย', 'ได้ค่ะ ช่วยให้เบอร์หน่อยนะคะ จะส่งข้อมูลให้ทาง Line หรือให้เซลส์โทรไปคุยก็ได้', 3, 'https://res.cloudinary.com/dz3cmaxnc/image/upload/v1731356069/cremo-info.jpg')

ON CONFLICT (id) DO NOTHING;

-- Update sequence
SELECT setval('qa_scenarios_id_seq', (SELECT MAX(id) FROM qa_scenarios));

-- =====================================================
-- STEP 2: Migrate Business Data
-- =====================================================
-- Source: adminpage - business_data.csv (29 rows)
-- Target: business_data table

INSERT INTO business_data (variable, description, category) VALUES
-- Product info
('สินค้าหลัก', 'ไอศกรีมแท่ง ไอศกรีมถ้วย ไอศกรีมโคน มีทุกรสชาติ เน้นให้ลูกค้าวางตู้ฟรี', 'product'),
('ไอศกรีมตัก', 'เหมาะสำหรับคาเฟ่และร้านอาหาร โดยเฉพาะหมูกะทะที่เอาไปใช้ในบุฟเฟ่ ราคาถูก คุณภาพดี', 'product'),
('รสชาติสินค้า', 'มีทุกรสชาติ เช่น ช็อกโกแลต วนิลา สตรอว์เบอร์รี่ มะพร้าว ชาเขียว และอื่นๆ อีกมากมาย เน้นความสะดวกและโปรโมชั่น', 'product'),

-- Freezer specifications
('ขนาดตู้แช่', 'มี 3 ขนาด: กว้าง 1 เมตร (เล็ก), 1.2 เมตร (กลาง), 1.5 เมตร (ใหญ่) ตู้แบบกระจกเลื่อน', 'freezer'),
('ตู้แช่ภาพตัวอย่าง', 'ตู้แช่แบบกระจกเลื่อน สวยงามทันสมัย ดูภาพได้ที่: https://res.cloudinary.com/dz3cmaxnc/image/upload/v1761356069/cremo-large-freezer.jpg', 'freezer'),
('ค่าไฟตู้แช่', 'ค่าไฟเฉลี่ยวันละ 10-12 บาท คิดเป็นเดือนประมาณ 300-360 บาท ขึ้นกับการเปิด-ปิดตู้', 'freezer'),
('การรับประกันตู้', 'รับประกันตลอดอายุสัญญา ตู้เสียซ่อมฟรี หรือเปลี่ยนตู้ใหม่ให้เลย ไม่มีค่าใช้จ่ายเพิ่มเติม', 'freezer'),
('การติดตั้งตู้', 'ติดตั้งฟรี ไม่มีค่าติดตั้ง ใช้เวลาแค่ 30 นาที เสียบปลั๊กรอ 2 ชั่วโมงก็เริ่มขายได้ทันที ง่ายมาก', 'freezer'),
('เคลมตู้เสีย', 'แจ้งเราทันทีผ่าน Line หรือโทร จะส่งช่างไปซ่อมฟรีหรือเปลี่ยนตู้ใหม่ให้เลย รวดเร็วภายใน 1-2 วัน', 'freezer'),

-- Pricing
('โปรโมชั่นปัจจุบัน', 'บิลแรก 2,500 บาท ลดทันที 1,000 บาท จ่ายจริงเพียง 1,500 บาท ได้ตู้ฟรี ส่งฟรี ไม่มีมัดจำ โปรนี้อัปเดตเป็นระยะ ต้องเช็คล่าสุดก่อนบอกลูกค้าเสมอ', 'price'),
('ค่าใช้จ่ายทั้งหมด', 'เสียแค่ค่าสินค้าบิลแรก 1,500 บาท (หลังลด 1,000 จากปกติ 2,500) ที่เหลือฟรีหมด: ตู้ฟรี ไม่มีมัดจำ ไม่มีค่าติดตั้ง ไม่มีค่าส่ง ไม่มีค่าซ่อม', 'price'),
('ค่ามัดจำตู้', 'ไม่มีค่ามัดจำเลย เราให้ยืมตู้ฟรี 100% ไม่ต้องจ่ายเงินล่วงหน้า เสียแค่ค่าสินค้าบิลแรกเท่านั้น', 'price'),
('ค่าส่งตู้', 'ส่งฟรีทุกจังหวัดทั่วไทย ไม่มีค่าขนส่งแม้แต่บาทเดียว ไม่ว่าจะอยู่ไกลแค่ไหนก็ฟรี', 'price'),
('ค่าติดตั้งตู้', 'ติดตั้งฟรี ไม่มีค่าติดตั้ง ทีมช่างมาติดตั้งให้ฟรีทั่วประเทศ เสียบปลั๊กก็ใช้ได้เลย', 'price'),
('กำไรโดยเฉลี่ย', 'ลูกค้าทั่วไป (ร้านสะดวกซื้อ/คาเฟ่): 3,000-10,000 บาท/เดือน | โรงเรียน: 5,000-15,000 บาท/เดือน | ขึ้นกับยอดขายและจำนวนลูกค้า', 'price'),
('ราคาขายออก', 'ราคาขายปลีกโดยเฉลี่ย 10-15 บาท/ชิ้น (ขึ้นกับรุ่นและขนาด) กำไรต่อชิ้นประมาณ 3-5 บาท ลูกค้าส่วนใหญ่ขายได้ 20-50 ชิ้น/วัน', 'price'),
('ราคาสินค้าต้นทุน', 'ต้นทุนสินค้าโดยเฉลี่ย 7-10 บาท/ชิ้น (ขึ้นกับรุ่น) ขายออก 10-15 บาท ได้กำไร 3-5 บาท/ชิ้น คำนวณง่าย ขายวันละ 30 ชิ้น ได้กำไร 100-150 บาท/วัน', 'price'),
('ส่วนลดพิเศษ', 'นอกจากบิลแรกลด 1,000 บาทแล้ว ยังมีโปรเมชั่นพิเศษตามช่วงเทศกาล (เช่น ปีใหม่ สงกรานต์) ต้องเช็คกับทีมขายเสมอเพราะอัปเดตบ่อย', 'price'),
('ราคาเปรียบเทียบคู่แข่ง', 'ครีโมถูกกว่าแบรนด์ดังอื่นๆ ประมาณ 15-20% แต่คุณภาพไม่แพ้ กำไรดีกว่า เหมาะสำหรับร้านเล็กที่ต้องการกำไรดี', 'price'),

-- Service
('การสั่งซื้อ', 'สั่งตามยอดขายจริง ไม่มีขั้นต่ำบังคับ ขายดีสั่งเยอะ ขายน้อยสั่งน้อย ยืดหยุ่น100% ลูกค้าไม่เสี่ยงสต็อกค้าง', 'service'),
('พื้นที่ให้บริการ', 'ให้บริการทั่วไทยทุกจังหวัด เน้นภาคกลาง แต่ภาคอื่นๆ ก็รับทั้งหมด มีเซลส์และทีมติดตั้งในทุกภูมิภาค', 'service'),
('ทีมขายในพื้นที่', 'มีเซลส์ประจำทุกจังหวัด สามารถนัดหมายไปพบที่ร้านได้ เอาตัวอย่างไปให้ดู อธิบายรายละเอียดตรงหน้าได้', 'service'),
('ช่องทางติดต่อ', 'ติดต่อผ่าน Facebook Messenger (เพจครีโม), Line Official, หรือโทรศัพท์ เราไม่ให้เบอร์ตรงๆ แต่ขอเบอร์ลูกค้าแล้วให้เซลส์โทรกลับ พร้อมถามช่วงเวลาที่สะดวก', 'service'),
('เวลาทำการ', 'ให้บริการ 24/7 ไม่มีวันหยุด ตอบข้อความได้ตลอดเวลา แต่การติดตั้งตู้จะนัดหมายในวันจันทร์-เสาร์ เวลา 9:00-17:00', 'service'),
('ระยะเวลาติดตั้ง', 'หลังยืนยันคำสั่งซื้อ ประมาณ 3-7 วันจะนัดไปติดตั้ง (ขึ้นกับพื้นที่) ติดตั้งใช้เวลา 30 นาที รอ 2 ชม.ก็ขายได้', 'service'),

-- Contract
('สัญญาและเงื่อนไข', 'สัญญาไม่ผูกมัด ไม่อยากขายต่อคืนตู้ได้เลย ไม่มีค่าปรับ แค่แจ้งล่วงหน้า 7 วัน จะไปเก็บตู้คืนฟรี ลูกค้าไม่เสี่ยงอะไร', 'contract'),
('การยกเลิกสัญญา', 'ยกเลิกได้ตลอดเวลา แจ้งล่วงหน้า 7 วัน ไม่มีค่าปรับ ไม่มีค่าใช้จ่าย ทีมจะไปเก็บตู้คืนฟรี ง่ายมาก', 'contract'),
('เงื่อนไขการวางตู้', 'ต้องมีพื้นที่วางตู้ มีปลั๊กไฟ และยอมรับเงื่อนไขว่าจะดูแลตู้ไม่ให้เสียหาย (ใช้งานปกติ) เท่านั้น ไม่มีเงื่อนไขซับซ้อน', 'contract')

ON CONFLICT (variable) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = NOW();

-- Update sequence
SELECT setval('business_data_id_seq', (SELECT MAX(id) FROM business_data));

-- =====================================================
-- STEP 3: Migrate Customer Check Data
-- =====================================================
-- Source: adminpage - customer_check.csv (sample data)
-- Target: customer_check table
-- Note: Only migrate if you want to preserve existing customer data

-- Example migration (adjust based on actual data):
-- INSERT INTO customer_check (psid, status, latest_response, customer_status, date_added) VALUES
-- ('24717167167878639', 'Normal', 'ส่งเบอร์โทรอย่างเดียว', 'ปิดการขาย', '2025-10-26 06:21:40'),
-- ('25055310377432306', 'success', NULL, NULL, '2025-10-30 15:30:04'),
-- ('25134335466160543', 'success', NULL, NULL, '2025-10-31 07:31:42'),
-- ('24951005377881824', 'Handoff', NULL, NULL, '2025-11-03 08:39:28')
-- ON CONFLICT (psid) DO UPDATE SET
--   status = EXCLUDED.status,
--   latest_response = EXCLUDED.latest_response,
--   customer_status = EXCLUDED.customer_status,
--   last_interaction = NOW();

-- =====================================================
-- STEP 4: Verification Queries
-- =====================================================

-- Count migrated records
SELECT
  'qa_scenarios' as table_name,
  COUNT(*) as record_count,
  COUNT(DISTINCT category) as categories
FROM qa_scenarios
UNION ALL
SELECT
  'business_data' as table_name,
  COUNT(*) as record_count,
  COUNT(DISTINCT category) as categories
FROM business_data
UNION ALL
SELECT
  'customer_check' as table_name,
  COUNT(*) as record_count,
  COUNT(DISTINCT status) as statuses
FROM customer_check;

-- Check QA scenarios by category
SELECT
  category,
  COUNT(*) as count,
  COUNT(image_url) as with_images
FROM qa_scenarios
GROUP BY category
ORDER BY count DESC;

-- Check business data by category
SELECT
  category,
  COUNT(*) as count
FROM business_data
GROUP BY category
ORDER BY count DESC;

-- Sample data verification
SELECT * FROM qa_scenarios LIMIT 5;
SELECT * FROM business_data LIMIT 5;
SELECT * FROM customer_check LIMIT 5;

-- =====================================================
-- STEP 5: Create Vector Store Embeddings (Manual)
-- =====================================================
-- Note: This is done through n8n workflow, not SQL
-- Use the RAG_n8n ref.json workflows to:
-- 1. Upload qa_scenarios to Supabase Vector Store
-- 2. Upload business_data to Supabase Vector Store
-- 3. Configure metadata filters

-- =====================================================
-- END OF MIGRATION
-- =====================================================
-- Version: 1.0
-- Last Updated: 2025-11-11
-- Records Migrated: 43 QA + 29 Business Data
-- =====================================================
