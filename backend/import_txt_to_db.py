import psycopg2
import json

DB_CONFIG = {
    "dbname": "fifa_auction",
    "user": "postgres",
    "password": "fifa",
    "host": "localhost",
    "port": 5432,
}

INPUT_FILE = "full_backup.txt"


def import_all_tables():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        with open(INPUT_FILE, "r", encoding="utf-8") as f:
            backup_data = json.load(f)

        for table_name, rows in backup_data.items():
            if not rows:
                continue

            columns = rows[0].keys()
            column_names = ", ".join(columns)
            placeholders = ", ".join(["%s"] * len(columns))

            insert_query = f"""
                INSERT INTO {table_name} ({column_names})
                VALUES ({placeholders})
            """

            for row in rows:
                cursor.execute(insert_query, list(row.values()))

        conn.commit()
        print("Full database imported successfully.")

    except Exception as e:
        print("Error:", e)
        conn.rollback()

    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    import_all_tables()
