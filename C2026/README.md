# Informatik Quest

Informatik Quest ist ein lokales, browserbasiertes 2D-Lernspiel im Pixel-Art-Stil. Der Prototyp nutzt HTML5, CSS3, Vanilla JavaScript und die Canvas API.

## Starten

Direkt starten:

```text
/Users/danielmiczka/Documents/C2026/index.html
```

Alternativ mit einem kleinen lokalen Webserver:

```bash
python3 -m http.server 5173
```

Danach im Browser:

```text
http://localhost:5173
```

## Steuerung

- WASD oder Pfeiltasten: bewegen
- E oder Enter: NPCs und Schilder ansprechen
- Q: Questbuch ein- oder ausblenden
- ESC: Pause-Menue

## Inhalt des Grundspiels

Der Spieler startet vor einer Informatikschule. Die Welt ist frei begehbar, besitzt Kollisionen, animiertes Wasser, Gras, Baeume, ein Haus, Schilder und NPCs. Prof. Byte gibt eine erste Binaerzahlen-Quest. Bei richtiger Antwort erhaelt der Spieler XP, Muenzen und ein Item.

## Architektur

Die Logik ist objektorientiert und modular aufgebaut:

- `main.js`: Game-Klasse, Game Loop, Ablaufsteuerung
- `js/player.js`: Spieler, Bewegung, Level und Laufanimation
- `js/world.js`: World und GameMap, Kamera, Tiles, Objekte, Zeichnung
- `js/collisions.js`: Kollisionspruefung
- `js/npc.js`: NPCs und kleine Idle-Animation
- `js/dialogue.js`: Dialogsteuerung
- `js/quests.js`: Questmodell
- `js/inventory.js`: Muenzen und Items
- `js/minigames.js`: Registrierbare Minispiele
- `js/save.js`: LocalStorage-Speicherung
- `js/ui.js`: Menues, HUD, Questbuch, Dialoge und Toasts

Neue Minispiele koennen in `js/minigames.js` ueber `register(id, config)` ergaenzt werden. Karten liegen als JSON in `maps/` und koennen spaeter durch echte Tilemaps ersetzt werden.

## Assets

Die Ordner unter `assets/` sind vorbereitet fuer Bilder, Sprites, Tiles, NPCs, Musik und Sounds. Der aktuelle Prototyp zeichnet die Pixel-Art direkt im Canvas, damit er ohne externe Dateien lauffaehig bleibt.
