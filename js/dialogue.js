class Dialogue {
  constructor(ui) {
    this.ui = ui;
  }

  open(speaker, text, actions = []) {
    this.ui.openDialogue(speaker, text, actions);
  }

  close() {
    this.ui.closeDialogue();
  }
}
