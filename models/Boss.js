import { API_KEYS, ENGINE_ID } from "../constants/api-keys.js";

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

  async generateBossImage() {
    try {
      const basePrompt = `Fantasy boss character: ${this.name}. ${this.story}`;
      const enhancedPrompt = `${basePrompt} High detail fantasy art, dramatic lighting, epic pose, 4k, highly detailed`;

      const response = await fetch(
        `https://api.stability.ai/v1/generation/${ENGINE_ID}/text-to-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${API_KEYS.STABILITY_AI}`,
          },
          body: JSON.stringify({
            text_prompts: [
              {
                text: enhancedPrompt,
                weight: 1,
              },
            ],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            steps: 30,
            samples: 1,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Stability AI API error: ${response.statusText}`);
      }

      const responseData = await response.json();
      const base64Image = responseData.artifacts[0].base64;
      const imageUrl = `data:image/png;base64,${base64Image}`;

      this.image = imageUrl;
      document.getElementById(
        "boss-portrait"
      ).style.backgroundImage = `url(${imageUrl})`;

      return imageUrl;
    } catch (error) {
      console.error("Failed to generate boss image:", error);
      return null;
    }
  }
}
