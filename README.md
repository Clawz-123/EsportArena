# Esports Arena

Esports Arena is a full-stack web app for managing esports tournaments.

## Live Demo

https://esportarena01.netlify.app

It includes:

- Player, Organizer, and Admin roles
- Tournament, match, bracket, and leaderboard management
- Wallet and payment features
- Notification and chat support

## Tech Stack

- Frontend: React + Vite
- Backend: Django + Django REST Framework + Channels
- Database: PostgreSQL

## Quick Start

### 1. Clone the project

```bash
git clone <repo-url>
cd EsportArena
```

### 2. Setup backend

```powershell
cd Backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a .env file inside Backend with at least:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=127.0.0.1
DB_PORT=5432
```

Run migrations and start backend:

```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 3. Setup frontend

Open a new terminal:

```powershell
cd Frontend
npm install
```

Create a .env file inside Frontend:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Start frontend:

```powershell
npm run dev
```

## Use the Project

1. Open frontend at http://localhost:5173
2. Register or login
3. Use role-based dashboard features
4. Use admin panel at http://127.0.0.1:8000/admin

## API Docs

- Swagger: http://127.0.0.1:8000/swagger/
- ReDoc: http://127.0.0.1:8000/redoc/
