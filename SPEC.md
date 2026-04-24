# AgriSmart - Agri-Tech Management System

## Project Overview

**Project Name:** AgriSmart  
**Type:** Full-Stack Web Application (Agri-Tech SaaS)  
**Core Functionality:** Multi-tenant agricultural management platform enabling Agri-Consultants to manage farmers, schedule crop tasks, and monitor compliance with automated weather alerts.  
**Target Users:** Super Admins, Agri-Consultants (Admins), and Farmers

---

## 1. Database Schema (PostgreSQL ERD)

### 1.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│     users       │       │   subscriptions      │       │     crops       │
├─────────────────┤       ├──────────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ admin_id (FK)        │       │ id (PK)         │
│ email           │       │ id (PK)              │       │ name            │
│ password        │       │ plan_type            │       │ variety         │
│ role            │       │ start_date           │       │ description     │
│ name            │       │ end_date             │       └────────┬────────┘
│ phone           │       └──────────────────────┘                │
│ location        │                                               │
│ is_active       │              ┌─────────────────┐              │
│ created_at      │       ┌──────│ farmer_crops    │◄─────────────┤
└────────┬────────┘       │      ├─────────────────┤              │
         │                │      │ id (PK)         │              │
         │                │      │ farmer_id (FK)  │              │
         │                │      │ crop_id (FK)    │              │
         │                │      │ sowing_date     │              │
         │                │      │ created_at      │              │
         │                │      └────────┬────────┘              │
         │                │               │                       │
         │                │      ┌────────▼────────┐              │
         │                │      │ farmer_tasks    │              │
         │                │      ├─────────────────┤              │
         │                └──────│ id (PK)         │              │
                            │      │ farmer_crop_id │              │
                            │      │ task_name      │              │
                            │      │ due_date       │              │
                            │      │ status         │              │
                            │      │ das            │              │
                            │      │ instructions   │              │
                            │      │ completed_at   │              │
                            │      │ completion_note│              │
                            │      │ completion_photo│             │
                            │      └─────────────────┘              │
                            │                                       │
         ┌──────────────────┴──────────────┐                        │
         │   weather_alerts                 │                        │
         ├──────────────────────────────────┤                        │
         │ id (PK)                          │                        │
         │ farmer_id (FK)                   │                        │
         │ alert_type (rain/heat)           │                        │
         │ message                          │                        │
         │ severity                         │                        │
         │ created_at                       │                        │
         │ is_read                          │                        │
         └──────────────────────────────────┘                        │
                                                                   │
                            ┌───────────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │ schedule_templates
                   ├─────────────────┤
                   │ id (PK)         │
                   │ crop_id (FK)    │
                   │ task_name       │
                   │ days_after_sowing
                   │ instructions    │
                   │ created_at      │
                   └─────────────────┘
```

### 1.2 Detailed Table Definitions

#### users
```sql
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
```

#### subscriptions
```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### crops
```sql
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    variety VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### schedule_templates
```sql
CREATE TABLE schedule_templates (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    days_after_sowing INTEGER NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### farmer_crops
```sql
CREATE TABLE farmer_crops (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    sowing_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(farmer_id, crop_id)
);
```

#### farmer_tasks
```sql
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
```

#### weather_alerts
```sql
CREATE TABLE weather_alerts (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('rain', 'heat', 'flood', 'drought')),
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.3 Indexes for Performance
```sql
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_farmer_tasks_status ON farmer_tasks(status);
CREATE INDEX idx_farmer_tasks_due_date ON farmer_tasks(due_date);
CREATE INDEX idx_weather_alerts_farmer_id ON weather_alerts(farmer_id);
```

---

## 2. Backend Folder Structure (MVC Architecture)

```
backend/
├── app.js                      # Express app entry point
├── server.js                   # Server startup & HTTP creation
├── config/
│   ├── database.js             # PostgreSQL connection config
│   ├── jwt.js                  # JWT secret & options
│   └── weather.js              # Weather API configuration
├── middleware/
│   ├── auth.js                 # JWT authentication middleware
│   ├── rbac.js                 # Role-Based Access Control
│   ├── validation.js           # Input validation middleware
│   └── errorHandler.js         # Global error handling
├── models/
│   ├── User.js                 # User model & methods
│   ├── Subscription.js         # Subscription model
│   ├── Crop.js                 # Crop model
│   ├── ScheduleTemplate.js     # Schedule template model
│   ├── FarmerCrop.js           # Farmer crop assignment model
│   ├── FarmerTask.js           # Farmer task model
│   └── WeatherAlert.js         # Weather alert model
├── controllers/
│   ├── authController.js       # Login/Register/Logout
│   ├── userController.js       # User CRUD operations
│   ├── subscriptionController.js
│   ├── cropController.js
│   ├── scheduleController.js   # Schedule template CRUD
│   ├── farmerController.js     # Farmer management
│   ├── taskController.js       # Task management
│   ├── weatherController.js    # Weather alerts
│   └── dashboardController.js  # Dashboard metrics
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── subscriptionRoutes.js
│   ├── cropRoutes.js
│   ├── scheduleRoutes.js
│   ├── farmerRoutes.js
│   ├── taskRoutes.js
│   ├── weatherRoutes.js
│   └── dashboardRoutes.js
├── services/
│   ├── scheduleGenerator.js    # Core schedule generation logic
│   ├── weatherService.js       # Weather API integration
│   └── notificationService.js  # Alert notifications
├── utils/
│   ├── hash.js                 # Password hashing
│   ├── jwt.js                  # JWT token helpers
│   ├── dateUtils.js            # Date manipulation helpers
│   └── response.js             # Standardized API responses
├── validators/
│   ├── authValidator.js
│   ├── userValidator.js
│   ├── cropValidator.js
│   └── taskValidator.js
├── logs/                       # Winston log files
│   ├── error/
│   └── combined/
├── .env                        # Environment variables
├── .gitignore
├── package.json
└── init.sql                    # Database initialization script
```

---

## 3. API Endpoints Overview

### 3.1 Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/login | User login | Public |
| POST | /api/auth/register | Register new user | Public |
| GET | /api/auth/me | Get current user | Auth |

### 3.2 Users (Super Admin)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/users | List all admins | Super Admin |
| POST | /api/users | Create admin | Super Admin |
| PUT | /api/users/:id | Update admin | Super Admin |
| DELETE | /api/users/:id | Deactivate admin | Super Admin |

### 3.3 Subscriptions
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/subscriptions | List all subscriptions | Super Admin |
| POST | /api/subscriptions | Create subscription | Super Admin |
| PUT | /api/subscriptions/:id | Update subscription | Super Admin |

### 3.4 Crops & Schedules
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/crops | List all crops | Admin |
| POST | /api/crops | Create crop | Admin |
| GET | /api/schedules | List schedule templates | Admin |
| POST | /api/schedules | Create schedule template | Admin |

### 3.5 Farmers
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/farmers | List farmers | Admin |
| POST | /api/farmers | Onboard farmer | Admin |
| PUT | /api/farmers/:id | Update farmer | Admin |
| GET | /api/farmers/:id/tasks | Get farmer's tasks | Admin |

### 3.6 Tasks
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/tasks | List tasks (filtered by role) | All |
| POST | /api/tasks | Create task manually | Admin |
| PUT | /api/tasks/:id | Update task status | Farmer |
| POST | /api/tasks/:id/complete | Complete with notes/photo | Farmer |

### 3.7 Weather
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/weather/alerts | Get weather alerts | Admin/Farmer |
| POST | /api/weather/check | Check & generate alerts | Scheduled |

### 3.8 Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/dashboard/super-admin | Global metrics | Super Admin |
| GET | /api/dashboard/admin | Admin dashboard | Admin |
| GET | /api/dashboard/farmer | Farmer dashboard | Farmer |

---

## 4. Technology Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** pg (node-postgres) with raw SQL for performance
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** express-validator
- **Logging:** Morgan + Winston
- **Environment:** dotenv

### Frontend
- **Framework:** Angular (Latest)
- **Styling:** Tailwind CSS
- **HTTP:** HttpClient
- **State:** RxJS / Services
- **Auth:** JWT stored in localStorage

---

## 5. Security Considerations

1. **Password Storage:** bcrypt with salt rounds ≥ 10
2. **JWT:** Access tokens (15min) + Refresh tokens (7 days)
3. **CORS:** Configure allowed origins
4. **Rate Limiting:** Protect against brute force
5. **Input Validation:** All user inputs sanitized
6. **SQL Injection:** Parameterized queries only
7. **Role Authorization:** Middleware validates role per route

---

## 6. Next Steps

1. ✅ Database Schema & ERD (This Document)
2. ⬜ Initialize Backend Project Structure
3. ⬜ Create init.sql and execute
4. ⬜ Implement Authentication System
5. ⬜ Implement CRUD Operations
6. ⬜ Implement Schedule Generator Logic
7. ⬜ Initialize Angular Frontend
8. ⬜ Build Role-Based UI Layouts