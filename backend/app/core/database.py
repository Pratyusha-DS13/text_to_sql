"""SQLAlchemy MySQL database connection."""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import Settings

settings = Settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=settings.debug,
    future=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_connection():
    """Test database connection and fetch one row."""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1 AS test"))
        return result.fetchone()


if __name__ == "__main__":
    row = test_connection()
    print(f"Connection OK. Fetched row: {row}")
