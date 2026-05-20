// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SaveTheCity
 * @dev Onchain AI game using Ritual Chain's native LLM precompile.
 *      Players pay 0.01 RITUAL per game. The LLM precompile generates
 *      a unique hero story fully onchain inside a TEE.
 *
 * Ritual LLM Precompile address: 0x0000000000000000000000000000000000000101
 */

interface IRitualLLM {
    /**
     * @notice Synchronous inference - returns result immediately (TEE-verified).
     *         Ritual Chain supports synchronous calls via its native precompile.
     */
    function infer(
        string calldata model,
        string calldata prompt,
        uint256 maxTokens
    ) external payable returns (string memory result);
}

contract SaveTheCity {
    // -----------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------
    address public constant RITUAL_LLM_PRECOMPILE = 0x0000000000000000000000000000000000000802;
    uint256 public constant PLAY_FEE = 0;
    uint256 public constant MAX_STORY_TOKENS = 300;
    string  public constant LLM_MODEL = "llama3.1-8b-instruct";

    uint8 public constant HERO_DUNKEN = 0;
    uint8 public constant HERO_STEFAN = 1;
    uint8 public constant HERO_JEZ    = 2;

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------
    address public owner;
    uint256 public totalGamesPlayed;

    struct GameRecord {
        address player;
        uint8   heroId;
        string  heroName;
        string  scenario;
        string  story;
        uint256 timestamp;
        uint256 gameNumber;
    }

    GameRecord[] public allGames;
    mapping(address => uint256[]) public playerGameIndices;
    mapping(uint8 => uint256) public heroPlayCount;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------
    event GamePlayed(
        uint256 indexed gameNumber,
        address indexed player,
        uint8   indexed heroId,
        string  heroName,
        string  scenario,
        string  story,
        uint256 timestamp
    );
    event Withdrawn(address indexed owner, uint256 amount);

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------
    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "SaveTheCity: not owner");
        _;
    }

    // -----------------------------------------------------------------------
    // Core Game Function
    // -----------------------------------------------------------------------

    /**
     * @notice Play a game. Send exactly 0.01 RITUAL.
     * @param heroId   0=Dunken, 1=Stefan, 2=Jez
     * @param scenario The city threat scenario string
     */
    function playGame(uint8 heroId, string calldata scenario)
        external
        payable
        returns (string memory story)
    {
        require(msg.value == 0, "SaveTheCity: no payment required");
        require(heroId <= 2, "SaveTheCity: invalid hero ID");
        require(bytes(scenario).length > 0, "SaveTheCity: scenario required");

        string memory heroName = _heroName(heroId);
        string memory heroDesc = _heroDescription(heroId);

        string memory prompt = string(abi.encodePacked(
            "You are a dramatic comic-book narrator. A city is under threat. ",
            "The threat: ", scenario, ". ",
            "The hero who answered the call is ", heroName, " - ", heroDesc, ". ",
            "Write a thrilling 3-sentence story of how ", heroName,
            " saved the city from this exact threat. ",
            "Make it dramatic, heroic, and specific to the threat. End with the city safe."
        ));

        IRitualLLM llm = IRitualLLM(RITUAL_LLM_PRECOMPILE);
        story = llm.infer{value: 0}(LLM_MODEL, prompt, MAX_STORY_TOKENS);

        uint256 gameIndex = allGames.length;
        uint256 gameNumber = ++totalGamesPlayed;

        allGames.push(GameRecord({
            player:     msg.sender,
            heroId:     heroId,
            heroName:   heroName,
            scenario:   scenario,
            story:      story,
            timestamp:  block.timestamp,
            gameNumber: gameNumber
        }));

        playerGameIndices[msg.sender].push(gameIndex);
        heroPlayCount[heroId]++;

        emit GamePlayed(gameNumber, msg.sender, heroId, heroName, scenario, story, block.timestamp);
    }

    // -----------------------------------------------------------------------
    // Scenario Seed (frontend uses this to pick a scenario)
    // -----------------------------------------------------------------------

    function getScenarioSeed() external view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            totalGamesPlayed
        ))) % 20;
    }

    // -----------------------------------------------------------------------
    // Read Functions
    // -----------------------------------------------------------------------

    function getRecentGames(uint256 count)
        external
        view
        returns (GameRecord[] memory)
    {
        uint256 total = allGames.length;
        if (count > total) count = total;
        GameRecord[] memory recent = new GameRecord[](count);
        for (uint256 i = 0; i < count; i++) {
            recent[i] = allGames[total - count + i];
        }
        return recent;
    }

    function getPlayerGames(address player)
        external
        view
        returns (GameRecord[] memory)
    {
        uint256[] memory indices = playerGameIndices[player];
        GameRecord[] memory games = new GameRecord[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            games[i] = allGames[indices[i]];
        }
        return games;
    }

    function getGame(uint256 index) external view returns (GameRecord memory) {
        require(index < allGames.length, "SaveTheCity: index out of range");
        return allGames[index];
    }

    function getTotalGames() external view returns (uint256) {
        return allGames.length;
    }

    function getHeroStats()
        external
        view
        returns (uint256 dunkenCount, uint256 stefanCount, uint256 jezCount)
    {
        return (heroPlayCount[0], heroPlayCount[1], heroPlayCount[2]);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // -----------------------------------------------------------------------
    // Owner Functions
    // -----------------------------------------------------------------------

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "SaveTheCity: nothing to withdraw");
        (bool ok, ) = payable(owner).call{value: balance}("");
        require(ok, "SaveTheCity: transfer failed");
        emit Withdrawn(owner, balance);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SaveTheCity: zero address");
        owner = newOwner;
    }

    // -----------------------------------------------------------------------
    // Internal Helpers
    // -----------------------------------------------------------------------

    function _heroName(uint8 heroId) internal pure returns (string memory) {
        if (heroId == HERO_DUNKEN) return "Dunken";
        if (heroId == HERO_STEFAN) return "Stefan";
        return "Jez";
    }

    function _heroDescription(uint8 heroId) internal pure returns (string memory) {
        if (heroId == HERO_DUNKEN) {
            return "an ancient stone titan who wields a crackling orb of pure energy, guardian of forgotten civilizations";
        }
        if (heroId == HERO_STEFAN) {
            return "a genius frog scientist of the Viltrumite order, master of technology and biological enhancement";
        }
        return "a mysterious cosmic entity with glowing eyes, channeling divine lightning through their fingertips";
    }

    receive() external payable {}
}
