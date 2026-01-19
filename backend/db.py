import psycopg2
from psycopg2.extras import RealDictCursor
from flask import g

DB_CONFIG = {
    "dbname": "fifa_auction",
    "user": "postgres",
    "password": "fifa",
    "host": "localhost",
    "port": 5432,
}

def get_db():
    if "db" not in g:
        g.db = psycopg2.connect(
            **DB_CONFIG,
            cursor_factory=RealDictCursor
        )
    return g.db

def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()
