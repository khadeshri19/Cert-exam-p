# Certificate Canvas

A full-stack, role-based Certificate Canvas Management System where admins manage users and authorization, and users can create certificate canvases, upload images, and verify certificates publicly.

## 🚀 Features

### Authentication System
- JWT-based authentication (Access + Refresh tokens)
- Role-based access control (Admin/User)
- Secure password hashing with bcrypt
- Token refresh mechanism

### User Management (Admin Only)
- CRUD operations on users
- Role assignment (admin/user)
- User status management (active/inactive)
- Prevent admin self-deletion

### Canvas Management
- Create canvas sessions
- Update canvas metadata
- Authorize certificates
- Delete canvas sessions
- Track authorization status

### Image Management
- Upload images (PNG, JPG, PDF, SVG)
- File size restriction (max 5MB)
- Associate images with users
- Delete images securely

### Certificate Verification
- Public verification endpoint
- Verify certificate using canvas session ID
- Display author name, title, date, and user info

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js + TypeScript |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL (RAW SQL only, NO ORM) |
| Authentication | JWT (Access + Refresh tokens) |
| File Uploads | Multer (local storage) |
| Testing | Jest + Supertest |

## 📁 Project Structure

```
certificate-canvas/
├── CertificateCanva.client/
│   └── client/
│       ├── public/
│       ├── src/
│       │   ├── api/           # API client
│       │   ├── components/    # Reusable components
│       │   ├── context/       # React contexts
│       │   ├── pages/         # Page components
│       │   ├── App.tsx        # Main app with routing
│       │   ├── index.css      # Global styles
│       │   └── main.tsx       # Entry point
│       ├── package.json
│       └── vite.config.ts
│
├── CertificateCanva.server/
│   └── server/
│       ├── src/
│       │   ├── config/        # Database & Multer config
│       │   ├── controllers/   # Route controllers
│       │   ├── middlewares/   # Auth & validation
│       │   ├── routes/        # API routes
│       │   ├── services/      # Business logic
│       │   ├── types/         # TypeScript types
│       │   ├── utils/         # Utilities
│       │   ├── script/        # DB setup scripts
│       │   ├── app.ts         # Express app
│       │   └── server.ts      # Server entry
│       ├── tests/             # Test files
│       ├── uploads/           # Uploaded files
│       └── package.json
│
├── database.sql               # Full database schema
└── README.md
```

## 🗄️ Database Schema

The system uses PostgreSQL with the following tables:

- **roles** - User roles (admin, user)
- **users** - User accounts with credentials
- **canvas_sessions** - Canvas/certificate sessions
- **authorized_canvases** - Authorized certificate details
- **images** - Uploaded image metadata

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/users/:id` | Get user by ID |

### Admin (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/users` | Create user |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/:id` | Get user by ID |
| PATCH | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/canvases` | Get all canvases |
| GET | `/api/admin/images` | Get all images |
| GET | `/api/admin/authorized` | Get authorized certs |

### Canvas
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/canva/session` | Create canvas session |
| GET | `/api/canva/session` | Get user's canvases |
| GET | `/api/canva/session/:id` | Get canvas by ID |
| PATCH | `/api/canva/session/:id` | Update canvas |
| DELETE | `/api/canva/session/:id` | Delete canvas |
| POST | `/api/canva/session/:id/authorize` | Authorize canvas |

### Images
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/images` | Upload image |
| GET | `/api/images` | Get user's images |
| GET | `/api/images/:id` | Get image by ID |
| DELETE | `/api/images/:id` | Delete image |
| GET | `/api/images/stats` | Get image stats |

### Verification (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/authorized/:id` | Verify certificate |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Database Setup

1. Create the database:
```sql
CREATE DATABASE certificate_canvas;
```

2. Run the schema:
```bash
psql -d certificate_canvas -f database.sql
```

Or run the setup script:
```bash
cd CertificateCanva.server/server
npm run db:setup
```

### Backend Setup

```bash
cd CertificateCanva.server/server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Seed admin user
npm run db:seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd CertificateCanva.client/client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/certificate_canvas

JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=AdminPassword@123
```

## 🧪 Testing

```bash
cd CertificateCanva.server/server

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🔒 Security Features

- JWT token authentication
- Access & Refresh token pattern
- Password hashing with bcrypt (10 rounds)
- Role-based access control
- SQL injection prevention (parameterized queries)
- File type and size validation
- CORS configuration
- Admin route protection

## 📱 Frontend Pages

1. **Login** - User authentication
2. **Dashboard** - Overview with stats
3. **My Canvases** - Canvas management
4. **My Images** - Image upload/management
5. **Verify Certificate** - Public verification
6. **Admin Dashboard** - System statistics
7. **User Management** - Admin user CRUD

## 🎨 Design Features

- Dark theme with glassmorphism
- Gradient accents
- Smooth animations
- Responsive design
- Modern typography (Inter font)
- Lucide icons

## 📝 Default Admin Credentials

After running the seed script:

```
Email: TestAdmin@test.com
Username: systemtest
Password: AdminTest@123
```

## 🏃 Running in Production

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
npm run build
npm run preview
```

## 📄 License

This project is for educational purposes.

---

Built with ❤️ using React, Express, TypeScript, and PostgreSQL