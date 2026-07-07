class Quest {
  constructor({ id, title, description, reward, completed = false }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.reward = reward;
    this.completed = completed;
  }

  static fromSave(data) {
    return new Quest(data);
  }

  complete() {
    this.completed = true;
  }

  toSave() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      reward: this.reward,
      completed: this.completed
    };
  }
}
