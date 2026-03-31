# flipoff-board

Tilpasset version af [magnum6actual/flipoff](https://github.com/magnum6actual/flipoff) til infoskærm-brug med admin-side og server-side lagring.

## Baseret på originalen

Originalt projekt:
- https://github.com/magnum6actual/flipoff

Denne version er en praktisk tilpasning af originalen til brug på egen server.

## Ændringer i denne version

- ren forside med kun flipboard
- sort baggrund
- diskret admin-knap nederst til højre
- admin-side med 5 tekstbokse
- `|` bruges som tvunget linjeskift
- maks 20 tegn pr. linje
- dansk fallback-tekst
- beskeder gemmes på serveren i JSON-fil
- auto-opdatering uden manuel refresh
- farver under flip er fjernet
- keyboard-hint er fjernet

## Struktur

- `index.html` – tavlen
- `admin.html` – admin-side
- `css/` – styling
- `js/` – klientlogik
- `data/messages.json` – gemte beskeder
- `server/flipoff_api.py` – lille API til at læse/skrive beskeder
- `server/flipoff-api.service` – systemd service-fil
- `server/nginx-flipoff.conf` – nginx-konfiguration

## Drift

Projektet er sat op til at kunne køre på en Debian-server med:

- nginx
- en lille Python-baseret API-service
- systemd til at holde API-servicen kørende

## Deployment-filer

Se mappen `server/` for de filer, der blev brugt til opsætningen.

