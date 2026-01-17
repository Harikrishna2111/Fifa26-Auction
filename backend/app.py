from flask import Flask, request, jsonify
from db import get_db, close_db
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3

app = Flask(__name__)
CORS(app, supports_credentials=True)
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
        conn.execute(
            "INSERT INTO users (fullname, username, password_hash) VALUES (?, ?, ?)",
            (fullname, username, password_hash)
        )
        conn.commit()
        conn.close()
    except sqlite3.IntegrityError:
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
    user = conn.execute(
        "SELECT * FROM users WHERE username = ?",
        (username,)
    ).fetchone()
    conn.close()

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
        
    db = get_db()

    search = request.args.get("search", "").strip()
    position = request.args.get("position", "")
    limit = int(request.args.get("limit", 1000))  # Increased default limit
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
        query += " AND position_group = ?"
        params.append(position)

    if search:
        query += """
            AND (
                name LIKE ?
                OR club LIKE ?
                OR nation LIKE ?
            )
        """
        like = f"%{search}%"
        params.extend([like, like, like])

    query += """
        ORDER BY overall DESC
        LIMIT ? OFFSET ?
    """

    params.extend([limit, offset])

    rows = db.execute(query, params).fetchall()
    players = [dict(row) for row in rows]
    return jsonify(players)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
