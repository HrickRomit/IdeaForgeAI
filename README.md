# IdeaForge AI

IdeaForge AI is an AI-powered academic project intelligence platform for capstone/project idea discovery, proposal similarity checking, faculty review support, and RAG-based project Q&A.

This repository is currently a starter monorepo with:

- `frontend/` - React + Vite + Tailwind
- `backend/` - FastAPI
- `docker-compose.yml` - PostgreSQL + ChromaDB for local development

## Read This First

After pulling the repo, do not expect `node_modules/`, Python packages, `.env`, or database data to already exist. Each developer must install dependencies and create local environment files on their own machine.

If you are using Codex or another AI coding assistant, tell it:

```text
Read README.md first and help me set up the project exactly as described. Do not add features unless I ask.
```

## Required Software

Install these before running the project:

- Git
- Node.js 20 or newer
- npm
- Python 3.11, 3.12, or 3.13
- Docker Desktop
- VS Code or another editor

Recommended Python version: `3.12`

Python `3.14` may cause package compatibility problems with AI/database libraries.

## Project Structure

```text
IdeaForgeAI/
  backend/
    app/
      api/
      core/
      models/
      schemas/
      services/
      main.py
    tests/
    requirements.txt
    .env.example
  frontend/
    src/
      App.jsx
      styles.css
    package.json
    index.html
    tailwind.config.js
    postcss.config.js
  docker-compose.yml
  .env.example
  README.md
```

## 1. Clone The Repository

```powershell
git clone <repository-url>
cd IdeaForgeAI
```

Replace `<repository-url>` with the actual GitHub repository URL.

## 2. Environment Files

Create local `.env` files from the examples.

From the project root:

```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
```

Update these values later when real secrets are available:

```text
JWT_SECRET_KEY=
GEMINI_API_KEY=
DATABASE_URL=
```

Important: never commit `.env` files to GitHub.

## 3. Start Database And Vector Store

Open Docker Desktop first. Wait until Docker says it is running.

Then run this from the project root:

```powershell
docker compose up -d
```

This starts:

- PostgreSQL on port `5432`
- ChromaDB on port `8001`

Check running containers:

```powershell
docker ps
```

Stop containers:

```powershell
docker compose down
```

## 4. Backend Setup

From the project root:

```powershell
cd backend
py -3.12 -m venv .venv
```

If Python 3.12 is not installed, use another available version:

```powershell
py -0p
py -3.13 -m venv .venv
```

Activate the virtual environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Start the backend:

```powershell
uvicorn app.main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

Expected response:

```json
{"status":"ok"}
```

FastAPI docs:

```text
http://localhost:8000/docs
```

## 5. Frontend Setup

Open a new terminal.

From the project root:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## 6. Normal Daily Startup

After the first setup, you usually only need these commands.

Terminal 1:

```powershell
cd IdeaForgeAI
docker compose up -d
```

Terminal 2:

```powershell
cd IdeaForgeAI\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Terminal 3:

```powershell
cd IdeaForgeAI\frontend
npm run dev
```

## 7. What Each Team Member Needs

Every teammate should have:

- Docker Desktop running
- Node/npm installed
- Python installed
- frontend dependencies installed with `npm install`
- backend dependencies installed with `pip install -r requirements.txt`
- local `.env` and `backend/.env` files created

The team lead or backend/AI lead should provide:

- Gemini API key
- final database credentials for shared/staging deployment
- sample archived project data
- any department/faculty/student seed data

## 8. Current Tech Stack

Frontend:

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Recharts
- Lucide React

Backend:

- FastAPI
- Uvicorn
- SQLAlchemy
- Alembic
- PostgreSQL driver: `psycopg`
- JWT utilities: `python-jose`
- password hashing: `passlib[bcrypt]`
- Pytest

AI/RAG:

- ChromaDB
- LangChain
- LangChain Google GenAI
- Sentence Transformers
- Gemini API

Local services:

- PostgreSQL
- ChromaDB
- Docker Compose

## 9. Common Problems

### Docker pipe error on Windows

Error example:

```text
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified
```

Fix:

1. Open Docker Desktop.
2. Wait until Docker is fully running.
3. Run `docker compose up -d` again.

### PowerShell blocks virtual environment activation

If this fails:

```powershell
.\.venv\Scripts\Activate.ps1
```

Run PowerShell as normal user and try:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then activate again.

### Backend package install fails

Use Python 3.12 if possible. Some AI libraries may not support the newest Python version immediately.

### Frontend command not found

If `npm` is not recognized, install Node.js from the official Node website and restart the terminal.

## 10. Git Rules

Do not commit:

- `.env`
- `node_modules/`
- `.venv/`
- generated database/vector data
- secret keys

Recommended branch flow:

```text
main
develop
feature/<feature-name>
```

Use clear commit messages:

```text
feat: add proposal submission page
fix: correct auth token handling
chore: update backend dependencies
docs: improve setup instructions
```

## 11. Current Project Status

This is a setup scaffold only.

Implemented so far:

- basic frontend starter
- basic backend starter
- backend health check
- Docker Compose for PostgreSQL and ChromaDB
- dependency manifests
- environment examples

Not implemented yet:

- authentication
- student/faculty/admin portals
- database models
- proposal submission
- semantic search
- similarity reports
- RAG chatbot
- Gemini integration
- deployment configuration
