import pandas as pd
import psycopg2

# -----------------------------
# CONFIG
# -----------------------------
CSV_PATH = "data.csv"

POSTGRES_CONFIG = {
    "dbname": "fifa_auction",
    "user": "postgres",
    "password": "fifa",
    "host": "localhost",
    "port": 5432,
}

# -----------------------------
# LOAD CSV
# -----------------------------
print(" Loading CSV...")
df = pd.read_csv(CSV_PATH, usecols=["player_id", "player_face_url"])

# Drop empty URLs
df = df.dropna(subset=["player_face_url"])

print(f"Found {len(df)} player images to update")

# -----------------------------
# CONNECT POSTGRES
# -----------------------------
conn = psycopg2.connect(**POSTGRES_CONFIG)
cur = conn.cursor()

# -----------------------------
# UPDATE QUERY
# -----------------------------
update_query = """
    UPDATE players
    SET image_url = %s
    WHERE id = %s
"""

updated = 0

for _, row in df.iterrows():
    cur.execute(update_query, (row["player_face_url"], int(row["player_id"])))
    if cur.rowcount > 0:
        updated += 1

conn.commit()
cur.close()
conn.close()

print(f" Updated image URLs for {updated} players")
