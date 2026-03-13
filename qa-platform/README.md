# QA Impact Analysis & Test Case Recommendation Platform

A full-stack platform for analyzing the impact of software changes and recommending relevant test cases using AI-powered similarity search.

## Tech Stack

- **Backend**: Python FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React 18 + TypeScript + Vite + Zustand + React Query
- **AI/ML**: sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2) for embeddings + cosine similarity
- **Styling**: Tailwind CSS

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Using Docker Compose (Recommended)

```bash
cp .env.example .env
docker-compose up --build
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env
uvicorn src.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features

- **JWT Authentication**: Register/Login with secure token management
- **Defect Management**: Upload defects via CSV or manual entry
- **Similar Defect Search**: AI-powered semantic similarity using multilingual sentence transformers
- **Impact Analysis**: Weighted scoring of change impact based on historical defects
- **Test Case Generation**: AI-assisted test case recommendations based on similar defects
- **Dashboard**: Overview of analyses, defect counts, and metrics

## Project Structure

```
qa-platform/
├── backend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── routers/     # API route handlers
│   │   │   ├── auth.py      # JWT utilities
│   │   │   └── database.py  # DB connection
│   │   ├── config/          # Settings
│   │   ├── ml_models/       # ML model wrappers
│   │   ├── models/          # SQLAlchemy models
│   │   ├── services/        # Business logic
│   │   └── utils/           # Seed data & helpers
│   └── tests/
├── frontend/
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Route pages
│       ├── services/        # API clients
│       ├── store/           # Zustand state
│       └── types/           # TypeScript interfaces
└── docs/                    # API & DB docs
```

## CSV Upload Format

The defect CSV should have these columns:
```
title,description,severity,module,status,reporter,related_features
```

Example:
```
로그인 실패,사용자가 올바른 비밀번호 입력 시 로그인 실패,Critical,Login,Open,QA Team,"['auth', 'session']"
```

## Environment Variables

See `.env.example` for all required environment variables.
