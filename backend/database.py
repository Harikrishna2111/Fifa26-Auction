import sqlite3
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir, "data.sqlite")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("""
INSERT INTO auction_players (auction_id, player_id, final_price, winning_team_id)
VALUES
(1, 252371, 110000000, 1),
(1, 239053, 95000000, 1),
(3, 212622, 85000000, 2);


""")

conn.commit()
conn.close()

print("users table created successfully")
