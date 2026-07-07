class UI {
  constructor(game) {
    this.game = game;
    this.mainMenu = document.querySelector("#mainMenu");
    this.infoPanel = document.querySelector("#infoPanel");
    this.pauseMenu = document.querySelector("#pauseMenu");
    this.hud = document.querySelector("#hud");
    this.questBook = document.querySelector("#questBook");
    this.dialogueBox = document.querySelector("#dialogueBox");
    this.toastElement = document.querySelector("#toast");
    this.minigamePanel = document.querySelector("#minigamePanel");
    this.bindButtons();
  }

  bindButtons() {
    document.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]")?.dataset.action;
      if (!action) return;
      const actions = {
        "new-game": () => this.game.newGame(),
        "load-game": () => this.game.loadGame(),
        settings: () => this.showInfo("Einstellungen", "Sound und Tastaturbelegung sind vorbereitet. Aktuell spielst du mit WASD, Pfeiltasten, E, Q und ESC."),
        credits: () => this.showInfo("Credits", "Informatik Quest wurde mit HTML5, CSS3, Vanilla JavaScript und Canvas gebaut."),
        "close-panel": () => this.hideInfo(),
        resume: () => this.game.resume(),
        save: () => this.game.save(),
        "main-menu": () => this.game.mainMenu()
      };
      actions[action]?.();
    });
  }

  showMainMenu() {
    this.mainMenu.classList.add("screen--active");
    this.pauseMenu.classList.remove("is-open");
    this.hud.classList.remove("is-visible");
    this.questBook.classList.remove("is-visible");
    this.closeDialogue();
  }

  startGame() {
    this.mainMenu.classList.remove("screen--active");
    this.infoPanel.classList.remove("screen--active");
    this.pauseMenu.classList.remove("is-open");
    this.hud.classList.add("is-visible");
    this.questBook.classList.add("is-visible");
  }

  showPause() {
    this.pauseMenu.classList.add("is-open");
  }

  hidePause() {
    this.pauseMenu.classList.remove("is-open");
  }

  showInfo(title, text) {
    document.querySelector("#panelTitle").textContent = title;
    document.querySelector("#panelText").textContent = text;
    this.infoPanel.classList.add("screen--active");
  }

  hideInfo() {
    this.infoPanel.classList.remove("screen--active");
  }

  renderHUD(player, inventory) {
    document.querySelector("#healthText").textContent = `Leben ${player.health}`;
    document.querySelector("#xpText").textContent = `XP ${player.xp}`;
    document.querySelector("#levelText").textContent = `Level ${player.level}`;
    document.querySelector("#coinsText").textContent = `Muenzen ${inventory.coins}`;
  }

  renderQuests(quests) {
    const list = document.querySelector("#questList");
    list.innerHTML = "";
    quests.forEach((quest) => {
      const item = document.createElement("div");
      item.className = "quest-item";
      item.innerHTML = `<strong>${quest.title}</strong>${quest.description}<br>Status: ${quest.completed ? "erledigt" : "offen"}`;
      list.append(item);
    });
  }

  toggleQuestBook() {
    this.questBook.classList.toggle("is-visible");
  }

  openDialogue(speaker, text, actions) {
    document.querySelector("#speakerName").textContent = speaker;
    document.querySelector("#dialogueText").textContent = text;
    const actionContainer = document.querySelector("#dialogueActions");
    actionContainer.innerHTML = "";
    actions.forEach((action) => {
      const button = document.createElement("button");
      button.className = "button";
      button.type = "button";
      button.textContent = action.label;
      button.addEventListener("click", action.onClick);
      actionContainer.append(button);
    });
    this.dialogueBox.classList.add("is-open");
  }

  closeDialogue() {
    this.dialogueBox.classList.remove("is-open");
  }

  openMinigame(title, question, answers) {
    document.querySelector("#minigameTitle").textContent = title;
    document.querySelector("#minigameQuestion").textContent = question;
    const answerContainer = document.querySelector("#minigameAnswers");
    answerContainer.innerHTML = "";
    answers.forEach((answer) => answerContainer.append(answer));
    this.minigamePanel.classList.add("is-open");
  }

  closeMinigame() {
    this.minigamePanel.classList.remove("is-open");
  }

  toast(message) {
    this.toastElement.textContent = message;
    this.toastElement.classList.add("is-visible");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastElement.classList.remove("is-visible"), 2400);
  }
}
