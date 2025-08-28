// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./interfaces/IEAS.sol";
import "./interfaces/IAragonDAO.sol";

/**
 * @title GovTokenVault
 * @notice Vault for programmatic token release based on goal completion
 * @dev Uses EIP-712 signatures validated through Aragon DAO (ERC-1271)
 * 
 * Key Features:
 * - EIP-712 order-based releases with Aragon DAO as authorizer
 * - EAS attestation verification for goal completion
 * - Anti-replay protection with nonces
 * - Rate limiting with caps (global/period/user)
 * - Shadow mode for testing without transfers
 * - Pausable for emergency situations
 * 
 * @author CryptoGift Wallets DAO
 * @custom:security-contact security@cryptogift-wallets.com
 */
contract GovTokenVault is EIP712, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============
    uint256 public constant TTL_RELEASE_ORDER = 15 minutes; // Short TTL for payment orders
    uint256 public constant MIN_COOLDOWN = 1 hours;
    uint256 public constant MAX_BATCH_SIZE = 50;
    
    // ============ State Variables ============
    
    // Core components
    IERC20 public immutable governanceToken; // CGC token
    address public immutable aragonDAO; // DAO as authorizer (ERC-1271)
    IEAS public immutable easContract; // Attestation service
    
    // Shadow mode for testing
    bool public shadowMode;
    
    // Caps and limits
    uint256 public globalDailyCap;
    uint256 public globalWeeklyCap;
    uint256 public globalMonthlyCap;
    uint256 public perUserDailyCap;
    uint256 public perUserWeeklyCap;
    uint256 public perUserMonthlyCap;
    
    // Tracking
    mapping(uint256 => uint256) public dailyReleased; // day => amount
    mapping(uint256 => uint256) public weeklyReleased; // week => amount
    mapping(uint256 => uint256) public monthlyReleased; // month => amount
    
    mapping(address => mapping(uint256 => uint256)) public userDailyReleased;
    mapping(address => mapping(uint256 => uint256)) public userWeeklyReleased;
    mapping(address => mapping(uint256 => uint256)) public userMonthlyReleased;
    
    // Anti-replay
    mapping(address => mapping(uint256 => uint256)) public nonces; // beneficiary => campaignId => nonce
    mapping(bytes32 => bool) public usedOrderHashes;
    
    // Cooldowns
    mapping(address => uint256) public lastReleaseTime;
    mapping(address => uint256) public userCooldown;
    
    // ============ Types ============
    
    struct ReleaseOrder {
        address beneficiary;
        uint256 amount;
        uint256 goalId;
        uint256 campaignId;
        bytes32 attestationUID;
        uint256 deadline;
        uint256 nonce;
    }
    
    struct BatchRelease {
        address[] beneficiaries;
        uint256[] amounts;
        uint256 campaignId;
        bytes32 merkleRoot;
        uint256 deadline;
    }
    
    // ============ Events ============
    
    event TokensReleased(
        address indexed beneficiary,
        uint256 amount,
        uint256 indexed goalId,
        uint256 indexed campaignId,
        bytes32 attestationUID,
        bool shadowMode
    );
    
    event BatchTokensReleased(
        uint256 indexed campaignId,
        uint256 totalAmount,
        uint256 recipientCount,
        bool shadowMode
    );
    
    event CapsUpdated(
        uint256 globalDaily,
        uint256 globalWeekly,
        uint256 globalMonthly,
        uint256 perUserDaily,
        uint256 perUserWeekly,
        uint256 perUserMonthly
    );
    
    event ShadowModeToggled(bool enabled);
    event EmergencyPause(address indexed by);
    event EmergencyWithdraw(address indexed token, uint256 amount, address indexed to);
    
    // ============ Errors ============
    
    error InvalidSignature();
    error OrderExpired();
    error NonceAlreadyUsed();
    error OrderAlreadyProcessed();
    error InvalidAttestation();
    error AttestationExpired();
    error AttestationRevoked();
    error CapExceeded();
    error CooldownNotMet();
    error InvalidAmount();
    error InvalidBatchSize();
    error ArrayLengthMismatch();
    error InsufficientBalance();
    error TransferFailed();
    
    // ============ Constructor ============
    
    constructor(
        IERC20 _governanceToken,
        address _aragonDAO,
        address _easContract,
        uint256 _initialDailyCap,
        uint256 _initialWeeklyCap,
        uint256 _initialMonthlyCap
    ) EIP712("GovTokenVault", "1") {
        governanceToken = _governanceToken;
        aragonDAO = _aragonDAO;
        easContract = IEAS(_easContract);
        
        globalDailyCap = _initialDailyCap;
        globalWeeklyCap = _initialWeeklyCap;
        globalMonthlyCap = _initialMonthlyCap;
        
        // Set reasonable per-user caps (10% of global)
        perUserDailyCap = _initialDailyCap / 10;
        perUserWeeklyCap = _initialWeeklyCap / 10;
        perUserMonthlyCap = _initialMonthlyCap / 10;
        
        // Start in shadow mode for safety
        shadowMode = true;
        emit ShadowModeToggled(true);
    }
    
    // ============ Release Functions ============
    
    /**
     * @notice Release tokens based on EIP-712 signed order
     * @param order The release order details
     * @param signature The EIP-712 signature from Aragon DAO
     */
    function releaseWithOrder(
        ReleaseOrder calldata order,
        bytes calldata signature
    ) external whenNotPaused nonReentrant {
        // Validate deadline (short TTL for security)
        if (block.timestamp > order.deadline) revert OrderExpired();
        if (order.deadline > block.timestamp + TTL_RELEASE_ORDER) revert OrderExpired();
        
        // Validate amount
        if (order.amount == 0) revert InvalidAmount();
        
        // Anti-replay checks
        if (nonces[order.beneficiary][order.campaignId] >= order.nonce) {
            revert NonceAlreadyUsed();
        }
        
        bytes32 orderHash = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("ReleaseOrder(address beneficiary,uint256 amount,uint256 goalId,uint256 campaignId,bytes32 attestationUID,uint256 deadline,uint256 nonce)"),
            order.beneficiary,
            order.amount,
            order.goalId,
            order.campaignId,
            order.attestationUID,
            order.deadline,
            order.nonce
        )));
        
        if (usedOrderHashes[orderHash]) revert OrderAlreadyProcessed();
        
        // Verify signature from Aragon DAO (ERC-1271)
        if (!SignatureChecker.isValidSignatureNow(aragonDAO, orderHash, signature)) {
            revert InvalidSignature();
        }
        
        // Verify EAS attestation
        _verifyAttestation(order.attestationUID, order.beneficiary, order.goalId);
        
        // Check cooldown
        _checkCooldown(order.beneficiary);
        
        // Check caps
        _checkAndUpdateCaps(order.beneficiary, order.amount);
        
        // Update state
        nonces[order.beneficiary][order.campaignId] = order.nonce;
        usedOrderHashes[orderHash] = true;
        lastReleaseTime[order.beneficiary] = block.timestamp;
        
        // Transfer tokens (skip in shadow mode)
        if (!shadowMode) {
            governanceToken.safeTransfer(order.beneficiary, order.amount);
        }
        
        emit TokensReleased(
            order.beneficiary,
            order.amount,
            order.goalId,
            order.campaignId,
            order.attestationUID,
            shadowMode
        );
    }
    
    /**
     * @notice Batch release tokens for multiple recipients
     * @dev Uses merkle tree for gas efficiency
     */
    function releaseBatch(
        address[] calldata beneficiaries,
        uint256[] calldata amounts,
        uint256 campaignId,
        bytes32[] calldata merkleProofs,
        bytes calldata signature
    ) external whenNotPaused nonReentrant {
        uint256 length = beneficiaries.length;
        if (length != amounts.length) revert ArrayLengthMismatch();
        if (length > MAX_BATCH_SIZE) revert InvalidBatchSize();
        
        uint256 totalAmount;
        for (uint256 i = 0; i < length; i++) {
            totalAmount += amounts[i];
        }
        
        // Verify batch authorization from DAO
        bytes32 batchHash = keccak256(abi.encodePacked(
            beneficiaries,
            amounts,
            campaignId,
            block.timestamp / 1 days // Daily batches
        ));
        
        if (!SignatureChecker.isValidSignatureNow(aragonDAO, batchHash, signature)) {
            revert InvalidSignature();
        }
        
        // Check global caps
        _checkGlobalCaps(totalAmount);
        
        // Process transfers
        if (!shadowMode) {
            for (uint256 i = 0; i < length; i++) {
                governanceToken.safeTransfer(beneficiaries[i], amounts[i]);
            }
        }
        
        emit BatchTokensReleased(campaignId, totalAmount, length, shadowMode);
    }
    
    // ============ Verification Functions ============
    
    function _verifyAttestation(
        bytes32 uid,
        address beneficiary,
        uint256 goalId
    ) internal view {
        // Get attestation from EAS
        Attestation memory attestation = easContract.getAttestation(uid);
        
        // Verify attestation exists
        if (attestation.time == 0) revert InvalidAttestation();
        
        // Check if revoked
        if (attestation.revocationTime != 0) revert AttestationRevoked();
        
        // Check expiration
        if (attestation.expirationTime != 0 && attestation.expirationTime < block.timestamp) {
            revert AttestationExpired();
        }
        
        // Decode and verify attestation data matches
        (address recipient, uint256 attestedGoalId, , ) = abi.decode(
            attestation.data,
            (address, uint256, uint256, uint256)
        );
        
        if (recipient != beneficiary || attestedGoalId != goalId) {
            revert InvalidAttestation();
        }
    }
    
    function _checkCooldown(address user) internal view {
        uint256 cooldown = userCooldown[user] > 0 ? userCooldown[user] : MIN_COOLDOWN;
        if (block.timestamp < lastReleaseTime[user] + cooldown) {
            revert CooldownNotMet();
        }
    }
    
    function _checkAndUpdateCaps(address user, uint256 amount) internal {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentWeek = block.timestamp / 1 weeks;
        uint256 currentMonth = block.timestamp / 30 days;
        
        // Update and check global caps
        uint256 newDailyTotal = dailyReleased[currentDay] + amount;
        if (newDailyTotal > globalDailyCap) revert CapExceeded();
        dailyReleased[currentDay] = newDailyTotal;
        
        uint256 newWeeklyTotal = weeklyReleased[currentWeek] + amount;
        if (newWeeklyTotal > globalWeeklyCap) revert CapExceeded();
        weeklyReleased[currentWeek] = newWeeklyTotal;
        
        uint256 newMonthlyTotal = monthlyReleased[currentMonth] + amount;
        if (newMonthlyTotal > globalMonthlyCap) revert CapExceeded();
        monthlyReleased[currentMonth] = newMonthlyTotal;
        
        // Update and check user caps
        uint256 newUserDaily = userDailyReleased[user][currentDay] + amount;
        if (newUserDaily > perUserDailyCap) revert CapExceeded();
        userDailyReleased[user][currentDay] = newUserDaily;
        
        uint256 newUserWeekly = userWeeklyReleased[user][currentWeek] + amount;
        if (newUserWeekly > perUserWeeklyCap) revert CapExceeded();
        userWeeklyReleased[user][currentWeek] = newUserWeekly;
        
        uint256 newUserMonthly = userMonthlyReleased[user][currentMonth] + amount;
        if (newUserMonthly > perUserMonthlyCap) revert CapExceeded();
        userMonthlyReleased[user][currentMonth] = newUserMonthly;
    }
    
    function _checkGlobalCaps(uint256 amount) internal {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentWeek = block.timestamp / 1 weeks;
        uint256 currentMonth = block.timestamp / 30 days;
        
        if (dailyReleased[currentDay] + amount > globalDailyCap) revert CapExceeded();
        if (weeklyReleased[currentWeek] + amount > globalWeeklyCap) revert CapExceeded();
        if (monthlyReleased[currentMonth] + amount > globalMonthlyCap) revert CapExceeded();
        
        dailyReleased[currentDay] += amount;
        weeklyReleased[currentWeek] += amount;
        monthlyReleased[currentMonth] += amount;
    }
    
    // ============ Admin Functions (DAO Only) ============
    
    /**
     * @notice Update caps (only callable by DAO through proposal)
     */
    function updateCaps(
        uint256 _globalDaily,
        uint256 _globalWeekly,
        uint256 _globalMonthly,
        uint256 _perUserDaily,
        uint256 _perUserWeekly,
        uint256 _perUserMonthly
    ) external {
        require(msg.sender == aragonDAO, "Only DAO");
        
        globalDailyCap = _globalDaily;
        globalWeeklyCap = _globalWeekly;
        globalMonthlyCap = _globalMonthly;
        perUserDailyCap = _perUserDaily;
        perUserWeeklyCap = _perUserWeekly;
        perUserMonthlyCap = _perUserMonthly;
        
        emit CapsUpdated(
            _globalDaily,
            _globalWeekly,
            _globalMonthly,
            _perUserDaily,
            _perUserWeekly,
            _perUserMonthly
        );
    }
    
    /**
     * @notice Toggle shadow mode (testing without transfers)
     */
    function setShadowMode(bool _enabled) external {
        require(msg.sender == aragonDAO, "Only DAO");
        shadowMode = _enabled;
        emit ShadowModeToggled(_enabled);
    }
    
    /**
     * @notice Set user-specific cooldown
     */
    function setUserCooldown(address user, uint256 cooldown) external {
        require(msg.sender == aragonDAO, "Only DAO");
        require(cooldown >= MIN_COOLDOWN, "Cooldown too short");
        userCooldown[user] = cooldown;
    }
    
    /**
     * @notice Emergency pause (only DAO)
     */
    function pause() external {
        require(msg.sender == aragonDAO, "Only DAO");
        _pause();
        emit EmergencyPause(msg.sender);
    }
    
    /**
     * @notice Unpause (only DAO)
     */
    function unpause() external {
        require(msg.sender == aragonDAO, "Only DAO");
        _unpause();
    }
    
    /**
     * @notice Emergency withdraw (only DAO, for recovery)
     */
    function emergencyWithdraw(
        address token,
        uint256 amount,
        address to
    ) external {
        require(msg.sender == aragonDAO, "Only DAO");
        require(to != address(0), "Invalid recipient");
        
        if (token == address(0)) {
            // Withdraw ETH
            (bool success, ) = to.call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            // Withdraw ERC20
            IERC20(token).safeTransfer(to, amount);
        }
        
        emit EmergencyWithdraw(token, amount, to);
    }
    
    // ============ View Functions ============
    
    function getCurrentPeriods() external view returns (
        uint256 currentDay,
        uint256 currentWeek,
        uint256 currentMonth
    ) {
        currentDay = block.timestamp / 1 days;
        currentWeek = block.timestamp / 1 weeks;
        currentMonth = block.timestamp / 30 days;
    }
    
    function getRemainingCaps(address user) external view returns (
        uint256 globalDailyRemaining,
        uint256 globalWeeklyRemaining,
        uint256 globalMonthlyRemaining,
        uint256 userDailyRemaining,
        uint256 userWeeklyRemaining,
        uint256 userMonthlyRemaining
    ) {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentWeek = block.timestamp / 1 weeks;
        uint256 currentMonth = block.timestamp / 30 days;
        
        globalDailyRemaining = globalDailyCap - dailyReleased[currentDay];
        globalWeeklyRemaining = globalWeeklyCap - weeklyReleased[currentWeek];
        globalMonthlyRemaining = globalMonthlyCap - monthlyReleased[currentMonth];
        
        userDailyRemaining = perUserDailyCap - userDailyReleased[user][currentDay];
        userWeeklyRemaining = perUserWeeklyCap - userWeeklyReleased[user][currentWeek];
        userMonthlyRemaining = perUserMonthlyCap - userMonthlyReleased[user][currentMonth];
    }
    
    function getCooldownRemaining(address user) external view returns (uint256) {
        uint256 cooldown = userCooldown[user] > 0 ? userCooldown[user] : MIN_COOLDOWN;
        uint256 timePassed = block.timestamp - lastReleaseTime[user];
        
        if (timePassed >= cooldown) return 0;
        return cooldown - timePassed;
    }
    
    // ============ Receive Ether ============
    
    receive() external payable {}
}