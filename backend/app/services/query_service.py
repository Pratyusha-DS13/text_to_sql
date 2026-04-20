from sqlalchemy import text
from sqlalchemy.orm import Session


def execute_query(db: Session, sql: str):
    result = db.execute(text(sql))
    rows = result.fetchall()

    # Convert to list of dicts
    columns = result.keys()
    data = [dict(zip(columns, row)) for row in rows]

    return data