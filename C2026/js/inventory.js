class Inventory {
  constructor({ coins = 0, items = [] } = {}) {
    this.coins = coins;
    this.items = new Map(items.map((item) => [item.name, item.count]));
  }

  static fromSave(data) {
    return new Inventory(data || {});
  }

  addCoins(amount) {
    this.coins += amount;
  }

  addItem(name, count = 1) {
    this.items.set(name, (this.items.get(name) || 0) + count);
  }

  toSave() {
    return {
      coins: this.coins,
      items: [...this.items.entries()].map(([name, count]) => ({ name, count }))
    };
  }
}
