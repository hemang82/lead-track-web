# 🚀 LeadTrack — Smart Lead Management System

A modern, fast, and user-friendly B2B SaaS Lead Management application designed to streamline sales pipelines, track prospective customer status, manage dynamic interaction notes, and visualize real-time pipeline analytics.



---

## ✨ Key Features

- 📊 **Pipeline Analytics Dashboard**: Real-time metrics for Total, New, Contacted, Qualified, and Lost leads.
- 🎯 **Clickable Stat Cards**: Direct auto-filter integration from dashboard stats to lead pipeline.
- ⚡ **Interactive Leads Table & Mobile Card View**: Instant inline status updates, debounced search (500ms), and custom dropdown filters.
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

## 🌐 Live URLs & Github Repository

- 📂 **GitHub Repository**: [https://github.com/hemang82/lead-track-web](https://github.com/hemang82/lead-track-web)
- 🌐 **Frontend Live App**: [https://lead-track-web.vercel.app](https://lead-track-web.vercel.app)
- ⚙️ **Backend API Live**: [https://leadtrack-backend.onrender.com](https://leadtrack-backend.onrender.com)

---

## 💻 Local Quick Start (`npm install && npm run dev`)

### 1. Clone the repository
```bash
git clone https://github.com/hemang82/lead-track-web.git
cd lead-track-web
```

### 2. Backend Setup & Seed Data
```bash
cd Backend
npm install
npm run seed     # Injects initial dummy leads & admin user
npm dev          # Runs on http://localhost:3005
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
npm run dev      # Runs on http://localhost:5173
```

---

## 🐳 Alternative: Run with Docker (1 Command)

Run the entire application (Frontend + Backend) simultaneously:

```bash
docker compose up --build
```
- 🌐 **Frontend App**: `http://localhost:5173`
- ⚙️ **Backend API**: `http://localhost:3005`

---

## 📡 API Endpoints & cURL Examples

All API requests require the `api-key` header: `api-key: leadmanagement`.

### 1. Get Dashboard Analytics Stats
```bash
curl -X GET "http://localhost:3005/api/leads/dashboard?user_id=1" \
     -H "api-key: leadmanagement"
```

### 2. Get All Leads (Paginated & Filtered)
```bash
curl -X GET "http://localhost:3005/api/leads?user_id=1&page=1&per_page=10&status=new" \
     -H "api-key: leadmanagement"
```

### 3. Add First Lead (Create Lead)
```bash
curl -X POST "http://localhost:3005/api/leads" \
     -H "Content-Type: application/json" \
     -H "api-key: leadmanagement" \
     -d '{
       "user_id": 1,
       "name": "Hemang Patel",
       "email": "hemang@example.com",
       "phone": "9876543210",
       "source": "Website",
       "status": "new",
       "description": "First test lead from cURL"
     }'
```

### 4. Update Lead Status (Inline Status Patch)
```bash
curl -X PUT "http://localhost:3005/api/leads/1" \
     -H "Content-Type: application/json" \
     -H "api-key: leadmanagement" \
     -d '{
       "status": "qualified"
     }'
```

### 5. Add Note to Lead
```bash
curl -X POST "http://localhost:3005/api/leads/1/notes" \
     -H "Content-Type: application/json" \
     -H "api-key: leadmanagement" \
     -d '{
       "user_id": 1,
       "content": "Followed up via phone call, interested in pricing."
     }'
```
