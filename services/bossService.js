import { Boss } from "../models/Boss.js";
import { DEFAULT_BOSSES } from "../data.js";
import { WORKOUTS } from "../constants/workouts.js";

export async function generateBossWithGemini() {
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
