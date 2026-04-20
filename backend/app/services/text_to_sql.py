import re

from openai import OpenAI

from app.config import Settings

settings = Settings()
client = OpenAI(
    api_key=settings.groq_api_key,
    base_url=settings.groq_base_url,
)

SCHEMA = """
Database schema:
- users(id, name, email)
- products(id, name, price)
- orders(id, user_id, product_id, amount, created_at)
"""

SYSTEM_PROMPT = f"""
You are a SQL expert. Convert natural language questions into MySQL SELECT queries.

{SCHEMA}

Rules:
- Only SELECT queries
- No DELETE, UPDATE, DROP, INSERT, ALTER
- Use proper joins:
  orders.user_id -> users.id
  orders.product_id -> products.id
- Prefer explicit columns instead of SELECT *
- Return ONLY SQL (no explanation)
"""

FORBIDDEN = ["DELETE", "DROP", "UPDATE", "INSERT", "ALTER"]


def is_safe_sql(sql: str) -> bool:
    return not any(word in sql.upper() for word in FORBIDDEN)


def fallback_text_to_sql(user_question: str) -> str:
    normalized = re.sub(r"\s+", " ", user_question.strip().lower())

    if "total amount" in normalized and "user" in normalized:
        return """
SELECT
    users.name,
    SUM(orders.amount) AS total_amount
FROM orders
JOIN users ON orders.user_id = users.id
GROUP BY users.id, users.name
ORDER BY total_amount DESC
""".strip()

    if "count" in normalized and "order" in normalized and "user" in normalized:
        return """
SELECT
    users.name,
    COUNT(orders.id) AS orders_count
FROM orders
JOIN users ON orders.user_id = users.id
GROUP BY users.id, users.name
ORDER BY orders_count DESC
""".strip()

    if ("revenue" in normalized or "total amount" in normalized) and "product" in normalized:
        return """
SELECT
    products.name,
    SUM(orders.amount) AS total_amount
FROM orders
JOIN products ON orders.product_id = products.id
GROUP BY products.id, products.name
ORDER BY total_amount DESC
""".strip()

    if "month" in normalized or "monthly" in normalized:
        return """
SELECT
    YEAR(orders.created_at) AS year,
    MONTH(orders.created_at) AS month,
    COUNT(orders.id) AS orders_count
FROM orders
GROUP BY YEAR(orders.created_at), MONTH(orders.created_at)
ORDER BY year, month
""".strip()

    return "SELECT id, user_id, product_id, amount, created_at FROM orders LIMIT 20"


def text_to_sql(user_question: str) -> str:
    if not settings.enable_remote_llm:
        return fallback_text_to_sql(user_question)

    try:
        response = client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_question},
            ],
            temperature=0,
        )

        sql = response.choices[0].message.content.strip()
    except Exception as exc:
        print(f"[WARN] LLM unavailable, using fallback SQL: {exc}")
        sql = fallback_text_to_sql(user_question)

    code_block = re.search(r"```(?:\w+)?\s*([\s\S]*?)```", sql)
    if code_block:
        sql = code_block.group(1).strip()

    sql = sql.rstrip(";")

    if not is_safe_sql(sql):
        raise ValueError("Unsafe SQL generated")

    return sql
