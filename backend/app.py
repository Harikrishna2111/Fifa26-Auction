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
r = redis.Redis(host='localhost', port=6379, decode_responses=True)

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
        WHERE manager_id = %s
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

    # Find the team for this user in the given auction
    cur.execute(
        "SELECT team_id FROM auction_results WHERE auction_id = %s AND user_id = %s",
        (auction_id, user_id)
    )
    row = cur.fetchone()
    if not row:
        cur.close()
        return jsonify([]), 200

    team_id = row["team_id"]

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

        WHERE t.manager_id = %s

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

@app.route("/api/lobby/create", methods=["POST"])
def create_lobby():
    data = request.json
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    import random, string
    join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    cur.execute("""
        INSERT INTO auctions (
            name, season, status,
            join_code, host_id,
            purse_per_team,
            bid_inc_min, bid_inc_mid, bid_inc_max,
            min_players, bidding_time
        )
        VALUES (%s, %s, 'LOBBY', %s, %s, %s, %s, %s, %s, %s, %s)
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
        data["bidding_time"]
    ))

    result = cur.fetchone()
    auction_id = result["id"]
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

    # Add participant with team name
    cur.execute("""
        INSERT INTO auction_participants (auction_id, user_id, team_name)
        VALUES (%s, %s, %s)
        ON CONFLICT (auction_id, user_id) DO UPDATE SET team_name = EXCLUDED.team_name
        RETURNING auction_id
    """, (data["auction_id"], data["user_id"], data["team_name"]))

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
            a.status,
            a.join_code,
            a.host_id,
            a.purse_per_team,
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

    cur.execute("""
        SELECT
            ap.user_id,
            u.username,
            ap.team_name
        FROM auction_participants ap
        JOIN users u ON u.id = ap.user_id
        WHERE ap.auction_id = %s
        ORDER BY ap.joined_at
    """, (auction_id,))

    participants = cur.fetchall()
    cur.close()

    return jsonify([dict(p) for p in participants])

@socketio.on("join_lobby")
def join_lobby_socket(data):
    room = f"lobby_{data['auction_id']}"
    join_room(room)

    emit("user_joined", {
        "user_id": data["user_id"],
        "team_name": data["team_name"]
    }, room=room)

@socketio.on("leave_lobby")
def leave_lobby_socket(data):
    auction_id = data['auction_id']
    user_id = data['user_id']
    room = f"lobby_{auction_id}"
    
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

@socketio.on("start_auction")
def start_auction(data):
    auction_id = data["auction_id"]

    r.set(f"auction:{auction_id}:status", "LIVE")
    emit("auction_started", {}, room=f"lobby_{auction_id}")


if __name__ == '__main__':
    # Run with SocketIO support
    socketio.run(app, host='0.0.0.0', debug=True, port=5000, allow_unsafe_werkzeug=True)