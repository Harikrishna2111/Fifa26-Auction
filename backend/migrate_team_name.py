import psycopg2

conn = psycopg2.connect(
    dbname="fifa_auction",
    user="postgres",
    password="postgres",
    host="10.133.206.100",
    port="5432"
)

cur = conn.cursor()

# Add team_name column
cur.execute("ALTER TABLE auction_participants ADD COLUMN IF NOT EXISTS team_name VARCHAR(100)")

# Add unique constraint
cur.execute("ALTER TABLE auction_participants DROP CONSTRAINT IF EXISTS auction_participants_auction_id_user_id_key")
cur.execute("ALTER TABLE auction_participants ADD CONSTRAINT auction_participants_auction_id_user_id_key UNIQUE (auction_id, user_id)")

conn.commit()
cur.close()
conn.close()

print("Migration completed: team_name column added to auction_participants")
