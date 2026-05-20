export const SCENARIOS = [
  "A 300-foot Kaiju monster has risen from the harbor and is demolishing the financial district with its massive claws",
  "A rogue AI has taken control of all city infrastructure — traffic systems, power grid, and water supply are now weapons",
  "An army of interdimensional warlords has opened a portal above City Hall and is raining plasma fire on civilians below",
  "A cascading earthquake is splitting the city in half — skyscrapers are tilting and the subway is flooding with seawater",
  "A mad scientist has released nanobots that are consuming all metal in the city — buildings and bridges are crumbling",
  "A psychic supervillain is broadcasting a mind-control signal that has turned 90% of the population into an obedient army",
  "A black hole device detonated in the city center is pulling streets, cars, and people into a swirling vortex",
  "A genetically engineered mega-virus is spreading through the air, turning people into stone within minutes of exposure",
  "A cult of time-sorcerers has rewound the city into the medieval era — dinosaurs roam the streets and logic no longer works",
  "An alien fleet has established a gravity tractor beam over the city and is slowly lifting the entire urban grid into space",
  "A chemical weapon has turned the rain toxic — acid burns anything organic it touches and the storm shows no sign of stopping",
  "The city's shadow has come alive as a dark entity that swallows anyone it touches into permanent darkness",
  "A mechanical plague of self-replicating drones is dismantling the city piece by piece to build a weapon of mass destruction",
  "A solar flare supercharged a villain's body to emit electromagnetic pulses, disabling all electronics across the entire city",
  "Underground war machines have surfaced through the streets and are systematically destroying every hospital and emergency service",
  "A reality-warping field is expanding from downtown, dissolving the laws of physics — gravity reverses in unpredictable waves",
  "A criminal mastermind has hijacked military satellites and is using orbital laser strikes against city blocks",
  "A supernatural tornado the size of the entire city has appeared — inside it, ghostly figures are dragging people into the storm",
  "A volcanic rift has opened under the city center and magma is flooding the underground transit system at lethal speed",
  "An ancient god has awakened beneath the city and its mere heartbeat is shattering foundations and collapsing entire districts",
];

export function getScenarioByIndex(index: number): string {
  return SCENARIOS[index % SCENARIOS.length];
}

export function getRandomScenario(): string {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}
