// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SaveTheCity
 * @dev Onchain AI game on Ritual Chain.
 *      AI story is generated serverside via Anthropic API and passed in.
 *      The contract records the result permanently onchain.
 *      Gas only — no platform fee.
 */
contract SaveTheCity {
    // -----------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------
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
     * @notice Record a game result onchain. Story is generated offchain via
     *         Anthropic API and passed in. Only gas cost — no platform fee.
     * @param heroId   0=Dunken, 1=Stefan, 2=Jez
     * @param scenario The city threat scenario string
     * @param story    The AI-generated story from the API route
     */
    function playGame(
        uint8 heroId,
        string calldata scenario,
        string calldata story
    ) external {
        require(heroId <= 2, "SaveTheCity: invalid hero ID");
        require(bytes(scenario).length > 0, "SaveTheCity: scenario required");
        require(bytes(story).length > 0, "SaveTheCity: story required");

        string memory heroName = _heroName(heroId);

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

    receive() external payable {}
}
