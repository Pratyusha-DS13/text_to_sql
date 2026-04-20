from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any
import json

from app.core.database import get_db

router = APIRouter()

# =========================
# SCHEMAS
# =========================

class SaveWidgetRequest(BaseModel):
    title: str
    sql: str
    chart: Dict[str, Any]

class WidgetResponse(BaseModel):
    id: int
    title: str
    sql: str
    chart: Dict[str, Any]
    created_at: str

# =========================
# DASHBOARD SUMMARY
# =========================

@router.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    try:
        total_users = db.execute(text("SELECT COUNT(*) FROM users")).scalar() or 0
        total_orders = db.execute(text("SELECT COUNT(*) FROM orders")).scalar() or 0
        total_revenue = db.execute(text("SELECT SUM(amount) FROM orders")).scalar() or 0
        avg_order_value = db.execute(text("SELECT AVG(amount) FROM orders")).scalar() or 0

        return {
            "total_users": int(total_users),
            "total_orders": int(total_orders),
            "total_revenue": float(total_revenue),
            "avg_order_value": float(avg_order_value)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# REVENUE BY USER
# =========================

@router.get("/dashboard/revenue-by-user")
def get_revenue_by_user(db: Session = Depends(get_db)):
    try:
        sql = """
        SELECT u.name, SUM(o.amount) AS total_amount
        FROM orders o
        JOIN users u ON o.user_id = u.id
        GROUP BY u.name
        ORDER BY total_amount DESC
        """

        result = db.execute(text(sql)).fetchall()

        data = [
            {
                "name": row[0],
                "total_amount": float(row[1]) if row[1] else 0
            }
            for row in result
        ]

        chart = {
            "type": "bar",
            "x": [row["name"] for row in data],
            "y": [row["total_amount"] for row in data],
            "x_label": "User",
            "y_label": "Total Revenue"
        }

        return {
            "sql": sql,
            "data": data,
            "chart": chart
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# SAVE WIDGET
# =========================

@router.post("/dashboard/save")
def save_widget(request: SaveWidgetRequest, db: Session = Depends(get_db)):
    try:
        chart_json = json.dumps(request.chart)

        sql_insert = """
        INSERT INTO dashboard_widgets (title, query, chart, created_at)
        VALUES (:title, :query, :chart, NOW())
        """

        db.execute(
            text(sql_insert),
            {
                "title": request.title,
                "query": request.sql,   # map frontend "sql" → DB "query"
                "chart": chart_json
            }
        )

        db.commit()

        inserted_id = db.execute(text("SELECT LAST_INSERT_ID()")).scalar()

        return {
            "id": inserted_id,
            "message": "Widget saved successfully"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# GET WIDGETS
# =========================

@router.get("/dashboard/widgets", response_model=List[WidgetResponse])
def get_widgets(db: Session = Depends(get_db)):
    try:
        sql = """
        SELECT id, title, query, chart, created_at
        FROM dashboard_widgets
        ORDER BY created_at DESC
        """

        result = db.execute(text(sql)).fetchall()

        widgets = []

        for row in result:
            chart_data = row[3]

            # Safely parse JSON
            if isinstance(chart_data, str):
                try:
                    chart_data = json.loads(chart_data)
                except:
                    chart_data = {}

            widgets.append({
                "id": row[0],
                "title": row[1],
                "sql": row[2],  # return as "sql" for frontend
                "chart": chart_data,
                "created_at": str(row[4])
            })

        return widgets

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# DELETE WIDGET
# =========================

@router.delete("/dashboard/{widget_id}")
def delete_widget(widget_id: int, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("DELETE FROM dashboard_widgets WHERE id = :id"),
            {"id": widget_id}
        )

        db.commit()

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Widget not found")

        return {"message": "Widget deleted successfully"}

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))