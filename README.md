# Lead Manager

A simple lead management application with a Node.js/Express REST API backend and a Next.js frontend, using MongoDB for storage.

## Prerequisites

- Node.js (v18+)
- MongoDB running locally on port 27017

## Project Structure

```
lead-manager/
├── backend/    # Express REST API
├── frontend/   # Next.js UI
└── README.md
```

## How to Run Locally

### 1. Start MongoDB

Make sure MongoDB is running locally:

```bash
mongod
```

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The API will run on http://localhost:5000

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will run on http://localhost:3000

## API Endpoints

| Method | Endpoint | Description      |
|--------|----------|------------------|
| GET    | /leads   | Fetch all leads  |
| POST   | /leads   | Add a new lead   |

### Lead Schema

| Field     | Type   | Required | Notes                                                        |
|-----------|--------|----------|--------------------------------------------------------------|
| name      | String | Yes      |                                                              |
| email     | String | Yes      | Unique                                                       |
| status    | Enum   | No       | "New", "Engaged", "Proposal Sent", "Closed-Won", "Closed-Lost" (default: "New") |
| createdAt | Date   | No       | Auto-generated                                               |
