# Sarvarth Certificate Platform

A production-ready full-stack web application for certificate design, generation, authorization, export, and public verification.

![Sarvarth Logo](CertificateCanva.client/client/public/sarvarth-logo.png)

## Features

✅ **Role-based Access Control** - Admin and User roles with granular permissions  
✅ **Secure Authentication** - JWT-based auth with access and refresh tokens  
✅ **Canvas Editor** - Fabric.js powered certificate designer  
✅ **Asset Management** - Upload and manage images for certificates  
✅ **Certificate Export** - Export as PNG, JPG, SVG formats  
✅ **Public Verification** - Verify certificates without authentication  
✅ **Modern UI** - Clean, responsive design with Sarvarth branding  

## Tech Stack

### Frontend
- React.js + TypeScript
- React Router
- Tailwind CSS
- Fabric.js (Canvas)
- Axios

### Backend
- Node.js + Express.js + TypeScript
- PostgreSQL (Raw SQL - no ORM)
- JWT Authentication
- bcrypt password hashing

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Setup Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE certificate_canvas;"

# Run schema
cd CertificateCanva.server/server
npm run db:setup
npm run db:seed
```

### 2. Configure Environment

```bash
# Backend
cd CertificateCanva.server/server
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Install Dependencies

```bash
# Backend
cd CertificateCanva.server/server
npm install

# Frontend
cd CertificateCanva.client/client
npm install
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend (Port 4000)
cd CertificateCanva.server/server
npm run dev

# Terminal 2 - Frontend (Port 5173)
cd CertificateCanva.client/client
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

### Default Credentials

```
Admin: admin / admin123
User: user / user123
```

## Project Structure

```
sarvarth_project/
├── CertificateCanva.client/
│   └── client/
│       └── src/
│           ├── api/           # API client
│           ├── components/    # Reusable components
│           ├── context/       # Auth context
│           ├── hooks/         # Custom hooks
│           ├── pages/         # Page components
│           └── App.tsx        # Main app
│
├── CertificateCanva.server/
│   └── server/
│       └── src/
│           ├── controllers/   # Route handlers
│           ├── middlewares/   # Auth, error handling
│           ├── repository/    # Database queries
│           ├── routes/        # API routes
│           ├── services/      # Business logic
│           └── script/        # DB setup scripts
│
└── PRD.md                     # Product Requirements
```

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Admin (Protected)
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Canvas (Protected)
- `GET /api/canva/session` - List canvases
- `POST /api/canva/session` - Create canvas
- `GET /api/canva/session/:id` - Get canvas
- `PATCH /api/canva/session/:id` - Update canvas
- `DELETE /api/canva/session/:id` - Delete canvas

### Images (Protected)
- `GET /api/images` - List images
- `POST /api/images` - Upload image
- `DELETE /api/images/:id` - Delete image

### Verification (Public)
- `GET /api/authorized/:id` - Verify certificate

## License

MIT License - See LICENSE file for details.