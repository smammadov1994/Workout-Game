import { API_KEYS, ENGINE_ID } from "../constants/api-keys.js";

export async function generateItemImage(item) {
  try {
    const prompt = item.customPrompt || buildDefaultPrompt(item);
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
              text: prompt,
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
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error("Failed to generate image:", error);
    return null;
  }
}

function buildDefaultPrompt(item) {
  return `Fantasy ${item.rarity.toLowerCase()} ${
    item.type
  } card art, detailed, magical glow, ${
    item.name
  }, digital art style, centered composition, isolated on dark background, high quality`;
}
