-- Clean up old tables if they exist
DROP TABLE IF EXISTS auction_sales;
DROP TABLE IF EXISTS auction_teams;
DROP TABLE IF EXISTS auctions;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS users;

-- 1. USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(100),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_balance DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PLAYERS (The FIFA Data)
CREATE TABLE players (
    id INTEGER PRIMARY KEY, -- FIFA ID
    name VARCHAR(100),
    position_group VARCHAR(10), -- FWD, MID, DEF, GK
    rating INTEGER,
    club VARCHAR(100),
    nation VARCHAR(100),
    image_url TEXT,
    market_value DECIMAL(15, 2) DEFAULT 100
);

-- 3. AUCTIONS (Lobby & Settings)
CREATE TABLE auctions (
    id SERIAL PRIMARY KEY,
    host_id INTEGER REFERENCES users(id),
    name VARCHAR(100),
    join_code VARCHAR(10) UNIQUE,
    status VARCHAR(20) DEFAULT 'LOBBY', -- LOBBY, LIVE, PAUSED, ENDED
    
    -- Financial Settings
    purse_per_team DECIMAL(15, 2),
    bid_inc_min DECIMAL(15, 2), -- e.g., 5M
    bid_inc_mid DECIMAL(15, 2), -- e.g., 10M
    bid_inc_max DECIMAL(15, 2), -- e.g., 20M
    allow_custom_bids BOOLEAN DEFAULT TRUE,
    
    -- Rules
    is_seasonal BOOLEAN DEFAULT FALSE,
    min_player_rating INTEGER DEFAULT 80,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. AUCTION TEAMS (Participants)
CREATE TABLE auction_teams (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER REFERENCES auctions(id),
    user_id INTEGER REFERENCES users(id),
    team_name VARCHAR(100),
    budget_remaining DECIMAL(15, 2),
    UNIQUE(auction_id, user_id)
);

-- 5. SALES (Results)
CREATE TABLE auction_sales (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER REFERENCES auctions(id),
    player_id INTEGER REFERENCES players(id),
    winner_team_id INTEGER REFERENCES auction_teams(id),
    sold_price DECIMAL(15, 2),
    sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);