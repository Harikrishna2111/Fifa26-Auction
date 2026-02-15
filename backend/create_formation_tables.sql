-- Create team_formations table to store formation type for each team
CREATE TABLE IF NOT EXISTS team_formations (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    formation_type VARCHAR(10) NOT NULL,  -- '4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id)  -- Each team can only have one active formation
);

-- Create team_formation_positions table to store player positions
CREATE TABLE IF NOT EXISTS team_formation_positions (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    position_type VARCHAR(10) NOT NULL,   -- 'pitch', 'sub', 'reserve'
    position_index INTEGER NOT NULL,      -- 0-10 for pitch, 0-6 for sub, 0+ for reserve
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, player_id)  -- Each player can only have one position per team
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_team_formations_team_id ON team_formations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_formation_positions_team_id ON team_formation_positions(team_id);
CREATE INDEX IF NOT EXISTS idx_team_formation_positions_player_id ON team_formation_positions(player_id);

-- Add comments for documentation
COMMENT ON TABLE team_formations IS 'Stores the formation type (e.g., 4-3-3) for each team';
COMMENT ON TABLE team_formation_positions IS 'Stores the position of each player within a team formation';
COMMENT ON COLUMN team_formation_positions.position_type IS 'Type of position: pitch (starting 11), sub (substitutes), or reserve';
COMMENT ON COLUMN team_formation_positions.position_index IS 'Index within the position type (0-based)';
