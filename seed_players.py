import csv
import psycopg2

# Database Configuration
DB_HOST = "localhost"
DB_NAME = "footyauction"
DB_USER = "admin"
DB_PASS = "password"
DB_PORT = "5432"

CSV_FILE_PATH = "data.csv"

def get_position_group(positions):
    """Simple logic to group specific positions into FWD/MID/DEF/GK"""
    first_pos = positions.split(',')[0].strip()
    
    if first_pos in ['GK']:
        return 'GK'
    elif first_pos in ['CB', 'LB', 'RB', 'LWB', 'RWB']:
        return 'DEF'
    elif first_pos in ['CDM', 'CM', 'CAM', 'LM', 'RM']:
        return 'MID'
    else:
        return 'FWD' # ST, CF, LW, RW, etc.

def seed_database():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT
        )
        cur = conn.cursor()
        print("✅ Connected to Database")

        with open(CSV_FILE_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            count = 0
            for row in reader:
                try:
                    # MAP CSV COLUMNS TO DATABASE COLUMNS
                    player_id = row['player_id']
                    name = row['short_name']
                    positions = row['player_positions']
                    rating = row['overall']
                    club = row['club_name']
                    nation = row['nationality_name']
                    image_url = row['player_face_url']
                    market_val = row.get('value_eur', 0) # Default to 0 if missing

                    # Calculate Position Group (FWD/MID/DEF)
                    pos_group = get_position_group(positions)

                    cur.execute("""
                        INSERT INTO players (id, name, position_group, rating, club, nation, image_url, market_value)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO NOTHING;
                    """, (player_id, name, pos_group, rating, club, nation, image_url, market_val))
                    
                    count += 1
                    if count % 1000 == 0:
                        print(f"   Processed {count} players...")
                        
                except Exception as e:
                    print(f"⚠️ Skipped a row due to error: {e}")
                    continue

        conn.commit()
        cur.close()
        conn.close()
        print(f"🎉 Success! Imported {count} players into the database.")

    except Exception as e:
        print(f"❌ Critical Error: {e}")

if __name__ == "__main__":
    seed_database()