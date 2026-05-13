-- AgriSmart Database Schema with Multi-Language Support (i18n)
-- PostgreSQL Initialization Script with JSONB for translatable fields

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS weather_alerts CASCADE;
DROP TABLE IF EXISTS farmer_tasks CASCADE;
DROP TABLE IF EXISTS farmer_crops CASCADE;
DROP TABLE IF EXISTS schedule_templates CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- USERS TABLE
-- Base table for all roles with language preference
-- ============================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'farmer')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location TEXT,
    
    -- i18n: Language preference (ISO 639-1 code)
    -- 'en' = English, 'mr' = Marathi, 'hi' = Hindi
    language_preference VARCHAR(10) DEFAULT 'en',
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- Subscription plans for admin accounts
-- ============================================================================
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CROPS TABLE
-- Master crop catalog with JSONB for multi-language names
-- ============================================================================
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    
    -- i18n: Multi-language crop name stored as JSONB
    -- Example: { "en": "Mango", "mr": "आंबा", "hi": "आम" }
    name JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- i18n: Multi-language variety names
    -- Example: { "en": "Kesar", "mr": "केसर", "hi": "केसर" }
    variety JSONB DEFAULT '{}'::jsonb,
    
    -- i18n: Multi-language description
    -- Example: { "en": "Premium alphonso mango", "mr": "प्रीमियम आंबा", "hi": "प्रीमियम आम" }
    description JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SCHEDULE TEMPLATES TABLE
-- Master schedule templates with JSONB for multi-language task names
-- ============================================================================
CREATE TABLE schedule_templates (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    
    -- i18n: Multi-language task name
    -- Example: { "en": "Land Preparation", "mr": "जमीन तयारी", "hi": "जमीन तैयारी" }
    task_name JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    days_after_sowing INTEGER NOT NULL,
    
    -- i18n: Multi-language instructions
    -- Example: { "en": "Prepare the land", "mr": "जमीन तयार करा", "hi": "जमीन तैयार करें" }
    instructions JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FARMER CROPS TABLE
-- Junction between farmers and crops with sowing date
-- ============================================================================
CREATE TABLE farmer_crops (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    sowing_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(farmer_id, crop_id)
);

-- ============================================================================
-- FARMER TASKS TABLE
-- Individual tasks assigned to farmers
-- ============================================================================
CREATE TABLE farmer_tasks (
    id SERIAL PRIMARY KEY,
    farmer_crop_id INTEGER REFERENCES farmer_crops(id) ON DELETE CASCADE,
    
    -- i18n: Multi-language task name
    task_name JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    due_date DATE NOT NULL,
    das INTEGER NOT NULL,
    
    -- i18n: Multi-language instructions
    instructions JSONB DEFAULT '{}'::jsonb,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
    completed_at TIMESTAMP,
    completion_note TEXT,
    completion_photo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- WEATHER ALERTS TABLE
-- Automated weather alerts for farmers
-- ============================================================================
CREATE TABLE weather_alerts (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('rain', 'heat', 'flood', 'drought')),
    
    -- i18n: Multi-language alert message
    -- Example: { "en": "Rain expected", "mr": "पाऊस अपेक्षित", "hi": "बारिश की संभावना" }
    message JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- Performance optimization
-- ============================================================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_language ON users(language_preference);
CREATE INDEX idx_farmer_tasks_status ON farmer_tasks(status);
CREATE INDEX idx_farmer_tasks_due_date ON farmer_tasks(due_date);
CREATE INDEX idx_farmer_tasks_farmer_crop_id ON farmer_tasks(farmer_crop_id);
CREATE INDEX idx_weather_alerts_farmer_id ON weather_alerts(farmer_id);
CREATE INDEX idx_weather_alerts_is_read ON weather_alerts(is_read);
CREATE INDEX idx_farmer_crops_farmer_id ON farmer_crops(farmer_id);
CREATE INDEX idx_schedule_templates_crop_id ON schedule_templates(crop_id);

-- ============================================================================
-- JSONB HELPER FUNCTIONS
-- Functions for extracting language-specific values from JSONB columns
-- ============================================================================

-- Function to get crop name in specific language
CREATE OR REPLACE FUNCTION get_crop_name(p_crop_id INTEGER, p_language VARCHAR DEFAULT 'en')
RETURNS TEXT AS $$
DECLARE
    v_name JSONB;
BEGIN
    SELECT c.name INTO v_name FROM crops c WHERE c.id = p_crop_id;
    IF v_name IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN COALESCE(v_name->>p_language, v_name->>'en', '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get task name in specific language
CREATE OR REPLACE FUNCTION get_task_name(p_task_id INTEGER, p_language VARCHAR DEFAULT 'en')
RETURNS TEXT AS $$
DECLARE
    v_name JSONB;
BEGIN
    SELECT ft.task_name INTO v_name FROM farmer_tasks ft WHERE ft.id = p_task_id;
    IF v_name IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN COALESCE(v_name->>p_language, v_name->>'en', '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get schedule template task name
CREATE OR REPLACE FUNCTION get_schedule_task_name(p_template_id INTEGER, p_language VARCHAR DEFAULT 'en')
RETURNS TEXT AS $$
DECLARE
    v_name JSONB;
BEGIN
    SELECT st.task_name INTO v_name FROM schedule_templates st WHERE st.id = p_template_id;
    IF v_name IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN COALESCE(v_name->>p_language, v_name->>'en', '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get weather alert message
CREATE OR REPLACE FUNCTION get_alert_message(p_alert_id INTEGER, p_language VARCHAR DEFAULT 'en')
RETURNS TEXT AS $$
DECLARE
    v_message JSONB;
BEGIN
    SELECT wa.message INTO v_message FROM weather_alerts wa WHERE wa.id = p_alert_id;
    IF v_message IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN COALESCE(v_message->>p_language, v_message->>'en', '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- SQL QUERY EXAMPLES FOR i18n
-- Example queries for fetching language-specific data
-- ============================================================================

-- Example 1: Get all crops in a specific language
-- SELECT id, get_crop_name(id, 'mr') as name FROM crops;

-- Example 2: Get farmer tasks in Marathi for a specific farmer
-- SELECT ft.id, get_task_name(ft.id, 'mr') as task_name, ft.due_date, ft.status
-- FROM farmer_tasks ft
-- JOIN farmer_crops fc ON ft.farmer_crop_id = fc.id
-- WHERE fc.farmer_id = 4;

-- Example 3: Get weather alerts in Hindi
-- SELECT wa.id, get_alert_message(wa.id, 'hi') as message, wa.alert_type, wa.severity
-- FROM weather_alerts wa
-- WHERE wa.farmer_id = 4;

-- Example 4: Get schedule templates in English
-- SELECT st.id, get_schedule_task_name(st.id, 'en') as task_name, st.days_after_sowing, 
--        st.instructions->>'en' as instructions
-- FROM schedule_templates st
-- WHERE st.crop_id = 1
-- ORDER BY st.days_after_sowing;

-- ============================================================================
-- UPDATED_AT TRIGGER
-- Auto-update timestamp when rows are modified
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA WITH MULTI-LANGUAGE
-- ============================================================================

-- Insert Super Admin
INSERT INTO users (email, password, role, name, phone, location, language_preference) VALUES
('superadmin@agrismart.com', '$2b$10$rBV2JzS1Jv7Z8Z8Z8Z8Z8OvJ1J1J1J1J1J1J1J1J1J1J1J1J1J1J1J1J1', 'super_admin', 'Super Admin', '+1234567890', 'Headquarters', 'en');

-- Insert sample Admins
INSERT INTO users (email, password, role, name, phone, location, language_preference) VALUES
('admin1@agrismart.com', '$2b$10$rBV2JzS1Jv7Z8Z8Z8Z8Z8OvJ1J1J1J1J1J1J1J1J1J1J1J1J1J1J1J1', 'admin', 'John Consultant', '+1234567891', 'Region A', 'en'),
('admin2@agrismart.com', '$2b$10$rBV2JzS1Jv7Z8Z8Z8Z8Z8OvJ1J1J1J1J1J1J1J1J1J1J1J1J1J1J1J1', 'admin', 'जान consultant', '+1234567892', 'Region B', 'mr');

-- Insert sample Farmers with different language preferences
INSERT INTO users (email, password, role, name, phone, location, language_preference) VALUES
('farmer1@agrismart.com', '$2b$10$rBV2JzS1Jv7Z8Z8Z8Z8Z8OvJ1J1J1J1J1J1J1J1J1J1J1J1J1J1J1J1', 'farmer', 'Ram Singh', '+1234567893', 'Village A, District X', 'mr'),
('farmer2@agrismart.com', '$2b$10$rBV2JzS1Jv7Z8Z8Z8Z8Z8OvJ1J1J1J1J1J1J1J1J1J1J1J1J1J1J1J1', 'farmer', 'Lakshmi Devi', '+1234567894', 'Village B, District Y', 'hi'),
('farmer3@agrismart.com', '$2b$10$rBV2JzS1Jv7Z8Z8Z8Z8Z8OvJ1J1J1J1J1J1J1J1J1J1J1J1J1J1J1J1', 'farmer', 'Krishna Rao', '+1234567895', 'Village C, District Z', 'en');

-- Insert sample subscriptions
INSERT INTO subscriptions (admin_id, plan_type, start_date, end_date) VALUES
(2, 'premium', '2024-01-01', '2024-12-31'),
(3, 'basic', '2024-01-01', '2024-06-30');

-- Insert sample crops with multi-language names
INSERT INTO crops (name, variety, description) VALUES
(
    -- Mango
    '{"en": "Mango", "mr": "आंबा", "hi": "आम"}'::jsonb,
    '{"en": "Kesar", "mr": "केसर", "hi": "केसर"}'::jsonb,
    '{"en": "Premium alphonso mango variety from Gujarat", "mr": "गुजरात मधील प्रीमियम आंबा", "hi": "गुजरात से प्रीमियम आम"}'::jsonb
),
(
    -- Wheat
    '{"en": "Wheat", "mr": "गव्ही", "hi": "गेहूं"}'::jsonb,
    '{"en": "PBW-550", "mr": "पीबीडब्ल्यू-550", "hi": "पीबीडब्ल्यू-550"}'::jsonb,
    '{"en": "High-yielding dwarf wheat variety", "mr": "उच्च उत्पादक वाढवे गव्ही", "hi": "उच्च उपज गेहूं की किस्म"}'::jsonb
),
(
    -- Rice
    '{"en": "Rice", "mr": "भात", "hi": "चावल"}'::jsonb,
    '{"en": "Basmati", "mr": "बासमती", "hi": "बासमती"}'::jsonb,
    '{"en": "Premium aromatic basmati rice", "mr": "प्रीमियम सुगंधी भात", "hi": "प्रीमियम सुगंधित बासमती चावल"}'::jsonb
),
(
    -- Cotton
    '{"en": "Cotton", "mr": "कापूस", "hi": "कपास"}'::jsonb,
    '{"en": "BT-Cotton", "mr": "बीटी-कापूस", "hi": "बीटी-कपास"}'::jsonb,
    '{"en": "Genetically modified cotton variety", "mr": "जनुकीय सुधारित कापूस", "hi": "आनुवंशिक रूप से संशोधित कपास"}'::jsonb
),
(
    -- Groundnut
    '{"en": "Groundnut", "mr": "शेंगदाणा", "hi": "मूंगफली"}'::jsonb,
    '{"en": "TAG-24", "mr": "टीएजी-24", "hi": "टीएजी-24"}'::jsonb,
    '{"en": "High-oil content groundnut variety", "mr": "उच्च तेल अंतर्गत शेंगदाणा", "hi": "उच्च तेल सामग्री मूंगफली"}'::jsonb
);

-- Insert schedule templates for Mango (Kesar) with multi-language
INSERT INTO schedule_templates (crop_id, task_name, days_after_sowing, instructions) VALUES
(1, '{"en": "Land Preparation", "mr": "जमीन तयारी", "hi": "जमीन तैयारी"}'::jsonb, 0, '{"en": "Prepare land with proper plowing and leveling", "mr": "योग्य नांगरून आणि समतोलाने जमीन तयार करा", "hi": "सही जुताई और समतले से जमीन तैयार करें"}'::jsonb),
(1, '{"en": "Pit Digging", "mr": "खड्डे खोदणे", "hi": "गड्ढे खोदना"}'::jsonb, 15, '{"en": "Dig pits of 1m x 1m x 1m size at 8m spacing", "mr": "8 मीटर अंतरावर 1मी x 1मी x 1मी आकाराचे खड्डे खोदा", "hi": "8 मीटर की दूरी पर 1मी x 1मी x 1मी के गड्ढे खोदें"}'::jsonb),
(1, '{"en": "FYM Application", "mr": "शेणाचा वापर", "hi": "गोबर खाद का प्रयोग"}'::jsonb, 20, '{"en": "Apply 50kg FYM per pit", "mr": "प्रत्येक खड्ड्यास 50 किलो शेण वापरा", "hi": "प्रत्येक गड्ढे में 50 किलो गोबर खाद डालें"}'::jsonb),
(1, '{"en": "Planting", "mr": "लागवड", "hi": "रोपण"}'::jsonb, 25, '{"en": "Plant saplings in pits during monsoon", "mr": "पावसाळ्यात खड्ड्यात रोपां लावा", "hi": "मानसून के दौरान गड्ढों में पौधे रोपें"}'::jsonb),
(1, '{"en": "First Irrigation", "mr": "पहिली पाणी विहीर", "hi": "पहला सिंचाई"}'::jsonb, 30, '{"en": "Provide first irrigation after planting", "mr": "लागवडीनंतर पहिली पाणी द्या", "hi": "रोपण के बाद पहला सिंचाई करें"}'::jsonb),
(1, '{"en": "Weeding", "mr": "निरसन", "hi": "निराई"}'::jsonb, 60, '{"en": "Remove weeds from basin", "mr": "पाच्यातील आगोदार काढून टाका", "hi": "बेसिन से खरपाई हटाएं"}'::jsonb),
(1, '{"en": "Intercropping", "mr": "आंतरपीक", "hi": "मिश्रित फसल"}'::jsonb, 90, '{"en": "Consider intercropping with vegetables", "mr": "भाजीपाल्यासह विचार करा", "hi": "सब्जियों के साथ मिश्रित फसल पर विचार करें"}'::jsonb),
(1, '{"en": "Pruning", "mr": "छाटणी", "hi": "छँटाई"}'::jsonb, 180, '{"en": "Remove dead branches and water sprouts", "mr": "मृत फांदे आणि पाणी अंकुर काढून टाका", "hi": "मृत शाखाएं और जलीय कल्ले हटाएं"}'::jsonb),
(1, '{"en": "Pest Management", "mr": "किड नियंत्रण", "hi": "कीट प्रबंधन"}'::jsonb, 210, '{"en": "Apply neem oil for mango hoppers", "mr": " आंब्याला लागणाऱ्या किडीसाठी निम तेल वापरा", "hi": "आम के छिलकी के लिए नीम तेल लगाएं"}'::jsonb),
(1, '{"en": "Harvesting", "mr": "कापणी", "hi": "कटाई"}'::jsonb, 365, '{"en": "Harvest when fruits develop yellow color", "mr": "फळे पिवळी झाली की कापणी करा", "hi": "जब फल पीले रंग के हों तब कटाई करें"}'::jsonb);

-- Insert schedule templates for Wheat with multi-language
INSERT INTO schedule_templates (crop_id, task_name, days_after_sowing, instructions) VALUES
(2, '{"en": "Field Preparation", "mr": "शेत तयारी", "hi": "खेत तैयारी"}'::jsonb, 0, '{"en": "Prepare field with 2-3 plowings", "mr": "2-3 वेळा नांगरून शेत तयार करा", "hi": "2-3 बार जुताई से खेत तैयार करें"}'::jsonb),
(2, '{"en": "Basal Fertilizer", "mr": "बेसल खत", "hi": "बेसल खाद"}'::jsonb, 5, '{"en": "Apply DAP and urea at sowing", "mr": "पेरणीवेळी डीएपी आणि युरिया वापरा", "hi": "बुवाई के समय DAP और यूरिया डालें"}'::jsonb),
(2, '{"en": "Sowing", "mr": "पेरणी", "hi": "बुवाई"}'::jsonb, 7, '{"en": "Sow seeds at 20cm row spacing", "mr": "20 सेमी अंतरावर बीग वापरा", "hi": "20 सेमी की दूरी पर बीज बोएं"}'::jsonb),
(2, '{"en": "First Irrigation", "mr": "पहिली पाणी विहीर", "hi": "पहला सिंचाई"}'::jsonb, 21, '{"en": "Provide first irrigation at crown root initiation", "mr": "मुकुट मुळे निळ्यासाठी पहिली पाणी द्या", "hi": "मुकुट जड़ निकलने पर पहला सिंचाई करें"}'::jsonb),
(2, '{"en": "Weed Control", "mr": "किड नियंत्रण", "hi": "खरपाई नियंत्रण"}'::jsonb, 30, '{"en": "Apply herbicide for weed control", "mr": "किड नियंत्रणासाठी तणनाशक वापरा", "hi": "खरपाई नियंत्रण के लिए herbicide लगाएं"}'::jsonb),
(2, '{"en": "Second Irrigation", "mr": "दुसरी पाणी विहीर", "hi": "दूसरा सिंचाई"}'::jsonb, 45, '{"en": "Apply second irrigation at tillering", "mr": "फांदे येण्यासाठी दुसरी पाणी द्या", "hi": "शाखा निकलने पर दूसरा सिंचाई करें"}'::jsonb),
(2, '{"en": "Third Irrigation", "mr": "तिसरी पाणी विहीर", "hi": "तीसरा सिंचाई"}'::jsonb, 75, '{"en": "Apply third irrigation at grain filling", "mr": "दाणे भरण्यासाठी तिसरी पाणी द्या", "hi": "दाने भरने पर तीसरा सिंचाई करें"}'::jsonb, 'pending'),
(2, '{"en": "Harvesting", "mr": "कापणी", "hi": "कटाई"}'::jsonb, 120, '{"en": "Harvest when grains turn golden yellow", "mr": "दाणे सोनेरी पिवळे झाले की कापणी करा", "hi": "जब दाने सुनहरे पीले हों तब कटाई करें"}'::jsonb, 'pending');

-- Insert sample farmer crops
INSERT INTO farmer_crops (farmer_id, crop_id, sowing_date) VALUES
(4, 1, '2024-06-15'),  -- Ram Singh - Mango
(4, 2, '2024-11-01'),  -- Ram Singh - Wheat
(5, 1, '2024-07-01'),  -- Lakshmi Devi - Mango
(5, 3, '2024-06-01'),  -- Lakshmi Devi - Rice
(6, 2, '2024-11-15');  -- Krishna Rao - Wheat

-- Insert sample farmer tasks with multi-language names
INSERT INTO farmer_tasks (farmer_crop_id, task_name, due_date, das, instructions, status) VALUES
(1, '{"en": "Land Preparation", "mr": "जमीन तयारी", "hi": "जमीन तैयारी"}'::jsonb, '2024-06-15', 0, '{"en": "Prepare land with proper plowing and leveling", "mr": "योग्य नांगरून आणि समतोलाने जमीन तयार करा", "hi": "सही जुताई और समतले से जमीन तैयार करें"}'::jsonb, 'done'),
(1, '{"en": "Pit Digging", "mr": "खड्डे खोदणे", "hi": "गड्ढे खोदना"}'::jsonb, '2024-06-30', 15, '{"en": "Dig pits of 1m x 1m x 1m size at 8m spacing", "mr": "8 मीटर अंतरावर 1मी x 1मी x 1मी आकाराचे खड्डे खोदा", "hi": "8 मीटर की दूरी पर 1मी x 1मी x 1मी के गड्ढे खोदें"}'::jsonb, 'done'),
(1, '{"en": "FYM Application", "mr": "शेणाचा वापर", "hi": "गोबर खाद का प्रयोग"}'::jsonb, '2024-07-05', 20, '{"en": "Apply 50kg FYM per pit", "mr": "प्रत्येक खड्ड्यास 50 किलो शेण वापरा", "hi": "प्रत्येक गड्ढे में 50 किलो गोबर खाद डालें"}'::jsonb, 'done'),
(1, '{"en": "Planting", "mr": "लागवड", "hi": "रोपण"}'::jsonb, '2024-07-10', 25, '{"en": "Plant saplings in pits during monsoon", "mr": "पावसाळ्यात खड्ड्यात रोपां लावा", "hi": "मानसून के दौरान गड्ढों में पौधे रोपें"}'::jsonb, 'done'),
(1, '{"en": "First Irrigation", "mr": "पहिली पाणी विहीर", "hi": "पहला सिंचाई"}'::jsonb, '2024-07-15', 30, '{"en": "Provide first irrigation after planting", "mr": "लागवडीनंतर पहिली पाणी द्या", "hi": "रोपण के बाद पहला सिंचाई करें"}'::jsonb, 'pending'),
(1, '{"en": "Weeding", "mr": "निरसन", "hi": "निराई"}'::jsonb, '2024-08-14', 60, '{"en": "Remove weeds from basin", "mr": "पाच्यातील आगोदार काढून टाका", "hi": "बेसिन से खरपाई हटाएं"}'::jsonb, 'pending'),
(2, '{"en": "Field Preparation", "mr": "शेत तयारी", "hi": "खेत तैयारी"}'::jsonb, '2024-11-01', 0, '{"en": "Prepare field with 2-3 plowings", "mr": "2-3 वेळा नांगरून शेत तयार करा", "hi": "2-3 बार जुताई से खेत तैयार करें"}'::jsonb, 'pending'),
(2, '{"en": "Basal Fertilizer", "mr": "बेसल खत", "hi": "बेसल खाद"}'::jsonb, '2024-11-06', 5, '{"en": "Apply DAP and urea at sowing", "mr": "पेरणीवेळी डीएपी आणि युरिया वापरा", "hi": "बुवाई के समय DAP और यूरिया डालें"}'::jsonb, 'pending');

-- Insert sample weather alerts with multi-language messages
INSERT INTO weather_alerts (farmer_id, alert_type, message, severity, is_read) VALUES
(4, 'rain', '{"en": "Heavy rainfall expected in next 48 hours. Avoid irrigation and protect crops.", "mr": "पुढील 48 तासात जोरदार पाऊस अपेक्षित. पाणी देणे टाळा आणि पिकांचे संरक्षण करा.", "hi": "अगले 48 घंटों में भारी बारिश की संभावना। सिंचाई से बचें और फसलों की रक्षा करें।"}'::jsonb, 'high', FALSE),
(4, 'heat', '{"en": "Temperature expected to rise above 40°C. Ensure adequate irrigation.", "mr": "तापमान 40°C पेक्षा वाढण्याची अपेक्षा. पुरेसे पाणी सुनिश्चित करा.", "hi": "तापमान 40°C से ऊपर रहने की संभावना। पर्याप्त सिंचाई सुनिश्चित करें।"}'::jsonb, 'medium', TRUE),
(5, 'rain', '{"en": "Moderate rainfall expected. Good conditions for mango harvesting.", "mr": "मध्यम पाऊस अपेक्षित. आंबा कापणीसाठी चांगली परिस्थित.", "hi": "मध्यम बारिश की संभावना। आम की कटाई के लिए अच्छी स्थिति।"}'::jsonb, 'low', FALSE),
(6, 'heat', '{"en": "Heat wave warning for next 3 days. Apply mulching to conserve moisture.", "mr": "पुढील 3 दिवसांसाठी उष्मा लाट चेतावणी. ओलावा टिकवण्यासाठी मल्चिंग करा.", "hi": "अगले 3 दिनों के लिए लू की चेतावनी। नमी बनाए रखने के लिए मल्चिंग करें।"}'::jsonb, 'high', FALSE);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE users IS 'Base table for all user roles: super_admin, admin, farmer';
COMMENT ON COLUMN users.language_preference IS 'User preferred language (ISO 639-1): en, mr, or hi';
COMMENT ON TABLE crops IS 'Master crop catalog with JSONB for multi-language support';
COMMENT ON COLUMN crops.name IS 'Multi-language crop name: { "en": "Mango", "mr": "आंबा", "hi": "आम" }';
COMMENT ON TABLE schedule_templates IS 'Master schedule templates with JSONB for i18n';
COMMENT ON TABLE farmer_tasks IS 'Individual tasks with JSONB for language-specific names';
COMMENT ON TABLE weather_alerts IS 'Weather alerts with JSONB for translated messages';
COMMENT ON FUNCTION get_crop_name IS 'Returns crop name in specified language';
COMMENT ON FUNCTION get_task_name IS 'Returns task name in specified language';
COMMENT ON FUNCTION get_alert_message IS 'Returns alert message in specified language';

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO agrismart_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO agrismart_user;