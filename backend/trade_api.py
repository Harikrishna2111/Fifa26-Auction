

# ============================================
# TRADE REST API ENDPOINTS
# ============================================

@app.route("/api/auctions/<int:auction_id>/trades", methods=["GET"])
def get_auction_trades(auction_id):
    """Get all active trades for an auction (for current user)"""
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Get trades where user is proposer or receiver
        cur.execute("""
            SELECT 
                t.*,
                u1.username as proposer_name,
                u2.username as receiver_name,
                ap1.team_name as proposer_team,
                ap2.team_name as receiver_team
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
        
        # Get player names for each trade
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
        conn.close()
        
        return jsonify(trades), 200
        
    except Exception as e:
        print(f"Error fetching trades: {e}")
        return jsonify({"error": "Failed to fetch trades"}), 500


@app.route("/api/auctions/<int:auction_id>/trade_history", methods=["GET"])
def get_trade_history(auction_id):
    """Get completed/rejected trade history"""
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cur.execute("""
            SELECT 
                t.*,
                u1.username as proposer_name,
                u2.username as receiver_name,
                ap1.team_name as proposer_team,
                ap2.team_name as receiver_team
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
        conn.close()
        
        return jsonify(trades), 200
        
    except Exception as e:
        print(f"Error fetching trade history: {e}")
        return jsonify({"error": "Failed to fetch trade history"}), 500


if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
