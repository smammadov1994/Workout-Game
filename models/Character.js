export class Character {
  constructor() {
    this.level = 1;
    this.xp = 0;
    this.strength = 10;
    this.endurance = 10;
    this.equipment = {
      weapon: null,
      armor: null,
      shield: null,
    };
    this.inventory = [];
    this.hasFirstDrop = false;
  }

  addToInventory(item) {
    if (this.inventory.length >= 100) {
      alert("Inventory is full! Please make room for new items.");
      return false;
    }
    this.inventory.push(item);
    this.updateInventoryDisplay();
    return true;
  }

  removeFromInventory(index) {
    if (index >= 0 && index < this.inventory.length) {
      this.inventory.splice(index, 1);
      this.updateInventoryDisplay();
    }
  }

  updateInventoryDisplay() {
    const inventoryGrid = document.getElementById("inventory-grid");
    const inventoryCount = document.getElementById("inventory-count");

    inventoryGrid.innerHTML = "";
    inventoryCount.textContent = this.inventory.length;

    // Create 100 slots
    for (let i = 0; i < 100; i++) {
      const slot = document.createElement("div");
      slot.className = "inventory-slot";

      if (i < this.inventory.length) {
        const item = this.inventory[i];
        slot.innerHTML = `
          <img src="${item.imageUrl || "#"}" alt="${item.name}">
          <div class="tooltip">
            ${item.name}<br>
            Type: ${item.type}<br>
            Rarity: ${item.rarity}<br>
            STR: +${item.stats.strength}<br>
            END: +${item.stats.endurance}
          </div>
        `;
        slot.onclick = () => this.equipItemFromInventory(i);
      } else {
        slot.classList.add("empty-slot");
      }

      inventoryGrid.appendChild(slot);
    }
  }

  equipItemFromInventory(index) {
    const item = this.inventory[index];
    this.equipItem(item);
    this.removeFromInventory(index);
  }

  gainXP(amount) {
    this.xp += amount;
    if (this.xp >= this.level * 100) {
      this.levelUp();
    }
    this.updateStats();
  }

  levelUp() {
    this.level++;
    this.strength += 2;
    this.endurance += 2;
    this.xp = 0;
    alert(`Level Up! You are now level ${this.level}!`);
  }

  updateStats() {
    document.getElementById("level").textContent = this.level;
    document.getElementById("xp").textContent = this.xp;
    document.getElementById("strength").textContent = this.strength;
    document.getElementById("endurance").textContent = this.endurance;
  }

  equipItem(item) {
    this.equipment[item.type] = item;
    this.strength += item.stats.strength || 0;
    this.endurance += item.stats.endurance || 0;
    this.updateStats();

    // Update equipment slot display
    const slot = document.querySelector(`[data-slot="${item.type}"]`);
    slot.innerHTML = `
      <p>${item.name}</p>
      <small>STR +${item.stats.strength || 0} END +${
      item.stats.endurance || 0
    }</small>
      <div class="slot-preview" style="background-image: url('${
        item.imageUrl
      }')"></div>
    `;
    slot.classList.add("equipped");

    // Update character preview
    const previewSlot = document.querySelector(`.${item.type}-preview`);
    if (previewSlot) {
      previewSlot.style.backgroundImage = `url('${item.imageUrl}')`;
    }
  }
}
