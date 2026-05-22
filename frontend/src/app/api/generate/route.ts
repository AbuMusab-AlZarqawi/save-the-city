import { NextRequest, NextResponse } from "next/server";

const HERO_DESCRIPTIONS: Record<number, string> = {
  0: "an ancient stone titan who wields a crackling orb of pure energy, guardian of forgotten civilizations",
  1: "a genius frog scientist of the Viltrumite order, master of technology and biological enhancement",
  2: "a mysterious cosmic entity with glowing eyes, channeling divine lightning through their fingertips",
};

const HERO_NAMES: Record<number, string> = {
  0: "Dunken",
  1: "Stefan",
  2: "Jez",
};

export async function POST(req: NextRequest) {
  try {
    const { heroId, scenario } = await req.json();

    if (heroId === undefined || heroId === null || !scenario) {
      return NextResponse.json({ error: "Missing heroId or scenario" }, { status: 400 });
    }

    const heroName = HERO_NAMES[heroId as number];
    const heroDesc = HERO_DESCRIPTIONS[heroId as number];

    if (!heroName) {
      return NextResponse.json({ error: "Invalid heroId" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a dramatic comic-book narrator for an onchain superhero game called "Save The City". A city is under threat and a hero has answered the call.

The threat: ${scenario}

The hero: ${heroName} — ${heroDesc}

Write a thrilling, dramatic 3-sentence story of exactly how ${heroName} saved the city from this specific threat. Be vivid, action-packed, and specific to both the threat and the hero's unique abilities. End with the city safe and the hero victorious. Plain text only, no markdown.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content?.trim() || "The hero saved the city.";

    return NextResponse.json({ story, heroName });
  } catch (err) {
    console.error("Generate route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}