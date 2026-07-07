const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const AUTOSAVE_MS = 15000;

class Game {
  constructor() {
    this.canvas = document.querySelector("#gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    this.ui = new UI(this);
    this.saveSystem = new SaveSystem("informatik-quest-save");
    this.inventory = new Inventory();
    this.dialogue = new Dialogue(this.ui);
    this.minigames = new MinigameRegistry(this);
    // Sound-Hooks sind vorbereitet, damit spaeter echte Dateien in assets/ angeschlossen werden koennen.
    this.audio = { music: null, step: null, click: null, questComplete: null };
    this.world = null;
    this.player = null;
    this.quests = new Map();
    this.keys = new Set();
    this.state = "menu";
    this.lastFrame = 0;
    this.lastAutosave = 0;

    this.bindEvents();
    this.ui.showMainMenu();
    requestAnimationFrame((time) => this.loop(time));
  }

  bindEvents() {
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      this.keys.add(key);

      if (key === "escape" && this.state === "playing") this.pause();
      else if (key === "escape" && this.state === "paused") this.resume();
      else if ((key === "e" || key === "enter") && this.state === "playing") this.tryInteract();
      else if (key === "q" && this.state === "playing") this.ui.toggleQuestBook();
    });

    window.addEventListener("keyup", (event) => {
      this.keys.delete(event.key.toLowerCase());
    });
  }

  async newGame() {
    this.inventory = new Inventory();
    this.quests = new Map([
      [
        "binary-start",
        new Quest({
          id: "binary-start",
          title: "Der erste Code",
          description: "Hilf Prof. Byte mit einer Binaerfrage.",
          reward: { xp: 30, coins: 12, item: "USB-Stick" }
        })
      ]
    ]);

    await this.loadMap("school");
    this.player = new Player({ x: 260, y: 340 });
    this.state = "playing";
    this.ui.startGame();
    this.ui.renderHUD(this.player, this.inventory);
    this.ui.renderQuests([...this.quests.values()]);
    this.ui.toast("Willkommen vor der Informatikschule.");
  }

  async loadGame() {
    const data = this.saveSystem.load();
    if (!data) {
      this.ui.toast("Kein Spielstand gefunden.");
      return;
    }

    await this.loadMap(data.mapId || "school");
    this.player = Player.fromSave(data.player);
    this.inventory = Inventory.fromSave(data.inventory);
    this.quests = new Map(data.quests.map((quest) => [quest.id, Quest.fromSave(quest)]));
    this.state = "playing";
    this.ui.startGame();
    this.ui.renderHUD(this.player, this.inventory);
    this.ui.renderQuests([...this.quests.values()]);
    this.ui.toast("Spiel geladen.");
  }

  save() {
    if (!this.player || !this.world) return;
    this.saveSystem.save({
      mapId: this.world.id,
      player: this.player.toSave(),
      inventory: this.inventory.toSave(),
      quests: [...this.quests.values()].map((quest) => quest.toSave())
    });
    this.ui.toast("Spiel gespeichert.");
  }

  async loadMap(id) {
    this.world = await World.load(id);
    this.world.npcs = this.world.data.npcs.map((npcData) => new NPC(npcData));
  }

  loop(time) {
    const delta = Math.min((time - this.lastFrame) / 1000, 0.04);
    this.lastFrame = time;

    // requestAnimationFrame haelt Bewegung, Kamera und Animationen fluessig.
    if (this.state === "playing") {
      this.update(delta, time);
      this.draw(time);
    } else {
      this.draw(time);
    }

    requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  update(delta, time) {
    this.player.update(delta, this.keys, this.world);
    this.world.update(delta);
    this.world.npcs.forEach((npc) => npc.update(delta));
    this.ui.renderHUD(this.player, this.inventory);

    if (time - this.lastAutosave > AUTOSAVE_MS) {
      this.save();
      this.lastAutosave = time;
    }
  }

  draw(time) {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!this.world || !this.player) {
      this.drawMenuBackdrop(time);
      return;
    }

    const camera = this.world.getCamera(this.player, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.world.draw(this.ctx, camera, time);
    this.world.npcs.forEach((npc) => npc.draw(this.ctx, camera, time));
    this.player.draw(this.ctx, camera, time);
    this.world.drawForeground(this.ctx, camera, time);
  }

  drawMenuBackdrop(time) {
    const pulse = Math.sin(time / 600) * 5;
    this.ctx.fillStyle = "#6ecb78";
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.fillStyle = "#4ba3d8";
    this.ctx.fillRect(0, 390 + pulse, CANVAS_WIDTH, 42);
    this.ctx.fillStyle = "#f3d070";
    this.ctx.fillRect(130, 130, 90, 90);
    this.ctx.fillStyle = "#2f7052";
    for (let x = 0; x < CANVAS_WIDTH; x += 48) this.ctx.fillRect(x, 328 + (x % 96), 18, 18);
  }

  tryInteract() {
    const npc = this.world.findNearbyNPC(this.player);
    if (npc) {
      this.startNPCDialogue(npc);
      return;
    }

    const sign = this.world.findNearbySign(this.player);
    if (sign) this.dialogue.open("Schild", sign.text, [{ label: "Weiter", onClick: () => this.dialogue.close() }]);
  }

  startNPCDialogue(npc) {
    const quest = npc.questId ? this.quests.get(npc.questId) : null;
    const actions = [{ label: "Bis spaeter", onClick: () => this.dialogue.close() }];

    if (quest && !quest.completed) {
      actions.unshift({
        label: "Frage beantworten",
        onClick: () => this.minigames.start("binary", (success) => this.finishQuest(quest, success))
      });
    }

    this.dialogue.open(npc.name, npc.dialogue.join(" "), actions);
  }

  finishQuest(quest, success) {
    this.dialogue.close();
    this.minigames.close();

    if (!success) {
      this.ui.toast("Fast! Versuch es noch einmal.");
      return;
    }

    quest.complete();
    this.player.addXP(quest.reward.xp);
    this.inventory.addCoins(quest.reward.coins);
    this.inventory.addItem(quest.reward.item);
    this.ui.renderQuests([...this.quests.values()]);
    this.ui.toast(`Quest erledigt: ${quest.title}`);
    this.save();
  }

  pause() {
    this.state = "paused";
    this.ui.showPause();
  }

  resume() {
    this.state = "playing";
    this.ui.hidePause();
  }

  mainMenu() {
    this.state = "menu";
    this.ui.showMainMenu();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.informatikQuest = new Game();
});
