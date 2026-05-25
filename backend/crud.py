from sqlalchemy.orm import Session
from sqlalchemy import desc
from . import models, schemas
from datetime import datetime

def get_notes(db: Session):
    # Sort notes: pinned ones first, then by updated_at descending
    return db.query(models.Note).order_by(
        desc(models.Note.is_pinned), 
        desc(models.Note.updated_at)
    ).all()

def get_note(db: Session, note_id: int):
    return db.query(models.Note).filter(models.Note.id == note_id).first()

def create_note(db: Session, note: schemas.NoteCreate):
    db_note = models.Note(
        title=note.title,
        content=note.content,
        color=note.color,
        category=note.category,
        is_pinned=note.is_pinned
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def update_note(db: Session, note_id: int, note_update: schemas.NoteUpdate):
    db_note = get_note(db, note_id)
    if not db_note:
        return None
    
    update_data = note_update.model_dump(exclude_unset=True) if hasattr(note_update, 'model_dump') else note_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_note, key, value)
    
    db_note.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_note)
    return db_note

def toggle_note_pin(db: Session, note_id: int):
    db_note = get_note(db, note_id)
    if not db_note:
        return None
    
    db_note.is_pinned = not db_note.is_pinned
    db_note.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_note)
    return db_note

def delete_note(db: Session, note_id: int):
    db_note = get_note(db, note_id)
    if not db_note:
        return False
    
    db.delete(db_note)
    db.commit()
    return True
