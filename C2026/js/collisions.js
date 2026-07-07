class Collision {
  constructor(world) {
    this.world = world;
  }

  blocks(rect) {
    // Grenzen, Wasser und feste Objekte bleiben getrennt pruefbar.
    return this.blocksBounds(rect) || this.blocksTiles(rect) || this.blocksObjects(rect);
  }

  blocksBounds(rect) {
    return rect.x < 64 || rect.y < 64 || rect.x + rect.width > this.world.width - 64 || rect.y + rect.height > this.world.height - 64;
  }

  blocksTiles(rect) {
    const points = [
      [rect.x, rect.y],
      [rect.x + rect.width, rect.y],
      [rect.x, rect.y + rect.height],
      [rect.x + rect.width, rect.y + rect.height]
    ];
    return points.some(([x, y]) => this.world.getTileType(Math.floor(x / this.world.tileSize), Math.floor(y / this.world.tileSize)) === "water");
  }

  blocksObjects(rect) {
    const blockers = [
      { x: 154, y: 150, width: 136, height: 104 },
      { x: 300, y: 218, width: 160, height: 42 },
      ...this.world.npcs.map((npc) => ({ x: npc.x - 8, y: npc.y - 8, width: 34, height: 38 }))
    ];
    return blockers.some((blocker) => intersects(rect, blocker));
  }
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
