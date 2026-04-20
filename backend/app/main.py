"""FastAPI application entry point."""

import json
import socket
from urllib.parse import urlparse

import mysql.connector
from fastapi import FastAPI
from pydantic import BaseModel
from app.config import Settings

from app.api.routes import health
from app.api.routes import query  # 👈 NEW IMPORT
from app.api.routes import dashboard  # 👈 NEW IMPORT
from app.api.routes import history  # 👈 NEW IMPORT
from fastapi.middleware.cors import CORSMiddleware

settings = Settings()

app = FastAPI(
    title="Text-to-SQL API",
    description="AI-powered analytics backend",
    version="0.1.0",
)


# Request models
class GenerateInsightRequest(BaseModel):
    question: str
    sql: str
    data: list


class ExplainQueryRequest(BaseModel):
    sql: str


class ConnectDbRequest(BaseModel):
    host: str
    port: int
    user: str
    password: str
    db: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing health route
app.include_router(health.router, prefix="/health", tags=["health"])

# 👇 ADD THIS
app.include_router(query.router, prefix="/query", tags=["query"])
app.include_router(dashboard.router, prefix="", tags=["dashboard"])
app.include_router(history.router, prefix="", tags=["history"])


@app.post("/connect-db")
async def connect_db(data: ConnectDbRequest):
    try:
        conn = mysql.connector.connect(
            host=data.host,
            port=data.port,
            user=data.user,
            password=data.password,
            database=data.db
        )
        conn.close()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def generate_insight_with_llm(question: str, sql: str, data: list) -> str:
    """Generate insight using Groq API or fallback logic."""
    try:
        from groq import Groq
        
        api_key = settings.groq_api_key
        if not settings.enable_remote_llm or not api_key or not _llm_endpoint_available():
            print("Remote LLM unavailable, using fallback insight")
            return _fallback_insight(data)
        
        client = Groq(api_key=api_key)
        
        # Format data for prompt - limit to 5 rows for speed
        data_str = json.dumps(data[:5])
        
        # Much simpler, faster prompt
        prompt = f"""Analyze this data result. Be concise (1-2 sentences only).

Question: {question}
Data: {data_str}

Key insight:"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,  # Lower temperature for faster, more consistent results
            max_tokens=100,   # Reduced from 200
            timeout=5.0,      # 5 second timeout
        )
        
        result = response.choices[0].message.content.strip()
        print(f"Insight generated successfully: {result[:50]}...")
        return result
    
    except Exception as e:
        print(f"LLM error: {e}")
        import traceback
        traceback.print_exc()
        return _fallback_insight(data)


def explain_sql_query(sql: str) -> str:
    """Explain SQL query using Groq API or fallback logic."""
    try:
        from groq import Groq
        
        api_key = settings.groq_api_key
        if not settings.enable_remote_llm or not api_key or not _llm_endpoint_available():
            print("Remote LLM unavailable, using fallback explanation")
            return _fallback_sql_explanation(sql)
        
        client = Groq(api_key=api_key)
        
        # Simpler, faster prompt
        prompt = f"""Explain this SQL query in 2-3 sentences:

{sql}

Explanation:"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=150,  # Reduced from 300
            timeout=5.0,     # 5 second timeout
        )
        
        result = response.choices[0].message.content.strip()
        print(f"SQL explanation generated successfully: {result[:50]}...")
        return result
    
    except Exception as e:
        print(f"SQL explanation error: {e}")
        import traceback
        traceback.print_exc()
        return _fallback_sql_explanation(sql)


def _fallback_insight(data: list) -> str:
    """Fallback insight generation without LLM."""
    if not data or len(data) == 0:
        return "No data to analyze."

    first_row = data[0]
    numeric_keys = [
        key for key, value in first_row.items()
        if isinstance(value, (int, float)) and not isinstance(value, bool)
    ]
    label_keys = [key for key in first_row.keys() if key not in numeric_keys]

    if numeric_keys:
        metric_key = numeric_keys[0]
        total = sum(row.get(metric_key, 0) for row in data if isinstance(row.get(metric_key), (int, float)))
        top_row = max(
            (row for row in data if isinstance(row.get(metric_key), (int, float))),
            key=lambda row: row.get(metric_key, 0),
            default=None,
        )

        if top_row:
            label = label_keys[0] if label_keys else "item"
            label_value = top_row.get(label, "Unknown")
            top_value = top_row.get(metric_key, 0)
            return (
                f"{label_value} has the highest {metric_key} at {top_value}. "
                f"The total {metric_key} across {len(data)} rows is {total}."
            )

    return f"Analysis complete. {len(data)} records retrieved and processed."


def _fallback_sql_explanation(sql: str) -> str:
    """Fallback SQL explanation without LLM."""
    return f"SQL Query:\n{sql}\n\nNote: LLM service not available. Please configure GROQ_API_KEY environment variable for detailed explanations."


def _llm_endpoint_available() -> bool:
    parsed = urlparse(settings.groq_base_url)
    host = parsed.hostname
    if not host:
        return False

    port = parsed.port or (443 if parsed.scheme == "https" else 80)

    try:
        with socket.create_connection((host, port), timeout=0.75):
            return True
    except OSError:
        return False


@app.post("/generate-insight")
async def generate_insight_endpoint(request: GenerateInsightRequest):
    """Generate insights from query results using LLM."""
    print(f"[DEBUG] Generate insight endpoint called")
    print(f"[DEBUG] Request: question={request.question[:50]}, sql_len={len(request.sql)}, data_len={len(request.data)}")
    
    try:
        question = request.question
        sql = request.sql
        data = request.data
        
        if not sql or not data:
            print(f"[DEBUG] Missing SQL or data")
            return {"insight": "Unable to generate insight without query results.", "error": "Missing data"}
        
        print(f"[DEBUG] Calling generate_insight_with_llm")
        insight = generate_insight_with_llm(question, sql, data)
        print(f"[DEBUG] Insight generated: {insight[:50]}")
        return {"insight": insight, "error": None}
    
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Exception in generate_insight_endpoint: {error_msg}")
        import traceback
        traceback.print_exc()
        # Always return valid JSON
        return {"insight": _fallback_insight(request.data), "error": error_msg}


@app.post("/explain-query")
async def explain_query_endpoint(request: ExplainQueryRequest):
    """Explain a SQL query using LLM."""
    print(f"[DEBUG] Explain query endpoint called")
    print(f"[DEBUG] Request: sql_len={len(request.sql)}")
    
    try:
        sql = request.sql
        
        if not sql:
            print(f"[DEBUG] Missing SQL")
            return {"explanation": "No SQL query provided.", "error": "Missing SQL"}
        
        print(f"[DEBUG] Calling explain_sql_query")
        explanation = explain_sql_query(sql)
        print(f"[DEBUG] Explanation generated: {explanation[:50]}")
        return {"explanation": explanation, "error": None}
    
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Exception in explain_query_endpoint: {error_msg}")
        import traceback
        traceback.print_exc()
        # Always return valid JSON
        return {"explanation": _fallback_sql_explanation(request.sql), "error": error_msg}


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to the Text-to-SQL API 🚀"}
