"""FastAPI application entry point."""

import json
import socket
from urllib.parse import urlparse

import mysql.connector
from fastapi import FastAPI
from pydantic import BaseModel
from app.config import Settings

from app.api.routes import health
from app.api.routes import query
from app.api.routes import dashboard
from app.api.routes import history
from fastapi.middleware.cors import CORSMiddleware

settings = Settings()

app = FastAPI(
    title="Text-to-SQL API",
    description="AI-powered analytics backend",
    version="0.1.0",
)

# ✅ CORS FIX (IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔥 allow all (fixes Vercel issue)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Request models
# -------------------------
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


# -------------------------
# Routes
# -------------------------
app.include_router(health.router, prefix="/health", tags=["health"])
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


# -------------------------
# LLM Functions
# -------------------------
def generate_insight_with_llm(question: str, sql: str, data: list) -> str:
    try:
        from groq import Groq
        
        api_key = settings.groq_api_key
        if not settings.enable_remote_llm or not api_key or not _llm_endpoint_available():
            return _fallback_insight(data)
        
        client = Groq(api_key=api_key)

        data_str = json.dumps(data[:5])

        prompt = f"""Analyze this data result. Be concise (1-2 sentences only).

Question: {question}
Data: {data_str}

Key insight:"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=100,
            timeout=5.0,
        )

        return response.choices[0].message.content.strip()

    except Exception:
        return _fallback_insight(data)


def explain_sql_query(sql: str) -> str:
    try:
        from groq import Groq
        
        api_key = settings.groq_api_key
        if not settings.enable_remote_llm or not api_key or not _llm_endpoint_available():
            return _fallback_sql_explanation(sql)
        
        client = Groq(api_key=api_key)

        prompt = f"""Explain this SQL query in 2-3 sentences:

{sql}

Explanation:"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=150,
            timeout=5.0,
        )

        return response.choices[0].message.content.strip()

    except Exception:
        return _fallback_sql_explanation(sql)


# -------------------------
# Fallbacks
# -------------------------
def _fallback_insight(data: list) -> str:
    if not data:
        return "No data to analyze."

    return f"{len(data)} records retrieved and analyzed."


def _fallback_sql_explanation(sql: str) -> str:
    return f"SQL Query:\n{sql}"


def _llm_endpoint_available() -> bool:
    parsed = urlparse(settings.groq_base_url)
    host = parsed.hostname
    port = parsed.port or 443

    try:
        with socket.create_connection((host, port), timeout=0.75):
            return True
    except OSError:
        return False


# -------------------------
# Endpoints
# -------------------------
@app.post("/generate-insight")
async def generate_insight_endpoint(request: GenerateInsightRequest):
    insight = generate_insight_with_llm(
        request.question, request.sql, request.data
    )
    return {"insight": insight, "error": None}


@app.post("/explain-query")
async def explain_query_endpoint(request: ExplainQueryRequest):
    explanation = explain_sql_query(request.sql)
    return {"explanation": explanation, "error": None}


@app.get("/")
async def root():
    return {"message": "Welcome to the Text-to-SQL API 🚀"}
