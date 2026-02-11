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

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def drop_all_tables(cursor):
    tables = [
        "auction_players",
        "team_players",
        "auction_participants",
        "auction_results",
        "teams",
        "users",
        "auctions",
        "players"
    ]
    for table in tables:
        cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE;")
    print("Dropped all existing tables.")

def create_all_tables(cursor):
    # Users
    cursor.execute("""
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            fullname text NOT NULL,
            username text NOT NULL,
            password_hash text NOT NULL,
            created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Players
    cursor.execute("""
        CREATE TABLE players (
            id integer PRIMARY KEY,
            name text,
            overall integer,
            pac real,
            sho real,
            dri real,
            position_group text,
            nation text,
            club text,
            value integer,
            wage integer,
            potential integer,
            age integer,
            height integer,
            foot text,
            image_url text
        );
    """)

    # Auctions
    cursor.execute("""
        CREATE TABLE auctions (
            id SERIAL PRIMARY KEY,
            name text NOT NULL,
            season text,
            status text NOT NULL,
            start_date timestamp without time zone,
            end_date timestamp without time zone,
            join_code text,
            host_id integer,
            purse_per_team integer,
            bid_inc_min integer,
            bid_inc_mid integer,
            bid_inc_max integer,
            min_players integer DEFAULT 11,
            bidding_time integer DEFAULT 30,
            custom_bid_enabled boolean DEFAULT FALSE,
            start_time timestamp without time zone,
            end_time timestamp without time zone,
            total_bids integer DEFAULT 0
        );
    """)

    # Teams
    cursor.execute("""
        CREATE TABLE teams (
            id SERIAL PRIMARY KEY,
            name text NOT NULL,
            manager_id integer NOT NULL,
            rating integer,
            value integer,
            stars integer,
            status text,
            created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Auction Participants
    # Removed strict REFERENCES to allow inconsistent data import
    cursor.execute("""
        CREATE TABLE auction_participants (
            id SERIAL PRIMARY KEY,
            auction_id integer,
            user_id integer,
            team_id integer,
            joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
            team_name character varying,
            budget integer DEFAULT 0
        );
    """)

    # Auction Results
    # Removed strict REFERENCES to allow inconsistent data import
    cursor.execute("""
        CREATE TABLE auction_results (
            id SERIAL PRIMARY KEY,
            auction_id integer,
            team_id integer,
            user_id integer
        );
    """)

    # Team Players
    # Removed strict REFERENCES to allow inconsistent data import
    cursor.execute("""
        CREATE TABLE team_players (
            team_id integer,
            player_id integer,
            acquired_price integer,
            bid_count integer DEFAULT 0,
            PRIMARY KEY (team_id, player_id)
        );
    """)

    # Auction Players
    # Removed strict REFERENCES to allow inconsistent data import
    cursor.execute("""
        CREATE TABLE auction_players (
            auction_id integer,
            player_id integer,
            final_price integer,
            winning_team_id integer,
            PRIMARY KEY (auction_id, player_id)
        );
    """)
    
    print("Recreated all tables.")


def reset_sequences(cursor):
    # Reset SERIAL sequences to max(id) + 1 to avoid conflicts
    tables_with_serial = ["users", "teams", "auctions", "auction_participants", "auction_results"]
    
    for table in tables_with_serial:
        try:
            # Check if table has rows
            cursor.execute(f"SELECT MAX(id) FROM {table};")
            max_id = cursor.fetchone()[0]
            if max_id is not None:
                # Update sequence
                seq_name = f"{table}_id_seq"
                cursor.execute(f"SELECT setval('{seq_name}', %s);", (max_id,))
                print(f"Reset sequence for {table} to {max_id}.")
        except Exception as e:
            print(f"Skipping sequence reset for {table}: {e}")


def import_all_tables():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        drop_all_tables(cursor)
        create_all_tables(cursor)

        with open(INPUT_FILE, "r", encoding="utf-8") as f:
            backup_data = json.load(f)

        # Order of import matters for Foreign Keys?
        # Yes: Users, Players, Auctions -> Teams -> Participants, Results, Team_Players, Auction_Players
        # But standard loop might not respect order.
        # We should define an explicit order.
        
        insert_order = [
            "users", 
            "players", 
            "auctions", 
            "teams", 
            "auction_participants", 
            "auction_results", 
            "team_players", 
            "auction_players"
        ]

        # Map for ensuring we process all
        processed_tables = set()

        for table_name in insert_order:
            if table_name in backup_data:
                rows = backup_data[table_name]
                if not rows:
                    continue
                
                print(f"Importing {len(rows)} rows into {table_name}...")
                
                columns = rows[0].keys()
                column_names = ", ".join(columns)
                placeholders = ", ".join(["%s"] * len(columns))

                insert_query = f"""
                    INSERT INTO {table_name} ({column_names})
                    VALUES ({placeholders})
                """

                for row in rows:
                    cursor.execute(insert_query, list(row.values()))
                
                processed_tables.add(table_name)
        
        # Process any remaining tables (if new ones were added to backup but not in explicit list)
        for table_name, rows in backup_data.items():
            if table_name not in processed_tables:
                if not rows:
                    continue
                print(f"Importing {len(rows)} rows into {table_name} (unsorted)...")
                 # Logic same as above
                columns = rows[0].keys()
                column_names = ", ".join(columns)
                placeholders = ", ".join(["%s"] * len(columns))
                insert_query = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders})"
                for row in rows:
                    cursor.execute(insert_query, list(row.values()))

        # Reset sequences after import
        reset_sequences(cursor)

        conn.commit()
        print("Full database imported successfully.")

    except Exception as e:
        print("Error during import:", e)
        if conn:
            conn.rollback()

    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    import_all_tables()
