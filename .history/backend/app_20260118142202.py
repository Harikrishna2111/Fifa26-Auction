from flask import Flask, request, jsonify, g
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db, close_db
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

# ==============================================================================
#  HELPER: THE AUCTION TIMER LOOP
# ==============================================================================
def auction_timer_loop(auction_id):
    """
    Runs in the background. Decrements timer every second.
    """
    print(f"⏰ Timer started for Auction {auction_id}")
    
    while True:
        # 1. Check if Auction is still live
        status = r.get(f"auction:{auction_id}:status")
        if status == "COMPLETED" or status is None:
            break
        
        # 2. Check if Paused
        if status == "PAUSED":
            time.sleep(1)
            continue
            
        # 3. Decrement Time
        timer_key = f"auction:{auction_id}:timer"
        current_time = r.decr(timer_key)
        
        # 4. Emit Time to All Users in the Room
        socketio.emit('timer_update', {'time': current_time}, room=f"auction_{auction_id}")
        
        # 5. Handle "SOLD" when time hits 0
        if current_time <= 0:
            handle_sold_logic(auction_id)
            # Reset timer for next player (e.g., 30s)
            r.set(timer_key, 30) 
            time.sleep(2) # Brief pause before next player
            
        time.sleep(1)

def handle_sold_logic(auction_id):
    """
    Moves the current player to 'Sold' in Postgres and fetches the next one.
    """
    # Get Current Bid Info from Redis
    current_bid = r.hgetall(f"auction:{auction_id}:current_bid")
    
    if current_bid and 'amount' in current_bid:
        # SAVE TO POSTGRES (Permanent Record)
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO auction_sales (auction_id, player_id, winner_team_id, sold_price)
            VALUES (%s, %s, %s, %s)
        """, (auction_id, current_bid['player_id'], current_bid['team_id'], current_bid['amount']))
        conn.commit()
        
        # Deduct Money from Team Budget
        cur.execute("""
            UPDATE auction_teams SET budget_remaining = budget_remaining - %s
            WHERE id = %s
        """, (current_bid['amount'], current_bid['team_id']))
        conn.commit()
        
        # Notify Everyone
        socketio.emit('player_sold', {
            'player_id': current_bid['player_id'],
            'amount': current_bid['amount'],
            'winner': current_bid['bidder_name']
        }, room=f"auction_{auction_id}")

        # Clear Bid for next turn
        r.delete(f"auction:{auction_id}:current_bid")

# ==============================================================================
#  HTTP ROUTES (REST API)
# ==============================================================================

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json
    try:
        conn = get_db()
        cur = conn.cursor()
        password_hash = generate_password_hash(data['password'])
        cur.execute(
            "INSERT INTO users (fullname, username, password_hash) VALUES (%s, %s, %s)",
            (data['fullname'], data['username'], password_hash)
        )
        conn.commit()
        return jsonify({"message": "User registered"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, fullname, username, password_hash FROM users WHERE username = %s", (data['username'],))
    user = cur.fetchone()
    
    if user and check_password_hash(user[3], data['password']):
        return jsonify({"message": "Login successful", "user": {"id": user[0], "fullname": user[1]}})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/api/lobby/create", methods=["POST"])
def create_lobby():
    data = request.json
    conn = get_db()
    cur = conn.cursor()
    
    # Generate a simple 6-char code
    import random, string
    join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    cur.execute("""
        INSERT INTO auctions (host_id, name, join_code, purse_per_team, bid_inc_min, bid_inc_mid, bid_inc_max, min_player_rating) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
    """, (data['host_id'], data['name'], join_code, data['purse'], data['inc_min'], data['inc_mid'], data['inc_max'], data['min_rating']))
    auction_id = cur.fetchone()[0]
    conn.commit()
    
    # Initialize Redis State for this Auction
    r.set(f"auction:{auction_id}:status", "LOBBY")
    r.set(f"auction:{auction_id}:timer", 30) # Default 30s timer
    
    return jsonify({"message": "Lobby created", "join_code": join_code, "auction_id": auction_id})

# ==============================================================================
#  SOCKET.IO EVENTS (Real-Time)
# ==============================================================================

@socketio.on('join_auction')
def handle_join(data):
    """
    Called when user enters the Auction Page.
    """
    room = f"auction_{data['auction_id']}"
    join_room(room)
    
    # Send current timer and status immediately
    current_time = r.get(f"auction:{data['auction_id']}:timer")
    current_status = r.get(f"auction:{data['auction_id']}:status")
    
    emit('sync_state', {'time': current_time, 'status': current_status})
    print(f"User {data['user_id']} joined {room}")

@socketio.on('place_bid')
def handle_bid(data):
    """
    Called when user clicks a Bid Button (+5M, +10M, or Custom).
    """
    auction_id = data['auction_id']
    amount = float(data['amount'])
    
    # 1. Update High Bid in Redis
    r.hmset(f"auction:{auction_id}:current_bid", {
        'amount': amount,
        'player_id': data['player_id'],
        'team_id': data['team_id'],
        'bidder_name': data['user_name']
    })
    
    # 2. Reset Timer to 15 seconds (Anti-Sniping rule)
    r.set(f"auction:{auction_id}:timer", 15)
    
    # 3. Notify Everyone
    emit('new_bid', {
        'amount': amount,
        'bidder': data['user_name']
    }, room=f"auction_{auction_id}")

@socketio.on('admin_control')
def handle_admin(data):
    """
    Handles Pause / Resume / Start commands.
    """
    auction_id = data['auction_id']
    action = data['action'] # 'PAUSE', 'RESUME', 'START'
    
    if action == 'START':
        r.set(f"auction:{auction_id}:status", "LIVE")
        # Start the background timer thread
        threading.Thread(target=auction_timer_loop, args=(auction_id,)).start()
        emit('status_update', {'status': 'LIVE'}, room=f"auction_{auction_id}")
        
    elif action == 'PAUSE':
        r.set(f"auction:{auction_id}:status", "PAUSED")
        emit('status_update', {'status': 'PAUSED'}, room=f"auction_{auction_id}")
        
    elif action == 'RESUME':
        r.set(f"auction:{auction_id}:status", "LIVE")
        emit('status_update', {'status': 'LIVE'}, room=f"auction_{auction_id}")

if __name__ == '__main__':
    # Run with SocketIO support
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)