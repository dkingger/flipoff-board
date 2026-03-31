# flipoff-board

Tilpasset version af [magnum6actual/flipoff](https://github.com/magnum6actual/flipoff) til brug som infoskærm med admin-side og server-side lagring.

## Hvad denne version gør

Denne version er lavet til at køre på en egen server og viser kun selve flipboardet på forsiden.

Den indeholder blandt andet:

* ren forside med kun flipboard
* sort baggrund
* diskret admin-knap nederst til højre
* admin-side med 5 tekstbokse
* `|` som tvunget linjeskift
* maks 20 tegn pr. linje
* dansk fallback-tekst
* server-side lagring i JSON-fil
* auto-opdatering uden manuel refresh
* farvede flip-effekter fjernet
* keyboard-hint fjernet

## Baseret på originalen

Originalt projekt:

* [https://github.com/magnum6actual/flipoff](https://github.com/magnum6actual/flipoff)

Denne udgave er en praktisk tilpasning af originalen til drift på egen Debian-server med nginx.

## Projektstruktur

* `index.html` – tavlen
* `admin.html` – admin-side
* `css/` – styling
* `js/` – klientlogik
* `data/messages.json` – gemte beskeder
* `server/flipoff_api.py` – lille Python API
* `server/flipoff-api.service` – systemd service
* `server/nginx-flipoff.conf` – nginx-konfiguration

## Sådan bruges det

### Forsiden

Forsiden viser kun flipboardet.

### Admin-side

Admin-siden ligger på:

`/admin.html`

Hver tekstboks svarer til én besked.

### Linjeskift

Brug tegnet `|` for at tvinge linjeskift.

Eksempel:

`Velkommen|til FabLab`

### Tekstregler

* maks 20 tegn pr. linje
* maks 5 linjer pr. besked
* 5 beskeder i alt

## Installation på Debian med nginx

### 1. Klon repoet

```bash
git clone https://github.com/dkingger/flipoff-board.git /var/www/flipoff
cd /var/www/flipoff
```

### 2. Opret datafil hvis den mangler

```bash
mkdir -p /var/www/flipoff/data
printf '["","","","",""]\n' > /var/www/flipoff/data/messages.json
```

### 3. Installer nginx

```bash
apt update
apt install -y nginx
```

### 4. Installer API-scriptet

```bash
cp server/flipoff_api.py /usr/local/bin/flipoff_api.py
chmod +x /usr/local/bin/flipoff_api.py
```

### 5. Installer systemd service

```bash
cp server/flipoff-api.service /etc/systemd/system/flipoff-api.service
systemctl daemon-reload
systemctl enable --now flipoff-api.service
```

### 6. Installer nginx-konfiguration

```bash
cp server/nginx-flipoff.conf /etc/nginx/sites-available/flipoff
ln -sf /etc/nginx/sites-available/flipoff /etc/nginx/sites-enabled/flipoff
rm -f /etc/nginx/sites-enabled/default
/usr/sbin/nginx -t
systemctl reload nginx
```

### 7. Åbn i browseren

Forside: `http://SERVER-IP/`
Admin: `http://SERVER-IP/admin.html`

## Opdatering efter ændringer

Hvis du ændrer filer lokalt og vil gemme dem i GitHub:

```bash
git add .
git commit -m "Beskriv ændringen"
git push
```

Hvis du vil hente ændringer ned på serveren igen:

```bash
cd /var/www/flipoff
git pull
```

## Bemærkning

Denne version er lavet som en praktisk driftstilpasning og er ikke identisk med upstream-projektet.
