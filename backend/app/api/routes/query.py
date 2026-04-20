from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel

from app.core.database import get_db
from app.services.text_to_sql import text_to_sql
from app.services.query_service import execute_query
from app.services.chart_service import generate_chart

router = APIRouter()


class QueryRequest(BaseModel):
    query: str


class ExecuteSqlRequest(BaseModel):
    sql: str


@router.post("/query")
def query_data(request: QueryRequest, db: Session = Depends(get_db)):
    try:
        user_query = request.query.strip()

        if not user_query:
            raise HTTPException(status_code=400, detail="Query is required")

        print(f"[DEBUG] Processing query: {user_query[:100]}")

        # Step 1: Convert to SQL
        sql = text_to_sql(user_query)
        print(f"[DEBUG] Generated SQL: {sql[:100]}")

        # Save to history
        db.execute(text("INSERT INTO query_history (question, sql_query) VALUES (:question, :sql)"), {"question": user_query, "sql": sql})
        db.commit()

        # Step 2: Execute SQL
        result = execute_query(db, sql)
        print(f"[DEBUG] Query result: {len(result)} rows")
        
        chart = generate_chart(result)
        print(f"[DEBUG] Chart generated")

        return {
            "sql": sql,
            "data": result,
            "chart": chart,
        }


    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Exception in query_data: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/execute-sql")
def execute_sql(request: ExecuteSqlRequest, db: Session = Depends(get_db)):
    try:
        sql = request.sql.strip()

        if not sql:
            raise HTTPException(status_code=400, detail="SQL is required")

        print(f"[DEBUG] Executing SQL: {sql[:100]}")

        # Execute the provided SQL directly
        result = execute_query(db, sql)
        print(f"[DEBUG] SQL result: {len(result)} rows")
        
        chart = generate_chart(result)
        print(f"[DEBUG] Chart generated")

        return {
            "sql": sql,
            "data": result,
            "chart": chart,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Exception in execute_sql: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))