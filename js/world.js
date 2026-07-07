const TILE = 32;

const FALLBACK_MAPS = {
  school: {
    id: "school",
    width: 40,
    height: 28,
    start: { x: 260, y: 340 },
    npcs: [
      {
        id: "prof-byte",
        name: "Prof. Byte",
        x: 520,
        y: 310,
        questId: "binary-start",
        dialogue: ["Willkommen in der Informatik-Welt.", "Kannst du mir helfen?", "Beantworte diese Frage."]
      },
      {
        id: "lina",
        name: "Lina",
        x: 710,
        y: 500,
        dialogue: ["Im Questbuch siehst du offene Aufgaben.", "Druecke Q, um es ein- oder auszublenden."]
      }
    ],
    signs: [{ x: 400, y: 420, text: "Informatikschule: Wissen ist der beste Schluessel." }],
    objects: []
  }
};

class GameMap {
  constructor(data, tileSize) {
    this.data = data;
    this.tileSize = tileSize;
    this.pixelWidth = data.width * tileSize;
    this.pixelHeight = data.height * tileSize;
  }

  // Die Beispielkarte wird prozedural interpretiert und kann spaeter echte Tile-Layer lesen.
  getTileType(x, y) {
    if (x < 0 || y < 0 || x >= this.data.width || y >= this.data.height) return "water";
    if (x < 2 || y < 2 || x > this.data.width - 3 || y > this.data.height - 3) return "water";
    if ((x >= 11 && x <= 26 && y >= 13 && y <= 15) || (x >= 18 && x <= 20 && y >= 6 && y <= 22)) return "path";
    if (x >= 4 && x <= 13 && y >= 4 && y <= 10) return "school";
    if ((x + y) % 13 === 0) return "flower";
    if ((x * 7 + y * 3) % 17 === 0) return "grass";
    return "field";
  }
}

class World {
  constructor(data) {
    this.id = data.id;
    this.data = data;
    this.map = new GameMap(data, TILE);
    this.width = this.map.pixelWidth;
    this.height = this.map.pixelHeight;
    this.tileSize = TILE;
    this.npcs = [];
    this.time = 0;
    this.collisions = new Collision(this);
  }

  static async load(id) {
    let data = FALLBACK_MAPS[id];
    try {
      const response = await fetch(`./maps/${id}.json`);
      if (response.ok) data = await response.json();
    } catch {
      data = FALLBACK_MAPS[id];
    }
    return new World(data);
  }

  update(delta) {
    this.time += delta;
  }

  getCamera(player, canvasWidth, canvasHeight) {
    return {
      x: clamp(player.x - canvasWidth / 2, 0, Math.max(0, this.width - canvasWidth)),
      y: clamp(player.y - canvasHeight / 2, 0, Math.max(0, this.height - canvasHeight))
    };
  }

  draw(ctx, camera, time) {
    this.drawTiles(ctx, camera, time);
    this.drawObjects(ctx, camera, time, false);
  }

  drawForeground(ctx, camera, time) {
    this.drawObjects(ctx, camera, time, true);
    this.drawInteractionHint(ctx, camera);
  }

  drawTiles(ctx, camera, time) {
    const startX = Math.floor(camera.x / TILE);
    const startY = Math.floor(camera.y / TILE);
    const endX = startX + Math.ceil(ctx.canvas.width / TILE) + 2;
    const endY = startY + Math.ceil(ctx.canvas.height / TILE) + 2;

    for (let y = startY; y < endY; y += 1) {
      for (let x = startX; x < endX; x += 1) {
        const worldX = x * TILE;
        const worldY = y * TILE;
        const tile = this.getTileType(x, y);
        this.drawTile(ctx, tile, worldX - camera.x, worldY - camera.y, x, y, time);
      }
    }
  }

  getTileType(x, y) {
    return this.map.getTileType(x, y);
  }

  drawTile(ctx, tile, x, y, tileX, tileY, time) {
    const wave = Math.sin(time / 320 + tileX + tileY) * 2;
    if (tile === "water") {
      ctx.fillStyle = "#4ba3d8";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.fillRect(x + 4 + wave, y + 11, 16, 3);
      return;
    }

    ctx.fillStyle = tile === "path" ? "#d9b66c" : "#7fd26d";
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(x, y, TILE, 2);

    if (tile === "grass") {
      ctx.fillStyle = "#55b45c";
      ctx.fillRect(x + 9, y + 11 + wave, 3, 10);
      ctx.fillRect(x + 18, y + 9 - wave, 3, 12);
    }

    if (tile === "flower") {
      ctx.fillStyle = "#d85f73";
      ctx.fillRect(x + 10, y + 10, 4, 4);
      ctx.fillStyle = "#f3d070";
      ctx.fillRect(x + 17, y + 18, 4, 4);
    }

    if (tile === "school") {
      ctx.fillStyle = "#a8b1be";
      ctx.fillRect(x, y, TILE, TILE);
    }
  }

  drawObjects(ctx, camera, time, foreground) {
    const objects = this.getStaticObjects();
    objects.forEach((object) => {
      if ((object.layer === "front") !== foreground) return;
      const x = object.x - camera.x;
      const y = object.y - camera.y;
      if (x < -80 || y < -80 || x > ctx.canvas.width + 80 || y > ctx.canvas.height + 80) return;
      DRAWERS[object.type](ctx, x, y, time);
    });
  }

  getStaticObjects() {
    return [
      { type: "house", x: 130, y: 110 },
      { type: "schoolSign", x: 400, y: 420 },
      { type: "tree", x: 90, y: 390, layer: "front" },
      { type: "tree", x: 860, y: 210, layer: "front" },
      { type: "tree", x: 1020, y: 610, layer: "front" },
      { type: "fence", x: 300, y: 224 },
      { type: "fence", x: 332, y: 224 },
      { type: "fence", x: 364, y: 224 },
      { type: "fence", x: 396, y: 224 },
      { type: "fence", x: 428, y: 224 }
    ];
  }

  findNearbyNPC(player) {
    return this.npcs.find((npc) => distance(player, npc) < 54);
  }

  findNearbySign(player) {
    return this.data.signs?.find((sign) => distance(player, sign) < 54);
  }

  drawInteractionHint(ctx, camera) {
    const near = this.findNearbyNPC(window.informatikQuest?.player || {}) || this.findNearbySign(window.informatikQuest?.player || {});
    if (!near) return;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(24, ctx.canvas.height - 166, 170, 28);
    ctx.fillStyle = "#17202a";
    ctx.font = "14px system-ui";
    ctx.fillText("E / Enter: sprechen", 36, ctx.canvas.height - 147);
  }
}

const DRAWERS = {
  house(ctx, x, y) {
    ctx.fillStyle = "#824f4f";
    ctx.fillRect(x + 12, y, 160, 46);
    ctx.fillStyle = "#e8d7a8";
    ctx.fillRect(x + 24, y + 38, 136, 104);
    ctx.fillStyle = "#42526b";
    ctx.fillRect(x + 78, y + 88, 30, 54);
    ctx.fillStyle = "#5aa7d6";
    ctx.fillRect(x + 42, y + 64, 24, 22);
    ctx.fillRect(x + 120, y + 64, 24, 22);
  },
  tree(ctx, x, y, time) {
    const sway = Math.sin(time / 420 + x) * 2;
    ctx.fillStyle = "#6f4d32";
    ctx.fillRect(x + 20, y + 36, 14, 36);
    ctx.fillStyle = "#2d8f62";
    ctx.fillRect(x + 4 + sway, y + 10, 46, 38);
    ctx.fillStyle = "#45b767";
    ctx.fillRect(x + 12 + sway, y, 34, 26);
  },
  fence(ctx, x, y) {
    ctx.fillStyle = "#8b6744";
    ctx.fillRect(x, y, 7, 34);
    ctx.fillRect(x + 24, y, 7, 34);
    ctx.fillRect(x, y + 12, 32, 6);
  },
  schoolSign(ctx, x, y) {
    ctx.fillStyle = "#6f4d32";
    ctx.fillRect(x + 18, y + 28, 8, 30);
    ctx.fillStyle = "#f3d070";
    ctx.fillRect(x, y, 44, 30);
    ctx.fillStyle = "#17202a";
    ctx.fillRect(x + 8, y + 11, 28, 4);
  }
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot((a.x || 0) - b.x, (a.y || 0) - b.y);
}
