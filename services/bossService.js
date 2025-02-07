import { Boss } from "../models/Boss.js";
import { DEFAULT_BOSSES } from "../data.js";
import { WORKOUTS } from "../constants/workouts.js";

let defaultBossIndex = 0;

export async function generateBoss() {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDjK__jJVM1TsuZa1_PhqsC35s7MJndxhA",
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
      return getDefaultBoss();
    }

    try {
      const data = await response.json();
      const bossData = JSON.parse(data.candidates[0].content.parts[0].text);
      const boss = new Boss();
      Object.assign(boss, bossData);
      return boss;
    } catch (error) {
      console.error("Failed to parse boss data:", error);
      return getDefaultBoss();
    }
  } catch (error) {
    console.error("Failed to fetch from API:", error);
    return getDefaultBoss();
  }
}

function getDefaultBoss() {
  if (defaultBossIndex >= DEFAULT_BOSSES.length) {
    defaultBossIndex = 0;
  }
  const defaultBoss = DEFAULT_BOSSES[defaultBossIndex++];
  const boss = new Boss();
  Object.assign(boss, defaultBoss);
  return boss;
}
