import psycopg2

# -----------------------
# CONFIG
# -----------------------
DB_CONFIG = {
    "dbname": "fifa_auction",
    "user": "postgres",
    "password": "fifa",
    "host": "localhost",
    "port": 5432,
}

# -----------------------
# CONNECT
# -----------------------
conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

# -----------------------
# QUERY
# -----------------------
cur.execute("""
    SELECT
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
""")

rows = cur.fetchall()

# -----------------------
# PRINT
# -----------------------
current_table = None
for table, column, dtype, nullable, default in rows:
    if table != current_table:
        print(f"\n TABLE: {table}")
        print("-" * (8 + len(table)))
        current_table = table

    print(
        f"  • {column:<20} {dtype:<15} "
        f"{'NULL' if nullable == 'YES' else 'NOT NULL'} "
        f"{f'DEFAULT {default}' if default else ''}"
    )

# -----------------------
# CLEANUP
# -----------------------
cur.close()
conn.close()
