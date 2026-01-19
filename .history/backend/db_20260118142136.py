import psycopg2
from flask import g

# Docker Database Credentials
DB_HOST = "localhost"
DB_NAME = "footyauction"
DB_USER = "admin"
DB_PASS = "password"

def get_db():
    if 'db' not in g:
        g.db = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()