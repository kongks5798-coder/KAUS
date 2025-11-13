// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KAUSToken (카우스 코인)
 * @dev 카우스 가상세계의 기축 통화 및 DAO 거버넌스 기반
 *
 * 주요 기능:
 * - 100억 KAUS 초기 발행
 * - AccessControl 기반 역할 관리 (GOVERNANCE_ROLE, MINTER_ROLE)
 * - Timelock 기반 민팅으로 급격한 인플레이션 방지
 * - 투명한 소각 메커니즘
 * - 스테이킹 보상 메커니즘 연동
 */
contract KAUSToken is ERC20, ERC20Burnable, Ownable, AccessControl, ReentrancyGuard {
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private constant INITIAL_SUPPLY = 10_000_000_000 * (10 ** 18); // 100억 KAUS
    uint256 public constant MAX_SUPPLY = 50_000_000_000 * (10 ** 18); // 최대 500억 KAUS
    uint256 public constant MIN_MINT_INTERVAL = 30 days; // 최소 민팅 간격
    uint256 public constant MAX_MINT_PERCENT = 5; // 한 번에 최대 5% 발행 가능

    uint256 public totalBurned;
    uint256 public lastMintTime;

    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurnedWithReason(address indexed from, uint256 amount, string reason);
    event GovernanceRoleGranted(address indexed account, address indexed granter);
    event MinterRoleGranted(address indexed account, address indexed granter);

    constructor() ERC20("KAUS Coin", "KAUS") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        lastMintTime = block.timestamp;
    }

    /**
     * @dev Timelock이 적용된 거버넌스 기반 토큰 발행
     * @param to 수령자 주소
     * @param amount 발행량
     * @param reason 발행 사유
     */
    function mintByGovernance(
        address to,
        uint256 amount,
        string memory reason
    ) public onlyRole(GOVERNANCE_ROLE) nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(reason).length > 0, "Reason required");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");

        require(
            block.timestamp >= lastMintTime + MIN_MINT_INTERVAL,
            "Minting too frequent"
        );

        uint256 maxMintAmount = (totalSupply() * MAX_MINT_PERCENT) / 100;
        require(amount <= maxMintAmount, "Exceeds max mint per period");

        lastMintTime = block.timestamp;
        _mint(to, amount);

        emit TokensMinted(to, amount, reason);
    }

    /**
     * @dev 스테이킹 보상 발행 (MINTER_ROLE 전용)
     * @param to 수령자 주소
     * @param amount 보상량
     */
    function mintStakingReward(
        address to,
        uint256 amount
    ) public onlyRole(MINTER_ROLE) nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");

        _mint(to, amount);
        emit TokensMinted(to, amount, "Staking Reward");
    }

    /**
     * @dev 사유를 기록하는 소각 기능
     * @param amount 소각량
     * @param reason 소각 사유
     */
    function burnWithReason(uint256 amount, string memory reason) public {
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(reason).length > 0, "Reason required");

        _burn(msg.sender, amount);
        totalBurned += amount;

        emit TokensBurnedWithReason(msg.sender, amount, reason);
    }

    /**
     * @dev 관리자가 특정 주소에서 소각 (수수료 등)
     * @param from 소각 대상 주소
     * @param amount 소각량
     * @param reason 소각 사유
     */
    function burnFrom(
        address from,
        uint256 amount,
        string memory reason
    ) public onlyRole(GOVERNANCE_ROLE) {
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(reason).length > 0, "Reason required");

        _burn(from, amount);
        totalBurned += amount;

        emit TokensBurnedWithReason(from, amount, reason);
    }

    /**
     * @dev Governance 역할 부여
     */
    function grantGovernanceRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(GOVERNANCE_ROLE, account);
        emit GovernanceRoleGranted(account, msg.sender);
    }

    /**
     * @dev Minter 역할 부여 (스테이킹 컨트랙트 등)
     */
    function grantMinterRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
        emit MinterRoleGranted(account, msg.sender);
    }

    /**
     * @dev 토큰 통계 조회
     */
    function getTokenStats() public view returns (
        uint256 currentSupply,
        uint256 maxSupply,
        uint256 burned,
        uint256 circulatingSupply
    ) {
        return (
            totalSupply(),
            MAX_SUPPLY,
            totalBurned,
            totalSupply() - balanceOf(address(this))
        );
    }

    /**
     * @dev 다음 민팅 가능 시간
     */
    function getNextMintTime() public view returns (uint256) {
        return lastMintTime + MIN_MINT_INTERVAL;
    }

    /**
     * @dev 현재 민팅 가능한 최대량
     */
    function getMaxMintableAmount() public view returns (uint256) {
        if (block.timestamp < lastMintTime + MIN_MINT_INTERVAL) {
            return 0;
        }
        uint256 maxMint = (totalSupply() * MAX_MINT_PERCENT) / 100;
        uint256 remainingSupply = MAX_SUPPLY - totalSupply();
        return maxMint < remainingSupply ? maxMint : remainingSupply;
    }

    /**
     * @dev AccessControl과 Ownable의 supportsInterface 충돌 해결
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
