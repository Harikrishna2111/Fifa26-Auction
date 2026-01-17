import pandas as pd
import sqlite3
import os

# ------------------------
# Paths
# ------------------------
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_file = os.path.join(base_dir, "../data.csv")
db_file = os.path.join(base_dir, "data.sqlite")

print(f"Reading CSV file: {csv_file}")
df = pd.read_csv(csv_file, low_memory=False)

print(f"Total rows: {len(df)}")
print(f"Total columns: {len(df.columns)}")

# ------------------------
# Position mapping
# ------------------------
FORWARD = {"ST", "CF", "LW", "RW", "LF", "RF"}
MIDFIELDER = {"CM", "CAM", "CDM", "LM", "RM", "LAM", "RAM", "LCM", "RCM", "LDM", "RDM"}
DEFENDER = {"CB", "LB", "RB", "LWB", "RWB", "LCB", "RCB"}
GOALKEEPER = {"GK"}

def map_position_group(pos_string):
    if pd.isna(pos_string):
        return None
    positions = set(pos_string.split(","))
    if positions & GOALKEEPER:
        return "Goalkeeper"
    if positions & FORWARD:
        return "Forward"
    if positions & MIDFIELDER:
        return "Midfielder"
    if positions & DEFENDER:
        return "Defender"
    return None

# ------------------------
# Filter & transform data
# ------------------------
players = pd.DataFrame({
    "id": df["player_id"],
    "name": df["short_name"],
    "overall": df["overall"],
    "pac": df["pace"],
    "sho": df["shooting"],
    "dri": df["dribbling"],
    "position_group": df["player_positions"].apply(map_position_group),
    "nation": df["nationality_name"],
    "club": df["club_name"],
    "value": df["value_eur"],
    "wage": df["wage_eur"],
    "potential": df["potential"],
    "age": df["age"],
    "height": df["height_cm"],
    "foot": df["preferred_foot"],
    "image_url": df["player_face_url"]
})

# Remove rows with missing position_group
players = players.dropna(subset=["position_group"])

print(f"Players after filtering: {len(players)}")

# Create SQLite database
print(f"Creating SQLite database: {db_file}")
conn = sqlite3.connect(db_file)
cursor = conn.cursor()

# Drop table if exists
cursor.execute("DROP TABLE IF EXISTS players")

# Create table
cursor.execute("""
    CREATE TABLE players (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        overall INTEGER,
        pac INTEGER,
        sho INTEGER,
        dri INTEGER,
        position_group TEXT,
        nation TEXT,
        club TEXT,
        value INTEGER,
        wage INTEGER,
        potential INTEGER,
        age INTEGER,
        height REAL,
        foot TEXT,
        image_url TEXT
    )
""")

# Insert data row by row
for idx, row in players.iterrows():
    cursor.execute("""
        INSERT INTO players (id, name, overall, pac, sho, dri, position_group, nation, club, value, wage, potential, age, height, foot, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        int(row['id']),
        row['name'],
        int(row['overall']) if pd.notna(row['overall']) else None,
        int(row['pac']) if pd.notna(row['pac']) else None,
        int(row['sho']) if pd.notna(row['sho']) else None,
        int(row['dri']) if pd.notna(row['dri']) else None,
        row['position_group'],
        row['nation'],
        row['club'],
        int(row['value']) if pd.notna(row['value']) else None,
        int(row['wage']) if pd.notna(row['wage']) else None,
        int(row['potential']) if pd.notna(row['potential']) else None,
        int(row['age']) if pd.notna(row['age']) else None,
        float(row['height']) if pd.notna(row['height']) else None,
        row['foot'],
        row['image_url']
    ))

# Create indexes
cursor.execute("CREATE INDEX idx_position ON players(position_group)")
cursor.execute("CREATE INDEX idx_overall ON players(overall)")
cursor.execute("CREATE INDEX idx_name ON players(name)")
cursor.execute("CREATE INDEX idx_club ON players(club)")

conn.commit()
conn.close()

print(f"✓ Successfully created SQLite database: {db_file}")
print(f"✓ Total players in database: {len(players)}")

# Drop rows without essential data
players.dropna(subset=["name", "overall", "position_group"], inplace=True)

print(f"Filtered players: {len(players)}")

# ------------------------
# Create SQLite DB
# ------------------------
print(f"Creating SQLite database: {db_file}")
conn = sqlite3.connect(db_file)

players.to_sql(
    "players",
    conn,
    if_exists="replace",
    index=False
)

conn.execute("CREATE INDEX IF NOT EXISTS idx_position ON players(position_group)")
conn.execute("CREATE INDEX IF NOT EXISTS idx_name ON players(name)")
conn.execute("CREATE INDEX IF NOT EXISTS idx_overall ON players(overall DESC)")

conn.commit()
conn.close()

print("Database created successfully")
