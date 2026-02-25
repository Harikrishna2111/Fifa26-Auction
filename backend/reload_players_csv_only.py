import csv
from pathlib import Path

import psycopg2
from psycopg2.extras import execute_values

DB_CONFIG = {
    "dbname": "fifa_auction",
    "user": "postgres",
    "password": "fifa",
    "host": "localhost",
    "port": 5432,
}

CSV_PATH = Path(__file__).resolve().parent.parent / "data.csv"
BATCH_SIZE = 1000


def to_int(val):
    if val is None:
        return None
    s = str(val).strip()
    if not s:
        return None
    try:
        return int(float(s))
    except Exception:
        return None


def to_float(val):
    if val is None:
        return None
    s = str(val).strip()
    if not s:
        return None
    try:
        return float(s)
    except Exception:
        return None


def normalize_position(raw):
    if not raw:
        return None
    return raw.strip().upper()


def infer_position_group(position_specific):
    pos = normalize_position(position_specific)
    if not pos:
        return None
    if pos == "GK":
        return "Goalkeeper"
    if pos in {"ST", "CF", "LF", "RF", "LW", "RW", "LS", "RS"}:
        return "Forward"
    if pos in {"CAM", "CM", "CDM", "LM", "RM", "LAM", "RAM", "LDM", "RDM", "LCM", "RCM"}:
        return "Midfielder"
    if pos in {"CB", "LB", "RB", "LWB", "RWB", "LCB", "RCB"}:
        return "Defender"
    return None


def get_primary_position(player_positions, club_position):
    positions_raw = (player_positions or "").strip()
    if positions_raw:
        first = positions_raw.split(",")[0].strip()
        if first:
            return normalize_position(first)
    return normalize_position(club_position)


def build_row(csv_row):
    positions_raw = (csv_row.get("player_positions") or "").strip()
    position_specific = get_primary_position(positions_raw, csv_row.get("club_position"))
    position_group = infer_position_group(position_specific)

    return (
        to_int(csv_row.get("player_id")),
        csv_row.get("short_name"),
        to_int(csv_row.get("overall")),
        to_float(csv_row.get("pace")),
        to_float(csv_row.get("shooting")),
        to_float(csv_row.get("dribbling")),
        position_group,
        csv_row.get("nationality_name"),
        csv_row.get("club_name"),
        to_int(csv_row.get("value_eur")),
        to_int(csv_row.get("wage_eur")),
        to_int(csv_row.get("potential")),
        to_int(csv_row.get("age")),
        to_int(csv_row.get("height_cm")),
        csv_row.get("preferred_foot"),
        csv_row.get("player_face_url"),
        to_float(csv_row.get("passing")),
        to_float(csv_row.get("defending")),
        to_float(csv_row.get("physic")),
        to_int(csv_row.get("weak_foot")),
        to_int(csv_row.get("skill_moves")),
        (csv_row.get("work_rate") or "").strip() or None,
        csv_row.get("body_type"),
        csv_row.get("preferred_foot"),
        to_int(csv_row.get("movement_acceleration")),
        to_int(csv_row.get("movement_sprint_speed")),
        to_int(csv_row.get("attacking_finishing")),
        to_int(csv_row.get("power_shot_power")),
        to_int(csv_row.get("power_long_shots")),
        to_int(csv_row.get("attacking_short_passing")),
        to_int(csv_row.get("mentality_vision")),
        to_int(csv_row.get("attacking_crossing")),
        to_int(csv_row.get("skill_ball_control")),
        to_int(csv_row.get("skill_dribbling")),
        to_int(csv_row.get("movement_agility")),
        to_int(csv_row.get("defending_marking_awareness")),
        to_int(csv_row.get("defending_standing_tackle")),
        to_int(csv_row.get("defending_sliding_tackle")),
        to_int(csv_row.get("power_jumping")),
        to_int(csv_row.get("power_stamina")),
        to_int(csv_row.get("power_strength")),
        to_int(csv_row.get("mentality_aggression")),
        to_int(csv_row.get("weight_kg")),
        to_int(csv_row.get("international_reputation")),
        csv_row.get("player_traits"),
        csv_row.get("player_tags"),
        csv_row.get("league_name"),
        positions_raw if positions_raw else None,
        csv_row.get("real_face"),
        position_specific,
    )


def run():
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"CSV not found: {CSV_PATH}")

    conn = psycopg2.connect(**DB_CONFIG)
    total = 0
    batch = []

    try:
        cur = conn.cursor()
        cur.execute("TRUNCATE TABLE players CASCADE;")

        sql = """
            INSERT INTO players (
                id, name, overall, pac, sho, dri, position_group, nation, club, value, wage,
                potential, age, height, foot, image_url,
                pas, def, phy, weak_foot, skill_moves, work_rate, body_type, preferred_foot,
                pace_acceleration, pace_sprint_speed, shooting_finishing, shooting_shot_power,
                shooting_long_shots, passing_short_passing, passing_vision, passing_crossing,
                dribbling_ball_control, dribbling_dribbling, dribbling_agility,
                defending_marking, defending_standing_tackle, defending_sliding_tackle,
                physical_jumping, physical_stamina, physical_strength, physical_aggression,
                weight_kg, international_reputation, player_traits, player_tags, league_name,
                positions, real_face, position_specific
            ) VALUES %s
        """

        with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                player_id = to_int(row.get("player_id"))
                if player_id is None:
                    continue
                batch.append(build_row(row))
                total += 1
                if len(batch) >= BATCH_SIZE:
                    execute_values(cur, sql, batch, page_size=BATCH_SIZE)
                    batch.clear()

            if batch:
                execute_values(cur, sql, batch, page_size=BATCH_SIZE)

        conn.commit()
        print(f"Reload complete. Inserted {total} rows from data.csv.")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    run()
