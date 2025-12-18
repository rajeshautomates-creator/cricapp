# Cricket SaaS Backend

Production-ready NestJS backend for Cricket Score SaaS platform with JWT authentication, role-based access control, real-time WebSocket updates, and Razorpay payment integration.

## 🚀 Features

- ✅ **JWT Authentication** - Access & refresh tokens with bcrypt password hashing
- ✅ **Role-Based Access Control** - Super Admin, Admin, Viewer roles
- ✅ **RESTful API** - Complete CRUD for tournaments, teams, players, matches
- ✅ **Real-time Updates** - WebSocket gateway for live score broadcasting
- ✅ **Payment Integration** - Razorpay subscription & purchase flows
- ✅ **PostgreSQL + Prisma ORM** - Type-safe database operations
- ✅ **Docker Ready** - Multi-stage builds, docker-compose for deployment
- ✅ **Validation** - class-validator for request validation

## 📋 Prerequisites

- Node.js 20+ 
- PostgreSQL 16+
- npm or yarn

## 🛠️ Local Development Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cricapp_db?schema=public"
JWT_ACCESS_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with demo data
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run start:dev
```

Backend will be running at `http://localhost:4000`

## 🎯 Demo Accounts

After seeding, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@demo.com | demo123 |
| Admin | demo@admin.com | demo123 |
| Viewer | demo@viewer.com | demo123 |

## 📡 API Endpoints

Base URL: `http://localhost:4000/api`

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Users (Super Admin only)

- `GET /users` - List all users (paginated)
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `PATCH /users/:id/role` - Change user role

### Tournaments

- `GET /tournaments` - List tournaments
- `GET /tournaments/:id` - Get tournament details
- `POST /tournaments` - Create tournament (Admin+)
- `PATCH /tournaments/:id` - Update tournament
- `DELETE /tournaments/:id` - Delete tournament

### Teams

- `GET /teams?tournamentId=xxx` - List teams
- `GET /teams/:id` - Get team with players
- `POST /teams` - Create team (Admin+)
- `PATCH /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team

### Players

- `GET /players?teamId=xxx` - List players
- `GET /players/:id` - Get player details
- `POST /players` - Add player (Admin+)
- `PATCH /players/:id` - Update player
- `DELETE /players/:id` - Remove player

### Matches

- `GET /matches?tournamentId=xxx&status=LIVE` - List matches
- `GET /matches/:id` - Get match details with score
- `POST /matches` - Schedule match (Admin+)
- `PATCH /matches/:id` - Update match
- `DELETE /matches/:id` - Delete match

### Scores

- `GET /scores/match/:matchId` - Get match score
- `PATCH /scores/match/:matchId` - Update score (Admin+)

### Subscriptions

- `POST /subscriptions/viewer/create-payment` - Create viewer subscription order
- `POST /subscriptions/viewer/verify-payment` - Verify & activate viewer subscription
- `GET /subscriptions/viewer/my-subscription` - Get my subscription status
- `POST /subscriptions/admin/create-payment` - Create admin purchase order
- `POST /subscriptions/admin/verify-payment` - Verify & activate admin access

### Settings

- `GET /settings/payment` - Get payment settings (public)
- `PATCH /settings/payment` - Update payment settings (Super Admin)

## 🔌 WebSocket Events

Connect to `ws://localhost:4000`

### Client → Server

- `join_match` - Subscribe to match updates (payload: matchId)
- `leave_match` - Unsubscribe from match (payload: matchId)

### Server → Client

- `score_update` - Real-time score changes
- `match_status_change` - Match status updates (LIVE, COMPLETED)

## 🐳 Docker Deployment

### Local Testing with Docker Compose

```bash
# From project root
docker-compose up --build
```

Services:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- PostgreSQL: `localhost:5432`

### Dokploy Deployment

1. **Push to Git Repository**

2. **Create App in Dokploy**
   - Select Docker Compose deployment
   - Connect your repository

3. **Configure Environment Variables** in Dokploy:
   ```
   JWT_ACCESS_SECRET=<random-32-char-string>
   JWT_REFRESH_SECRET=<random-32-char-string>
   RAZORPAY_KEY_ID=<your-razorpay-key>
   RAZORPAY_KEY_SECRET=<your-razorpay-secret>
   CORS_ORIGIN=https://yourdomain.com
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

4. **Deploy**
   - Dokploy will build and run docker-compose
   - Database migrations run automatically on backend startup

5. **Post-Deployment**
   ```bash
   # SSH into backend container and seed database (first time only)
   docker exec -it cricapp-backend npx prisma db seed
   ```

## 🔐 Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens - Access (15min), Refresh (7 days)
- Role-based guards on all protected endpoints
- Ownership validation (admins can only modify their own resources)

## 📂 Project Structure

```
backend/
├── src/
│   ├── auth/           # JWT authentication & guards
│   ├── users/          # User management
│   ├── tournaments/    # Tournament CRUD
│   ├── teams/          # Team management
│   ├── players/        # Player management
│   ├── matches/        # Match scheduling
│   ├── scores/         # Score tracking
│   ├── subscriptions/  # Payment integration
│   ├── settings/       # Payment settings
│   ├── websocket/      # Real-time gateway
│   ├── prisma/         # Database service
│   ├── app.module.ts   # Root module
│   └── main.ts         # Entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── seed.ts         # Seed script
│   └── migrations/     # Database migrations
├── Dockerfile          # Backend Docker image
└── package.json        # Dependencies & scripts
```

## 🧪 Testing

### Manual API Testing

Use the provided demo accounts to test endpoints:

```bash
# Login as admin
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@admin.com","password":"demo123"}'

# Use the returned access token
TOKEN="your-access-token"

# Create tournament
curl -X POST http://localhost:4000/api/tournaments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Tournament","startDate":"2024-12-25","endDate":"2025-01-10","venue":"Stadium"}'
```

## 🛠️ Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Reset database
npx prisma migrate reset
```

### Port Already in Use

```bash
# Change PORT in .env file
PORT=4001
```

### Prisma Client Errors

```bash
# Regenerate Prisma Client
npx prisma generate
```

## 📝 License

MIT

## 👥 Support

For issues or questions, please contact the development team.

---

**Built with NestJS, Prisma, PostgreSQL, and Socket.IO**
