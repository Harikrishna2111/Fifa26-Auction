import requests

API_URL = "https://fantasy.premierleague.com/api/bootstrap-static/"
IMG_BASE = "https://resources.premierleague.com/premierleague/photos/players/250x250/p{}.png"

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://www.premierleague.com/",
    "Origin": "https://www.premierleague.com"
}

PNG_MAGIC = b"\x89PNG\r\n\x1a\n"

data = requests.get(API_URL).json()
players = data["elements"]

real_image_urls = []

for player in players:
    player_id = player["photo"].split(".")[0]
    url = IMG_BASE.format(player_id)

    try:
        r = requests.get(url, headers=HEADERS, stream=True, timeout=5)

        first_bytes = r.raw.read(8)

        if first_bytes == PNG_MAGIC:
            real_image_urls.append(url)

    except requests.RequestException:
        continue

with open("real_player_image_urls.txt", "w") as f:
    f.write("\n".join(real_image_urls))

print(f"Verified {len(real_image_urls)} real player images")
