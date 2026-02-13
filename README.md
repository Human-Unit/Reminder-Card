# Memory Card Application 🧠

[![Backend CI](https://github.com/Human-Unit/Reminder-Card/actions/workflows/backend.yml/badge.svg)](https://github.com/Human-Unit/Reminder-Card/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/Human-Unit/Reminder-Card/actions/workflows/frontend.yml/badge.svg)](https://github.com/Human-Unit/Reminder-Card/actions/workflows/frontend.yml)


A full-stack web application for managing personal memories and experiences with a powerful admin dashboard. Built with Go and Next.js.

## ✨ Features

- **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- **Memory Management** - Create, edit, and delete personal memory entries with custom icons and colors
- **Admin Dashboard** - Comprehensive system control panel for managing users and entries
- **Dark Mode** - Beautiful light/dark theme support with smooth transitions
- **Responsive Design** - Fully adaptive UI for desktop, tablet, and mobile devices
- **Real-time Updates** - Automatic data synchronization using React Query
- **Modern UI** - Polished interface with animations powered by Framer Motion

## 🛠️ Tech Stack

### Backend
- **Go** - High-performance backend server
- **Gin** - Web framework for routing and middleware
- **GORM** - ORM for database operations
- **JWT** - Token-based authentication
- **PostgreSQL** - Robust relational database
- **Swagger** - API documentation

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Query** - Data fetching and caching
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client
- **Sonner** - Toast notifications
- **Lucide Icons** - Beautiful icon set

## 📦 Installation

### Prerequisites
- Go 1.21 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
go mod download

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Required: ADMIN_PASSWORD

# Run the server
go run cmd/main.go
```

The backend will start on `http://localhost:8080`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local
# Required: NEXT_PUBLIC_API_URL=http://localhost:8080

# Run the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### Docker Setup (Recommended)

Running the entire stack with Docker Compose is the easiest way to get started.

```bash
# Set up environment variables first
# For backend
echo "ADMIN_PASSWORD=your_secure_password" > backend/.env
# For frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > frontend/.env.local

# Run everything
docker compose up --build
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- API Docs: `http://localhost:8080/swagger/index.html`


## 🔧 Environment Variables

### Backend (.env)
```env
ADMIN_PASSWORD=your_secure_admin_password
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 🚀 Usage

### User Flow
1. **Register** - Create a new account at `/register`
2. **Login** - Sign in at `/login`
3. **Dashboard** - View and manage your memories
4. **Create Entries** - Add new memories with custom icons and colors
5. **Theme Toggle** - Switch between light and dark modes

### Admin Access
- Navigate to `/admin`
- Login with username: `admin` and the password from your `.env` file
- Manage all users and entries from the admin panel

## 📁 Project Structure

```
├── backend/
│   ├── cmd/
│   │   └── main.go              # Application entry point
│   ├── internal/
│   │   ├── handlers/            # Route handlers
│   │   ├── middleware/          # Auth & CORS middleware
│   │   ├── models/              # Database models
│   │   └── routes/              # API routes
│   └── go.mod
│
├── frontend/
│   ├── app/                     # Next.js app directory
│   │   ├── admin/              # Admin panel
│   │   ├── dashboard/          # User dashboard
│   │   ├── login/              # Login page
│   │   └── register/           # Registration page
│   ├── components/             # Reusable components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and configs
│   └── types/                  # TypeScript types
│
└── README.md
```

## 🔌 API Endpoints

### Public Routes
- `POST /user/login` - User authentication
- `POST /user/create` - User registration

### Protected User Routes (Requires JWT)
- `GET /user/entries` - Get user's entries
- `POST /user/entries` - Create new entry
- `PUT /user/entries/:id` - Update entry
- `DELETE /user/entries/:id` - Delete entry
- `POST /user/logout` - Logout

### Admin Routes (Requires admin role)
- `GET /admin/users` - List all users
- `GET /admin/entries` - List all entries
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `PUT /admin/entries/:id` - Update any entry
- `DELETE /admin/entries/:id` - Delete any entry

## 🎨 Features Showcase

### Responsive Navigation
- Desktop: Full sidebar with branding
- Mobile: Bottom navigation bar with icons

### Visual Selectors
- Choose from multiple icons (Briefcase, Lightbulb, Heart)
- Select from gradient color themes (Purple, Orange, Blue)

### Real-time Feedback
- Toast notifications for all actions
- Smooth animations for state changes
- Loading states for async operations

## 🔐 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- HTTP-only cookies for token storage
- CORS protection
- Role-based access control (User/Admin)

## 🔄 CI/CD

This project uses GitHub Actions for continuous integration and deployment:

### Automated Workflows

**Backend CI** (`.github/workflows/backend.yml`)
- Runs on every push/PR to `main` or `develop` branches
- Go version: 1.21
- Steps:
  - Code checkout
  - Dependency installation and verification
  - `go vet` static analysis
  - Unit tests with race detection
  - Code coverage report generation
  - Build verification

**Frontend CI** (`.github/workflows/frontend.yml`)
- Runs on every push/PR to `main` or `develop` branches
- Node.js version: 18
- Steps:
  - Code checkout
  - Dependency installation
  - ESLint code quality checks
  - Production build verification
  - Build artifact upload

### Triggering Workflows

Workflows automatically run when:
- Code is pushed to `main` or `develop` branches
- Pull requests are created targeting these branches
- Changes are made to relevant paths (backend/* or frontend/*)

### Viewing Results

Check the Actions tab in your GitHub repository to see workflow runs and status.

## 🧪 Development

### Run Tests
```bash
# Backend
cd backend
go test ./...

# Frontend
cd frontend
npm run lint
```

### Build for Production
```bash
# Backend
cd backend
go build -o server cmd/main.go

# Frontend
cd frontend
npm run build
npm start
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👤 Author

Built with ❤️ as a portfolio project

---

**Note**: This is a portfolio project demonstrating full-stack development skills with Go and Next.js.
