// Contract ABI for SaveTheCity
export const SAVE_THE_CITY_ABI = [
  // Write functions
  {
    inputs: [
      { internalType: "uint8", name: "heroId", type: "uint8" },
      { internalType: "string", name: "scenario", type: "string" },
    ],
    name: "playGame",
    outputs: [{ internalType: "string", name: "story", type: "string" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Read functions
  {
    inputs: [],
    name: "getScenarioSeed",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "count", type: "uint256" }],
    name: "getRecentGames",
    outputs: [
      {
        components: [
          { internalType: "address", name: "player", type: "address" },
          { internalType: "uint8", name: "heroId", type: "uint8" },
          { internalType: "string", name: "heroName", type: "string" },
          { internalType: "string", name: "scenario", type: "string" },
          { internalType: "string", name: "story", type: "string" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "uint256", name: "gameNumber", type: "uint256" },
        ],
        internalType: "struct SaveTheCity.GameRecord[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getPlayerGames",
    outputs: [
      {
        components: [
          { internalType: "address", name: "player", type: "address" },
          { internalType: "uint8", name: "heroId", type: "uint8" },
          { internalType: "string", name: "heroName", type: "string" },
          { internalType: "string", name: "scenario", type: "string" },
          { internalType: "string", name: "story", type: "string" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "uint256", name: "gameNumber", type: "uint256" },
        ],
        internalType: "struct SaveTheCity.GameRecord[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalGames",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getHeroStats",
    outputs: [
      { internalType: "uint256", name: "dunkenCount", type: "uint256" },
      { internalType: "uint256", name: "stefanCount", type: "uint256" },
      { internalType: "uint256", name: "jezCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PLAY_FEE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalGamesPlayed",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "gameNumber", type: "uint256" },
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: true, internalType: "uint8", name: "heroId", type: "uint8" },
      { indexed: false, internalType: "string", name: "heroName", type: "string" },
      { indexed: false, internalType: "string", name: "scenario", type: "string" },
      { indexed: false, internalType: "string", name: "story", type: "string" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "GamePlayed",
    type: "event",
  },
] as const;

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const PLAY_FEE_ETH = "0";
export const PLAY_FEE_WEI = BigInt("0"); // 0.01 ETH in wei
