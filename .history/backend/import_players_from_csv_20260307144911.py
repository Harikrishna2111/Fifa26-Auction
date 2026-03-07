import csv
from pathlib import Path
import os

import psycopg2
from psycopg2.extras import execute_values

def get_db_config():
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        return database_url
    else:
        return {
            "dbname": "fifa_auction",
            "user": "postgres",
            "password": "fifa",
            "host": "localhost",
            "port": 5432,
        }

def connect_db():
    config = get_db_config()
    if isinstance(config, str):
        return psycopg2.connect(config)
    else:
        return psycopg2.connect(**config)

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
        return "Midfielder"
    if pos == "GK":
        return "Goalkeeper"
    if pos in {"ST", "CF", "LF", "RF", "LW", "RW", "LS", "RS"}:
        return "Forward"
    if pos in {"CAM", "CM", "CDM", "LM", "RM", "LAM", "RAM", "LDM", "RDM", "LCM", "RCM"}:
        return "Midfielder"
    if pos in {"CB", "LB", "RB", "LWB", "RWB", "LCB", "RCB"}:
        return "Defender"
    return "Midfielder"


def get_primary_position(player_positions, club_position):
    positions_raw = (player_positions or "").strip()
    if positions_raw:
        first = positions_raw.split(",")[0].strip()
        if first:
            return normalize_position(first)
    return normalize_position(club_position)


def ensure_columns(cur):
    cur.execute("ALTER TABLE players ADD COLUMN IF NOT EXISTS position_specific TEXT;")
    cur.execute("ALTER TABLE players ADD COLUMN IF NOT EXISTS positions TEXT;")


def create_table_if_not_exists(cur):
    cur.execute("""
        CREATE TABLE IF NOT EXISTS players (
            player_id INTEGER PRIMARY KEY,
            short_name TEXT,
            overall INTEGER,
            pace REAL,
            shooting REAL,
            passing REAL,
            dribbling REAL,
            defending REAL,
            physic REAL,
            attacking_work_rate TEXT,
            defensive_work_rate TEXT,
            preferred_foot TEXT,
            weak_foot INTEGER,
            skill_moves INTEGER,
            international_reputation INTEGER,
            work_rate TEXT,
            body_type TEXT,
            real_face BOOLEAN,
            release_clause_eur REAL,
            player_tags TEXT,
            player_traits TEXT,
            pace_diving REAL,
            gk_handling REAL,
            gk_kicking REAL,
            gk_positioning REAL,
            gk_reflexes REAL,
            ls REAL,
            st REAL,
            rs REAL,
            lw REAL,
            lf REAL,
            cf REAL,
            rf REAL,
            rw REAL,
            lam REAL,
            cam REAL,
            ram REAL,
            lm REAL,
            lcm REAL,
            cm REAL,
            rcm REAL,
            rm REAL,
            lwb REAL,
            ldm REAL,
            cdm REAL,
            rdm REAL,
            rwb REAL,
            lb REAL,
            lcb REAL,
            cb REAL,
            rcb REAL,
            rb REAL,
            gk REAL,
            player_face_url TEXT,
            club_logo_url TEXT,
            club_flag_url TEXT,
            nation_logo_url TEXT,
            nation_flag_url TEXT,
            club INTEGER,
            club_name TEXT,
            league_name TEXT,
            league_level INTEGER,
            club_position TEXT,
            club_jersey_number INTEGER,
            club_loaned_from TEXT,
            club_joined INTEGER,
            club_contract_valid_until INTEGER,
            nationality_id INTEGER,
            nationality_name TEXT,
            nation_team_id INTEGER,
            nation_position TEXT,
            nation_jersey_number INTEGER,
            preferred_position TEXT,
            work_rate_attacking TEXT,
            work_rate_defensive TEXT,
            age INTEGER,
            dob TEXT,
            height_cm INTEGER,
            weight_kg INTEGER,
            league_id INTEGER,
            league_name_duplicate TEXT,
            best_overall_rating INTEGER,
            position_group TEXT,
            position_specific TEXT,
            positions TEXT
        );
    """)


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
        position_specific,
        positions_raw if positions_raw else None,
        csv_row.get("real_face"),
    )


def flush_batch(cur, batch):
    if not batch:
        return

    sql = """
        INSERT INTO players (
            player_id, short_name, overall, pace, shooting, dribbling, position_group, nationality_name, club_name, value_eur, wage_eur,
            potential, age, height_cm, preferred_foot, player_face_url,
            passing, defending, physic, weak_foot, skill_moves, work_rate, body_type, preferred_foot,
            movement_acceleration, movement_sprint_speed, attacking_finishing, power_shot_power,
            power_long_shots, attacking_short_passing, mentality_vision, attacking_crossing,
            skill_ball_control, dribbling, movement_agility,
            defending_marking_awareness, defending_standing_tackle, defending_sliding_tackle,
            power_jumping, power_stamina, power_strength, mentality_aggression,
            weight_kg, international_reputation, player_traits, player_tags, league_name,
            position_specific, positions, real_face
        )
        VALUES %s
        ON CONFLICT (player_id) DO UPDATE SET
            short_name = COALESCE(EXCLUDED.short_name, players.short_name),
            overall = COALESCE(EXCLUDED.overall, players.overall),
            pace = COALESCE(EXCLUDED.pace, players.pace),
            shooting = COALESCE(EXCLUDED.shooting, players.shooting),
            dribbling = COALESCE(EXCLUDED.dribbling, players.dribbling),
            position_group = COALESCE(EXCLUDED.position_group, players.position_group),
            nationality_name = COALESCE(EXCLUDED.nationality_name, players.nationality_name),
            club_name = COALESCE(EXCLUDED.club_name, players.club_name),
            value_eur = COALESCE(EXCLUDED.value_eur, players.value_eur),
            wage_eur = COALESCE(EXCLUDED.wage_eur, players.wage_eur),
            potential = COALESCE(EXCLUDED.potential, players.potential),
            age = COALESCE(EXCLUDED.age, players.age),
            height_cm = COALESCE(EXCLUDED.height_cm, players.height_cm),
            preferred_foot = COALESCE(EXCLUDED.preferred_foot, players.preferred_foot),
            player_face_url = COALESCE(EXCLUDED.player_face_url, players.player_face_url),
            passing = COALESCE(EXCLUDED.passing, players.passing),
            defending = COALESCE(EXCLUDED.defending, players.defending),
            physic = COALESCE(EXCLUDED.physic, players.physic),
            weak_foot = COALESCE(EXCLUDED.weak_foot, players.weak_foot),
            skill_moves = COALESCE(EXCLUDED.skill_moves, players.skill_moves),
            work_rate = COALESCE(EXCLUDED.work_rate, players.work_rate),
            body_type = COALESCE(EXCLUDED.body_type, players.body_type),
            preferred_foot = COALESCE(EXCLUDED.preferred_foot, players.preferred_foot),
            pace_acceleration = COALESCE(EXCLUDED.pace_acceleration, players.pace_acceleration),
            pace_sprint_speed = COALESCE(EXCLUDED.pace_sprint_speed, players.pace_sprint_speed),
            shooting_finishing = COALESCE(EXCLUDED.shooting_finishing, players.shooting_finishing),
            shooting_shot_power = COALESCE(EXCLUDED.shooting_shot_power, players.shooting_shot_power),
            shooting_long_shots = COALESCE(EXCLUDED.shooting_long_shots, players.shooting_long_shots),
            passing_short_passing = COALESCE(EXCLUDED.passing_short_passing, players.passing_short_passing),
            passing_vision = COALESCE(EXCLUDED.passing_vision, players.passing_vision),
            passing_crossing = COALESCE(EXCLUDED.passing_crossing, players.passing_crossing),
            dribbling_ball_control = COALESCE(EXCLUDED.dribbling_ball_control, players.dribbling_ball_control),
            dribbling_dribbling = COALESCE(EXCLUDED.dribbling_dribbling, players.dribbling_dribbling),
            dribbling_agility = COALESCE(EXCLUDED.dribbling_agility, players.dribbling_agility),
            defending_marking = COALESCE(EXCLUDED.defending_marking, players.defending_marking),
            defending_standing_tackle = COALESCE(EXCLUDED.defending_standing_tackle, players.defending_standing_tackle),
            defending_sliding_tackle = COALESCE(EXCLUDED.defending_sliding_tackle, players.defending_sliding_tackle),
            physical_jumping = COALESCE(EXCLUDED.physical_jumping, players.physical_jumping),
            physical_stamina = COALESCE(EXCLUDED.physical_stamina, players.physical_stamina),
            physical_strength = COALESCE(EXCLUDED.physical_strength, players.physical_strength),
            physical_aggression = COALESCE(EXCLUDED.physical_aggression, players.physical_aggression),
            weight_kg = COALESCE(EXCLUDED.weight_kg, players.weight_kg),
            international_reputation = COALESCE(EXCLUDED.international_reputation, players.international_reputation),
            player_traits = COALESCE(EXCLUDED.player_traits, players.player_traits),
            player_tags = COALESCE(EXCLUDED.player_tags, players.player_tags),
            league_name = COALESCE(EXCLUDED.league_name, players.league_name),
            position_specific = COALESCE(EXCLUDED.position_specific, players.position_specific),
            positions = COALESCE(EXCLUDED.positions, players.positions),
            real_face = COALESCE(EXCLUDED.real_face, players.real_face)
    """
    execute_values(cur, sql, batch, page_size=BATCH_SIZE)


def import_players_from_csv():
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"CSV not found: {CSV_PATH}")

    conn = connect_db()
    total = 0
    batch = []
    skipped = 0

    try:
        cur = conn.cursor()
        create_table_if_not_exists(cur)
        ensure_columns(cur)

        with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            for csv_row in reader:
                row_id = to_int(csv_row.get("player_id"))
                if row_id is None:
                    skipped += 1
                    continue

                batch.append(build_row(csv_row))
                total += 1

                if len(batch) >= BATCH_SIZE:
                    flush_batch(cur, batch)
                    batch.clear()

            if batch:
                flush_batch(cur, batch)

        conn.commit()
        print(f"Imported/updated players: {total}")
        print(f"Skipped rows: {skipped}")
        print("Columns ensured: position_specific, positions")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    import_players_from_csv()
