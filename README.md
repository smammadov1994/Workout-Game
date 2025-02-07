# Fitness RPG

A web-based RPG game that gamifies your workout routine. Complete real-life workouts to level up your character and collect magical equipment.

## Features

- Track workouts and gain experience points
- Level up system that increases character stats
- Equipment system with 5 rarity levels (Common to Legendary)
- Magic: The Gathering style equipment cards
- Equipment stats scale with character level and rarity
- Prepared for AI image generation integration

## How to Use

1. Open `index.html` in your web browser
2. Enter your workout duration and type
3. Click "Complete Workout" to gain experience
4. Level up by gaining enough experience
5. Find magical equipment with random chances after workouts
6. Equip items to boost your character's stats

## Integrating AI Image Generation

The game is prepared to work with AI image generation services. To integrate an AI service:

1. Open `app.js` and locate the `generateItemImage` function
2. Replace the TODO section with your chosen AI service API call. Here are examples for popular services:

### OpenAI DALL-E Example

```javascript
const response = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your-api-key",
  },
  body: JSON.stringify({
    prompt: prompt,
    n: 1,
    size: "512x512",
  }),
});
const data = await response.json();
return data.data[0].url;
```

### Stable Diffusion Example

```javascript
const response = await fetch("your-stable-diffusion-endpoint", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your-api-key",
  },
  body: JSON.stringify({
    prompt: prompt,
    negative_prompt: "blurry, low quality",
    steps: 30,
    width: 512,
    height: 512,
  }),
});
const data = await response.json();
return data.output[0]; // Adjust based on your API response structure
```

## The Prompt Template

The game generates detailed prompts for the AI to create equipment card art. The prompt template is:

```
Fantasy [rarity] [equipment type] card art, detailed, magical glow, [equipment name], digital art style
```

For example:

- "Fantasy legendary sword card art, detailed, magical glow, Dragon's Weapon of Power, digital art style"
- "Fantasy rare shield card art, detailed, magical glow, Ancient Shield of Glory, digital art style"

## Customization

You can customize various aspects of the game:

- Edit the equipment prefixes and suffixes in the `Equipment` class
- Adjust rarity chances in the `generateRarity` method
- Modify stat calculations in the `generateStats` method
- Change the XP requirements for leveling up in the `gainXP` method

## Styles

The game uses the Cinzel font family for a fantasy RPG feel. The color scheme can be customized in the `:root` CSS variables in `styles.css`.
