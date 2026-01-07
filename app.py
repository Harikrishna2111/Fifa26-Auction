from flask import Flask, render_template, request, redirect, session
from flask_socketio import SocketIO, emit, join_room, leave_room
import time
import sqlite3
import uuid



app = Flask(__name__)
app.secret_key = "auction_secret"

socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")


def get_db():
    conn = sqlite3.connect("auction.db")
    conn.row_factory = sqlite3.Row
    return conn




def is_admin(lobby_code):
    return session.get("username") == lobbies[lobby_code]["admin"]


@app.route("/")
def index():
    return render_template("index.html")





@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    lobby_id = request.form.get("lobby_id")

    session["username"] = username

    # If lobby ID is given, join it
    if lobby_id:
        return redirect(f"/lobby/{lobby_id}")

    # Else create new lobby
    new_lobby_id = str(uuid.uuid4())[:6]
    return redirect(f"/lobby/{new_lobby_id}")

@app.route('/lobby') 
def lobby_home(): 
    if 'username' not in session: 
        return redirect('/') 
    return render_template('lobby.html')


@app.route("/lobby/<lobby_id>")
def lobby_room(lobby_id):
    if "username" not in session:
        return redirect("/")
    return render_template(
        "lobby.html",
        lobby_id=lobby_id,
        username=session["username"],
        is_admin=is_admin(lobby_id)
    )

lobbies = {}
trade_requests = {}


@socketio.on("join_lobby")
def handle_join(data):
    lobby = data["lobby"]
    user = data["user"]

    if lobby not in lobbies:
        lobbies[lobby] = {
            "admin": user,
            "players": [],
            "budget": 0,
            "players_data": []
        }

    if user not in lobbies[lobby]["players"]:
        lobbies[lobby]["players"].append(user)

    join_room(lobby)
    emit("lobby_update", lobbies[lobby], room=lobby)


@socketio.on("upload_players")
def handle_upload(data):
    lobby = data["lobby"]
    lobbies[lobby]["players_data"] = data["players"]
    lobbies[lobby]["budget"] = int(data["budget"])


@socketio.on("start_auction")
def handle_start(data):
    lobby = data["lobby"]
    emit("auction_started", room=lobby)


@app.route('/auction/<lobby_code>')
def auction_room(lobby_code):
    if 'username' not in session:
        return redirect('/')

    # TEMP dummy data (will come from JSON + SocketIO later)
    player = {
        "name": "Kylian Mbappé",
        "ovr": 91,
        "position": "ST",
        "pace": 97,
        "shooting": 89,
        "passing": 80,
        "dribbling": 92,
        "defending": 36,
        "physical": 77,
        "image": "https://via.placeholder.com/300"
    }

    teams = [
        {"name": "Team A", "budget": 900, "players": []},
        {"name": "Team B", "budget": 850, "players": []}
    ]

    return render_template(
        'auction.html',
        player=player,
        teams=teams,
        current_bid=100,
        highest_bidder="Team A",
        is_admin=session.get('is_admin', False)
    )


@app.route('/trade/<lobby_code>', methods=['GET', 'POST'])
def trade(lobby_code):
    if 'username' not in session:
        return redirect('/')

    # TEMP dummy data
    my_team = [
        {"name": "Messi", "position": "RW", "price": 120},
        {"name": "De Bruyne", "position": "CM", "price": 100}
    ]

    other_teams = [
        {
            "name": "Team B",
            "players": [
                {"name": "Haaland"},
                {"name": "Vinicius Jr"}
            ]
        }
    ]

    incoming_trades = [
        {
            "from_team": "Team B",
            "offer_player": "Haaland",
            "money": 50,
            "request_player": "Messi"
        }
    ]

    return render_template(
        'trade.html',
        lobby_code=lobby_code,
        my_team=my_team,
        my_budget=300,
        other_teams=other_teams,
        incoming_trades=incoming_trades
    )

@app.route("/create_lobby", methods=["GET", "POST"])
def create_lobby():
    if "username" not in session:
        return redirect("/")

    lobby_code = str(uuid.uuid4())[:6]

    lobbies[lobby_code] = {
        "admin": session["username"],
        "players": [session["username"]],
        "teams": {
            session["username"]: {
                "budget": 1000,
                "players": []
            }
        },
        "players_data": [],
        "current_bid": 0,
        "highest_bidder": None,
        "timer": 10,
        "paused": False,
        "skips": set(),
        "unsold": [],
        "current_index": 0,
        "status": "waiting"
    }

    trade_requests[lobby_code] = []

    return redirect(f"/lobby/{lobby_code}")


@app.route("/join_lobby", methods=["POST"])
def join_lobby_http():
    if "username" not in session:
        return redirect("/")

    lobby_code = request.form.get("lobby_code")

    if lobby_code not in lobbies:
        return "Lobby not found", 404

    return redirect(f"/lobby/{lobby_code}")


@app.route('/summary/<lobby_code>')
def summary(lobby_code):
    db = get_db()
    cursor = db.cursor()

    teams = cursor.execute("""
    SELECT name, budget FROM teams WHERE lobby_code=?
    """, (lobby_code,)).fetchall()

    result = []
    for team in teams:
        players = cursor.execute("""
        SELECT player_name, price FROM squad
        WHERE lobby_code=? AND team_name=?
        """, (lobby_code, team["name"])).fetchall()

        result.append({
            "name": team["name"],
            "budget": team["budget"],
            "players": players
        })

    unsold = cursor.execute("""
    SELECT player_name FROM unsold WHERE lobby_code=?
    """, (lobby_code,)).fetchall()

    db.close()

    return render_template(
        "summary.html",
        teams=result,
        unsold_players=unsold
    )


@socketio.on("place_bid")
def place_bid(data):
    lobby_code = data["lobby_code"]
    team = data["team"]
    bid_amount = data["amount"]

    lobby = lobbies[lobby_code]

    if bid_amount > lobby["current_bid"]:
        lobby["current_bid"] = bid_amount
        lobby["highest_bidder"] = team
        lobby["timer"] = 10  # reset timer

        emit("bid_update", {
            "bid": bid_amount,
            "bidder": team
        }, room=lobby_code)

@socketio.on("skip_player")
def skip_player(data):
    lobby_code = data["lobby_code"]
    team = data["team"]

    lobby = lobbies[lobby_code]
    lobby["skips"].add(team)

    if len(lobby["skips"]) == len(lobby["teams"]):
        emit("player_unsold", room=lobby_code)
        lobby["skips"].clear()
    else:
        emit("skip_update", {
            "skipped_by": team
        }, room=lobby_code)

@socketio.on("pause_auction")
def pause_auction(data):
    lobby_code = data["lobby_code"]

    lobbies[lobby_code]["paused"] = True
    emit("auction_paused", room=lobby_code)


@socketio.on("resume_auction")
def resume_auction(data):
    lobby_code = data["lobby_code"]

    lobbies[lobby_code]["paused"] = False
    emit("auction_resumed", room=lobby_code)

def auction_timer(lobby_code):
    while True:
        lobby = lobbies[lobby_code]

        if not lobby["paused"]:
            lobby["timer"] -= 1

            emit("timer_update", {
                "time": lobby["timer"]
            }, room=lobby_code)

            if lobby["timer"] <= 0:
                emit("player_sold", {
                    "winner": lobby["highest_bidder"],
                    "price": lobby["current_bid"]
                }, room=lobby_code)

                break

        socketio.sleep(1)

@app.route('/upload-json/<lobby_code>', methods=['POST'])
def upload_json(lobby_code):
    if 'username' not in session:
        return redirect('/')

    if 'player_json' not in request.files:
        return "No file uploaded", 400

    file = request.files['player_json']

    data = json.load(file)

    # Initialize lobby auction data
    lobbies[lobby_code]["players"] = data["auction_order"]
    lobbies[lobby_code]["current_index"] = 0
    lobbies[lobby_code]["settings"] = data.get("settings", {})
    lobbies[lobby_code]["unsold"] = []

    return redirect(f"/auction/{lobby_code}")

def load_next_player(lobby_code):
    lobby = lobbies[lobby_code]
    idx = lobby["current_index"]

    if idx >= len(lobby["players"]):
        return None

    player = lobby["players"][idx]

    lobby["current_player"] = player
    lobby["current_bid"] = lobby["settings"].get("base_price", 0)
    lobby["highest_bidder"] = None
    lobby["timer"] = 10
    lobby["skips"] = set()

    lobby["current_index"] += 1

    return player

@socketio.on("start_auction")
def start_auction(data):
    lobby_code = data["lobby_code"]

    player = load_next_player(lobby_code)
    if player:
        emit("new_player", player, room=lobby_code)
        socketio.start_background_task(auction_timer, lobby_code)

def finalize_player(lobby_code):
    lobby = lobbies[lobby_code]

    winner = lobby["highest_bidder"]
    price = lobby["current_bid"]
    player = lobby["current_player"]

    if winner:
        lobby["teams"][winner]["players"].append({
            "name": player["name"],
            "price": price
        })
        lobby["teams"][winner]["budget"] -= price
    else:
        lobby["unsold"].append(player)
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    INSERT INTO squad (lobby_code, team_name, player_name, price)
    VALUES (?, ?, ?, ?)
    """, (lobby_code, winner, player["name"], price))

    cursor.execute("""
    UPDATE teams SET budget = budget - ?
    WHERE lobby_code=? AND name=?
    """, (price, lobby_code, winner))
    cursor.execute("""
INSERT INTO unsold (lobby_code, player_name)
VALUES (?, ?)
""", (lobby_code, player["name"]))
    db.commit()
    db.close()
    emit("player_finalized", {
        "player": player,
        "winner": winner,
        "price": price
    }, room=lobby_code)

    socketio.sleep(10)  # gap between players

    next_player = load_next_player(lobby_code)
    if next_player:
        emit("new_player", next_player, room=lobby_code)
        socketio.start_background_task(auction_timer, lobby_code)
    else:
        emit("auction_finished", room=lobby_code)


@socketio.on("skip_player")
def skip_player(data):
    lobby_code = data["lobby_code"]
    team = data["team"]

    lobby = lobbies[lobby_code]
    lobby["skips"].add(team)

    if len(lobby["skips"]) == len(lobby["teams"]):
        lobby["highest_bidder"] = None
        finalize_player(lobby_code)

@socketio.on("send_trade")
def send_trade(data):
    lobby_code = data["lobby_code"]

    trade = {
        "id": str(time.time()),
        "from_team": data["from_team"],
        "to_team": data["to_team"],
        "offer_player": data.get("offer_player"),
        "offer_money": data.get("offer_money", 0),
        "request_player": data["request_player"],
        "status": "pending"
    }

    trade_requests[lobby_code].append(trade)

    emit("trade_received", trade, room=lobby_code)
@socketio.on("accept_trade")
def accept_trade(data):
    lobby_code = data["lobby_code"]
    trade_id = data["trade_id"]

    lobby = lobbies[lobby_code]

    trade = next(t for t in trade_requests[lobby_code] if t["id"] == trade_id)

    from_team = lobby["teams"][trade["from_team"]]
    to_team = lobby["teams"][trade["to_team"]]

    # Money transfer
    if trade["offer_money"] > 0:
        from_team["budget"] -= trade["offer_money"]
        to_team["budget"] += trade["offer_money"]

    # Player swap
    if trade["offer_player"]:
        p1 = next(p for p in from_team["players"] if p["name"] == trade["offer_player"])
        p2 = next(p for p in to_team["players"] if p["name"] == trade["request_player"])

        from_team["players"].remove(p1)
        to_team["players"].remove(p2)

        from_team["players"].append(p2)
        to_team["players"].append(p1)
    else:
        # Money → Player
        p = next(p for p in to_team["players"] if p["name"] == trade["request_player"])
        to_team["players"].remove(p)
        from_team["players"].append(p)

    trade["status"] = "accepted"

    emit("trade_completed", trade, room=lobby_code)
    emit("team_update", lobby["teams"], room=lobby_code)
@socketio.on("reject_trade")
def reject_trade(data):
    lobby_code = data["lobby_code"]
    trade_id = data["trade_id"]

    trade = next(t for t in trade_requests[lobby_code] if t["id"] == trade_id)
    trade["status"] = "rejected"

    emit("trade_rejected", trade, room=lobby_code)

@socketio.on("kick_player")
def kick_player(data):
    lobby_code = data["lobby_code"]
    target = data["username"]

    if not is_admin(lobby_code):
        return

    emit("kicked", {"username": target}, room=lobby_code)

@socketio.on("toggle_lobby_lock")
def toggle_lobby_lock(data):
    lobby_code = data["lobby_code"]

    if not is_admin(lobby_code):
        return

    lobbies[lobby_code]["locked"] = not lobbies[lobby_code]["locked"]

    emit("lobby_lock_status", {
        "locked": lobbies[lobby_code]["locked"]
    }, room=lobby_code)

@socketio.on("force_next")
def force_next(data):
    lobby_code = data["lobby_code"]

    if not is_admin(lobby_code):
        return

    finalize_player(lobby_code)

@socketio.on("end_auction")
def end_auction(data):
    lobby_code = data["lobby_code"]

    if not is_admin(lobby_code):
        return

    lobbies[lobby_code]["status"] = "ended"
    emit("auction_finished", room=lobby_code)



socketio.run(app, host="0.0.0.0", port=5000)