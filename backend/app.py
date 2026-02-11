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
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

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
        
    def scard(self, name):
         if name in self.store and isinstance(self.store[name], set):
             return len(self.store[name])
         return 0
    
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
    r = redis.Redis(host='localhost', port=6379, decode_responses=True)
    r.ping() # Test connection
    print("✓ Redis connected successfully")
except redis.exceptions.ConnectionError:
    print("⚠ Redis connection failed. Using in-memory fallback (MockRedis).")
    r = MockRedis()

app.teardown_appcontext(close_db)

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
            a.season,
            a.status,
            a.end_date,
            t.name AS acquired_team
        FROM auctions a
        LEFT JOIN auction_players ap ON ap.auction_id = a.id
        LEFT JOIN teams t ON ap.winning_team_id = t.id
        WHERE a.status IN ('COMPLETED', 'PAUSED')
        GROUP BY a.id, t.name
        ORDER BY a.end_date DESC
        LIMIT 3
    """)
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

    # My Teams
    cur.execute("""
        SELECT
            id,
            name,
            rating,
            value,
            stars,
            status
        FROM teams
        WHERE manager_id = %s AND status = 'IDLE'
        ORDER BY created_at DESC
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
            "status": team["status"],
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

    cur.execute("""
        SELECT
            t.id AS team_id,
            t.name AS team_name,
            t.rating AS team_ovr,
            t.status,
            COALESCE(SUM(p.value), 0) AS market_value,
            COUNT(tp.player_id) AS player_count,

            CASE
                WHEN a.status IN ('LIVE', 'PAUSED') THEN 'ACTIVE'
                ELSE 'IDLE'
            END AS auction_state

        FROM teams t
        LEFT JOIN team_players tp ON tp.team_id = t.id
        LEFT JOIN players p ON p.id = tp.player_id
        LEFT JOIN auction_results ar ON ar.team_id = t.id
        LEFT JOIN auctions a ON a.id = ar.auction_id

        WHERE t.manager_id = %s AND t.status = 'IDLE'

        GROUP BY t.id, a.status
        ORDER BY auction_state DESC, t.name
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
        data["auction_name"],
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
        WHERE join_code = %s AND status = 'LOBBY'
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
    cur.execute("SELECT purse_per_team FROM auctions WHERE id = %s", (data["auction_id"],))
    auction = cur.fetchone()
    initial_budget = auction["purse_per_team"] if auction else 0

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
        ORDER BY ap.joined_at
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
        ORDER BY overall DESC
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

@socketio.on("join_lobby")
def join_lobby_socket(data):
    room = f"lobby_{str(data['auction_id'])}"
    join_room(room)
    print(f"User {data['user_id']} joined room: {room}")

    # Ensure user is in DB (Wrap in try block to prevent FK errors from blocking sync)
    try:
        if int(data['user_id']) > 0:
            conn = get_db()
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO auction_participants (auction_id, user_id, team_name)
                VALUES (%s, %s, %s)
                ON CONFLICT (auction_id, user_id) DO NOTHING
            """, (data['auction_id'], data['user_id'], data['team_name']))
            conn.commit()
            cur.close()
    except Exception as e:
        print(f"Error adding participant {data['user_id']}: {e}")

    emit("user_joined", {
        "user_id": data["user_id"],
        "team_name": data["team_name"]
    }, room=room)
    
    # Send Current Sync State
    # Only applicable if Auction is LIVE or PAUSED
    auction_id_str = str(data['auction_id'])
    status = r.get(f"auction:{auction_id_str}:status")

    if status == "LIVE" or status == "PAUSED":
        index = r.get(f"auction:{auction_id_str}:index") or 0
        current_bid = r.hgetall(f"auction:{auction_id_str}:current_bid")
        expires = r.get(f"auction:{auction_id_str}:round_expires")

        emit("sync_auction", {
            "current_index": int(index),
            "highest_bid": int(current_bid.get("amount", 0)),
            "highest_bidder": current_bid.get("bidder", "None"),
            "round_expires": float(expires) if expires else None,
            "status": status
        }, room=request.sid) # Only to this user

@socketio.on("leave_lobby")
def leave_lobby_socket(data):
    auction_id = data['auction_id']
    user_id = data['user_id']
    room = f"lobby_{str(auction_id)}"
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM auction_participants WHERE auction_id = %s AND user_id = %s",
        (auction_id, user_id)
    )
    conn.commit()
    cur.close()
    
    leave_room(room)
    emit("user_left", {"user_id": user_id}, room=room)

@socketio.on("place_bid")
def handle_place_bid(data):
    auction_id = str(data.get("auction_id"))
    amount = data.get("amount")
    bidder = data.get("bidder") # team_name
    user_id = data.get("user_id") # New: Track user ID for reliable updates
    
    room = f"lobby_{auction_id}"
    
    # Store in Redis
    redis_key = f"auction:{auction_id}:current_bid"
    r.hset(redis_key, mapping={
        "amount": amount,
        "bidder": bidder,
        "user_id": user_id if user_id else "",
        "timestamp": time.time()
    })
    
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

    # Clear any pass votes since a new bid restarts the clock/logic
    r.delete(f"auction:{auction_id}:passes")
    
    print(f"Bid stored in Redis for {room}: {amount} by {bidder}")
    
    # Broadcast to all users in the room
    emit("bid_placed", {
        "amount": amount,
        "bidder": bidder,
        "timestamp": time.time(),
        "round_expires": new_expires 
    }, room=room)


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
                         # Insert into team_players table
                         cur.execute("""
                            INSERT INTO team_players (team_id, player_id, acquired_price)
                            VALUES (%s, %s, %s)
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
    auction_id = str(data.get("auction_id"))
    user_id = data.get("user_id")
    
    room = f"lobby_{auction_id}"
    pass_key = f"auction:{auction_id}:passes"
    
    # Add user to set of passes
    r.sadd(pass_key, user_id)
    pass_count = r.scard(pass_key)
    
    # Get total active participants
    # Note: socket only tracks connections, but we want DB participants count ideally
    # For speed, we can check Redis if we tracked participants there, but let's query DB for accuracy or use room size
    # Using DB is safer for "Registered Participants"
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM auction_participants WHERE auction_id = %s", (auction_id,))
    total_participants = cur.fetchone()[0]
    cur.close()
    
    print(f"Pass vote: {pass_count}/{total_participants} in {room}")
    
    # If all participants passed
    if pass_count >= total_participants:
        # Check if there is an active bid
        current_bid = r.hgetall(f"auction:{auction_id}:current_bid")
        if not current_bid:
             # No bid + All Passed = Unsold immediately
             emit("player_finalized", {
                 "result": "unsold",
                 "bidder": "None",
                 "amount": 0
             }, room=room)
             r.delete(pass_key)
    else:
        # Just notify (optional, maybe update UI with X/Y passed)
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
            SELECT COUNT(tp.id) as sold_count, COALESCE(SUM(tp.acquired_price), 0) as total_spent
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
        emit("auction_started", {"season": season}, room=room)
        
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
    
    # Reset State for new round
    r.delete(f"auction:{auction_id}:current_bid")
    r.delete(f"auction:{auction_id}:passes")
    
    # Reset Timer
    bidding_time = int(r.get(f"auction:{auction_id}:config_time") or 30)
    expires = time.time() + bidding_time
    r.set(f"auction:{auction_id}:round_expires", expires)

    emit("round_changed", {
        "current_index": new_index,
        "round_expires": expires
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
            "round_expires": new_expires
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


if __name__ == '__main__':
    # Run with SocketIO support
    socketio.run(app, host='0.0.0.0', debug=True, port=5000, allow_unsafe_werkzeug=True)