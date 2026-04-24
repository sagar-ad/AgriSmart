-- AgriSmart Database Schema
-- PostgreSQL Initialization Script

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS weather_alerts CASCADE;
DROP TABLE IF EXISTS farmer_tasks CASCADE;
DROP TABLE IF EXISTS farmer_crops CASCADE;
DROP TABLE IF EXISTS schedule_templates CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table (base table for all roles)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'farmer')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create crops table
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    variety VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create schedule_templates table
CREATE TABLE schedule_templates (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    days_after_sowing INTEGER NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create farmer_crops table (junction between farmers and crops with sowing date)
CREATE TABLE farmer_crops (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    sowing_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(farmer_id, crop_id)
);

-- Create farmer_tasks table
CREATE TABLE farmer_tasks (
    id SERIAL PRIMARY KEY,
    farmer_crop_id INTEGER REFERENCES farmer_crops(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    das INTEGER NOT NULL,
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
    completed_at TIMESTAMP,
    completion_note TEXT,
    completion_photo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create weather_alerts table
CREATE TABLE weather_alerts (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('rain', 'heat', 'flood', 'drought')),
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_farmer_tasks_status ON farmer_tasks(status);
CREATE INDEX idx_farmer_tasks_due_date ON farmer_tasks(due_date);
CREATE INDEX idx_farmer_tasks_farmer_crop_id ON farmer_tasks(farmer_crop_id);
CREATE INDEX idx_weather_alerts_farmer_id ON weather_alerts(farmer_id);
CREATE INDEX idx_weather_alerts_is_read ON weather_alerts(is_read);
CREATE INDEX idx_farmer_crops_farmer_id ON farmer_crops(farmer_id);
CREATE INDEX idx_schedule_templates_crop_id ON schedule_templates(crop_id);

-- Insert sample data for testing

-- Insert Super Admin (password: admin123 - bcrypt hash placeholder)
INSERT INTO users (email, password, role, name, phone, location) VALUES
('superadmin@agrismart.com', '$2b$10$rBV2JzS1Jv7Z8Z8Z8Z8Z8OvJ1J1J1J1J1J1J1J1J1J1J1J1J1J1J1', 'super_admin', 'Super Admin', '+1234567890', 'Headquarters');

-- Insert sample Admins (Agri-Consultants)
INSERT INTO users (email, password, role, name, phone, location) VALUES
('admin1@agrismart.com', '$2b$10$rBV2JzS1Jv7Z8Z8Z8Z8Z8OvJ1J1J1J1J1J1J1J1J1J1J1J1J1J1J1', 'admin', 'John Consultant', '+1234567891', 'Region A'),
('admin2@agrismart.com', '$2b$10$rBV2JzS1Jv7Z8Z8Z8Z8Z8OvJ1J1J1J1J1J1J1J1J1J1J1J1J1J1J1', 'admin', 'Jane Consultant', '+1234567892', 'Region B');

-- Insert sample Farmers
INSERT INTO users (email, password, role, name, phone, location) VALUES
('farmer1@agrismart.com', '$2b$10$rBV2JzS1Jv7Z8Z8Z8Z8Z8OvJ1J1J1J1J1J1J1J1J1J1J1J1J1J1J1', 'farmer', 'Ram Singh', '+1234567893', 'Village A, District X'),
('farmer2@agrismart.com', '$2b$10$rBV2JzS1Jv7Z8Z8Z8Z8Z8OvJ1J1J1J1J1J1J1J1J1J1J1J1J1J1J1', 'farmer', 'Lakshmi Devi', '+1234567894', 'Village B, District Y'),
('farmer3@agrismart.com', '$2b$10$rBV2JzS1Jv7Z8Z8Z8Z8Z8OvJ1J1J1J1J1J1J1J1J1J1J1J1J1J1J1', 'farmer', 'Krishna Rao', '+1234567895', 'Village C, District Z');

-- Insert sample subscriptions
INSERT INTO subscriptions (admin_id, plan_type, start_date, end_date) VALUES
(2, 'premium', '2024-01-01', '2024-12-31'),
(3, 'basic', '2024-01-01', '2024-06-30');

-- Insert sample crops
INSERT INTO crops (name, variety, description) VALUES
('Mango', 'Kesar', 'Premium alphonso mango variety from Gujarat'),
('Wheat', 'PBW-550', 'High-yielding dwarf wheat variety'),
('Rice', 'Basmati', 'Premium aromatic basmati rice'),
('Cotton', 'BT-Cotton', 'Genetically modified cotton variety'),
('Groundnut', 'TAG-24', 'High-oil content groundnut variety');

-- Insert sample schedule templates for Kesar Mango
INSERT INTO schedule_templates (crop_id, task_name, days_after_sowing, instructions) VALUES
(1, 'Land Preparation', 0, 'Prepare land with proper plowing and leveling'),
(1, 'Pit Digging', 15, 'Dig pits of 1m x 1m x 1m size at 8m spacing'),
(1, 'FYM Application', 20, 'Apply 50kg FYM per pit'),
(1, 'Planting', 25, 'Plant saplings in pits during monsoon'),
(1, 'First Irrigation', 30, 'Provide first irrigation after planting'),
(1, 'Weeding', 60, 'Remove weeds from basin'),
(1, 'Intercropping', 90, 'Consider intercropping with vegetables'),
(1, 'Pruning', 180, 'Remove dead branches and water sprouts'),
(1, 'Pest Management', 210, 'Apply neem oil for mango hoppers'),
(1, 'Harvesting', 365, 'Harvest when fruits develop yellow color');

-- Insert sample schedule templates for Wheat
INSERT INTO schedule_templates (crop_id, task_name, days_after_sowing, instructions) VALUES
(2, 'Field Preparation', 0, 'Prepare field with 2-3 plowings'),
(2, 'Basal Fertilizer', 5, 'Apply DAP and urea at sowing'),
(2, 'Sowing', 7, 'Sow seeds at 20cm row spacing'),
(2, 'First Irrigation', 21, 'Provide first irrigation at crown root initiation'),
(2, 'Weed Control', 30, 'Apply herbicide for weed control'),
(2, 'Second Irrigation', 45, 'Apply second irrigation at tillering'),
(2, 'Third Irrigation', 75, 'Apply third irrigation at grain filling'),
(2, 'Harvesting', 120, 'Harvest when grains turn golden yellow');

-- Insert sample farmer crops
INSERT INTO farmer_crops (farmer_id, crop_id, sowing_date) VALUES
(4, 1, '2024-06-15'),  -- Ram Singh - Mango
(4, 2, '2024-11-01'),  -- Ram Singh - Wheat
(5, 1, '2024-07-01'),  -- Lakshmi Devi - Mango
(5, 3, '2024-06-01'),  -- Lakshmi Devi - Rice
(6, 2, '2024-11-15');  -- Krishna Rao - Wheat

-- Insert sample farmer tasks (will be auto-generated by Schedule Generator in production)
INSERT INTO farmer_tasks (farmer_crop_id, task_name, due_date, das, instructions, status) VALUES
(1, 'Land Preparation', '2024-06-15', 0, 'Prepare land with proper plowing and leveling', 'done'),
(1, 'Pit Digging', '2024-06-30', 15, 'Dig pits of 1m x 1m x 1m size at 8m spacing', 'done'),
(1, 'FYM Application', '2024-07-05', 20, 'Apply 50kg FYM per pit', 'done'),
(1, 'Planting', '2024-07-10', 25, 'Plant saplings in pits during monsoon', 'done'),
(1, 'First Irrigation', '2024-07-15', 30, 'Provide first irrigation after planting', 'pending'),
(1, 'Weeding', '2024-08-14', 60, 'Remove weeds from basin', 'pending'),
(2, 'Field Preparation', '2024-11-01', 0, 'Prepare field with 2-3 plowings', 'pending'),
(2, 'Basal Fertilizer', '2024-11-06', 5, 'Apply DAP and urea at sowing', 'pending'),
(3, 'Land Preparation', '2024-07-01', 0, 'Prepare land with proper plowing and leveling', 'done'),
(3, 'Pit Digging', '2024-07-16', 15, 'Dig pits of 1m x 1m x 1m size at 8m spacing', 'pending');

-- Insert sample weather alerts
INSERT INTO weather_alerts (farmer_id, alert_type, message, severity, is_read) VALUES
(4, 'rain', 'Heavy rainfall expected in next 48 hours. Avoid irrigation and protect crops.', 'high', FALSE),
(4, 'heat', 'Temperature expected to rise above 40°C. Ensure adequate irrigation.', 'medium', TRUE),
(5, 'rain', 'Moderate rainfall expected. Good conditions for mango harvesting.', 'low', FALSE),
(6, 'heat', 'Heat wave warning for next 3 days. Apply mulching to conserve moisture.', 'high', FALSE);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO agrismart_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO agrismart_user;

-- Comments for documentation
COMMENT ON TABLE users IS 'Base table for all user roles: super_admin, admin, farmer';
COMMENT ON TABLE subscriptions IS 'Subscription plans for admin accounts: free, basic, premium';
COMMENT ON TABLE crops IS 'Master crop catalog with varieties';
COMMENT ON TABLE schedule_templates IS 'Master schedule templates indexed by Days After Sowing (DAS)';
COMMENT ON TABLE farmer_crops IS 'Junction table linking farmers to crops with sowing date';
COMMENT ON TABLE farmer_tasks IS 'Individual tasks assigned to farmers based on crop schedule';
COMMENT ON TABLE weather_alerts IS 'Automated weather alerts for farmers';

COMMENT ON COLUMN users.role IS 'User role: super_admin (platform management), admin (agri-consultant), farmer (end-user)';
COMMENT ON COLUMN subscriptions.plan_type IS 'Subscription tier: free, basic, premium';
COMMENT ON COLUMN farmer_tasks.das IS 'Days After Sowing - task scheduling index';
COMMENT ON COLUMN farmer_tasks.status IS 'Task completion status: pending or done';