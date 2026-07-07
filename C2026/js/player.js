const PLAYER_SIZE = 26;
const PLAYER_SPEED = 138;
const LEVEL_XP = 100;

class Player {
  constructor({ x, y, health = 5, xp = 0, level = 1 }) {
    this.x = x;
    this.y = y;
    this.width = PLAYER_SIZE;
    this.height = PLAYER_SIZE;
    this.health = health;
    this.xp = xp;
    this.level = level;
    this.direction = "down";
    this.walkTime = 0;
  }

  static fromSave(data) {
    return new Player(data || { x: 260, y: 340 });
  }

  update(delta, keys, world) {
    let dx = 0;
    let dy = 0;

    if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
    if (keys.has("arrowright") || keys.has("d")) dx += 1;
    if (keys.has("arrowup") || keys.has("w")) dy -= 1;
    if (keys.has("arrowdown") || keys.has("s")) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy);
      dx /= length;
      dy /= length;
      this.walkTime += delta;
      this.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
    } else {
      this.walkTime = 0;
    }

    this.move(dx * PLAYER_SPEED * delta, 0, world);
    this.move(0, dy * PLAYER_SPEED * delta, world);
  }

  move(dx, dy, world) {
    const next = { x: this.x + dx, y: this.y + dy, width: this.width, height: this.height };
    if (!world.collisions.blocks(next)) {
      this.x += dx;
      this.y += dy;
    }
  }

  addXP(amount) {
    this.xp += amount;
    while (this.xp >= this.level * LEVEL_XP) {
      this.xp -= this.level * LEVEL_XP;
      this.level += 1;
      this.health = Math.min(this.health + 1, 9);
    }
  }

  draw(ctx, camera, time) {
    const x = Math.round(this.x - camera.x);
    const y = Math.round(this.y - camera.y);
    const bob = Math.sin(time / 90) * (this.walkTime > 0 ? 2 : 0);

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(x + 4, y + 24, 20, 6);
    ctx.fillStyle = "#244563";
    ctx.fillRect(x + 5, y + 10 + bob, 16, 16);
    ctx.fillStyle = "#f1bd83";
    ctx.fillRect(x + 6, y + 2 + bob, 14, 12);
    ctx.fillStyle = "#383449";
    ctx.fillRect(x + 5, y + bob, 16, 5);
    ctx.fillStyle = "#f4d35e";
    ctx.fillRect(x + 7, y + 13 + bob, 12, 4);

    const legOffset = this.walkTime > 0 ? Math.sign(Math.sin(time / 110)) * 2 : 0;
    ctx.fillStyle = "#1f2c3f";
    ctx.fillRect(x + 6 + legOffset, y + 25, 5, 6);
    ctx.fillRect(x + 15 - legOffset, y + 25, 5, 6);
  }

  toSave() {
    return {
      x: this.x,
      y: this.y,
      health: this.health,
      xp: this.xp,
      level: this.level
    };
  }
}
