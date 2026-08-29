# 🚀 LeadTrack — Smart Lead Management System

A modern, fast, and user-friendly B2B SaaS Lead Management application designed to streamline sales pipelines, track prospective customer status, manage dynamic interaction notes, and visualize real-time pipeline analytics.

---

## ✨ Key Features

- 📊 **Pipeline Analytics Dashboard**: Real-time metrics for Total, New, Contacted, Qualified, and Lost leads.
- 🎯 **Clickable Stat Cards**: Direct auto-filter integration from dashboard stats to lead pipeline.
- ⚡ **Interactive Leads Table**: Instant inline status updates, debounced search (500ms), and custom dropdown filters.
- 💬 **Quick Note Action**: Add and review dynamic client interaction notes directly from the table or detail view.
- 🛡️ **Full Form Validations**: Built using `react-hook-form` with phone number numeric restrictions & dynamic patch payloads.
- 🎨 **Premium UI/UX**: Custom Indigo design system crafted with React JS & Tailwind CSS.
- 🐳 **Dockerized**: Fully containerized using Docker & Docker Compose for zero-config environment setup.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS v4, Lucide Icons, Sonner Toasts, Nginx
- **Backend**: Node.js, Express.js, SQLite (Better-SQLite3), Axios API Client
- **DevOps**: Docker, Docker Compose

---

## 🐳 Run with Docker (Recommended)

Run the entire application (Frontend + Backend) with a single command:

```bash
docker compose up --build
```
- 🌐 **Frontend App**: `http://localhost:5173`
- ⚙️ **Backend API**: `http://localhost:3005`

---

## 💻 Manual Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/lead-management.git
cd lead-management
```

### 2. Backend Setup
```bash
cd Backend
npm install
npm start
```
*Backend runs on `http://localhost:3005`*

### 3. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*
