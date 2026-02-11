import psycopg2
from psycopg2.extras import RealDictCursor
import json

DB_CONFIG = {
    "dbname": "fifa_auction",
    "user": "postgres",
    "password": "fifa",
    "host": "localhost",
    "port": 5432,
}

OUTPUT_FILE = "full_backup.txt"


def export_all_tables():
    try:
        conn = psycopg2.connect(
            **DB_CONFIG,
            cursor_factory=RealDictCursor
        )
        cursor = conn.cursor()

        # Get all table names
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public';
        """)

        tables = cursor.fetchall()
        backup_data = {}

        for table in tables:
            table_name = table["table_name"]
            cursor.execute(f"SELECT * FROM {table_name};")
            rows = cursor.fetchall()
            backup_data[table_name] = rows

        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(backup_data, f, indent=4, default=str)

        print("Full database exported successfully.")

    except Exception as e:
        print("Error:", e)

    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    export_all_tables()
