# EventSphere

A comprehensive event management dashboard and tracking application.

## Architecture & Technology Stack

The application uses a decoupled client-server architecture:

- **Frontend**: React (v19) / TypeScript, TanStack Router, TanStack Query, Lucide Icons, Tailwind CSS
- **Backend**: Python 3, Flask REST API (`Flask`, `Flask-CORS`, `Flask-SQLAlchemy`)
- **Database**: SQLite (managed via SQLAlchemy ORM)
- **Communication**: REST API using standard HTTP `fetch()` requests between the frontend and Flask backend

```
React / TypeScript Frontend (Port 8080)
               ↓  REST API (fetch)
Flask Backend Server (Port 5001)
               ↓  SQLAlchemy ORM
        SQLite Database (events.db)
```

## REST API Endpoints

The Flask backend exposes the following REST API endpoints under `/api/events`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend and database health status |
| `GET` | `/api/events` | List all events (supports optional `status` and `search` query parameters) |
| `GET` | `/api/events/<id>` | Retrieve a specific event by ID |
| `POST` | `/api/events` | Create a new event with JSON body |
| `PUT` | `/api/events/<id>` | Update an existing event by ID |
| `DELETE` | `/api/events/<id>` | Delete an event by ID |

## Getting Started

### 1. Python Flask Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   ```bash
   source venv/bin/activate
   ```
3. Install dependencies (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```
4. Run the backend tests:
   ```bash
   python test_backend.py
   ```
5. Start the Flask server on port 5001:
   ```bash
   python app.py
   ```

### 2. React / TypeScript Frontend

1. In the project root directory:
   ```bash
   npm install
   ```
2. Start the Vite development server on port 8080:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:8080` in your browser.

## Features

- **Dashboard**: High-level statistics on Total, Upcoming, Completed, and Cancelled events.
- **Events Management**: Full CRUD operations (Create, Read, Update, Delete) for events.
- **Filtering & Search**: Real-time filtering by status tabs and search by event name.
- **Responsive UI**: Polished modern layout with status badges, currency formatting, and modal delete confirmations.

