import csv
import psycopg2
import os

# 1. Database Configuration
DB_HOST = "localhost"
DB_NAME = "footyauction"
DB_USER = "admin"
DB_PASS = "password"
DB_PORT = "5432"

# 2. Path to your CSV file
# Ensure 'data.csv' is in the SAME folder as this script
CSV_FILE_PATH = "data.csv"

def seed_database():
    try:
        # Connect to Postgres
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT
        )
        cur = conn.cursor()
        print("✅ Connected to Database")

        # Open the CSV file
        with open(CSV_FILE_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            count = 0
            for row in reader:
                # MAP YOUR CSV COLUMNS HERE
                # Adjust 'row["Name"]' etc. to match EXACT headers in your data.csv
                try:
                    cur.execute("""
                        INSERT INTO players (id, name, position_group, rating, club, nation, image_url)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO NOTHING;
                    """, (
                        row['id'],            # FIFA ID column
                        row['name'],          # Name column
                        row['position'],      # Position column
                        row['overall'],       # Rating/Overall column
                        row['club'],          # Club column
                        row['nation'],        # Nation column
                        row['image_url']      # Image URL column
                    ))
                    count += 1
                except KeyError as e:
                    print(f"❌ Error: Your CSV is missing column: {e}")
                    return

        conn.commit()
        cur.close()
        conn.close()
        print(f"🎉 Success! Imported {count} players into the database.")

    except Exception as e:
        print(f"❌ Failed to connect or insert: {e}")

if __name__ == "__main__":
    seed_database()