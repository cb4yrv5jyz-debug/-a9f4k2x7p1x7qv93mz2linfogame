class NPC {
  constructor({ id, name, x, y, dialogue = [], questId = null }) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.dialogue = dialogue;
    this.questId = questId;
    this.idleTime = 0;
  }

  update(delta) {
    this.idleTime += delta;
  }

  draw(ctx, camera, time) {
    const x = Math.round(this.x - camera.x);
    const y = Math.round(this.y - camera.y);
    const bob = Math.sin(time / 360 + this.x) * 2;

    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(x + 2, y + 24, 22, 6);
    ctx.fillStyle = "#7566d8";
    ctx.fillRect(x + 4, y + 10 + bob, 18, 16);
    ctx.fillStyle = "#f2c18d";
    ctx.fillRect(x + 6, y + 1 + bob, 14, 12);
    ctx.fillStyle = "#f3d070";
    ctx.fillRect(x + 3, y - 1 + bob, 20, 5);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 2, y - 17 + bob, 22, 12);
    ctx.fillStyle = "#17202a";
    ctx.fillRect(x + 8, y - 12 + bob, 8, 3);
  }
}
