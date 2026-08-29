# Lead Management System - Backend API

A robust, RESTful Backend API for a Lead Management System built with Node.js, Express, and SQLite (better-sqlite3).

## Features
- **Leads CRUD:** Complete management of leads with dynamic filtering and soft-delete capabilities.
- **Notes System:** Add and track multiple notes for any specific lead.
- **RESTful Standards:** Properly structured API endpoints using standard HTTP methods and status codes.
- **Pagination & Search:** Optimized data fetching with server-side pagination and wildcard search.
- **Automatic Database Setup:** Zero-configuration SQLite setup with a built-in seed script for quick testing.

---

## 🚀 Getting Started

Follow these simple steps to run the project on your local machine. No external database setup is required!

### 1. Install Dependencies
```bash
npm install
```

### 2. Inject Dummy Data (Seed Database)
To make testing easier, run the seed script. It will automatically create the `leads.db` SQLite database, generate the necessary tables, and populate them with dummy users, leads, and notes.
```bash
node seed.js
```

### 3. Run Tests (Bonus)
A full End-to-End Jest test suite is provided to automatically test the CRUD operations.
```bash
npm test
```

### 4. Start the Server
```bash
npm run dev
```
The server will start running on `http://localhost:3005` (or your configured PORT).

---

## 📡 API Documentation (Examples)

All endpoints accept and return JSON. Please ensure you send the `Content-Type: application/json` header in your requests.

### Leads API

#### 1. Get All Leads (List with Pagination & Search)
Fetch all leads. Supports pagination, search by name/email/phone, and status filtering. Every lead also includes an array of its notes.
- **Endpoint:** `GET /api/leads`
- **Query Params (Optional):** `page`, `per_page`, `search`, `status`
```bash
curl -X GET "http://localhost:3005/api/leads?page=1&per_page=10&status=new"
```

#### 2. Get Lead Details
Fetch a specific lead by ID, including all its associated notes.
- **Endpoint:** `GET /api/leads/:id`
```bash
curl -X GET "http://localhost:3005/api/leads/3"
```

#### 3. Create a Lead
- **Endpoint:** `POST /api/leads`
```bash
curl -X POST "http://localhost:3005/api/leads" \
-H "Content-Type: application/json" \
-d '{
    "user_id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "source": "Website",
    "description": "Needs a demo"
}'
```

#### 4. Update a Lead
- **Endpoint:** `PATCH /api/leads/:id`
```bash
curl -X PATCH "http://localhost:3005/api/leads/3" \
-H "Content-Type: application/json" \
-d '{
    "status": "contacted",
    "description": "Follow up next week"
}'
```

#### 5. Delete a Lead (Soft Delete)
- **Endpoint:** `DELETE /api/leads/:id`
```bash
curl -X DELETE "http://localhost:3005/api/leads/3"
```

---

### Notes API

#### 6. Add a Note to a Lead
- **Endpoint:** `POST /api/leads/:id/notes`
```bash
curl -X POST "http://localhost:3005/api/leads/3/notes" \
-H "Content-Type: application/json" \
-d '{
    "user_id": 2,
    "content": "Customer asked for pricing details."
}'
```

#### 7. Get All Notes for a Lead
- **Endpoint:** `GET /api/leads/:id/notes`
```bash
curl -X GET "http://localhost:3005/api/leads/3/notes"
```

---

## 🏗️ Architecture & Technologies
- **Framework:** Express.js
- **Database:** SQLite3 (`better-sqlite3` for synchronous, fast execution)
- **Validation:** `validatorjs` for request payload verification.
- **Pattern:** MVC structure (Routes -> Controllers -> Models).
