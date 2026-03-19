# Lead Manager

A simple lead management app built with Node.js, Express, MongoDB, and Next.js.

## Live Link

[https://frontend-silk-two-88.vercel.app](https://frontend-silk-two-88.vercel.app)

## How to Run Locally

Clone the repo:

```bash
git clone https://github.com/bersu77/lead-manager.git
cd lead-manager
```

Start the backend:

```bash
cd backend
npm install
cp .env.example .env   # then fill in your MongoDB URI, Resend key, and JWT secret
npm run dev
```

Start the frontend (new terminal):

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:5000 npm run dev
```

Open http://localhost:3000
