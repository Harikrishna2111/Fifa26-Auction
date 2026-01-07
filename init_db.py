def init_db():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS lobbies (
        lobby_code TEXT PRIMARY KEY,
        admin TEXT,
        status TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lobby_code TEXT,
        name TEXT,
        budget INTEGER
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS squad (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lobby_code TEXT,
        team_name TEXT,
        player_name TEXT,
        price INTEGER
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS unsold (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lobby_code TEXT,
        player_name TEXT
    )
    """)

    db.commit()
    db.close()
init_db()
