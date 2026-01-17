from flask import Flask, request, jsonify
from db import get_db, close_db
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow React frontend
app.teardown_appcontext(close_db)




@app.route("/api/players", methods=["GET"])
def get_players():
    db = get_db()

    search = request.args.get("search", "").strip()
    position = request.args.get("position", "")
    limit = int(request.args.get("limit", 20))
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
