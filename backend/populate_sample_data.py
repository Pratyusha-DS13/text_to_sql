from sqlalchemy import create_engine, text
from app.config import Settings

s = Settings()
engine = create_engine(s.database_url)

with engine.connect() as conn:
    conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
    conn.execute(text("TRUNCATE TABLE orders"))
    conn.execute(text("TRUNCATE TABLE users"))
    conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))

    conn.execute(text(
        "INSERT INTO users (name, email) VALUES "
        "('Alice', 'alice@example.com'), "
        "('Bob', 'bob@example.com'), "
        "('Charlie', 'charlie@example.com'), "
        "('Diana', 'diana@example.com')"
    ))

    conn.execute(text(
        "INSERT INTO orders (user_id, product_id, amount) VALUES "
        "(1, 1, 50000), "
        "(1, 2, 20000), "
        "(2, 2, 20000), "
        "(3, 2, 15000), "
        "(4, 1, 26000), "
        "(4, 2, 10000), "
        "(4, 1, 5000)"
    ))

    conn.commit()

print('Inserted sample users and orders')
