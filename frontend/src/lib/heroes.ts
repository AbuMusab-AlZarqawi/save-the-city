export interface Hero {
  id: number;
  name: string;
  title: string;
  description: string;
  image: string;
  color: string;
  glowColor: string;
  borderColor: string;
  power: string;
  weakness: string;
}

export const HEROES: Hero[] = [
  {
    id: 0,
    name: "Dunken",
    title: "The Stone Oracle",
    description: "An ancient titan forged from living stone, wielding a crackling orb of pure energy. Guardian of forgotten civilizations.",
    image: "/heroes/dunken.png",
    color: "#8888ff",
    glowColor: "rgba(136, 136, 255, 0.4)",
    borderColor: "#6666cc",
    power: "Reality Manipulation",
    weakness: "Entropy Fields",
  },
  {
    id: 1,
    name: "Stefan",
    title: "Viltrumite Scientist",
    description: "Genius frog of the Viltrumite order. Master of biological enhancement and advanced technology. Thumbs up, city saved.",
    image: "/heroes/stefan.jpg",
    color: "#c9a227",
    glowColor: "rgba(201, 162, 39, 0.4)",
    borderColor: "#9a7d1f",
    power: "Bio-Tech Mastery",
    weakness: "Sonic Frequencies",
  },
  {
    id: 2,
    name: "Jez",
    title: "The Cosmic Entity",
    description: "A mysterious cosmic being wearing divine symbols. Channels lightning through the universe's oldest runes.",
    image: "/heroes/jez.png",
    color: "#ff6b00",
    glowColor: "rgba(255, 107, 0, 0.4)",
    borderColor: "#cc5500",
    power: "Divine Lightning",
    weakness: "Dimensional Anchors",
  },
];
