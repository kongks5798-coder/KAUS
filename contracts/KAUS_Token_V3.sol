// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KAUS_Token_V3 is ERC20, ERC20Burnable, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant STAKING_REWARD_RATE = 10;
    uint256 public constant LOCK_PERIOD_30_DAYS = 30 days;
    uint256 public constant LOCK_PERIOD_90_DAYS = 90 days;
    uint256 public constant LOCK_PERIOD_180_DAYS = 180 days;
    uint256 public constant LOCK_PERIOD_365_DAYS = 365 days;

    struct StakingInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lockPeriod;
        uint256 lastClaimTime;
        bool active;
    }

    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        address proposer;
    }

    mapping(address => StakingInfo) public stakes;
    mapping(address => uint256) public votingPower;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    uint256 public proposalCount;
    uint256 public totalStaked;
    uint256 public totalBurned;

    address public nftContract;

    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardClaimed(address indexed user, uint256 reward);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 votingPower);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor() ERC20("KAUS Token", "KAUS") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function setNFTContract(address _nftContract) external onlyOwner {
        require(_nftContract != address(0), "Invalid NFT contract address");
        nftContract = _nftContract;
    }

    function stake(uint256 amount, uint256 lockPeriod) external {
        require(amount > 0, "Amount must be greater than 0");
        require(
            lockPeriod == LOCK_PERIOD_30_DAYS ||
            lockPeriod == LOCK_PERIOD_90_DAYS ||
            lockPeriod == LOCK_PERIOD_180_DAYS ||
            lockPeriod == LOCK_PERIOD_365_DAYS,
            "Invalid lock period"
        );
        require(!stakes[msg.sender].active, "Already staking");

        _transfer(msg.sender, address(this), amount);

        stakes[msg.sender] = StakingInfo({
            amount: amount,
            startTime: block.timestamp,
            lockPeriod: lockPeriod,
            lastClaimTime: block.timestamp,
            active: true
        });

        uint256 votePower = calculateVotingPower(amount, lockPeriod);
        votingPower[msg.sender] = votePower;
        totalStaked += amount;

        emit Staked(msg.sender, amount, lockPeriod);
    }

    function calculateVotingPower(uint256 amount, uint256 lockPeriod) public pure returns (uint256) {
        uint256 multiplier = 100;

        if (lockPeriod == LOCK_PERIOD_365_DAYS) {
            multiplier = 200;
        } else if (lockPeriod == LOCK_PERIOD_180_DAYS) {
            multiplier = 150;
        } else if (lockPeriod == LOCK_PERIOD_90_DAYS) {
            multiplier = 125;
        }

        return (amount * multiplier) / 100;
    }

    function calculateReward(address user) public view returns (uint256) {
        StakingInfo memory userStake = stakes[user];
        if (!userStake.active) return 0;

        uint256 timeStaked = block.timestamp - userStake.lastClaimTime;
        uint256 reward = (userStake.amount * STAKING_REWARD_RATE * timeStaked) / (365 days * 100);

        return reward;
    }

    function claimReward() external {
        require(stakes[msg.sender].active, "No active stake");

        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No reward available");

        stakes[msg.sender].lastClaimTime = block.timestamp;
        _mint(msg.sender, reward);

        emit RewardClaimed(msg.sender, reward);
    }

    function unstake() external {
        StakingInfo memory userStake = stakes[msg.sender];
        require(userStake.active, "No active stake");
        require(
            block.timestamp >= userStake.startTime + userStake.lockPeriod,
            "Lock period not ended"
        );

        uint256 reward = calculateReward(msg.sender);
        uint256 totalAmount = userStake.amount + reward;

        stakes[msg.sender].active = false;
        votingPower[msg.sender] = 0;
        totalStaked -= userStake.amount;

        _transfer(address(this), msg.sender, userStake.amount);
        if (reward > 0) {
            _mint(msg.sender, reward);
        }

        emit Unstaked(msg.sender, userStake.amount, reward);
    }

    function burnFromFee(uint256 amount, string memory reason) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(address(this)) >= amount, "Insufficient balance");

        _burn(address(this), amount);
        totalBurned += amount;

        emit TokensBurned(address(this), amount, reason);
    }

    function createProposal(
        string memory title,
        string memory description,
        uint256 votingPeriod
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(bytes(description).length > 0, "Description required");
        require(votingPeriod >= 1 days && votingPeriod <= 30 days, "Invalid voting period");

        uint256 proposalId = proposalCount++;

        proposals[proposalId] = Proposal({
            id: proposalId,
            title: title,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            executed: false,
            proposer: msg.sender
        });

        emit ProposalCreated(proposalId, msg.sender, title);
        return proposalId;
    }

    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 userVotingPower = votingPower[msg.sender];
        require(userVotingPower > 0, "No voting power");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.votesFor += userVotingPower;
        } else {
            proposal.votesAgainst += userVotingPower;
        }

        emit Voted(proposalId, msg.sender, support, userVotingPower);
    }

    function executeProposal(uint256 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal rejected");

        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    function getStakingInfo(address user) external view returns (StakingInfo memory) {
        return stakes[user];
    }

    function isVotingEligible(address user) external view returns (bool) {
        return votingPower[user] > 0;
    }
}
