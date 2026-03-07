import psycopg2
from psycopg2.extras import RealDictCursor
from flask import g
import os

def get_db():
    if "db" not in g:
        database_url = os.environ.get("DATABASE_URL")
        if database_url:
            g.db = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
        else:
            # On hosted runtimes (Render/Vercel), DATABASE_URL must be set.
            is_hosted = os.environ.get("RENDER") == "true" or bool(os.environ.get("RENDER_SERVICE_ID"))
            if is_hosted:
                raise RuntimeError("DATABASE_URL is not set in the deployment environment")

            # Fallback to local config for development.
            db_config = {
                "dbname": "fifa_auction",
                "user": "postgres",
                "password": "fifa",
                "host": "localhost",
                "port": 5432,
            }
            g.db = psycopg2.connect(**db_config, cursor_factory=RealDictCursor)
    return g.db

def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()
