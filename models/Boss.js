import { generateItemImage } from "../services/imageService.js";
import { API_KEYS } from "../constants/api-keys.js";

export class Boss {
  constructor() {
    this.health = 100;
    this.maxHealth = 100;
    this.name = "";
    this.story = "";
    this.image = null;
    this.weakness = "";
    this.challenge = [];
    this.weaknessMultiplier = 2;

    if (arguments.length > 0 && arguments[0]) {
      const data = arguments[0];
      this.health = data.health || this.health;
      this.maxHealth = data.health || this.maxHealth;
      this.name = data.name || this.name;
      this.story = data.story || this.story;
      this.weakness = data.weakness || this.weakness;
      this.challenge = data.challenge || this.challenge;
      this.weaknessMultiplier =
        data.weaknessMultiplier || this.weaknessMultiplier;
    }
  }

  takeDamage(amount, exerciseType) {
    const damage =
      exerciseType === this.weakness
        ? amount * this.weaknessMultiplier
        : amount;
    this.health = Math.max(0, this.health - damage);
    this.updateHealthDisplay();
    return this.health <= 0;
  }

  updateHealthDisplay() {
    const healthFill = document.getElementById("boss-health");
    const healthText = document.getElementById("boss-health-text");
    const percentage = (this.health / this.maxHealth) * 100;

    healthFill.style.width = `${percentage}%`;
    healthText.textContent = `${Math.round(this.health)}/${this.maxHealth}`;
  }

  async generateBossImage(prompt) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEYS.GEMINI}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Create a detailed image description for a fantasy boss character: ${this.name}. ${this.story} Describe the boss's appearance in vivid, specific detail that could be used to generate an artwork.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate boss image description");
      }

      const data = await response.json();
      const imageDescription = data.candidates[0].content.parts[0].text;

      // Use Stability AI to generate the actual image
      const imageUrl = await generateItemImage({
        name: this.name,
        type: "boss",
        rarity: "Legendary",
        customPrompt: imageDescription,
      });

      if (imageUrl) {
        this.image = imageUrl;
        document.getElementById(
          "boss-portrait"
        ).style.backgroundImage = `url(${imageUrl})`;
      }
    } catch (error) {
      console.error("Failed to generate boss image:", error);
    }
  }
}
