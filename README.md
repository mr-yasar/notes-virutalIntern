# 📓 Magical Notes SPA

A premium, glassmorphic single-page application (SPA) for capturing, styling, categorizing, and searching notes. Built with a robust **FastAPI (Python) backend**, **SQLite database**, **SQLAlchemy ORM**, and a clean, responsive **vanilla HTML/CSS/JS frontend**.

---

## ✨ Features

- **Rich Glassmorphic Design**: Modern dark mode styling, translucent container cards, hover animations, and glowing background decorations.
- **Categorization**: Sort thoughts instantly into tags like *General*, *Work*, *Personal*, or *Ideas*.
- **Note Pinning**: Keep important notes anchored at the top of your workspace.
- **Dynamic Search**: Instantly filter notes in real-time by title, content, or category tag.
- **Visual Color Themes**: Apply colors like Charcoal, Plum, Teal, Indigo, and Forest to note cards.
- **Toast Notifications**: Interactive popup notifications giving instant feedback on save, edit, pin, and delete events.
- **Interactive Editing**: Beautiful backdrop-blur modal to edit note titles, text, colors, and tags.

---

## 🛠️ Tech Stack

- **Backend**: Python 3, FastAPI (REST API, static files server)
- **Database**: SQLite (local database `notes.db`)
- **ORM & Validation**: SQLAlchemy & Pydantic v2
- **Frontend**: Vanilla HTML5, CSS3 (Custom Variables, Transitions, Keyframes), Modern JS (Async Fetch API, state-driven rendering)

---

## 📁 Directory Structure

```
magical-einstein/
├── backend/
│   ├── database.py       # SQLite connection and session maker
│   ├── models.py         # SQLAlchemy DB models (Note fields)
│   ├── schemas.py        # Pydantic schemas for request validation
│   ├── crud.py           # SQL queries execution logic (CRUD)
│   └── main.py           # FastAPI entrypoint, routers, static mounting
├── frontend/
│   ├── index.html        # Single-page UI structure
│   ├── style.css         # Custom CSS (Glassmorphism layout)
│   └── app.js            # JavaScript SPA logic & API connections
├── .gitignore            # Excluded databases and caches
├── requirements.txt      # Python library dependencies
├── README.md             # Project documentation
└── run.py                # Setup, dependency check, and runner script
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Make sure you have **Python 3** installed on your system.

### 🏃 Running the Application
1. Clone or navigate to the repository directory:
   ```bash
   cd magical-einstein
   ```
2. Execute the convenience runner script:
   ```bash
   python run.py
   ```
   *Note: This script automatically verifies your environment, installs/updates dependencies (FastAPI, Uvicorn, SQLAlchemy), and starts the server on port 8000.*

3. Open your browser and go to:
   👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 📡 API Endpoints

FastAPI generates automatic interactive documentation. You can view and test endpoints at **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notes` | Fetch all notes (sorted by pinned first, then updated date) |
| `POST` | `/api/notes` | Create a new note |
| `PUT` | `/api/notes/{id}` | Update an existing note's details |
| `PATCH` | `/api/notes/{id}/pin` | Toggle a note's pinned state |
| `DELETE` | `/api/notes/{id}` | Delete a note |
