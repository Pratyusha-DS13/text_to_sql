from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db

router = APIRouter()

@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT id, question, sql_query, created_at FROM query_history ORDER BY created_at DESC"))
        history = [
            {
                "id": row[0],
                "question": row[1],
                "sql_query": row[2],
                "created_at": str(row[3])
            }
            for row in result
        ]
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history/{id}")
def delete_history(id: int, db: Session = Depends(get_db)):
    try:
        db.execute(text("DELETE FROM query_history WHERE id = :id"), {"id": id})
        db.commit()
        return {"message": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))