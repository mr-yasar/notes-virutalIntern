import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List

from .database import engine, get_db, Base
from . import crud, schemas

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Magical Notes API", version="1.0.0")

# API Routes
@app.get("/api/notes", response_model=List[schemas.NoteResponse])
def read_notes(db: Session = Depends(get_db)):
    return crud.get_notes(db)

@app.post("/api/notes", response_model=schemas.NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    if not note.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Note content cannot be empty"
        )
    return crud.create_note(db, note)

@app.put("/api/notes/{note_id}", response_model=schemas.NoteResponse)
def update_note(note_id: int, note_update: schemas.NoteUpdate, db: Session = Depends(get_db)):
    updated = crud.update_note(db, note_id, note_update)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {note_id} not found"
        )
    return updated

@app.patch("/api/notes/{note_id}/pin", response_model=schemas.NoteResponse)
def toggle_note_pin(note_id: int, db: Session = Depends(get_db)):
    updated = crud.toggle_note_pin(db, note_id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {note_id} not found"
        )
    return updated

@app.delete("/api/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_note(db, note_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {note_id} not found"
        )
    return

# Setup static files directory relative to main.py
current_dir = os.path.dirname(os.path.realpath(__file__))
frontend_dir = os.path.join(os.path.dirname(current_dir), "frontend")

# Ensure the frontend directory exists so mounting doesn't throw a Startup exception
os.makedirs(frontend_dir, exist_ok=True)

# Mount the static files at the root (MUST be after API routes to avoid overriding them)
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
