# Certificate Canvas Platform - Requirements Document

## Project Overview
A comprehensive certificate generation and verification platform built with React (Frontend) and Node.js/Express (Backend).

---

## 1. System Architecture

### 1.1 Frontend (React + Vite)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Plain CSS (No CSS frameworks)
- **Canvas Editor**: Fabric.js 6

### 1.2 Backend (Node.js + Express)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL

---

## 2. Database Schema

### 2.1 Tables

#### `roles`
| Column    | Type        | Constraints |
|-----------|-------------|-------------|
| id        | int         | PK          |
| role_name | varchar(50) | NOT NULL    |

#### `users`
| Column        | Type         | Constraints          |
|---------------|--------------|----------------------|
| id            | uuid         | PK                   |
| name          | varchar(100) | NOT NULL             |
| username      | varchar(50)  | NOT NULL, UNIQUE     |
| email         | varchar(150) | NOT NULL, UNIQUE     |
| password_hash | text         | NOT NULL             |
| role_id       | int          | FK -> roles.id       |
| is_active     | boolean      | DEFAULT true         |
| created_at    | timestamp    |                      |
| updated_at    | timestamp    |                      |

#### `canvas_sessions`
| Column      | Type         | Constraints          |
|-------------|--------------|----------------------|
| id          | uuid         | PK                   |
| user_id     | uuid         | FK -> users.id       |
| title       | varchar(150) |                      |
| is_authorized| boolean     | DEFAULT false        |
| created_at  | timestamp    |                      |
| updated_at  | timestamp    |                      |

#### `images`
| Column      | Type         | Constraints          |
|-------------|--------------|----------------------|
| id          | uuid         | PK                   |
| user_id     | uuid         | FK -> users.id       |
| file_name   | varchar(255) | NOT NULL             |
| file_url    | text         | NOT NULL             |
| file_type   | varchar(50)  |                      |
| file_size   | bigint       |                      |
| uploaded_at | timestamp    |                      |

#### `authorized_canvases`
| Column           | Type         | Constraints               |
|------------------|--------------|---------------------------|
| id               | uuid         | PK                        |
| canvas_session_id| uuid         | FK -> canvas_sessions.id  |
| author_name      | varchar(100) | NOT NULL                  |
| title            | varchar(150) | NOT NULL                  |
| authorized_date  | date         | NOT NULL                  |
| created_at       | timestamp    |                           |

---

## 3. User Roles & Permissions

### 3.1 Admin
- Access to Admin Dashboard
- Create, Read, Update, Delete users
- View all certificates
- Authorize certificates

### 3.2 User (Canvas User)
- Access to User Dashboard
- Create and manage own canvases
- Upload and manage photos/assets
- Generate certificates
- View profile

---

## 4. Pages & Features

### 4.1 Public Pages

#### Login Page (`/login`)
- Simple centered card layout
- Sarvarth logo at top
- Username/Email input field
- Password input field
- Login button (red/coral color)
- Error message display

#### Verification Page (`/verify`)
- Split layout (left form, right result)
- Left panel: Illustration + Code input + Verify button
- Right panel: Certificate display with:
  - Sarvarth logo
  - "Certificate of Completion" title
  - Holder name
  - Course/Certificate title
  - Date
  - Verification badge

### 4.2 Admin Pages (Protected)

#### Admin Dashboard (`/admin/dashboard`)
- Left sidebar with navigation
- Main content area with:
  - "DashBoard ADMIN" title
  - "Recents" section with 3 Create buttons
  - Users table (empty cells by default)
- Create User Modal:
  - Name, Email, Username, Password, Role fields
  - Cancel and Create buttons

### 4.3 User Pages (Protected)

#### User Dashboard (`/user/dashboard`)
- Left sidebar with navigation (DashBoard, Assets, Canvas)
- Main content with search bar
- "Recents" section with grid of canvas thumbnails
- Each thumbnail shows preview + title

#### Photo/Assets Page (`/user/assets`)
- Same sidebar layout
- Photo grid with image thumbnails
- Upload functionality

#### Profile Page (`/user/profile`)
- User avatar/icon
- Readonly fields: Name, Username, Role, Organization
- Change button at bottom

#### Canvas Editor (`/canvas/:id`)
- Left tools sidebar (icons for tools)
- Main canvas workspace
- Right metadata panel:
  - Name, Title, Date fields
  - GENERATE button (red)
  - Certificate ID display
- Top navbar with export options
- Bottom zoom controls

---

## 5. API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Canvas
- `GET /api/canvas` - List user's canvases
- `POST /api/canvas` - Create canvas
- `GET /api/canvas/:id` - Get canvas
- `PUT /api/canvas/:id` - Save canvas
- `DELETE /api/canvas/:id` - Delete canvas
- `POST /api/canvas/:id/authorize` - Authorize certificate

### Verification
- `GET /api/verify/:code` - Verify certificate

### Images
- `GET /api/images` - List user's images
- `POST /api/images/upload` - Upload image
- `DELETE /api/images/:id` - Delete image

---

## 6. Color Palette

| Color Name    | Hex Code  | Usage                    |
|---------------|-----------|--------------------------|
| Primary       | #ee7158   | Buttons, accents         |
| Secondary     | #3d5a5a   | Dark text, sidebar       |
| Teal          | #67c5c8   | Focus states, accents    |
| Background    | #f5f5f5   | Page backgrounds         |
| White         | #ffffff   | Cards, inputs            |
| Gray 200      | #e5e7eb   | Borders                  |
| Gray 500      | #6b7280   | Secondary text           |
| Gray 800      | #1f2937   | Primary text             |

---

## 7. Technology Stack

### Frontend
- React 19
- TypeScript
- Vite 7
- React Router DOM 7
- Fabric.js 6 (Canvas)
- Axios (HTTP client)
- Zustand (State management)
- Lucide React (Icons)

### Backend
- Node.js 18+
- Express.js
- TypeScript
- PostgreSQL
- JWT (Authentication)
- Multer (File uploads)
- bcrypt (Password hashing)

---

## 8. File Structure

```
CertificateCanva.client/
└── client/
    ├── src/
    │   ├── components/
    │   │   └── AdvancedEditor/
    │   │       ├── Editor.tsx
    │   │       ├── Navbar.tsx
    │   │       ├── Sidebar.tsx
    │   │       ├── panels/
    │   │       │   └── MetadataSidebar.tsx
    │   │       ├── types.ts
    │   │       └── utils.ts
    │   ├── hooks/
    │   │   └── use-editor.ts
    │   ├── styles/
    │   │   ├── global.css
    │   │   ├── reset.css
    │   │   ├── variables.css
    │   │   ├── components/
    │   │   │   └── sidebar.css
    │   │   └── pages/
    │   │       ├── login.css
    │   │       ├── admin.css
    │   │       ├── dashboard.css
    │   │       ├── editor.css
    │   │       └── verification.css
    │   ├── api/
    │   │   └── index.ts
    │   ├── App.tsx
    │   └── main.tsx
    ├── public/
    │   └── sarvarth-logo.png
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json

CertificateCanva.server/
└── server/
    ├── src/
    │   ├── controllers/
    │   ├── services/
    │   ├── routes/
    │   ├── middleware/
    │   ├── config/
    │   └── server.ts
    ├── package.json
    └── tsconfig.json
```

---

## 9. Running the Application

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Development

```bash
# Backend
cd CertificateCanva.server/server
npm install
npm run dev

# Frontend
cd CertificateCanva.client/client
npm install
npm run dev
```

### Production Build

```bash
# Frontend
cd CertificateCanva.client/client
npm run build

# Backend
cd CertificateCanva.server/server
npm run build
npm start
```

---

## 10. Environment Variables

### Backend (.env)
```
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/certificate_canvas
JWT_SECRET=your-secret-key
UPLOAD_DIR=./uploads
```

### Frontend
- API is proxied through Vite config to `http://localhost:4000`

---

*Document Version: 1.0*
*Last Updated: February 2026*
