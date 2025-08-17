# Internify - Applicant Tracking System

Internify is a full-stack platform designed for both recruiters and applicants. Recruiters can post and manage internships/jobs, track applications using a drag-and-drop Kanban board, and gain insights with analytics. Applicants can discover opportunities, submit applications, and track their progress—all in one place.

## Features

* Role-based access (Recruiter & Applicant)
* Job management: post, edit, delete listings
* Track applications with a Kanban board
* Analytics dashboard with Chart.js
* Responsive design with dark/light mode
* Real-time notifications

## Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, @hello-pangea/dnd, React Hot Toast, Chart.js
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Zod, bcrypt

## Demo URLs

* **Frontend:** \[Your Vercel URL]
* **Backend:** \[Your Render API URL]

## Getting Started

### Backend Setup

```bash
cd api
npm install
```

Create `.env` in `api`:

```env
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-secret>
CLIENT_URL=https://your-frontend.vercel.app
```

Start server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd ../client
npm install
```

Create `.env.local` in `client`:

```env
NEXT_PUBLIC_API_URL=https://your-backend.render.app/api
```

Start frontend:

```bash
npm run dev
```


## API Overview

* **Auth**: register, login, logout
* **Jobs**: list, create, updates, delete, get applications
* **Applications**: submit, update status
* **Analytics**: recruiter dashboard (visualized using Chart.js)

## Kanban Board

Recruiters can drag applications across columns (**APPLIED → UNDER\_REVIEW → INTERVIEW → OFFER → REJECTED**) to update the status. Changes are reflected in real time.

## Deployment

* Frontend deployed on **Vercel**
* Backend deployed on **Render**

## Security

* JWT authentication
* Password hashing with bcrypt
* Role-based access middleware
* Input validation using Zod
* CORS restricted to frontend URL
