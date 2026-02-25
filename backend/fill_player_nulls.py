import psycopg2

DB_CONFIG = {
    "dbname": "fifa_auction",
    "user": "postgres",
    "password": "fifa",
    "host": "localhost",
    "port": 5432,
}


def fill_nulls():
    conn = psycopg2.connect(**DB_CONFIG)
    try:
        cur = conn.cursor()

        # Derive missing positional text first.
        cur.execute(
            """
            UPDATE players
            SET position_specific = COALESCE(
                position_specific,
                NULLIF(TRIM(SPLIT_PART(COALESCE(positions, ''), ',', 1)), ''),
                CASE
                    WHEN position_group = 'Goalkeeper' THEN 'GK'
                    WHEN position_group = 'Defender' THEN 'CB'
                    WHEN position_group = 'Midfielder' THEN 'CM'
                    WHEN position_group = 'Forward' THEN 'ST'
                    ELSE 'CM'
                END
            )
            WHERE position_specific IS NULL OR TRIM(position_specific) = '';
            """
        )

        cur.execute(
            """
            UPDATE players
            SET positions = COALESCE(positions, position_specific)
            WHERE positions IS NULL OR TRIM(positions) = '';
            """
        )

        # Fill text nulls.
        cur.execute(
            """
            UPDATE players
            SET
                preferred_foot = COALESCE(preferred_foot, foot, 'Right'),
                foot = COALESCE(foot, preferred_foot, 'Right'),
                work_rate = COALESCE(work_rate, 'Medium/Medium'),
                body_type = COALESCE(body_type, 'Normal'),
                player_traits = COALESCE(player_traits, ''),
                player_tags = COALESCE(player_tags, ''),
                league_name = COALESCE(league_name, 'Unknown'),
                real_face = COALESCE(real_face, 'No')
            WHERE
                preferred_foot IS NULL OR foot IS NULL OR work_rate IS NULL OR body_type IS NULL
                OR player_traits IS NULL OR player_tags IS NULL OR league_name IS NULL OR real_face IS NULL;
            """
        )

        # Fill numeric/stat nulls.
        cur.execute(
            """
            UPDATE players
            SET
                pas = COALESCE(pas, 0),
                def = COALESCE(def, 0),
                phy = COALESCE(phy, 0),
                weak_foot = COALESCE(weak_foot, 1),
                skill_moves = COALESCE(skill_moves, 1),
                pace_acceleration = COALESCE(pace_acceleration, CAST(COALESCE(pac, 0) AS INT)),
                pace_sprint_speed = COALESCE(pace_sprint_speed, CAST(COALESCE(pac, 0) AS INT)),
                shooting_finishing = COALESCE(shooting_finishing, CAST(COALESCE(sho, 0) AS INT)),
                shooting_shot_power = COALESCE(shooting_shot_power, CAST(COALESCE(sho, 0) AS INT)),
                shooting_long_shots = COALESCE(shooting_long_shots, CAST(COALESCE(sho, 0) AS INT)),
                passing_short_passing = COALESCE(passing_short_passing, CAST(COALESCE(pas, 0) AS INT)),
                passing_vision = COALESCE(passing_vision, CAST(COALESCE(pas, 0) AS INT)),
                passing_crossing = COALESCE(passing_crossing, CAST(COALESCE(pas, 0) AS INT)),
                dribbling_ball_control = COALESCE(dribbling_ball_control, CAST(COALESCE(dri, 0) AS INT)),
                dribbling_dribbling = COALESCE(dribbling_dribbling, CAST(COALESCE(dri, 0) AS INT)),
                dribbling_agility = COALESCE(dribbling_agility, CAST(COALESCE(dri, 0) AS INT)),
                defending_marking = COALESCE(defending_marking, CAST(COALESCE(def, 0) AS INT)),
                defending_standing_tackle = COALESCE(defending_standing_tackle, CAST(COALESCE(def, 0) AS INT)),
                defending_sliding_tackle = COALESCE(defending_sliding_tackle, CAST(COALESCE(def, 0) AS INT)),
                physical_jumping = COALESCE(physical_jumping, CAST(COALESCE(phy, 0) AS INT)),
                physical_stamina = COALESCE(physical_stamina, CAST(COALESCE(phy, 0) AS INT)),
                physical_strength = COALESCE(physical_strength, CAST(COALESCE(phy, 0) AS INT)),
                physical_aggression = COALESCE(physical_aggression, CAST(COALESCE(phy, 0) AS INT)),
                weight_kg = COALESCE(weight_kg, 75),
                international_reputation = COALESCE(international_reputation, 1)
            WHERE
                pas IS NULL OR def IS NULL OR phy IS NULL OR weak_foot IS NULL OR skill_moves IS NULL
                OR pace_acceleration IS NULL OR pace_sprint_speed IS NULL
                OR shooting_finishing IS NULL OR shooting_shot_power IS NULL OR shooting_long_shots IS NULL
                OR passing_short_passing IS NULL OR passing_vision IS NULL OR passing_crossing IS NULL
                OR dribbling_ball_control IS NULL OR dribbling_dribbling IS NULL OR dribbling_agility IS NULL
                OR defending_marking IS NULL OR defending_standing_tackle IS NULL OR defending_sliding_tackle IS NULL
                OR physical_jumping IS NULL OR physical_stamina IS NULL OR physical_strength IS NULL OR physical_aggression IS NULL
                OR weight_kg IS NULL OR international_reputation IS NULL;
            """
        )

        conn.commit()
        print("Filled nulls in players table.")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    fill_nulls()
