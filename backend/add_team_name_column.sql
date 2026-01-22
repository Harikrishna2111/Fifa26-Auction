-- Add team_name column to auction_participants table
ALTER TABLE auction_participants ADD COLUMN IF NOT EXISTS team_name VARCHAR(100);

-- Update constraint to include user_id for proper conflict handling
ALTER TABLE auction_participants DROP CONSTRAINT IF EXISTS auction_participants_auction_id_user_id_key;
ALTER TABLE auction_participants ADD CONSTRAINT auction_participants_auction_id_user_id_key UNIQUE (auction_id, user_id);
