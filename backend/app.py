from flask import Flask, request, jsonify, g
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db, close_db
import psycopg2
import psycopg2.extras
import redis
import json
import traceback
import threading
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO (Async Mode for Timers)
socketio = SocketIO(
    app, 
    cors_allowed_origins="*", 
    async_mode='threading',
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25
)

# Initialize Redis (For Live Auction State)
class MockRedis:
    def __init__(self):
        self.store = {}
    
    def get(self, name):
        return self.store.get(name)
        
    def set(self, name, value):
        self.store[name] = value
        return True
        
    def hset(self, name, mapping):
        if name not in self.store:
            self.store[name] = {}
        self.store[name].update(mapping)
        return len(mapping)
        
    def hgetall(self, name):
        return self.store.get(name, {})
        
    def delete(self, *names):
        count = 0
        for name in names:
            if name in self.store:
                del self.store[name]
                count += 1
        return count
        
    def sadd(self, name, *values):
        if name not in self.store:
            self.store[name] = set()
        
        count = 0
        # Ensure name points to a set
        if not isinstance(self.store[name], set):
             self.store[name] = set() # Overwrite if conflict for mock
             
        for v in values:
            if v not in self.store[name]:
                self.store[name].add(v)
                count += 1
        return count

    def srem(self, name, *values):
        if name not in self.store or not isinstance(self.store[name], set):
            return 0
        count = 0
        for v in values:
            if v in self.store[name]:
                self.store[name].remove(v)
                count += 1
        return count
        
    def scard(self, name):
         if name in self.store and isinstance(self.store[name], set):
             return len(self.store[name])
         return 0
    
    def sismember(self, name, value):
        """Check if value is a member of the set stored at key name"""
        if name in self.store and isinstance(self.store[name], set):
            return value in self.store[name]
        return False
    
    def rpush(self, name, *values):
        if name not in self.store:
             self.store[name] = []
        if not isinstance(self.store[name], list):
             self.store[name] = []
        self.store[name].extend(values)
        return len(self.store[name])
        
    def incr(self, name, amount=1):
        val = int(self.store.get(name, 0))
        val += amount
        self.store[name] = val
        return val

try:
    r = redis.Redis(host='10.130.81.230', port=6379, decode_responses=True)
    r.ping() # Test connection
    print("✓ Redis connected successfully")
except redis.exceptions.ConnectionError:
    print("WARNING: Redis connection failed. Using in-memory fallback (MockRedis).")
    r = MockRedis()

app.teardown_appcontext(close_db)

# Tracks socket session -> auction/user context for disconnect handling.
sid_context = {}

@app.route("/api/auth/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return "", 200
        
    data = request.json

    fullname = data.get("fullname")
    username = data.get("username")
    password = data.get("password")

    if not fullname or not username or not password:
        return jsonify({"error": "All fields are required"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    # Check if username already exists
    cur.execute("SELECT id FROM users WHERE username = %s", (username,))
    existing = cur.fetchone()
    
    if existing:
        cur.close()
        print(f"Registration failed: Username '{username}' already exists (ID: {existing['id']})")
        return jsonify({"error": "Username already exists"}), 409
    
    password_hash = generate_password_hash(password)
    
    try:
        cur.execute(
            "INSERT INTO users (fullname, username, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (fullname, username, password_hash)
        )
        result = cur.fetchone()
        conn.commit()
        cur.close()
        print(f"User '{username}' registered successfully with ID: {result['id']}")
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        conn.rollback()
        cur.close()
        print(f"Registration error: {str(e)}")
        return jsonify({"error": "Registration failed"}), 500

@app.route("/api/auth/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return "", 200
        
    data = request.json

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        "SELECT * FROM users WHERE username = %s",
        (username,)
    )
    user = cur.fetchone()
    cur.close()

    if not user:
        print(f"Login failed: User '{username}' not found in database")
        return jsonify({"error": "Invalid username or password"}), 401

    if not check_password_hash(user["password_hash"], password):
        print(f"Login failed: Invalid password for user '{username}'")
        return jsonify({"error": "Invalid username or password"}), 401

    print(f"Login successful for user '{username}'")
    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "fullname": user["fullname"],
            "username": user["username"]
        }
    })

@app.route("/api/players", methods=["GET", "OPTIONS"])
def get_players():
    if request.method == "OPTIONS":
        return "", 200
        
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    search = request.args.get("search", "").strip()
    position = request.args.get("position", "")
    limit = int(request.args.get("limit", 1000))
    offset = int(request.args.get("offset", 0))

    query = """
        SELECT
            id,
            name,
            position_group,
            overall,
            pac,
            sho,
            dri,
            nation,
            club,
            value,
            wage,
            potential,
            age,
            height,
            foot,
            image_url
        FROM players
        WHERE 1=1
    """

    params = []

    if position:
        query += " AND position_group = %s"
        params.append(position)

    if search:
        query += """
            AND (
                name ILIKE %s
                OR club ILIKE %s
                OR nation ILIKE %s
            )
        """
        like = f"%{search}%"
        params.extend([like, like, like])

    query += """
        ORDER BY overall DESC
        LIMIT %s OFFSET %s
    """

    params.extend([limit, offset])

    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    players = [dict(row) for row in rows]
    return jsonify(players)

@app.route("/api/dashboard/<int:user_id>", methods=["GET"])
def manager_dashboard(user_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Manager info
    cur.execute(
        "SELECT id, fullname FROM users WHERE id = %s",
        (user_id,)
    )
    user = cur.fetchone()

    if not user:
        cur.close()
        return jsonify({"error": "User not found"}), 404

    # Past Auctions
    cur.execute("""
        SELECT 
            a.id,
            a.name,
            CASE 
                WHEN a.season = '0' OR a.season IS NULL OR a.season = '' THEN 'One-off'
                ELSE CONCAT('Season ', a.season)
            END AS season,
            a.status,
            a.end_date,
            t.name AS acquired_team
        FROM auctions a
        JOIN auction_participants part ON part.auction_id = a.id
        LEFT JOIN teams t ON part.team_id = t.id
        WHERE a.status IN ('COMPLETED', 'PAUSED')
          AND part.user_id = %s
        GROUP BY a.id, t.name
        ORDER BY a.end_date DESC
        LIMIT 3
    """, (user_id,))
    past_auctions = cur.fetchall()

    auctions_data = [
        {
            "id": row["id"],
            "name": row["name"],
            "season": row["season"],
            "status": row["status"],
            "end_date": row["end_date"],
            "acquired_team": row["acquired_team"]
        }
        for row in past_auctions
    ]

    # My Teams - Show all teams (including from completed auctions)
    # Calculate rating and value from actual players
    cur.execute("""
        SELECT
            t.id,
            t.name,
            t.stars,
            t.status,
            COALESCE(ROUND(AVG(p.overall)), 0) AS rating,
            COALESCE(SUM(p.value), 0) AS value,
            CASE
                WHEN a.status IN ('LIVE', 'PAUSED') THEN 'ACTIVE'
                WHEN a.status = 'COMPLETED' THEN 'COMPLETED'
                ELSE 'IDLE'
            END AS display_status
        FROM teams t
        LEFT JOIN auction_participants ap ON ap.team_id = t.id
        LEFT JOIN auctions a ON a.id = ap.auction_id
        LEFT JOIN team_players tp ON tp.team_id = t.id
        LEFT JOIN players p ON p.id = tp.player_id
        WHERE t.manager_id = %s
        GROUP BY t.id, a.status
        ORDER BY 
            CASE 
                WHEN a.status IN ('LIVE', 'PAUSED') THEN 1
                WHEN a.status = 'COMPLETED' THEN 2
                ELSE 3
            END,
            t.created_at DESC
        LIMIT 3
    """, (user_id,))
    teams = cur.fetchall()

    teams_data = []

    for team in teams:
        cur.execute("""
            SELECT p.id, p.name, p.image_url
            FROM team_players tp
            JOIN players p ON tp.player_id = p.id
            WHERE tp.team_id = %s
            LIMIT 4
        """, (team["id"],))
        players = cur.fetchall()

        teams_data.append({
            "id": team["id"],
            "name": team["name"],
            "rating": team["rating"],
            "value": team["value"],
            "stars": team["stars"],
            "status": team.get("display_status") or team["status"],
            "players": [
                {
                    "id": p["id"],
                    "name": p["name"],
                    "image_url": p["image_url"]
                } for p in players
            ]
        })

    cur.close()

    return jsonify({
        "manager": {
            "id": user["id"],
            "fullname": user["fullname"]
        },
        "past_auctions": auctions_data,
        "teams": teams_data
    })


@app.route("/api/auctions", methods=["GET"])
def get_all_auctions():
    user_id = request.args.get("user_id", type=int) # Optional

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Filter to only show auctions the user participated in (JOIN auction_participants)
    cur.execute("""
        SELECT
            a.id                    AS auction_id,
            a.name                  AS auction_name,
            a.season,
            a.status,
            a.start_date,
            a.end_date,

            t.id                    AS team_id,
            t.name                  AS team_name,
            t.stars,

            COUNT(tp.player_id)     AS player_count

        FROM auctions a
        JOIN auction_participants ap
            ON a.id = ap.auction_id AND ap.user_id = %s
        LEFT JOIN teams t
            ON t.id = ap.team_id
        LEFT JOIN team_players tp
            ON tp.team_id = t.id

        GROUP BY
            a.id,
            t.id

        ORDER BY
            COALESCE(a.end_date, a.start_date) DESC
    """, (user_id,))

    rows = cur.fetchall()
    cur.close()

    result = []
    for r in rows:
        # Determine type based on season column
        # 0 -> ONE-OFF, anything else -> SEASONAL
        season_val = r["season"]
        is_seasonal = True
        if str(season_val) == '0' or season_val == 0 or season_val == 'One-off':
            is_seasonal = False

        result.append({
            "auctionId": r["auction_id"],
            "name": r["auction_name"],
            "season": season_val if is_seasonal else "One-off", # Display 'One-off' if 0
            "type": "SEASONAL" if is_seasonal else "ONE-OFF",
            "status": r["status"],
            "displayDate": (
                r["end_date"] or r["start_date"]
            ).strftime("%b %d, %Y") if (r["end_date"] or r["start_date"]) else "TBD",

            "team": {
                "id": r["team_id"],
                "name": r["team_name"],
                "stars": r["stars"],
                "playerCount": r["player_count"]
            } if r["team_id"] else None
        })
    return jsonify(result)


@app.route("/api/auctions/history", methods=["GET"])
def auction_history():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT
            a.id                    AS auction_id,
            a.name                  AS auction_name,
            a.season,
            a.status,
            a.start_date,
            a.end_date,

            t.id                    AS team_id,
            t.name                  AS team_name,
            t.stars,

            COUNT(tp.player_id)     AS player_count

        FROM auction_results ar
        JOIN auctions a
            ON a.id = ar.auction_id
        JOIN teams t
            ON t.id = ar.team_id
        LEFT JOIN team_players tp
            ON tp.team_id = t.id

        WHERE ar.user_id = %s

        GROUP BY
            a.id,
            t.id

        ORDER BY
            COALESCE(a.end_date, a.start_date) DESC
    """, (user_id,))

    rows = cur.fetchall()
    cur.close()

    result = []
    for r in rows:
        result.append({
            "auctionId": r["auction_id"],
            "name": r["auction_name"],
            "season": r["season"],
            "type": "SEASONAL" if r["season"] != 'One-off' else "ONE-OFF",
            "status": r["status"],
            "displayDate": (
                r["end_date"] or r["start_date"]
            ).strftime("%b %d, %Y"),

            "team": {
                "id": r["team_id"],
                "name": r["team_name"],
                "stars": r["stars"],
                "playerCount": r["player_count"]
            }
        })

    return jsonify(result), 200


@app.route("/api/auctions/<int:auction_id>/squad", methods=["GET"])
def auction_squad(auction_id):
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Find the team for this user in the given auction (Live Support)
    # 1. Check auction_participants for a linked team_id
    cur.execute(
        "SELECT team_id, team_name FROM auction_participants WHERE auction_id = %s AND user_id = %s",
        (auction_id, user_id)
    )
    row = cur.fetchone()
    
    team_id = None
    team_name = None
    
    if row:
        team_id = row.get("team_id")
        team_name = row.get("team_name")
        
    # 2. Fallback: If no linked team_id, check 'teams' table by manager_id and team_name (from participant)
    if not team_id:
        # Strict mode: Do not look up old teams. If no team is linked in auction_participants, 
        # it means the user hasn't bought any players yet in THIS specific auction.
        pass
        cur.close()
        return jsonify([]), 200

    # Fetch the players for the team with acquired price
    cur.execute(
        """
        SELECT
            p.id,
            p.name,
            p.overall AS rating,
            p.position_group AS pos,
            p.image_url AS img,
            tp.acquired_price AS price
        FROM team_players tp
        JOIN players p ON tp.player_id = p.id
        WHERE tp.team_id = %s
        ORDER BY tp.acquired_price DESC NULLS LAST, p.overall DESC
        """,
        (team_id,)
    )

    rows = cur.fetchall()
    cur.close()

    players = [
        {
            "id": r["id"],
            "name": r["name"],
            "rating": r["rating"],
            "pos": r["pos"],
            "img": r["img"],
            "price": r["price"]
        }
        for r in rows
    ]

    return jsonify(players), 200



@app.route("/api/teams/manage")
def manage_teams():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Modified query to include teams from completed auctions
    # We join with auction_participants to find all teams associated with the user's auctions
    # Calculate rating and value from actual players
    cur.execute("""
        SELECT
            t.id AS team_id,
            t.name AS team_name,
            COALESCE(ROUND(AVG(p.overall)), 0) AS team_ovr,
            t.status,
            COALESCE(SUM(p.value), 0) AS market_value,
            COUNT(tp.player_id) AS player_count,

            CASE
                WHEN a.status IN ('LIVE', 'PAUSED') THEN 'ACTIVE'
                WHEN a.status = 'COMPLETED' THEN 'COMPLETED'
                ELSE 'IDLE'
            END AS auction_state

        FROM teams t
        LEFT JOIN team_players tp ON tp.team_id = t.id
        LEFT JOIN players p ON p.id = tp.player_id
        LEFT JOIN auction_participants ap ON ap.team_id = t.id
        LEFT JOIN auctions a ON a.id = ap.auction_id

        WHERE t.manager_id = %s

        GROUP BY t.id, a.status
        ORDER BY 
            CASE 
                WHEN a.status IN ('LIVE', 'PAUSED') THEN 1
                WHEN a.status = 'COMPLETED' THEN 2
                ELSE 3
            END,
            t.name
    """, (user_id,))

    teams = cur.fetchall()

    # Fetch player avatars per team
    result = []
    for team in teams:
        cur.execute("""
            SELECT image_url
            FROM players p
            JOIN team_players tp ON tp.player_id = p.id
            WHERE tp.team_id = %s
            LIMIT 4
        """, (team["team_id"],))

        avatars = [r["image_url"] for r in cur.fetchall()]

        result.append({
            "id": team["team_id"],
            "name": team["team_name"],
            "league": "EUROPE",  # placeholder (can be improved later)
            "status": team["auction_state"],
            "teamOVR": team["team_ovr"],
            "marketValue": team["market_value"],
            "playerCount": team["player_count"],
            "avatars": avatars
        })

    cur.close()
    return jsonify(result)


@app.route('/api/teams/<int:team_id>/players', methods=['GET'])
def team_players(team_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # Try to fetch with formation positions (if tables exist)
        cur.execute(
            """
            SELECT
                p.id,
                p.name,
                p.overall AS rating,
                p.position_group AS pos,
                p.image_url AS img,
                tp.acquired_price AS price,
                COALESCE(tfp.position_type, 'reserve') AS position_type,
                COALESCE(tfp.position_index, 999) AS position_index
            FROM team_players tp
            JOIN players p ON tp.player_id = p.id
            LEFT JOIN team_formation_positions tfp ON tfp.team_id = tp.team_id AND tfp.player_id = p.id
            WHERE tp.team_id = %s
            ORDER BY 
                CASE 
                    WHEN tfp.position_type = 'pitch' THEN 1
                    WHEN tfp.position_type = 'sub' THEN 2
                    ELSE 3
                END,
                tfp.position_index ASC NULLS LAST,
                tp.acquired_price DESC NULLS LAST,
                p.overall DESC
            """,
            (team_id,)
        )
        rows = cur.fetchall()
    except Exception as e:
        # If formation tables don't exist, fall back to simple query
        print(f"Formation tables not found, using fallback query: {e}")
        conn.rollback()  # Rollback the failed transaction
        cur.close()  # Close the old cursor
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)  # Create new cursor
        cur.execute(
            """
            SELECT
                p.id,
                p.name,
                p.overall AS rating,
                p.position_group AS pos,
                p.image_url AS img,
                tp.acquired_price AS price
            FROM team_players tp
            JOIN players p ON tp.player_id = p.id
            WHERE tp.team_id = %s
            ORDER BY tp.acquired_price DESC NULLS LAST, p.overall DESC
            """,
            (team_id,)
        )
        rows = cur.fetchall()

    cur.close()

    players = [
        {
            'id': r['id'],
            'name': r['name'],
            'rating': r['rating'],
            'pos': r['pos'],
            'img': r['img'],
            'price': r['price']
        }
        for r in rows
    ]

    return jsonify(players), 200


@app.route('/api/teams/<int:team_id>/formation', methods=['GET'])
def get_team_formation(team_id):
    """Get saved formation for a team"""
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        # Get formation type
        cur.execute(
            "SELECT formation_type FROM team_formations WHERE team_id = %s",
            (team_id,)
        )
        formation_row = cur.fetchone()
        
        if not formation_row:
            cur.close()
            return jsonify({"formation_type": None, "players": []}), 200
        
        # Get player positions
        cur.execute(
            """
            SELECT player_id, position_type, position_index
            FROM team_formation_positions
            WHERE team_id = %s
            ORDER BY 
                CASE 
                    WHEN position_type = 'pitch' THEN 1
                    WHEN position_type = 'sub' THEN 2
                    ELSE 3
                END,
                position_index ASC
            """,
            (team_id,)
        )
        positions = cur.fetchall()
        cur.close()
        
        return jsonify({
            "formation_type": formation_row["formation_type"],
            "players": [
                {
                    "player_id": p["player_id"],
                    "position_type": p["position_type"],
                    "position_index": p["position_index"]
                }
                for p in positions
            ]
        }), 200
    except Exception as e:
        # Tables don't exist yet, return empty formation
        print(f"Formation tables not found: {e}")
        cur.close()
        return jsonify({"formation_type": None, "players": []}), 200


@app.route('/api/teams/<int:team_id>/formation', methods=['POST'])
def save_team_formation(team_id):
    """Save formation for a team"""
    data = request.get_json()
    formation_type = data.get('formation_type')
    players = data.get('players', [])
    
    if not formation_type:
        return jsonify({"error": "formation_type is required"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    
    try:
        # Insert or update formation type
        cur.execute(
            """
            INSERT INTO team_formations (team_id, formation_type, updated_at)
            VALUES (%s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (team_id) 
            DO UPDATE SET formation_type = EXCLUDED.formation_type, updated_at = CURRENT_TIMESTAMP
            """,
            (team_id, formation_type)
        )
        
        # Delete existing positions
        cur.execute(
            "DELETE FROM team_formation_positions WHERE team_id = %s",
            (team_id,)
        )
        
        # Insert new positions
        for player in players:
            cur.execute(
                """
                INSERT INTO team_formation_positions (team_id, player_id, position_type, position_index)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (team_id, player_id)
                DO UPDATE SET position_type = EXCLUDED.position_type, position_index = EXCLUDED.position_index
                """,
                (team_id, player['player_id'], player['position_type'], player['position_index'])
            )
        
        conn.commit()
        cur.close()
        
        return jsonify({"message": "Formation saved successfully"}), 200
        
    except Exception as e:
        conn.rollback()
        cur.close()
        print(f"Error saving formation: {e}")
        return jsonify({"error": "Failed to save formation"}), 500


@app.route("/api/players/market")
def get_market_players():
    # query params
    search = request.args.get("search", "").strip()
    position = request.args.get("position", "ALL")
    try:
        limit = int(request.args.get("limit", 18))
    except Exception:
        limit = 18
    try:
        offset = int(request.args.get("offset", 0))
    except Exception:
        offset = 0

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Build WHERE clause safely
    where_clauses = ["1=1"]
    params = []

    if search:
        like = f"%{search.lower()}%"
        where_clauses.append("(LOWER(name) LIKE %s OR LOWER(club) LIKE %s OR LOWER(nation) LIKE %s)")
        params.extend([like, like, like])

    # support group filters (FWD/MID/DEF/GK) -> map to actual position_group values
    if position and position != "ALL":
        # include both human-readable groups and common position codes
        group_map = {
            'FWD': ['Forward','ST','CF','LF','RF','LW','RW','LS','RS'],
            'MID': ['Midfielder','CAM','CM','CDM','LM','RM'],
            'DEF': ['Defender','LB','LWB','RWB','RB','CB'],
            'GK': ['Goalkeeper','GK']
        }
        if position in group_map:
            vals = group_map[position]
            placeholders = ",".join(["%s"] * len(vals))
            where_clauses.append(f"position_group IN ({placeholders})")
            params.extend(vals)
        else:
            where_clauses.append("position_group = %s")
            params.append(position)

    where_sql = " WHERE " + " AND ".join(where_clauses)

    # total count
    count_sql = "SELECT COUNT(*) AS total FROM players" + where_sql
    cur.execute(count_sql, params)
    total_row = cur.fetchone()
    total = total_row["total"] if total_row else 0

    # fetch page
    query = f"SELECT id, name, overall, pac, sho, dri, position_group, club, nation, value, image_url FROM players {where_sql} ORDER BY overall DESC LIMIT %s OFFSET %s"
    page_params = params + [limit, offset]
    cur.execute(query, page_params)
    players = cur.fetchall()
    cur.close()
    for i in players:
        if i["position_group"] == 'Forward':
            i["position_group"] = "FWD"
        elif i["position_group"] == 'Midfielder':
            i["position_group"] = "MID"
        elif i["position_group"] == 'Defender':
            i["position_group"] = "DEF"
        elif i["position_group"] == 'Goalkeeper':
            i["position_group"] = "GK"
    return jsonify({"total": total, "players": players})


@app.route('/api/teams', methods=['POST'])
def create_team():
    data = request.json or {}
    name = data.get('name')
    manager_id = data.get('manager_id')
    players = data.get('players', [])

    if not name:
        return jsonify({"error": "Team name is required"}), 400
    if not manager_id:
        return jsonify({"error": "manager_id is required"}), 400

    conn = get_db()
    cur = conn.cursor()

    try:
        # compute team rating (avg of players.overall) and market value (sum of players.value)
        player_ids = [int(p.get('player_id')) for p in players if p.get('player_id')]
        team_rating = 0
        team_value = 0
        if player_ids:
            placeholders = ','.join(['%s'] * len(player_ids))
            agg_sql = f"SELECT AVG(overall) AS avg_overall, COALESCE(SUM(value),0) AS total_value FROM players WHERE id IN ({placeholders})"
            cur.execute(agg_sql, tuple(player_ids))
            agg = cur.fetchone()
            if isinstance(agg, dict):
                avg_overall = agg.get('avg_overall') or 0
                total_value = agg.get('total_value') or 0
            else:
                avg_overall = agg[0] or 0
                total_value = agg[1] or 0
            try:
                team_rating = int(round(float(avg_overall)))
            except Exception:
                team_rating = int(avg_overall or 0)
            team_value = int(total_value or 0)

        cur.execute(
            "INSERT INTO teams (name, manager_id, rating, value, status, created_at) VALUES (%s, %s, %s, %s, %s, now()) RETURNING id",
            (name, manager_id, team_rating, team_value, 'IDLE')
        )
        new_row = cur.fetchone()
        if isinstance(new_row, dict):
            team_id = new_row.get('id')
        else:
            team_id = new_row[0]

        # insert team_players if provided
        for p in players:
            player_id = p.get('player_id')
            acquired_price = p.get('acquired_price')
            if player_id:
                cur.execute(
                    "INSERT INTO team_players (team_id, player_id, acquired_price) VALUES (%s, %s, %s)",
                    (team_id, player_id, acquired_price)
                )

        conn.commit()
    except Exception as e:
        conn.rollback()
        # print traceback to server console for debugging
        tb = traceback.format_exc()
        print(tb)
        try:
            cur.close()
        except Exception:
            pass
        return jsonify({"error": str(e), "trace": tb}), 500

    cur.close()
    return jsonify({"team_id": team_id}), 201


@app.route("/api/admin/migrate_schema", methods=["GET"])
def migrate_schema():
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS custom_bid_enabled BOOLEAN DEFAULT TRUE;")
        cur.execute("ALTER TABLE auction_participants ADD COLUMN IF NOT EXISTS budget BIGINT;")
        
        # Create team_players table if it doesn't exist
        cur.execute("""
            CREATE TABLE IF NOT EXISTS team_players (
                id SERIAL PRIMARY KEY,
                auction_id INTEGER NOT NULL REFERENCES auctions(id),
                participant_id INTEGER, -- ideally references auction_participants(id) but it might not have a PK
                player_id INTEGER NOT NULL, -- references players(id) implicitly
                price BIGINT NOT NULL,
                acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Also ensure auction_participants has a PK if we want to link cleanly, 
        # or we just use (auction_id, user_id). 
        # For simplicity, let's link by auction_id and user_id or team_name.
        # Let's add user_id to team_players for easier joining.
        cur.execute("ALTER TABLE team_players ADD COLUMN IF NOT EXISTS user_id INTEGER;")
        
        conn.commit()
        return jsonify({"message": "Migration successful"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

@app.route("/api/lobby/create", methods=["POST"])
def create_lobby():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    auction_name = data.get("auction_name") or data.get("name")
    if not auction_name:
        return jsonify({"error": "Auction name is required"}), 400
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    import random, string
    join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    custom_bid = data.get("custom_bid_enabled", True)

    cur.execute("""
        INSERT INTO auctions (
            name, season, status,
            join_code, host_id,
            purse_per_team,
            bid_inc_min, bid_inc_mid, bid_inc_max,
            min_players, bidding_time, custom_bid_enabled
        )
        VALUES (%s, %s, 'LOBBY', %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        auction_name,
        data.get("season"),
        join_code,
        data["host_id"],
        data["purse"],
        data["inc_min"],
        data["inc_mid"],
        data["inc_max"],
        data["min_players"],
        data["bidding_time"],
        custom_bid
    ))

    result = cur.fetchone()
    auction_id = result["id"]
    
    # Automatically add host to participants
    # Fetch host username for team_name default
    cur.execute("SELECT username FROM users WHERE id = %s", (data["host_id"],))
    host_user = cur.fetchone()
    
    # Use provided team_name or fallback to username
    host_team_name = data.get("team_name")
    if not host_team_name:
        host_team_name = host_user["username"] if host_user else "Admin Team"

    cur.execute("""
        INSERT INTO auction_participants (auction_id, user_id, team_name, budget)
        VALUES (%s, %s, %s, %s)
    """, (auction_id, data["host_id"], host_team_name, data["purse"]))

    conn.commit()
    cur.close()

    return jsonify({
        "auction_id": auction_id,
        "join_code": join_code
    })



@app.route("/api/lobby/verify", methods=["POST"])
def verify_lobby():
    data = request.json
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT id FROM auctions
        WHERE join_code = %s AND status IN ('LOBBY', 'LIVE', 'PAUSED')
    """, (data["join_code"],))
    auction = cur.fetchone()
    cur.close()

    if not auction:
        return jsonify({"error": "Invalid or expired lobby code"}), 404

    return jsonify({"auction_id": auction["id"]})

@app.route("/api/lobby/join", methods=["POST"])
def join_lobby():
    data = request.json
    print(f"Join lobby request: {data}")
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Fetch initial budget from auction settings
    cur.execute("SELECT purse_per_team, status FROM auctions WHERE id = %s", (data["auction_id"],))
    auction = cur.fetchone()
    
    if not auction:
        cur.close()
        return jsonify({"error": "Auction not found"}), 404

    if auction["status"] == "COMPLETED":
        cur.close()
        return jsonify({"error": "This auction has ended"}), 403

    initial_budget = auction["purse_per_team"]

    # Add participant with team name and budget
    cur.execute("""
        INSERT INTO auction_participants (auction_id, user_id, team_name, budget)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (auction_id, user_id) DO UPDATE SET team_name = EXCLUDED.team_name
        RETURNING auction_id
    """, (data["auction_id"], data["user_id"], data["team_name"], initial_budget))

    result = cur.fetchone()
    print(f"Inserted participant: auction_id={result['auction_id']}, user_id={data['user_id']}, team_name={data['team_name']}")
    
    # Get join_code for navigation
    cur.execute("SELECT join_code FROM auctions WHERE id = %s", (result["auction_id"],))
    auction = cur.fetchone()
    
    conn.commit()
    cur.close()

    return jsonify({
        "auction_id": result["auction_id"],
        "join_code": auction["join_code"],
        "message": "Joined lobby successfully"
    })


@app.route("/api/lobby/<int:auction_id>")
def get_lobby(auction_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT
            a.id,
            a.name,
            a.season,
            a.status,
            a.join_code,
            a.host_id,
            a.purse_per_team,
            a.bid_inc_min,
            a.bid_inc_mid,
            a.bid_inc_max,
            a.min_players,
            a.bidding_time,
            COUNT(p.user_id) AS player_count
        FROM auctions a
        LEFT JOIN auction_participants p ON p.auction_id = a.id
        WHERE a.id = %s
        GROUP BY a.id
    """, (auction_id,))

    lobby = cur.fetchone()
    cur.close()

    if not lobby:
        return jsonify({"error": "Lobby not found"}), 404
        
    if lobby["status"] == "COMPLETED":
        return jsonify({"error": "This auction has ended"}), 403

    return jsonify(lobby)

@app.route("/api/lobby/<int:auction_id>/participants")
def get_lobby_participants(auction_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Dynamic Budget Calculation: (Auction Purse) - (Sum of Acquired Prices for Team)
    cur.execute("""
        SELECT
            ap.id,
            ap.user_id,
            u.username,
            ap.team_name,
            ap.team_id,
            (a.purse_per_team - COALESCE((
                SELECT SUM(tp.acquired_price)
                FROM team_players tp
                WHERE tp.team_id = ap.team_id
            ), 0)) as budget
        FROM auction_participants ap
        JOIN users u ON u.id = ap.user_id
        JOIN auctions a ON a.id = ap.auction_id
        WHERE ap.auction_id = %s
        ORDER BY (ap.user_id = a.host_id) DESC, ap.joined_at ASC
    """, (auction_id,))

    participants = cur.fetchall()
    cur.close()

    return jsonify([dict(p) for p in participants])

@app.route("/api/lobby/<int:auction_id>/details")
def get_lobby_details(auction_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM auctions WHERE id = %s", (auction_id,))
    lobby = cur.fetchone()
    cur.close()
    return jsonify(lobby)


@app.route("/api/auctions/<int:auction_id>/preauction", methods=["GET"])
def get_preauction_data(auction_id):
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # Ensure retention columns exist in older DBs.
        cur.execute("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS retention_limit INTEGER DEFAULT 10;")
        cur.execute("ALTER TABLE auction_participants ADD COLUMN IF NOT EXISTS retention_confirmed BOOLEAN DEFAULT FALSE;")

        # Current auction details.
        cur.execute("""
            SELECT id, name, season, host_id, purse_per_team, COALESCE(retention_limit, 10) AS retention_limit
            FROM auctions
            WHERE id = %s
        """, (auction_id,))
        current_auction = cur.fetchone()
        if not current_auction:
            return jsonify({"error": "Auction not found"}), 404

        # Previous season in same auction series (same host + name, lower season).
        raw_season = current_auction.get("season")
        try:
            current_season = int(raw_season) if raw_season is not None else 0
        except (TypeError, ValueError):
            current_season = 0

        prev_auction_id = None
        if current_season >= 2:
            # NOTE: season can be stored as TEXT in some DBs, so avoid SQL numeric comparison.
            cur.execute("""
                SELECT id, season
                FROM auctions
                WHERE host_id = %s
                  AND name = %s
                  AND id <> %s
                ORDER BY id DESC
            """, (current_auction["host_id"], current_auction["name"], auction_id))
            candidates = cur.fetchall()

            best = None
            for row in candidates:
                raw = row.get("season")
                try:
                    s = int(raw) if raw is not None else 0
                except (TypeError, ValueError):
                    s = 0
                if s < current_season:
                    if not best or s > best["season_int"] or (s == best["season_int"] and row["id"] > best["id"]):
                        best = {"id": row["id"], "season_int": s}

            prev_auction_id = best["id"] if best else None

        # Current participants (for team names + budgets in this season).
        cur.execute("""
            SELECT user_id, team_name, budget, team_id, COALESCE(retention_confirmed, FALSE) AS retention_confirmed
            FROM auction_participants
            WHERE auction_id = %s
            ORDER BY user_id
        """, (auction_id,))
        current_participants = cur.fetchall()

        previous_players_by_user = {}
        if prev_auction_id:
            # Fetch all previous-season players mapped by previous participant user.
            cur.execute("""
                SELECT
                    ap.user_id,
                    p.id,
                    p.name,
                    p.position_group,
                    p.overall,
                    p.club,
                    p.nation,
                    p.image_url,
                    tp.acquired_price
                FROM auction_participants ap
                JOIN team_players tp ON tp.team_id = ap.team_id
                JOIN players p ON p.id = tp.player_id
                WHERE ap.auction_id = %s
                ORDER BY ap.user_id, tp.acquired_price DESC
            """, (prev_auction_id,))
            prev_rows = cur.fetchall()

            for row in prev_rows:
                uid = row["user_id"]
                previous_players_by_user.setdefault(uid, []).append(dict(row))

        participants_detailed = []
        market_players = []
        my_team = None
        my_players = previous_players_by_user.get(user_id, [])
        my_retained_ids = []

        for part in current_participants:
            part_players = previous_players_by_user.get(part["user_id"], [])
            entry = {
                "user_id": part["user_id"],
                "team_name": part["team_name"],
                "budget": part["budget"],
                "team_id": part.get("team_id"),
                "retention_confirmed": bool(part.get("retention_confirmed")),
                "players_count_prev": len(part_players),
                "players_prev": part_players
            }
            participants_detailed.append(entry)
            if part["user_id"] == user_id:
                my_team = entry
                if part.get("team_id"):
                    cur.execute("""
                        SELECT player_id
                        FROM team_players
                        WHERE team_id = %s
                    """, (part["team_id"],))
                    my_retained_ids = [r["player_id"] for r in cur.fetchall()]
            else:
                market_players.extend(part_players)

        # Keep market manageable and premium-first.
        market_players = sorted(market_players, key=lambda x: x.get("acquired_price") or 0, reverse=True)[:120]

        all_confirmed = len(participants_detailed) > 0 and all(p.get("retention_confirmed") for p in participants_detailed)

        return jsonify({
            "auction": dict(current_auction),
            "previous_auction_id": prev_auction_id,
            "participants": participants_detailed,
            "my_team": my_team,
            "my_players_prev": my_players,
            "my_retained_ids": my_retained_ids,
            "market_players_prev": market_players,
            "all_confirmed": all_confirmed
        }), 200
    except Exception as e:
        print(f"Error fetching preauction data: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()


@app.route("/api/auctions/<int:auction_id>/retentions", methods=["POST"])
def confirm_retentions(auction_id):
    data = request.json or {}
    user_id = data.get("user_id")
    selected_player_ids = data.get("player_ids", [])

    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    if not isinstance(selected_player_ids, list):
        return jsonify({"error": "player_ids must be a list"}), 400

    # Normalize player IDs to ints and unique.
    normalized_ids = []
    for pid in selected_player_ids:
        try:
            i = int(pid)
            if i not in normalized_ids:
                normalized_ids.append(i)
        except Exception:
            continue

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        cur.execute("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS retention_limit INTEGER DEFAULT 10;")
        cur.execute("ALTER TABLE auction_participants ADD COLUMN IF NOT EXISTS retention_confirmed BOOLEAN DEFAULT FALSE;")

        # Current auction details.
        cur.execute("""
            SELECT id, name, host_id, purse_per_team, COALESCE(retention_limit, 10) AS retention_limit, season
            FROM auctions
            WHERE id = %s
        """, (auction_id,))
        auction = cur.fetchone()
        if not auction:
            return jsonify({"error": "Auction not found"}), 404

        try:
            current_season = int(auction.get("season") or 0)
        except (TypeError, ValueError):
            current_season = 0

        # Find previous auction (same host + name, nearest lower season).
        prev_auction_id = None
        if current_season >= 2:
            cur.execute("""
                SELECT id, season
                FROM auctions
                WHERE host_id = %s
                  AND name = %s
                  AND id <> %s
                ORDER BY id DESC
            """, (auction["host_id"], auction["name"], auction_id))
            candidates = cur.fetchall()
            best = None
            for row in candidates:
                try:
                    s = int(row.get("season") or 0)
                except (TypeError, ValueError):
                    s = 0
                if s < current_season:
                    if not best or s > best["season_int"] or (s == best["season_int"] and row["id"] > best["id"]):
                        best = {"id": row["id"], "season_int": s}
            prev_auction_id = best["id"] if best else None

        if not prev_auction_id:
            return jsonify({"error": "No previous season found for retention"}), 400

        # Enforce retention limit.
        retention_limit = int(auction.get("retention_limit") or 0)
        if len(normalized_ids) > retention_limit:
            return jsonify({"error": f"Retention limit exceeded ({retention_limit})"}), 400

        # Current participant row.
        cur.execute("""
            SELECT id, team_id, team_name
            FROM auction_participants
            WHERE auction_id = %s AND user_id = %s
        """, (auction_id, user_id))
        participant = cur.fetchone()
        if not participant:
            return jsonify({"error": "Participant not found in current auction"}), 404

        team_id = participant.get("team_id")
        if not team_id:
            # Create team for current auction if needed.
            cur.execute("""
                INSERT INTO teams (name, manager_id, rating, value, status, created_at)
                VALUES (%s, %s, 0, 0, 'ACTIVE', NOW())
                RETURNING id
            """, (participant["team_name"], user_id))
            team_id = cur.fetchone()["id"]
            cur.execute("""
                UPDATE auction_participants
                SET team_id = %s
                WHERE id = %s
            """, (team_id, participant["id"]))

        # Previous-season eligible players with original acquired price.
        cur.execute("""
            SELECT tp.player_id, tp.acquired_price
            FROM auction_participants ap
            JOIN team_players tp ON tp.team_id = ap.team_id
            WHERE ap.auction_id = %s
              AND ap.user_id = %s
        """, (prev_auction_id, user_id))
        prev_rows = cur.fetchall()
        prev_price_map = {int(r["player_id"]): int(r["acquired_price"] or 0) for r in prev_rows}
        eligible_prev_ids = list(prev_price_map.keys())

        # Validate all selected belong to user from previous season.
        invalid_ids = [pid for pid in normalized_ids if pid not in prev_price_map]
        if invalid_ids:
            return jsonify({"error": "Some selected players are not eligible for retention", "invalid_player_ids": invalid_ids}), 400

        # Replace retentions (only touching eligible previous players for this user).
        if eligible_prev_ids:
            cur.execute("""
                DELETE FROM team_players
                WHERE team_id = %s
                  AND player_id = ANY(%s)
            """, (team_id, eligible_prev_ids))

        for pid in normalized_ids:
            cur.execute("""
                INSERT INTO team_players (team_id, player_id, acquired_price)
                VALUES (%s, %s, %s)
            """, (team_id, pid, prev_price_map[pid]))

        retained_total = sum(prev_price_map[pid] for pid in normalized_ids)
        remaining_budget = int(auction["purse_per_team"] or 0) - retained_total
        if remaining_budget < 0:
            remaining_budget = 0

        cur.execute("""
            UPDATE auction_participants
            SET budget = %s, retention_confirmed = TRUE
            WHERE id = %s
        """, (remaining_budget, participant["id"]))

        conn.commit()
        socketio.emit("retentions_updated", {"auction_id": auction_id}, room=f"lobby_{auction_id}")
        return jsonify({
            "message": "Retentions confirmed",
            "retained_player_ids": normalized_ids,
            "retained_cost": retained_total,
            "remaining_budget": remaining_budget
        }), 200
    except Exception as e:
        conn.rollback()
        print(f"Error confirming retentions: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

@app.route("/api/lobby/<int:auction_id>/available_players")
def get_auction_players(auction_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # 1. Get auction settings (min rating threshold)
    cur.execute("SELECT min_players FROM auctions WHERE id = %s", (auction_id,))
    auction = cur.fetchone()
    
    if not auction:
        cur.close()
        return jsonify({"error": "Auction not found"}), 404
        
    min_rating = auction["min_players"] or 0

    # 2. Get eligible players
    # User Request: "rating greater than min players value"
    cur.execute("""
        SELECT * FROM players 
        WHERE overall > %s
        ORDER BY overall DESC, id ASC
    """, (min_rating,))
    
    all_players = cur.fetchall()
    cur.close()

    # 3. Categorize Players
    fwds = []
    mids = []
    defs = []
    gks = []

    # Map positions to 4 main groups
    # Common mappings based on modern football/FIFA
    fwd_roles = {'ST', 'CF', 'LF', 'RF', 'LW', 'RW', 'LS', 'RS', 'Forward'}
    mid_roles = {'CAM', 'CM', 'CDM', 'LM', 'RM', 'Midfielder'}
    def_roles = {'CB', 'LB', 'RB', 'LWB', 'RWB', 'Defender'}
    gk_roles = {'GK', 'Goalkeeper'}

    for p in all_players:
        pos = p.get('position_group')
        # Fallback if position_group is generic or specific code
        # We check exact match first, then partial if needed, but set logic is safer
        if pos in fwd_roles:
            fwds.append(p)
        elif pos in mid_roles:
            mids.append(p)
        elif pos in def_roles:
            defs.append(p)
        elif pos in gk_roles:
            gks.append(p)
        else:
            # Fallback for unknown positions - maybe treat as Midfield or add to end?
            # Let's add to Mids as generic filler or check distinct values
            # Assuming 'Forward', 'Midfielder', etc are the main ones in DB based on get_market_players
            if 'Forward' in str(pos): fwds.append(p)
            elif 'Midfielder' in str(pos): mids.append(p)
            elif 'Defender' in str(pos): defs.append(p)
            elif 'Goalkeeper' in str(pos): gks.append(p)
            else: mids.append(p) # Default to Mid

    # 4. Cycle Logic (12 of each)
    ordered_players = []
    
    # Pointers for each list
    f_idx, m_idx, d_idx, g_idx = 0, 0, 0, 0
    f_len, m_len, d_len, g_len = len(fwds), len(mids), len(defs), len(gks)
    
    while f_idx < f_len or m_idx < m_len or d_idx < d_len or g_idx < g_len:
        # 12 Forwards
        for _ in range(12):
            if f_idx < f_len:
                ordered_players.append(fwds[f_idx])
                f_idx += 1
        
        # 12 Midfielders
        for _ in range(12):
            if m_idx < m_len:
                ordered_players.append(mids[m_idx])
                m_idx += 1
                
        # 12 Defenders
        for _ in range(12):
            if d_idx < d_len:
                ordered_players.append(defs[d_idx])
                d_idx += 1
                
        # 12 Goalkeepers
        for _ in range(12):
            if g_idx < g_len:
                ordered_players.append(gks[g_idx])
                g_idx += 1
    
    return jsonify(ordered_players)

@socketio.on("connect")
def handle_connect():
    """Handle new WebSocket connections"""
    print(f"Client connected: {request.sid}")
    return True

@socketio.on("join_lobby")
def join_lobby_socket(data):
    auction_id = int(data['auction_id'])
    user_id = int(data['user_id'])
    team_name = data.get('team_name', 'Team')
    room = f"lobby_{str(auction_id)}"
    
    # Check if auction is completed before joining
    status_key = f"auction:{auction_id}:status"
    current_status = r.get(status_key)
    
    # If not in Redis, check DB (fallback)
    if not current_status:
        try:
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT status FROM auctions WHERE id = %s", (auction_id,))
            row = cur.fetchone()
            cur.close()
            if row:
                # row is a RealDictRow because of get_db() default factory
                current_status = row.get('status')
        except Exception as e:
            print(f"Error checking status for socket join: {e}")

    if current_status == "COMPLETED":
        emit("error", {"message": "This auction has ended"}, room=request.sid)
        return

    join_room(room)
    print(f"User {user_id} joined room: {room}")
    sid_context[request.sid] = {"auction_id": auction_id, "user_id": user_id}
    r.sadd(f"auction:{auction_id}:connected_users", user_id)

    # Ensure user is in DB (Wrap in try block to prevent FK errors from blocking sync)
    try:
        if user_id > 0:
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT purse_per_team FROM auctions WHERE id = %s", (auction_id,))
            auction = cur.fetchone()
            initial_budget = auction["purse_per_team"] if auction else 0
            cur.execute("""
                INSERT INTO auction_participants (auction_id, user_id, team_name, budget)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (auction_id, user_id) DO UPDATE
                SET team_name = EXCLUDED.team_name,
                    budget = COALESCE(auction_participants.budget, EXCLUDED.budget)
            """, (auction_id, user_id, team_name, initial_budget))
            conn.commit()
            cur.close()
    except Exception as e:
        print(f"Error adding participant {user_id}: {e}")

    emit("user_joined", {
        "user_id": user_id,
        "team_name": team_name
    }, room=room)
    
    # Send Current Sync State
    # Only applicable if Auction is LIVE or PAUSED
    auction_id_str = str(auction_id)
    status = r.get(f"auction:{auction_id_str}:status")

    # Recovery: If Redis is empty but DB says LIVE/PAUSED (Server Restart)
    if not status:
        try:
            conn = get_db()
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute("SELECT status, current_index, bidding_time FROM auctions WHERE id = %s", (auction_id,))
            row = cur.fetchone()
            cur.close()
            
            if row and row['status'] in ('LIVE', 'PAUSED'):
                status = row['status']
                index = row['current_index'] or 0
                bidding_time = row['bidding_time'] or 30
                
                print(f"Recovering Auction State from DB: Status={status}, Index={index}")
                
                # Restore Redis
                r.set(f"auction:{auction_id_str}:status", status)
                r.set(f"auction:{auction_id_str}:index", index)
                r.set(f"auction:{auction_id_str}:config_time", bidding_time)
                
                # For timer, if we just recovered, maybe restart round? 
                # Or just give full time if we lost the exact second?
                # Safer to give full time or just set to NOW if paused.
                if status == 'LIVE':
                    new_expires = time.time() + bidding_time
                    r.set(f"auction:{auction_id_str}:round_expires", new_expires)
        except Exception as e:
            print(f"Error recovering state: {e}")

    if status == "LIVE" or status == "PAUSED":
        index = r.get(f"auction:{auction_id_str}:index") or 0
        current_bid = r.hgetall(f"auction:{auction_id_str}:current_bid")
        expires = r.get(f"auction:{auction_id_str}:round_expires")

        emit("sync_auction", {
            "current_index": int(index),
            "highest_bid": int(current_bid.get("amount", 0)),
            "highest_bidder": current_bid.get("bidder", "None"),
            "round_expires": float(expires) if expires else None,
            "status": status,
            "server_time": time.time()
        }, room=request.sid) # Only to this user

@socketio.on("leave_lobby")
def leave_lobby_socket(data):
    auction_id = int(data['auction_id'])
    user_id = int(data['user_id'])
    room = f"lobby_{str(auction_id)}"

    sid_context.pop(request.sid, None)
    r.srem(f"auction:{auction_id}:connected_users", user_id)

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT status FROM auctions WHERE id = %s", (auction_id,))
    row = cur.fetchone()
    auction_status = row["status"] if row else None

    # Preserve participant state during/after auction to keep team, players and purse.
    # Only allow removal while still in lobby phase.
    if auction_status == "LOBBY":
        cur.execute(
            "DELETE FROM auction_participants WHERE auction_id = %s AND user_id = %s",
            (auction_id, user_id)
        )

    # Auto-pause if someone leaves a live auction.
    if auction_status == "LIVE":
        status_key = f"auction:{auction_id}:status"
        r.set(status_key, "PAUSED")

        expires_key = f"auction:{auction_id}:round_expires"
        expires = r.get(expires_key)
        remaining = 0
        if expires:
            remaining = float(expires) - time.time()
            if remaining < 0:
                remaining = 0
        r.set(f"auction:{auction_id}:paused_remaining", remaining)

        cur.execute("UPDATE auctions SET status = 'PAUSED' WHERE id = %s", (auction_id,))

        emit("auction_status_change", {"status": "PAUSED"}, room=room)

    conn.commit()
    cur.close()

    leave_room(room)
    emit("user_left", {"user_id": user_id}, room=room)


@socketio.on("disconnect")
def handle_disconnect():
    ctx = sid_context.pop(request.sid, None)
    if not ctx:
        return

    auction_id = int(ctx["auction_id"])
    user_id = int(ctx["user_id"])
    room = f"lobby_{auction_id}"

    r.srem(f"auction:{auction_id}:connected_users", user_id)

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT status FROM auctions WHERE id = %s", (auction_id,))
        row = cur.fetchone()
        auction_status = row["status"] if row else None

        if auction_status == "LIVE":
            r.set(f"auction:{auction_id}:status", "PAUSED")

            expires = r.get(f"auction:{auction_id}:round_expires")
            remaining = 0
            if expires:
                remaining = float(expires) - time.time()
                if remaining < 0:
                    remaining = 0
            r.set(f"auction:{auction_id}:paused_remaining", remaining)

            cur.execute("UPDATE auctions SET status = 'PAUSED' WHERE id = %s", (auction_id,))
            conn.commit()

            emit("auction_status_change", {"status": "PAUSED"}, room=room)
            print(f"Auction {auction_id} auto-paused because user {user_id} disconnected")
    except Exception as e:
        conn.rollback()
        print(f"Error handling disconnect for auction {auction_id}: {e}")
    finally:
        cur.close()

@socketio.on("place_bid")
def handle_place_bid(data):
    auction_id = str(data.get("auction_id"))
    amount = data.get("amount")
    bidder = data.get("bidder") # team_name
    user_id = data.get("user_id") # New: Track user ID for reliable updates
    player_id = data.get("player_id")
    
    print(f"Received bid request: {amount} from {bidder} (ID: {user_id})")

    room = f"lobby_{auction_id}"
    
    # Check if user has already passed
    if r.sismember(f"auction:{auction_id}:passes", user_id):
        print(f"User {user_id} CANNOT BID: Already passed.")
        emit("action_failed", {"message": "You have already passed this round."}, room=request.sid)
        return

    # Store in Redis
    redis_key = f"auction:{auction_id}:current_bid"
    r.hset(redis_key, mapping={
        "amount": amount,
        "bidder": bidder,
        "user_id": user_id if user_id else "",
        "player_id": player_id if player_id else "",
        "timestamp": time.time()
    })
    if player_id:
        r.set(f"auction:{auction_id}:current_player_id", player_id)
    
    # Update Timer expiration (Reset clock)
    # We need bidding_time. Ideally fetched once or stored in redis config
    bidding_time = int(r.get(f"auction:{auction_id}:config_time") or 30)
    new_expires = time.time() + bidding_time
    r.set(f"auction:{auction_id}:round_expires", new_expires)
    
    # Log to History
    log_key = f"auction:{auction_id}:logs"
    r.rpush(log_key, json.dumps({
        "type": "bid",
        "amount": amount,
        "bidder": bidder,
        "timestamp": time.time()
    }))

    # DO NOT Clear pass votes. Passes are permanent for the round.
    # r.delete(f"auction:{auction_id}:passes")
    
    print(f"Bid stored in Redis for {room}: {amount} by {bidder}")
    
    # Broadcast to all users in the room
    emit("bid_placed", {
        "amount": amount,
        "bidder": bidder,
        "timestamp": time.time(),
        "round_expires": new_expires,
        "server_time": time.time()
    }, room=room)

    # CHECK FOR IMMEDIATE WIN (If everyone else already passed)
    # We need to check passes again because if A, B, C are players. A & B pass. C bids.
    # C should win immediately.
    pass_key = f"auction:{auction_id}:passes"
    pass_count = r.scard(pass_key)
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as count FROM auction_participants WHERE auction_id = %s", (auction_id,))
    result = cur.fetchone()
    total_participants = result['count'] if result else 0
    cur.close()
    conn.close() # Good practice
    
    if total_participants == 0:
        print(f"No participants found for auction {auction_id}")
        return

    if pass_count >= total_participants - 1:
         # Immediate win path must persist exactly like normal timer finalization.
         handle_finalize_player({
             "auction_id": auction_id,
             "player_id": player_id,
             "result": "sold",
             "amount": amount,
             "bidder": bidder
         })
         return


@socketio.on("finalize_player")
def handle_finalize_player(data):
    auction_id = str(data.get("auction_id"))
    player_id = data.get("player_id")
    result = data.get("result") # 'sold' or 'unsold'
    
    room = f"lobby_{auction_id}"
    redis_key = f"auction:{auction_id}:current_bid"
    
    updated_budget = None
    user_id = None
    
    if result == 'sold':
        # Get final bid details from Redis (source of truth)
        bid_data = r.hgetall(redis_key)
        if bid_data:
            amount = int(bid_data.get("amount", 0))
            bidder_team = bid_data.get("bidder")
            user_id_redis = bid_data.get("user_id") # Get user_id if valid
            
            # Deduct budget from winner
            conn = get_db()
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            try:
                # Update budget for the team (Prefer user_id, fallback to team_name)
                # Also fetch team_id if it exists in auction_participants
                if user_id_redis and str(user_id_redis).isdigit() and int(user_id_redis) > 0:
                     cur.execute("""
                        UPDATE auction_participants 
                        SET budget = budget - %s 
                        WHERE auction_id = %s AND user_id = %s
                        RETURNING id, user_id, budget, team_name, team_id
                    """, (amount, auction_id, int(user_id_redis)))
                else:
                     cur.execute("""
                        UPDATE auction_participants 
                        SET budget = budget - %s 
                        WHERE auction_id = %s AND team_name = %s
                        RETURNING id, user_id, budget, team_name, team_id
                    """, (amount, auction_id, bidder_team))
                
                participant = cur.fetchone()
                
                if participant:
                    participant_id = participant['id']
                    user_id = participant['user_id']
                    updated_budget = participant['budget']
                    team_name = participant['team_name']
                    team_id = participant.get('team_id')

                    # Logic to ensure we have a valid team_id for team_players table
                    if not team_id:
                         # FORCE create new team for this specific auction context
                         # Do NOT lookup old teams by name to ensure unique team per auction
                        cur.execute("""
                            INSERT INTO teams (name, manager_id, rating, value, status, created_at)
                            VALUES (%s, %s, 0, 0, 'ACTIVE', NOW())
                            RETURNING id
                        """, (team_name, user_id))
                        res = cur.fetchone()
                        if res:
                            team_id = res['id']

                        # Link this team_id back to auction_participants for next time
                        if team_id:
                            cur.execute("UPDATE auction_participants SET team_id = %s WHERE id = %s", (team_id, participant_id))

                    if team_id:
                         # Insert into team_players table (prevent duplicates)
                         cur.execute("""
                            INSERT INTO team_players (team_id, player_id, acquired_price)
                            VALUES (%s, %s, %s)
                            ON CONFLICT (team_id, player_id) DO NOTHING
                         """, (team_id, player_id, amount))

                         # Recalculate Budget Dynamically for response
                         cur.execute("""
                            SELECT (a.purse_per_team - COALESCE(SUM(tp.acquired_price), 0)) as remaining_budget
                            FROM auctions a
                            LEFT JOIN team_players tp ON tp.team_id = %s
                            WHERE a.id = %s
                            GROUP BY a.purse_per_team
                         """, (team_id, auction_id))
                         
                         res = cur.fetchone()
                         if res:
                             updated_budget = res['remaining_budget']

                conn.commit()
                print(f"PLAYER SOLD: {player_id} to {bidder_team} for {amount}. Budget updated to {updated_budget}.")
            except Exception as e:
                print(f"Error updating budget: {e}")
                conn.rollback()
            finally:
                cur.close()
    
    # Clear Redis for next player
    r.delete(redis_key)
    r.delete(f"auction:{auction_id}:passes")
    
    # Broadcast result to show animation/modal
    emit("player_finalized", {
        "player_id": player_id,
        "result": result,
        "amount": data.get("amount"), # passed from client for display if redis fails
        "bidder": data.get("bidder"),
        "updated_budget": updated_budget,
        "user_id": user_id
    }, room=room)


@socketio.on("pass_turn")
def handle_pass_turn(data):
    print(f"🔔 PASS_TURN EVENT RECEIVED: {data}")
    auction_id = str(data.get("auction_id"))
    user_id = data.get("user_id")
    
    room = f"lobby_{auction_id}"
    pass_key = f"auction:{auction_id}:passes"
    
    # Add user to set of passes
    r.sadd(pass_key, user_id)
    pass_count = r.scard(pass_key)
    
    print(f"✅ User {user_id} added to passes. Total: {pass_count}")
    
    # Get total active participants
    # Note: socket only tracks connections, but we want DB participants count ideally
    # For speed, we can check Redis if we tracked participants there, but let's query DB for accuracy or use room size
    # Using DB is safer for "Registered Participants"
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as count FROM auction_participants WHERE auction_id = %s", (auction_id,))
    result = cur.fetchone()
    total_participants = result['count'] if result else 0
    cur.close()
    
    if total_participants == 0:
        print(f"⚠️ No participants found for auction {auction_id}")
        emit("pass_update", {"count": 0, "total": 0}, room=room)
        return
    
    print(f"Pass vote: {pass_count}/{total_participants} in {room}")
    
    # If all participants passed
    # If enough participants passed
    # Condition 1: Active Bid Exists
    current_bid = r.hgetall(f"auction:{auction_id}:current_bid")
    
    if current_bid:
        bidder_user_id = current_bid.get("user_id")
        bidder_has_passed = r.sismember(pass_key, bidder_user_id) if bidder_user_id else False
        
        # Two scenarios for finalization:
        # 1. Bidder hasn't passed, but everyone else has (bidder is last one standing)
        # 2. Everyone including the bidder has passed (bidder accepts their bid)
        
        if bidder_has_passed:
            # Bidder passed - only finalize if EVERYONE has passed
            if pass_count >= total_participants:
                print(f"🎯 IMMEDIATE FINALIZATION: All passed (including bidder). SOLD to {current_bid.get('bidder')}")
                
                # Resolve current player_id (Redis key -> current bid hash -> client payload fallback)
                player_id = r.get(f"auction:{auction_id}:current_player_id")
                if not player_id:
                    player_id = current_bid.get("player_id")
                if not player_id:
                    player_id = data.get("player_id")
                if player_id and str(player_id).isdigit():
                    player_id = int(player_id)
                
                # DO DATABASE WORK - Insert player into team
                amount = int(current_bid.get("amount", 0))
                bidder_team = current_bid.get("bidder")
                user_id_redis = current_bid.get("user_id")
                updated_budget = None
                
                conn = get_db()
                cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                try:
                    # Update budget and get team_id
                    if user_id_redis and str(user_id_redis).isdigit() and int(user_id_redis) > 0:
                        cur.execute("""
                            UPDATE auction_participants 
                            SET budget = budget - %s 
                            WHERE auction_id = %s AND user_id = %s
                            RETURNING id, user_id, budget, team_name, team_id
                        """, (amount, auction_id, int(user_id_redis)))
                    else:
                        cur.execute("""
                            UPDATE auction_participants 
                            SET budget = budget - %s 
                            WHERE auction_id = %s AND team_name = %s
                            RETURNING id, user_id, budget, team_name, team_id
                        """, (amount, auction_id, bidder_team))
                    
                    participant = cur.fetchone()
                    
                    if participant and player_id:
                        participant_id = participant['id']
                        user_id_final = participant['user_id']
                        updated_budget = participant['budget']
                        team_name = participant['team_name']
                        team_id = participant.get('team_id')
                        
                        # Create team if needed
                        if not team_id:
                            cur.execute("""
                                INSERT INTO teams (name, manager_id, rating, value, status, created_at)
                                VALUES (%s, %s, 0, 0, 'ACTIVE', NOW())
                                RETURNING id
                            """, (team_name, user_id_final))
                            res = cur.fetchone()
                            if res:
                                team_id = res['id']
                            
                            if team_id:
                                cur.execute("UPDATE auction_participants SET team_id = %s WHERE id = %s", (team_id, participant_id))
                        
                        # Insert player into team_players
                        if team_id:
                            cur.execute("""
                                INSERT INTO team_players (team_id, player_id, acquired_price)
                                VALUES (%s, %s, %s)
                                ON CONFLICT (team_id, player_id) DO NOTHING
                            """, (team_id, player_id, amount))
                            print(f"✅ Player {player_id} assigned to team {team_id}")
                    
                    conn.commit()
                except Exception as e:
                    print(f"❌ Error in pass finalization: {e}")
                    conn.rollback()
                finally:
                    cur.close()
                    conn.close()
                
                # Clean up Redis
                r.delete(f"auction:{auction_id}:current_bid")
                r.delete(pass_key)
                
                emit("player_finalized", {
                    "result": "sold",
                    "bidder": current_bid.get("bidder"),
                    "amount": amount,
                    "user_id": current_bid.get("user_id"),
                    "player_id": player_id,
                    "updated_budget": updated_budget
                }, room=room)
                return
        else:
            # Bidder hasn't passed - finalize if everyone EXCEPT bidder has passed
            if pass_count >= total_participants - 1:
                print(f"🎯 IMMEDIATE FINALIZATION: All except bidder passed. SOLD to {current_bid.get('bidder')}")
                
                # Resolve current player_id (Redis key -> current bid hash -> client payload fallback)
                player_id = r.get(f"auction:{auction_id}:current_player_id")
                if not player_id:
                    player_id = current_bid.get("player_id")
                if not player_id:
                    player_id = data.get("player_id")
                if player_id and str(player_id).isdigit():
                    player_id = int(player_id)
                
                # DO DATABASE WORK - Insert player into team
                amount = int(current_bid.get("amount", 0))
                bidder_team = current_bid.get("bidder")
                user_id_redis = current_bid.get("user_id")
                updated_budget = None
                
                conn = get_db()
                cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                try:
                    # Update budget and get team_id
                    if user_id_redis and str(user_id_redis).isdigit() and int(user_id_redis) > 0:
                        cur.execute("""
                            UPDATE auction_participants 
                            SET budget = budget - %s 
                            WHERE auction_id = %s AND user_id = %s
                            RETURNING id, user_id, budget, team_name, team_id
                        """, (amount, auction_id, int(user_id_redis)))
                    else:
                        cur.execute("""
                            UPDATE auction_participants 
                            SET budget = budget - %s 
                            WHERE auction_id = %s AND team_name = %s
                            RETURNING id, user_id, budget, team_name, team_id
                        """, (amount, auction_id, bidder_team))
                    
                    participant = cur.fetchone()
                    
                    if participant and player_id:
                        participant_id = participant['id']
                        user_id_final = participant['user_id']
                        updated_budget = participant['budget']
                        team_name = participant['team_name']
                        team_id = participant.get('team_id')
                        
                        # Create team if needed
                        if not team_id:
                            cur.execute("""
                                INSERT INTO teams (name, manager_id, rating, value, status, created_at)
                                VALUES (%s, %s, 0, 0, 'ACTIVE', NOW())
                                RETURNING id
                            """, (team_name, user_id_final))
                            res = cur.fetchone()
                            if res:
                                team_id = res['id']
                            
                            if team_id:
                                cur.execute("UPDATE auction_participants SET team_id = %s WHERE id = %s", (team_id, participant_id))
                        
                        # Insert player into team_players
                        if team_id:
                            cur.execute("""
                                INSERT INTO team_players (team_id, player_id, acquired_price)
                                VALUES (%s, %s, %s)
                                ON CONFLICT (team_id, player_id) DO NOTHING
                            """, (team_id, player_id, amount))
                            print(f"✅ Player {player_id} assigned to team {team_id}")
                    
                    conn.commit()
                except Exception as e:
                    print(f"❌ Error in pass finalization: {e}")
                    conn.rollback()
                finally:
                    cur.close()
                    conn.close()
                
                # Clean up Redis
                r.delete(f"auction:{auction_id}:current_bid")
                r.delete(pass_key)
                
                emit("player_finalized", {
                    "result": "sold",
                    "bidder": current_bid.get("bidder"),
                    "amount": amount,
                    "user_id": current_bid.get("user_id"),
                    "player_id": player_id,
                    "updated_budget": updated_budget
                }, room=room)
                return
             
    else:
        # Condition 2: No Bid
        # If ALL participants passed
        if pass_count >= total_participants:
             print(f"🎯 IMMEDIATE FINALIZATION: All passed with no bids. UNSOLD")
             
             # Resolve current player_id
             player_id = r.get(f"auction:{auction_id}:current_player_id")
             if not player_id:
                 player_id = data.get("player_id")
             if player_id and str(player_id).isdigit():
                 player_id = int(player_id)
             
             # Clean up Redis state
             r.delete(pass_key)
             
             emit("player_finalized", {
                 "result": "unsold",
                 "bidder": "None",
                 "amount": 0,
                 "player_id": player_id
             }, room=room)
             return  # Exit early, finalization complete
    
    # Notify count update (only if not finalized)
    print(f"📊 Pass update: {pass_count}/{total_participants} - not enough to finalize yet")
    emit("pass_update", {"count": pass_count, "total": total_participants}, room=room)


@app.route("/api/auctions/<int:auction_id>/stats", methods=["GET"])
def get_auction_stats(auction_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        # 1. Global Stats
        # Duration
        cur.execute("""
            SELECT 
                start_date, end_date, 
                EXTRACT(EPOCH FROM (end_date - start_date)) as duration_seconds
            FROM auctions
            WHERE id = %s
        """, (auction_id,))
        auction_times = cur.fetchone()
        
        # Most Expensive Player
        cur.execute("""
            SELECT p.name, tp.acquired_price
            FROM team_players tp
            JOIN players p ON p.id = tp.player_id
            WHERE tp.team_id IN (
                SELECT team_id FROM auction_participants WHERE auction_id = %s
            )
            ORDER BY tp.acquired_price DESC
            LIMIT 1
        """, (auction_id,))
        most_expensive = cur.fetchone()

        # Total Spent & Sold Count
        cur.execute("""
            SELECT COUNT(*) as sold_count, COALESCE(SUM(tp.acquired_price), 0) as total_spent
            FROM team_players tp
            WHERE tp.team_id IN (
                SELECT team_id FROM auction_participants WHERE auction_id = %s
            )
        """, (auction_id,))
        totals = cur.fetchone()

        # 2. Team Standings & Details
        cur.execute("""
            SELECT 
                t.id as team_id,
                t.name as team_name,
                u.username as manager,
                COALESCE(SUM(tp.acquired_price), 0) as spent,
                COUNT(tp.player_id) as players_count,
                ap.budget as remaining_budget
            FROM auction_participants ap
            JOIN teams t ON t.id = ap.team_id
            JOIN users u ON u.id = ap.user_id
            LEFT JOIN team_players tp ON tp.team_id = t.id
            WHERE ap.auction_id = %s
            GROUP BY t.id, u.username, ap.budget
            ORDER BY spent DESC
        """, (auction_id,))
        standings = cur.fetchall()
        
        # Fetch players for each team
        teams_detailed = []
        for team in standings:
             cur.execute("""
                SELECT p.id, p.name, p.position_group, p.overall, p.image_url, tp.acquired_price
                FROM team_players tp
                JOIN players p ON p.id = tp.player_id
                WHERE tp.team_id = %s
                ORDER BY tp.acquired_price DESC
             """, (team['team_id'],))
             players = cur.fetchall()
             
             teams_detailed.append({
                 **team,
                 "players": [dict(p) for p in players]
             })

        return jsonify({
            "global": {
                "duration": auction_times['duration_seconds'] if auction_times and auction_times['duration_seconds'] else 0,
                "total_spent": totals['total_spent'] if totals else 0,
                "total_sold": totals['sold_count'] if totals else 0,
                "most_expensive": most_expensive
            },
            "teams": teams_detailed
        })
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()


@socketio.on("start_auction")
def start_auction(data):
    try:
        auction_id_str = str(data["auction_id"]) # Ensure string for room
        auction_id_int = int(data["auction_id"]) # Ensure int for DB
        room = f"lobby_{auction_id_str}"
        print(f"Received start_auction for Room: {room}")

        # Fetch Season & Bidding Time
        season = 1
        bidding_time = 30
        try:
            conn = get_db()
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            # Start Date: Update when auction first goes live
            cur.execute("""
                UPDATE auctions 
                SET status = 'LIVE', start_date = CURRENT_DATE 
                WHERE id = %s AND status = 'LOBBY'
                RETURNING season, bidding_time
            """, (auction_id_int,))
            
            res = cur.fetchone()
            if res:
                season = res['season'] or 1
                bidding_time = res['bidding_time'] or 30
                conn.commit()
            else:
                # If not updated (maybe already live?), just fetch
                cur.execute("SELECT season, bidding_time FROM auctions WHERE id = %s", (auction_id_int,))
                res = cur.fetchone()
                if res:
                    season = res['season'] or 1
                    bidding_time = res['bidding_time'] or 30
            
            cur.close()
        except Exception as e:
            print(f"Error updating/fetching details: {e}")
            if conn: conn.rollback()
            season = 1

        # Initialize State in Redis
        r.set(f"auction:{auction_id_str}:status", "LIVE")
        r.set(f"auction:{auction_id_str}:index", 0)
        r.set(f"auction:{auction_id_str}:round_expires", time.time() + bidding_time)
        r.delete(f"auction:{auction_id_str}:current_bid") # Clear previous if any
        r.delete(f"auction:{auction_id_str}:passes")
        
        # Save Bidding Time for reference later (simpler than querying DB repeatedly)
        r.set(f"auction:{auction_id_str}:config_time", bidding_time)

        print(f"Emitting auction_started to {room} with season {season}")
        # Emit to everyone in the room (including sender)
        emit("auction_started", {"season": season, "server_time": time.time()}, room=room)
        
    except Exception as e:
        print(f"Critical Error in start_auction: {e}")
        # Try to emit error back to sender
        emit("error", {"message": "Failed to start auction"}, room=request.sid)


@socketio.on("next_player")
def handle_next_player(data):
    auction_id = str(data.get("auction_id"))
    room = f"lobby_{auction_id}"

    # Increment Index
    new_index = r.incr(f"auction:{auction_id}:index")
    
    # Persist Index to DB
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("UPDATE auctions SET current_index = %s WHERE id = %s", (new_index, int(auction_id)))
        conn.commit()
        cur.close()
    except Exception as e:
        print(f"Error persisting index: {e}")

    # Reset State for new round
    r.delete(f"auction:{auction_id}:current_bid")
    r.delete(f"auction:{auction_id}:passes")
    
    # Reset Timer
    bidding_time = int(r.get(f"auction:{auction_id}:config_time") or 30)
    expires = time.time() + bidding_time
    r.set(f"auction:{auction_id}:round_expires", expires)

    emit("round_changed", {
        "current_index": new_index,
        "round_expires": expires,
        "server_time": time.time()
    }, room=room)


@socketio.on("toggle_pause")
def handle_toggle_pause(data):
    auction_id = str(data.get("auction_id"))
    room = f"lobby_{auction_id}"

    # Check current status
    status_key = f"auction:{auction_id}:status"
    current_status = r.get(status_key)

    conn = get_db()
    cur = conn.cursor()

    # Fallback: if Redis lost status, recover from DB.
    if not current_status:
        cur.execute("SELECT status FROM auctions WHERE id = %s", (data['auction_id'],))
        row = cur.fetchone()
        if row:
            # tuple cursor
            current_status = row[0]
            if current_status in ("LIVE", "PAUSED"):
                r.set(status_key, current_status)
        # Last resort: assume LIVE so pause action still works.
        if not current_status:
            current_status = "LIVE"

    if current_status == "LIVE":
        # Pause it
        r.set(status_key, "PAUSED")

        # Calculate remaining time for the current round
        expires_key = f"auction:{auction_id}:round_expires"
        expires = r.get(expires_key)
        remaining = 0
        if expires:
            remaining = float(expires) - time.time()
            if remaining < 0: remaining = 0

        r.set(f"auction:{auction_id}:paused_remaining", remaining)

        # Update DB
        cur.execute("UPDATE auctions SET status = 'PAUSED' WHERE id = %s", (data['auction_id'],))
        conn.commit()

        emit("auction_status_change", {"status": "PAUSED"}, room=room)
        print(f"Auction {auction_id} PAUSED. Remaining time: {remaining:.2f}s")

    elif current_status == "PAUSED":
        # Resume it
        r.set(status_key, "LIVE")

        # Restore timer
        remaining = float(r.get(f"auction:{auction_id}:paused_remaining") or 30)
        new_expires = time.time() + remaining
        r.set(f"auction:{auction_id}:round_expires", new_expires)

        # Update DB
        cur.execute("UPDATE auctions SET status = 'LIVE' WHERE id = %s", (data['auction_id'],))
        conn.commit()

        emit("auction_status_change", {
            "status": "LIVE",
            "round_expires": new_expires,
            "server_time": time.time()
        }, room=room)
        print(f"Auction {auction_id} RESUMED. New expires: {new_expires}")

    cur.close()


@socketio.on("end_auction")
def handle_end_auction(data):
    auction_id = str(data.get("auction_id"))
    room = f"lobby_{auction_id}"

    conn = get_db()
    cur = conn.cursor()

    try:
        # Update Auction Status to COMPLETED
        cur.execute("""
            UPDATE auctions 
            SET status = 'COMPLETED', end_date = NOW() 
            WHERE id = %s
        """, (data['auction_id'],))
        conn.commit()

        # Clear Redis State
        r.delete(f"auction:{auction_id}:status")
        r.delete(f"auction:{auction_id}:current_bid")
        r.delete(f"auction:{auction_id}:passes")
        r.delete(f"auction:{auction_id}:round_expires")

        print(f"Auction {auction_id} ENDED by host.")

        # Notify all clients to redirect
        emit("auction_ended", {"auction_id": data['auction_id']}, room=room)

    except Exception as e:
        conn.rollback()
        print(f"Error ending auction: {e}")
    finally:
        cur.close()

# ============================================
# TRADE REST API ENDPOINTS
# ============================================

@app.route("/api/auctions/<int:auction_id>/trades", methods=["GET"])
def get_auction_trades(auction_id):
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute("""
            SELECT
                t.*,
                u1.username AS proposer_name,
                u2.username AS receiver_name,
                ap1.team_name AS proposer_team,
                ap2.team_name AS receiver_team
            FROM trades t
            JOIN users u1 ON t.proposer_id = u1.id
            JOIN users u2 ON t.receiver_id = u2.id
            JOIN auction_participants ap1 ON t.proposer_id = ap1.user_id AND t.auction_id = ap1.auction_id
            JOIN auction_participants ap2 ON t.receiver_id = ap2.user_id AND t.auction_id = ap2.auction_id
            WHERE t.auction_id = %s
              AND (t.proposer_id = %s OR t.receiver_id = %s)
              AND t.status = 'pending'
            ORDER BY t.created_at DESC
        """, (auction_id, user_id, user_id))

        trades = cur.fetchall()

        for trade in trades:
            if trade['proposer_players']:
                cur.execute("SELECT id, name FROM players WHERE id = ANY(%s)", (trade['proposer_players'],))
                trade['proposer_players_details'] = cur.fetchall()
            else:
                trade['proposer_players_details'] = []

            if trade['receiver_players']:
                cur.execute("SELECT id, name FROM players WHERE id = ANY(%s)", (trade['receiver_players'],))
                trade['receiver_players_details'] = cur.fetchall()
            else:
                trade['receiver_players_details'] = []

        cur.close()
        return jsonify(trades), 200
    except Exception as e:
        print(f"Error fetching trades: {e}")
        return jsonify({"error": "Failed to fetch trades"}), 500


@app.route("/api/auctions/<int:auction_id>/trade_history", methods=["GET"])
def get_trade_history(auction_id):
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute("""
            SELECT
                t.*,
                u1.username AS proposer_name,
                u2.username AS receiver_name,
                ap1.team_name AS proposer_team,
                ap2.team_name AS receiver_team
            FROM trades t
            JOIN users u1 ON t.proposer_id = u1.id
            JOIN users u2 ON t.receiver_id = u2.id
            JOIN auction_participants ap1 ON t.proposer_id = ap1.user_id AND t.auction_id = ap1.auction_id
            JOIN auction_participants ap2 ON t.receiver_id = ap2.user_id AND t.auction_id = ap2.auction_id
            WHERE t.auction_id = %s
              AND t.status IN ('accepted', 'rejected', 'cancelled')
            ORDER BY t.updated_at DESC
            LIMIT 50
        """, (auction_id,))

        trades = cur.fetchall()
        cur.close()
        return jsonify(trades), 200
    except Exception as e:
        print(f"Error fetching trade history: {e}")
        return jsonify({"error": "Failed to fetch trade history"}), 500
# ============================================
# TRADE SOCKET HANDLERS
# ============================================

@socketio.on("propose_trade")
def handle_propose_trade(data):
    """
    Propose a trade to another participant
    Data: {
        auction_id, proposer_id, receiver_id,
        proposer_players: [player_ids], proposer_cash,
        receiver_players: [player_ids], receiver_cash
    }
    """
    auction_id = str(data.get("auction_id"))
    proposer_id = data.get("proposer_id")
    receiver_id = data.get("receiver_id")
    proposer_players = data.get("proposer_players", [])
    proposer_cash = data.get("proposer_cash", 0)
    receiver_players = data.get("receiver_players", [])
    receiver_cash = data.get("receiver_cash", 0)
    
    room = f"lobby_{auction_id}"
    
    print(f"Trade proposed: User {proposer_id} -> User {receiver_id}")
    
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Get team IDs and names for both users
        cur.execute("""
            SELECT user_id, team_id, team_name
            FROM auction_participants 
            WHERE auction_id = %s AND user_id IN (%s, %s)
        """, (auction_id, proposer_id, receiver_id))
        
        participants = cur.fetchall()
        proposer_team_id = None
        receiver_team_id = None
        proposer_team_name = None
        receiver_team_name = None
        
        for p in participants:
            if p['user_id'] == proposer_id:
                proposer_team_id = p['team_id']
                proposer_team_name = p['team_name']
            if p['user_id'] == receiver_id:
                receiver_team_id = p['team_id']
                receiver_team_name = p['team_name']

        if proposer_team_name is None or receiver_team_name is None:
            emit("trade_error", {"message": "Invalid participants"}, room=request.sid)
            cur.close()
            conn.close()
            return

        # Ensure both participants have team rows linked for this auction.
        if not proposer_team_id:
            cur.execute("""
                INSERT INTO teams (name, manager_id, rating, value, status, created_at)
                VALUES (%s, %s, 0, 0, 'ACTIVE', NOW())
                RETURNING id
            """, (proposer_team_name, proposer_id))
            proposer_team_id = cur.fetchone()['id']
            cur.execute("""
                UPDATE auction_participants
                SET team_id = %s
                WHERE auction_id = %s AND user_id = %s
            """, (proposer_team_id, auction_id, proposer_id))

        if not receiver_team_id:
            cur.execute("""
                INSERT INTO teams (name, manager_id, rating, value, status, created_at)
                VALUES (%s, %s, 0, 0, 'ACTIVE', NOW())
                RETURNING id
            """, (receiver_team_name, receiver_id))
            receiver_team_id = cur.fetchone()['id']
            cur.execute("""
                UPDATE auction_participants
                SET team_id = %s
                WHERE auction_id = %s AND user_id = %s
            """, (receiver_team_id, auction_id, receiver_id))
        
        # Validate proposer owns the players they're offering
        if proposer_players:
            cur.execute("""
                SELECT COUNT(*) as count
                FROM team_players
                WHERE team_id = %s AND player_id = ANY(%s)
            """, (proposer_team_id, proposer_players))
            
            owned_count = cur.fetchone()['count']
            if owned_count != len(proposer_players):
                emit("trade_error", {"message": "You don't own all the players you're offering"}, room=request.sid)
                cur.close()
                conn.close()
                return

        # Validate receiver owns any players that proposer is requesting
        if receiver_players:
            cur.execute("""
                SELECT COUNT(*) as count
                FROM team_players
                WHERE team_id = %s AND player_id = ANY(%s)
            """, (receiver_team_id, receiver_players))
            owned_count = cur.fetchone()['count']
            if owned_count != len(receiver_players):
                emit("trade_error", {"message": "Requested players are no longer available"}, room=request.sid)
                cur.close()
                conn.close()
                return
        
        # Validate proposer has enough cash
        if proposer_cash > 0:
            cur.execute("""
                SELECT budget FROM auction_participants
                WHERE auction_id = %s AND user_id = %s
            """, (auction_id, proposer_id))
            
            budget = cur.fetchone()['budget']
            if budget < proposer_cash:
                emit("trade_error", {"message": "Insufficient budget"}, room=request.sid)
                cur.close()
                conn.close()
                return
        
        # Insert trade offer
        cur.execute("""
            INSERT INTO trades (
                auction_id, proposer_id, receiver_id,
                proposer_team_id, receiver_team_id,
                proposer_players, proposer_cash,
                receiver_players, receiver_cash,
                status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
            RETURNING id
        """, (
            auction_id, proposer_id, receiver_id,
            proposer_team_id, receiver_team_id,
            proposer_players, proposer_cash,
            receiver_players, receiver_cash
        ))
        
        trade_id = cur.fetchone()['id']
        conn.commit()
        
        # Get player names for notification
        player_names_proposer = []
        player_names_receiver = []
        
        if proposer_players:
            cur.execute("SELECT name FROM players WHERE id = ANY(%s)", (proposer_players,))
            player_names_proposer = [row['name'] for row in cur.fetchall()]
        
        if receiver_players:
            cur.execute("SELECT name FROM players WHERE id = ANY(%s)", (receiver_players,))
            player_names_receiver = [row['name'] for row in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        # Emit to receiver
        emit("trade_proposed", {
            "trade_id": trade_id,
            "proposer_id": proposer_id,
            "receiver_id": receiver_id,
            "proposer_team": proposer_team_name,
            "receiver_team": receiver_team_name,
            "proposer_players": player_names_proposer,
            "proposer_cash": proposer_cash,
            "receiver_players": player_names_receiver,
            "receiver_cash": receiver_cash
        }, room=room, include_self=False)
        
        # Confirm to proposer
        emit("trade_sent", {
            "trade_id": trade_id,
            "proposer_id": proposer_id,
            "receiver_id": receiver_id,
            "message": "Trade offer sent successfully"
        }, room=request.sid)
        
        print(f"Trade {trade_id} created successfully")
        
    except Exception as e:
        print(f"Error proposing trade: {e}")
        if 'conn' in locals() and conn:
            conn.rollback()
        emit("trade_error", {"message": "Failed to propose trade"}, room=request.sid)


@socketio.on("accept_trade")
def handle_accept_trade(data):
    """Accept a trade offer"""
    trade_id = data.get("trade_id")
    user_id = data.get("user_id")
    
    print(f"User {user_id} accepting trade {trade_id}")
    
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Get trade details
        cur.execute("""
            SELECT * FROM trades
            WHERE id = %s AND receiver_id = %s AND status = 'pending'
        """, (trade_id, user_id))
        
        trade = cur.fetchone()
        
        if not trade:
            emit("trade_error", {"message": "Trade not found or already processed"}, room=request.sid)
            cur.close()
            conn.close()
            return
        
        auction_id = trade['auction_id']
        room = f"lobby_{auction_id}"
        
        # Re-validate receiver owns the players
        if trade['receiver_players']:
            cur.execute("""
                SELECT COUNT(*) as count
                FROM team_players
                WHERE team_id = %s AND player_id = ANY(%s)
            """, (trade['receiver_team_id'], trade['receiver_players']))
            
            owned_count = cur.fetchone()['count']
            if owned_count != len(trade['receiver_players']):
                emit("trade_error", {"message": "You no longer own all the requested players"}, room=request.sid)
                cur.close()
                conn.close()
                return
        
        # Re-validate receiver has enough cash
        if trade['receiver_cash'] > 0:
            cur.execute("""
                SELECT budget FROM auction_participants
                WHERE auction_id = %s AND user_id = %s
            """, (auction_id, user_id))
            
            budget = cur.fetchone()['budget']
            if budget < trade['receiver_cash']:
                emit("trade_error", {"message": "Insufficient budget"}, room=request.sid)
                cur.close()
                conn.close()
                return
        
        # EXECUTE TRADE
        # 1. Transfer proposer's players to receiver
        if trade['proposer_players']:
            for player_id in trade['proposer_players']:
                cur.execute("""
                    UPDATE team_players
                    SET team_id = %s
                    WHERE team_id = %s AND player_id = %s
                """, (trade['receiver_team_id'], trade['proposer_team_id'], player_id))
        
        # 2. Transfer receiver's players to proposer
        if trade['receiver_players']:
            for player_id in trade['receiver_players']:
                cur.execute("""
                    UPDATE team_players
                    SET team_id = %s
                    WHERE team_id = %s AND player_id = %s
                """, (trade['proposer_team_id'], trade['receiver_team_id'], player_id))
        
        # 3. Update budgets
        if trade['proposer_cash'] > 0:
            # Proposer gives cash to receiver
            cur.execute("""
                UPDATE auction_participants
                SET budget = budget - %s
                WHERE auction_id = %s AND user_id = %s
            """, (trade['proposer_cash'], auction_id, trade['proposer_id']))
            
            cur.execute("""
                UPDATE auction_participants
                SET budget = budget + %s
                WHERE auction_id = %s AND user_id = %s
            """, (trade['proposer_cash'], auction_id, trade['receiver_id']))
        
        if trade['receiver_cash'] > 0:
            # Receiver gives cash to proposer
            cur.execute("""
                UPDATE auction_participants
                SET budget = budget - %s
                WHERE auction_id = %s AND user_id = %s
            """, (trade['receiver_cash'], auction_id, trade['receiver_id']))
            
            cur.execute("""
                UPDATE auction_participants
                SET budget = budget + %s
                WHERE auction_id = %s AND user_id = %s
            """, (trade['receiver_cash'], auction_id, trade['proposer_id']))
        
        # 4. Update trade status
        cur.execute("""
            UPDATE trades
            SET status = 'accepted', updated_at = NOW()
            WHERE id = %s
        """, (trade_id,))
        
        conn.commit()
        
        # Get updated budgets
        cur.execute("""
            SELECT user_id, budget FROM auction_participants
            WHERE auction_id = %s AND user_id IN (%s, %s)
        """, (auction_id, trade['proposer_id'], trade['receiver_id']))
        
        budgets = {row['user_id']: row['budget'] for row in cur.fetchall()}
        
        cur.close()
        conn.close()
        
        # Notify both parties
        emit("trade_completed", {
            "trade_id": trade_id,
            "proposer_id": trade['proposer_id'],
            "receiver_id": trade['receiver_id'],
            "budgets": budgets
        }, room=room)
        
        print(f"Trade {trade_id} completed successfully")
        
    except Exception as e:
        print(f"Error accepting trade: {e}")
        if 'conn' in locals() and conn:
            conn.rollback()
        emit("trade_error", {"message": "Failed to complete trade"}, room=request.sid)


@socketio.on("reject_trade")
def handle_reject_trade(data):
    """Reject a trade offer"""
    trade_id = data.get("trade_id")
    user_id = data.get("user_id")
    
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Update trade status
        cur.execute("""
            UPDATE trades
            SET status = 'rejected', updated_at = NOW()
            WHERE id = %s AND receiver_id = %s AND status = 'pending'
            RETURNING auction_id, proposer_id
        """, (trade_id, user_id))
        
        result = cur.fetchone()
        
        if not result:
            emit("trade_error", {"message": "Trade not found"}, room=request.sid)
            cur.close()
            conn.close()
            return
        
        conn.commit()
        cur.close()
        conn.close()
        
        room = f"lobby_{result['auction_id']}"
        
        # Notify proposer
        emit("trade_rejected", {
            "trade_id": trade_id,
            "receiver_id": user_id,
            "proposer_id": result['proposer_id']
        }, room=room)
        
        print(f"Trade {trade_id} rejected by user {user_id}")
        
    except Exception as e:
        print(f"Error rejecting trade: {e}")
        if 'conn' in locals() and conn:
            conn.rollback()
        emit("trade_error", {"message": "Failed to reject trade"}, room=request.sid)


@socketio.on("cancel_trade")
def handle_cancel_trade(data):
    """Cancel own trade offer"""
    trade_id = data.get("trade_id")
    user_id = data.get("user_id")
    
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Update trade status
        cur.execute("""
            UPDATE trades
            SET status = 'cancelled', updated_at = NOW()
            WHERE id = %s AND proposer_id = %s AND status = 'pending'
            RETURNING auction_id, receiver_id
        """, (trade_id, user_id))
        
        result = cur.fetchone()
        
        if not result:
            emit("trade_error", {"message": "Trade not found"}, room=request.sid)
            cur.close()
            conn.close()
            return
        
        conn.commit()
        cur.close()
        conn.close()
        
        room = f"lobby_{result['auction_id']}"
        
        # Notify receiver
        emit("trade_cancelled", {
            "trade_id": trade_id,
            "proposer_id": user_id,
            "receiver_id": result['receiver_id']
        }, room=room)
        
        print(f"Trade {trade_id} cancelled by user {user_id}")
        
    except Exception as e:
        print(f"Error cancelling trade: {e}")
        if 'conn' in locals() and conn:
            conn.rollback()
        emit("trade_error", {"message": "Failed to cancel trade"}, room=request.sid)


if __name__ == '__main__':
    socketio.run(
        app,
        host='0.0.0.0',
        debug=True,
        use_reloader=False,
        port=5000,
        allow_unsafe_werkzeug=True,
    )
