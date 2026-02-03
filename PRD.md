# Sarvarth Certificate Platform - Product Requirements Document

## Overview
Sarvarth is a production-ready full-stack web application for certificate design, generation, authorization, export, and public verification using a canvas-based editor.

## Technology Stack

### Frontend
- React.js + TypeScript
- React Router (routing)
- Context API (state management)
- Fabric.js (canvas editor)
- Tailwind CSS (styling)

### Backend
- Node.js + Express.js + TypeScript
- PostgreSQL (database)
- Raw SQL queries (NO ORM)
- JWT Authentication (Access + Refresh tokens)
- bcrypt (password hashing)

## User Roles

### Admin Role
- Login securely
- Create, read, update, delete users
- Assign roles
- View all assets and canvas sessions
- Monitor active/inactive sessions
- Authorize/revoke certificates
- View certificate export history

**Admin Email Rule**: `*@sarvarth.com` or configurable admin emails

### User Role
- Login securely
- View dashboard
- Upload assets (images)
- Create and edit certificates via canvas
- Generate and export certificates (PDF/PNG)
- View/edit profile
- Change password

## Route Structure

### Public Routes
- `/login` - Login page
- `/verify/:certificateId` - Certificate verification

### Protected Routes (JWT Required)
- `/dashboard` - User dashboard
- `/assets` - Asset management
- `/canvas` - Canvas editor
- `/canvas/:id` - Edit specific canvas
- `/profile` - User profile

### Admin Only Routes
- `/admin` - Admin dashboard
- `/admin/users` - User management

## Database Schema

```sql
-- roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE
);

-- users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  username VARCHAR(50) UNIQUE,
  email VARCHAR(150) UNIQUE,
  password_hash TEXT,
  role_id INTEGER REFERENCES roles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- images
CREATE TABLE images (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  file_name VARCHAR(255),
  file_url TEXT,
  file_type VARCHAR(50),
  file_size BIGINT,
  uploaded_at TIMESTAMP
);

-- canvas_sessions
CREATE TABLE canvas_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(150),
  canvas_data JSONB,
  is_authorized BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- authorized_canvases
CREATE TABLE authorized_canvases (
  id UUID PRIMARY KEY,
  canvas_session_id UUID REFERENCES canvas_sessions(id),
  author_name VARCHAR(100),
  title VARCHAR(150),
  authorized_date DATE,
  created_at TIMESTAMP
);

-- refresh_tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);
```

## API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Users (Admin Only)
- `POST /api/admin/users`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `DELETE /api/admin/users/:id`

### Assets
- `POST /api/images` - Upload
- `GET /api/images` - List
- `DELETE /api/images/:id`

### Canvas
- `POST /api/canva/session` - Create
- `GET /api/canva/session` - List
- `GET /api/canva/session/:id` - Get one
- `PATCH /api/canva/session/:id` - Update
- `DELETE /api/canva/session/:id`

### Verification (Public)
- `GET /api/authorized/:id`

## UI Design Specs

### Brand Colors
- Primary: Teal `#3d5a5a`
- Accent Cyan: `#67c5c8`
- Accent Coral: `#ee7158`
- Gray: `#6c7c7c`

### Logo
Sarvarth text in teal with geometric icon (gray, coral, cyan blocks)

### Components
- Clean, modern sidebar navigation
- Card-based layout for assets/canvases
- Modal dialogs for forms
- Responsive grid layouts

## Security Requirements
- bcrypt password hashing (10 rounds)
- JWT tokens with expiration
- Role-based route protection
- SQL injection prevention (parameterized queries)
- Secure file upload handling
- Session timeout handling

## Export Features
- Export as PDF
- Export as PNG
- Embedded certificate ID
- Verification QR code (optional)
