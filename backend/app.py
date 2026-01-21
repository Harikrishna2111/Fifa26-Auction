from flask import Flask, request, jsonify, g
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db, close_db
import psycopg2
import psycopg2.extras
import redis
import json
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

    password_hash = generate_password_hash(password)

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (fullname, username, password_hash) VALUES (%s, %s, %s)",
            (fullname, username, password_hash)
        )
        conn.commit()
        cur.close()
    except psycopg2.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409

    return jsonify({"message": "User registered successfully"}), 201

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
        return jsonify({"error": "Invalid credentials"}), 401

    if not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid credentials"}), 401

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

            -- Active auction check
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
    search = request.args.get("search", "")
    position = request.args.get("position")  # FWD / MID / DEF / GK

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    query = """
        SELECT
            id,
            name,
            overall,
            pace,
            sho,
            dri,
            position_group,
            club,
            nation,
            value,
            image_url
        FROM players
        WHERE 1=1
    """
    params = []

    if search:
        query += """
            AND (
                LOWER(name) LIKE %s
                OR LOWER(club) LIKE %s
                OR LOWER(nation) LIKE %s
            )
        """
        like = f"%{search.lower()}%"
        params.extend([like, like, like])

    if position and position != "ALL":
        query += " AND position_group = %s"
        params.append(position)

    query += " ORDER BY overall DESC LIMIT 50"

    cur.execute(query, params)
    players = cur.fetchall()
    cur.close()

    return jsonify(players)


if __name__ == '__main__':
    # Run with SocketIO support
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)