import { EQUIPMENT_CONFIG } from "../data.js";

export class Equipment {
  static types = EQUIPMENT_CONFIG.types;
  static rarities = EQUIPMENT_CONFIG.rarities;
  static prefixes = EQUIPMENT_CONFIG.prefixes;
  static suffixes = EQUIPMENT_CONFIG.suffixes;

  constructor(type, level) {
    this.type = type;
    this.rarity = this.generateRarity();
    this.name = this.generateName();
    this.stats = this.generateStats(level);
    this.imageUrl = null;
  }

  generateRarity() {
    const roll = Math.random() * 100;
    if (roll > 98) return "Legendary";
    if (roll > 90) return "Epic";
    if (roll > 75) return "Rare";
    if (roll > 50) return "Uncommon";
    return "Common";
  }

  generateName() {
    const prefix =
      Equipment.prefixes[Math.floor(Math.random() * Equipment.prefixes.length)];
    const suffix =
      Equipment.suffixes[Math.floor(Math.random() * Equipment.suffixes.length)];
    return `${prefix} ${
      this.type.charAt(0).toUpperCase() + this.type.slice(1)
    } ${suffix}`;
  }

  generateStats(level) {
    const baseValue = Math.floor(level * 1.5);
    const multiplier = EQUIPMENT_CONFIG.rarityMultipliers[this.rarity];

    return {
      strength: Math.floor(
        baseValue * multiplier * (Math.random() * 0.4 + 0.8)
      ),
      endurance: Math.floor(
        baseValue * multiplier * (Math.random() * 0.4 + 0.8)
      ),
    };
  }
}
