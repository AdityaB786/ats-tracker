# ATS Tracker - Applicant Tracking System

A modern, full-stack Applicant Tracking System built with Next.js, Express, MongoDB, and TypeScript. Features include role-based authentication, drag-and-drop Kanban boards, real-time analytics, and a responsive UI with dark mode support.

## Features

- **Role-Based Access Control**: Separate interfaces for applicants and recruiters
- **Job Management**: Post, edit, and delete job listings
- **Application Tracking**: Apply to jobs and track application status
- **Kanban Board**: Drag-and-drop interface for managing application pipeline
- **Analytics Dashboard**: Visual insights with Chart.js
- **Dark/Light Mode**: System-aware theme switching
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Chart.js (react-chartjs-2)
- @hello-pangea/dnd (drag-and-drop)
- React Hot Toast (notifications)

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- Zod (validation)
- bcrypt (password hashing)

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB installation
- Git

## Local Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd ATS-Tracker
```

### 2. Set up the API server

```bash
cd api
npm install
```

Create `.env` file in the `api` folder:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ats-tracker?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here-change-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Set up the Frontend

```bash
cd ../client
npm install
```

Create `.env.local` file in the `client` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Seed the database

```bash
cd ../api
npm run seed
```

This creates demo accounts:
- **Recruiter**: recruiter@test.com / 123456
- **Applicant**: applicant@test.com / 123456

### 5. Start the development servers

In separate terminals:

```bash
# Terminal 1 - API server
cd api
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
ATS-Tracker/
├── api/                    # Backend API
│   ├── src/
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routes
│   │   ├── middleware/    # Auth & error handling
│   │   ├── utils/         # Helpers & validation
│   │   ├── types/         # TypeScript interfaces
│   │   ├── scripts/       # Seed script
│   │   └── server.ts      # Entry point
│   └── package.json
│
├── client/                 # Frontend Next.js app
│   ├── app/               # App router pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/     # Applicant dashboard
│   │   ├── jobs/          # Job listings & details
│   │   └── recruiter/     # Recruiter pages
│   ├── components/        # Reusable components
│   ├── lib/               # Utilities & contexts
│   ├── types/             # TypeScript types
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/me` - Get current user
- `PATCH /api/me` - Update profile

### Jobs
- `GET /api/jobs` - List all jobs (with search/filters)
- `POST /api/jobs` - Create job (recruiter only)
- `GET /api/jobs/:id` - Get job details
- `PATCH /api/jobs/:id` - Update job (recruiter only)
- `DELETE /api/jobs/:id` - Delete job (recruiter only)
- `GET /api/jobs/:id/applications` - Get job applications (recruiter only)

### Applications
- `POST /api/applications` - Submit application (applicant only)
- `GET /api/applications/me` - Get my applications (applicant only)
- `GET /api/applications/:id` - Get application details
- `PATCH /api/applications/:id` - Update application status (recruiter only)

### Analytics
- `GET /api/analytics/summary` - Get analytics data (recruiter only)

## Deployment

### Deploy to Vercel (Frontend)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed API URL

### Deploy API

Options:
- **Render**: Free tier available, automatic deploys from GitHub
- **Railway**: Simple deployment with MongoDB addon
- **Heroku**: Requires credit card but has free tier

Set environment variables on your chosen platform:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Strong secret key for production
- `CLIENT_URL`: Your deployed frontend URL
- `NODE_ENV`: production

### MongoDB Atlas Setup

1. Create free cluster at https://cloud.mongodb.com
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for any IP)
4. Get connection string and update MONGODB_URI

## Security Considerations

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt (10 salt rounds)
- CORS configured for frontend origin only
- Role-based middleware protects sensitive routes
- Input validation with Zod schemas

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.