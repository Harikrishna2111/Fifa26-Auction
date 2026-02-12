
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
        
        # Get team IDs for both users
        cur.execute("""
            SELECT user_id, team_id 
            FROM auction_participants 
            WHERE auction_id = %s AND user_id IN (%s, %s)
        """, (auction_id, proposer_id, receiver_id))
        
        participants = cur.fetchall()
        proposer_team_id = None
        receiver_team_id = None
        
        for p in participants:
            if p['user_id'] == proposer_id:
                proposer_team_id = p['team_id']
            if p['user_id'] == receiver_id:
                receiver_team_id = p['team_id']
        
        if not proposer_team_id or not receiver_team_id:
            emit("trade_error", {"message": "Invalid participants"}, room=request.sid)
            cur.close()
            conn.close()
            return
        
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
            "proposer_players": player_names_proposer,
            "proposer_cash": proposer_cash,
            "receiver_players": player_names_receiver,
            "receiver_cash": receiver_cash
        }, room=room, include_self=False)
        
        # Confirm to proposer
        emit("trade_sent", {
            "trade_id": trade_id,
            "message": "Trade offer sent successfully"
        }, room=request.sid)
        
        print(f"Trade {trade_id} created successfully")
        
    except Exception as e:
        print(f"Error proposing trade: {e}")
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
            "receiver_id": user_id
        }, room=room)
        
        print(f"Trade {trade_id} rejected by user {user_id}")
        
    except Exception as e:
        print(f"Error rejecting trade: {e}")
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
            "proposer_id": user_id
        }, room=room)
        
        print(f"Trade {trade_id} cancelled by user {user_id}")
        
    except Exception as e:
        print(f"Error cancelling trade: {e}")
        emit("trade_error", {"message": "Failed to cancel trade"}, room=request.sid)
