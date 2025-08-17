# Internifyy - Applicant Tracking & Job Management System

Internifyy is a modern, full-stack platform for both **job applicants** and **recruiters**. Applicants can search and apply for jobs, while recruiters can post jobs, track applications via a drag-and-drop **Kanban board**, and visualize analytics with **Chart.js**.

---

## **Features**

- **Role-Based Access**: Separate interfaces for applicants and recruiters.
- **Job Management**: Recruiters can post, edit, and delete job listings.
- **Application Tracking**: Track application status (APPLIED, UNDER_REVIEW, INTERVIEW, OFFER, REJECTED).
- **Kanban Board**: Drag-and-drop interface to manage application pipelines.
- **Analytics Dashboard**: Visual insights using **Chart.js**.
- **Dark/Light Mode**: System-aware theme switching.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

---

## **Tech Stack**

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Chart.js (via react-chartjs-2)
- @hello-pangea/dnd (drag-and-drop Kanban)
- React Hot Toast (notifications)

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- Zod (input validation)
- bcrypt (password hashing)

---

## **Database Schema & Relationships**

### **Users Collection (`User`)**
- Fields: `name`, `email`, `passwordHash`, `role` (`applicant` | `recruiter`), `createdAt`.
- Passwords are hashed with **bcrypt**.
- Role defines permissions for accessing pages and APIs.

### **Jobs Collection (`Job`)**
- Fields: `title`, `description`, `requirements`, `location`, `deadline`, `recruiterId`, `createdAt`.
- Text indexes for searching jobs.
- Indexed by `recruiterId` and `createdAt`.

### **Applications Collection (`Application`)**
- Fields: `jobId`, `applicantId`, `status`, `resumeUrl`, `resumeData`, `resumeFileName`, `applicantName`, `applicantEmail`, `applicantPhone`, `yearsOfExperience`, `currentRole`, `coverLetter`, `notes`, `createdAt`, `updatedAt`.
- Unique index on `{ jobId, applicantId }` to prevent duplicate applications.
- Index on `{ jobId, status }` for fast Kanban queries.
- Automatically updates `updatedAt` on save.

### **Relationships**
- One recruiter (`User`) can post many jobs (`Job`).
- One applicant (`User`) can submit many applications (`Application`).
- One job can have many applications.

---

## **Local Setup**

### **1. Clone the repository**
```bash
git clone https://github.com/AdityaB786/ats-tracker.git
cd ats-tracker
````

### **2. Setup Backend**

```bash
cd api
npm install
```

Create a `.env` file in the `api` folder:

```env
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### **3. Setup Frontend**

```bash
cd ../client
npm install
```

Create `.env.local` in the `client` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### **4. Seed Database**

```bash
cd ../api
npm run seed
```

Demo accounts:

* **Recruiter**: [recruiter@test.com](mailto:recruiter@test.com) / 123456
* **Applicant**: [applicant@test.com](mailto:applicant@test.com) / 123456

### **5. Start Servers**

Open separate terminals:

```bash
# API
cd api
npm run dev

# Frontend
cd client
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## **Deployment**

### **Frontend**

* Deployed on **Vercel**
* Set `NEXT_PUBLIC_API_URL` to your backend URL.

### **Backend**

* Deployed on **Render**
* Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV`.

---

## **Libraries Used**

* **Frontend**: Next.js, Tailwind CSS, Chart.js, @hello-pangea/dnd, React Hot Toast
* **Backend**: Express, Mongoose, bcrypt, Zod, JWT

---

## **Demo Video**

* https://drive.google.com/file/d/1MZ__tTQYkhNkp5lI5Npd3I2gQekqBhiZ/view?usp=drive_link



## **Further Improvements:
*
I developed an automated job notifier using Playwright, n8n, and webhooks. The system runs on a scheduled cron job, scrapes the latest job postings from Superset, and delivers real-time Telegram alerts to JIIT students through n8n. This creates a zero-touch, low-code workflow for automated placement updates.
The same solution can be integrated into the Internifyy app, ensuring that whenever a recruiter posts a new opportunity, all registered candidates receive instant notifications — helping candidates apply faster and enabling recruiters to reach more applicants efficiently.
