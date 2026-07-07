class Minigame {
  constructor(game, config) {
    this.game = game;
    this.config = config;
  }

  start(onComplete) {
    const buttons = this.config.answers.map((answer) => {
      const button = document.createElement("button");
      button.className = "button";
      button.type = "button";
      button.textContent = answer.label;
      button.addEventListener("click", () => onComplete(answer.correct));
      return button;
    });
    this.game.ui.openMinigame(this.config.title, this.config.question, buttons);
  }
}

class MinigameRegistry {
  constructor(game) {
    this.game = game;
    this.games = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    // Weitere Themen werden mit derselben Schnittstelle registriert.
    this.register("binary", {
      title: "Binaerzahlen",
      question: "Welche Dezimalzahl entspricht der Binaerzahl 1010?",
      answers: [
        { label: "8", correct: false },
        { label: "10", correct: true },
        { label: "12", correct: false },
        { label: "16", correct: false }
      ]
    });
  }

  register(id, config) {
    this.games.set(id, new Minigame(this.game, config));
  }

  start(id, onComplete) {
    this.games.get(id)?.start(onComplete);
  }

  close() {
    this.game.ui.closeMinigame();
  }
}
