import { DEFAULT_BOSSES } from "./data.js";
import { Character } from "./models/Character.js";
import { Boss } from "./models/Boss.js";
import { Equipment } from "./models/Equipment.js";
import { WORKOUTS } from "./constants/workouts.js";
import { API_KEYS } from "./constants/api-keys.js";
import { generateItemImage } from "./services/imageService.js";

// Initialize character and setup initial inventory display
const character = new Character();
character.updateStats();
character.updateInventoryDisplay();

// Initialize current boss
let currentBoss = null;

// Prevent form submission and handle workout completion
const workoutForm = document.querySelector(".workout-form");
const workoutButton = document.getElementById("complete-workout");
const workoutType = document.getElementById("workout-type");
const repsInput = document.getElementById("workout-reps");
const findBossButton = document.getElementById("find-boss");

workoutForm.onsubmit = (e) => e.preventDefault();

let defaultBossIndex = 0;

async function generateBossWithGemini() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEYS.GEMINI}`,
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
                  text:
                    'You are a JSON generator. Generate a boss character for a fitness RPG game following this exact format, no markdown or extra text: {"name": string, "story": string, "weakness": string (one of: ' +
                    Object.values(WORKOUTS).join(", ") +
                    '), "challenges": [{"exercise": string, "reps": number}] (array of 3 challenges)}',
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      // If API fails, use default boss
      if (defaultBossIndex >= DEFAULT_BOSSES.length) {
        defaultBossIndex = 0; // Reset to first boss if we've used them all
      }
      const defaultBoss = DEFAULT_BOSSES[defaultBossIndex++];
      const boss = new Boss();
      Object.assign(boss, defaultBoss);
      return boss;
    }

    try {
      const data = await response.json();
      const bossData = JSON.parse(data.candidates[0].content.parts[0].text);

      const boss = new Boss();
      boss.name = bossData.name;
      boss.story = bossData.story;
      boss.weakness = bossData.weakness;
      boss.challenge = bossData.challenges;

      return boss;
    } catch (error) {
      console.error("Failed to parse boss data:", error);
      // Fall back to default boss
      if (defaultBossIndex >= DEFAULT_BOSSES.length) {
        defaultBossIndex = 0;
      }
      const defaultBoss = DEFAULT_BOSSES[defaultBossIndex++];
      const boss = new Boss();
      Object.assign(boss, defaultBoss);
      return boss;
    }
  } catch (error) {
    console.error("Failed to fetch from API:", error);
    // Fall back to default boss
    if (defaultBossIndex >= DEFAULT_BOSSES.length) {
      defaultBossIndex = 0;
    }
    const defaultBoss = DEFAULT_BOSSES[defaultBossIndex++];
    const boss = new Boss();
    Object.assign(boss, defaultBoss);
    return boss;
  }
}

findBossButton.addEventListener("click", async () => {
  try {
    console.log("Find boss button clicked");
    findBossButton.disabled = true;
    findBossButton.textContent = "Summoning Boss...";

    console.log("Generating boss with Gemini...");
    currentBoss = await generateBossWithGemini();
    console.log("Generated boss:", currentBoss);
    console.log("Generating boss image...");
    await currentBoss.generateBossImage();
    console.log("Boss image generated");

    // Update UI
    console.log("Updating UI with new boss");
    document.getElementById("boss-name").textContent = currentBoss.name;
    document.getElementById("boss-story").textContent = currentBoss.story;
    document.getElementById(
      "boss-weakness"
    ).textContent = `Weakness: ${currentBoss.weakness}`;

    const challengeList = document.getElementById("challenge-list");
    challengeList.innerHTML = currentBoss.challenge
      .map(
        (c) => `
      <div class="challenge-item" data-exercise="${c.exercise}" data-reps="${c.reps}">
        ${c.exercise}: ${c.reps} reps
      </div>
    `
      )
      .join("");

    currentBoss.updateHealthDisplay();
  } catch (error) {
    alert("Failed to generate boss. Please try again.");
  } finally {
    findBossButton.disabled = false;
    findBossButton.textContent = "Find New Boss";
  }
});

// Event listener for workout completion
workoutButton.addEventListener("click", async () => {
  if (!currentBoss) {
    alert("Find a boss first!");
    return;
  }

  const reps = parseInt(repsInput.value);
  const exercise = workoutType.value;

  if (!reps || reps <= 0) {
    alert("Please enter a valid number of reps!");
    return;
  }

  try {
    // Disable form and update button text
    workoutButton.disabled = true;
    workoutType.disabled = true;
    repsInput.disabled = true;
    workoutButton.textContent = "Processing...";

    // Calculate XP and damage
    const xpGained = Math.floor(reps * 5);
    character.gainXP(xpGained);

    // Deal damage to boss
    const baseDamage = reps * 2;
    const isBossDefeated = currentBoss.takeDamage(
      baseDamage,
      WORKOUTS[exercise]
    );

    if (isBossDefeated) {
      // Generate two guaranteed equipment drops
      const drops = [];
      for (let i = 0; i < 2; i++) {
        const type =
          Equipment.types[Math.floor(Math.random() * Equipment.types.length)];
        const newEquipment = new Equipment(type, character.level);
        drops.push(newEquipment);
      }

      // Display drops one after another
      for (const equipment of drops) {
        await displayEquipmentCard(equipment);
      }

      currentBoss = null;
      document.getElementById("boss-name").textContent = "No Active Boss";
      document.getElementById("boss-story").textContent = "";
      document.getElementById("boss-weakness").textContent = "";
      document.getElementById("challenge-list").innerHTML = "";
      document.getElementById("boss-portrait").style.backgroundImage = "none";
    }

    workoutButton.textContent = "Complete Exercise";
  } catch (error) {
    console.error("Error processing workout:", error);
    alert("There was an error processing your workout. Please try again.");
    workoutButton.textContent = "Complete Exercise";
  } finally {
    workoutType.disabled = false;
    repsInput.disabled = false;
    workoutButton.disabled = false;
  }
});

async function displayEquipmentCard(equipment) {
  workoutButton.textContent = "Unlocking...";

  // Generate the image first
  const imageUrl = await generateItemImage(equipment);
  if (imageUrl) {
    equipment.imageUrl = imageUrl;
  }
  const rewardDisplay = document.getElementById("reward-display");
  const cardStats = rewardDisplay.querySelector(".card-stats");
  const cardImage = rewardDisplay.querySelector(".card-image");

  // Set card content
  cardStats.innerHTML = `
    <h4 style="color: ${getRarityColor(equipment.rarity)}">${
    equipment.name
  }</h4>
    <p>Type: ${equipment.type}</p>
    <p>Rarity: ${equipment.rarity}</p>
    <p>Strength: +${equipment.stats.strength}</p>
    <p>Endurance: +${equipment.stats.endurance}</p>
    <div class="card-buttons">
      <button id="equip-button">Equip</button>
      <button id="inventory-button">Add to Inventory</button>
    </div>
  `;

  // Set card image
  if (equipment.imageUrl) {
    cardImage.style.background = `url(${equipment.imageUrl}) center/cover`;
  } else {
    // Fallback to gradient if image generation failed
    cardImage.style.background = `
      linear-gradient(45deg, 
      ${getRarityColor(equipment.rarity)}33, 
      ${getRarityColor(equipment.rarity)}66)
    `;
  }

  rewardDisplay.style.display = "block";

  // Add event listeners for buttons
  document.getElementById("equip-button").addEventListener("click", () => {
    character.equipItem(equipment);
    rewardDisplay.style.display = "none";
  });

  document.getElementById("inventory-button").addEventListener("click", () => {
    if (character.addToInventory(equipment)) {
      rewardDisplay.style.display = "none";
    }
  });
}

function getRarityColor(rarity) {
  const colors = {
    Common: "#808080",
    Uncommon: "#00ff00",
    Rare: "#0000ff",
    Epic: "#800080",
    Legendary: "#ffd700",
  };
  return colors[rarity];
}
