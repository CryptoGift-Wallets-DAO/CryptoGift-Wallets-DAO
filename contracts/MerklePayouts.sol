// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MerklePayouts
 * @notice Efficient batch token distribution using Merkle trees
 * @dev Used for monthly campaigns and large-scale distributions
 * 
 * @author CryptoGift Wallets DAO
 */
contract MerklePayouts is Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // ============ State Variables ============
    
    /// @notice The governance token to distribute
    IERC20 public immutable token;
    
    /// @notice The DAO that controls this contract
    address public immutable dao;
    
    /// @notice Active Merkle roots for distributions
    mapping(bytes32 => DistributionInfo) public distributions;
    
    /// @notice Claimed status for each distribution
    mapping(bytes32 => mapping(address => bool)) public hasClaimed;
    
    /// @notice Total amount claimed per address across all distributions
    mapping(address => uint256) public totalClaimed;
    
    // ============ Types ============
    
    struct DistributionInfo {
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 endTime;
        string ipfsHash; // Metadata stored on IPFS
        bool active;
        bool shadowMode; // For testing without real transfers
    }
    
    // ============ Events ============
    
    event DistributionCreated(
        bytes32 indexed merkleRoot,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime,
        string ipfsHash
    );
    
    event Claimed(
        bytes32 indexed merkleRoot,
        address indexed account,
        uint256 amount,
        uint256 indexed distributionId
    );
    
    event DistributionCancelled(bytes32 indexed merkleRoot);
    event EmergencyWithdraw(address indexed token, uint256 amount);
    
    // ============ Errors ============
    
    error OnlyDAO();
    error InvalidProof();
    error AlreadyClaimed();
    error DistributionNotActive();
    error DistributionExpired();
    error DistributionNotStarted();
    error InvalidAmount();
    error InvalidTimeRange();
    error InsufficientBalance();
    
    // ============ Modifiers ============
    
    modifier onlyDAO() {
        if (msg.sender != dao) revert OnlyDAO();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(IERC20 _token, address _dao) {
        token = _token;
        dao = _dao;
    }
    
    // ============ Distribution Management ============
    
    /**
     * @notice Create a new Merkle distribution
     * @param merkleRoot The Merkle root of the distribution tree
     * @param totalAmount Total tokens to distribute
     * @param startTime When claiming starts
     * @param endTime When claiming ends
     * @param ipfsHash IPFS hash with distribution details
     * @param shadowMode If true, no actual transfers occur
     */
    function createDistribution(
        bytes32 merkleRoot,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime,
        string calldata ipfsHash,
        bool shadowMode
    ) external onlyDAO {
        if (startTime >= endTime) revert InvalidTimeRange();
        if (totalAmount == 0) revert InvalidAmount();
        if (distributions[merkleRoot].active) revert DistributionNotActive();
        
        // Check contract has enough tokens (unless in shadow mode)
        if (!shadowMode) {
            uint256 balance = token.balanceOf(address(this));
            if (balance < totalAmount) revert InsufficientBalance();
        }
        
        distributions[merkleRoot] = DistributionInfo({
            totalAmount: totalAmount,
            claimedAmount: 0,
            startTime: startTime,
            endTime: endTime,
            ipfsHash: ipfsHash,
            active: true,
            shadowMode: shadowMode
        });
        
        emit DistributionCreated(
            merkleRoot,
            totalAmount,
            startTime,
            endTime,
            ipfsHash
        );
    }
    
    /**
     * @notice Cancel a distribution (emergency only)
     * @param merkleRoot The Merkle root to cancel
     */
    function cancelDistribution(bytes32 merkleRoot) external onlyDAO {
        distributions[merkleRoot].active = false;
        emit DistributionCancelled(merkleRoot);
    }
    
    // ============ Claiming ============
    
    /**
     * @notice Claim tokens from a Merkle distribution
     * @param merkleRoot The Merkle root of the distribution
     * @param amount The amount to claim
     * @param merkleProof The Merkle proof for verification
     */
    function claim(
        bytes32 merkleRoot,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external nonReentrant whenNotPaused {
        _claim(merkleRoot, msg.sender, amount, merkleProof);
    }
    
    /**
     * @notice Claim on behalf of another address (useful for relayers)
     * @param merkleRoot The Merkle root of the distribution
     * @param account The account to claim for
     * @param amount The amount to claim
     * @param merkleProof The Merkle proof for verification
     */
    function claimFor(
        bytes32 merkleRoot,
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external nonReentrant whenNotPaused {
        _claim(merkleRoot, account, amount, merkleProof);
    }
    
    /**
     * @notice Internal claim logic
     */
    function _claim(
        bytes32 merkleRoot,
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) internal {
        DistributionInfo storage dist = distributions[merkleRoot];
        
        // Validate distribution
        if (!dist.active) revert DistributionNotActive();
        if (block.timestamp < dist.startTime) revert DistributionNotStarted();
        if (block.timestamp > dist.endTime) revert DistributionExpired();
        if (hasClaimed[merkleRoot][account]) revert AlreadyClaimed();
        
        // Verify Merkle proof
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(account, amount))));
        if (!MerkleProof.verify(merkleProof, merkleRoot, leaf)) {
            revert InvalidProof();
        }
        
        // Mark as claimed
        hasClaimed[merkleRoot][account] = true;
        dist.claimedAmount += amount;
        totalClaimed[account] += amount;
        
        // Transfer tokens (unless in shadow mode)
        if (!dist.shadowMode) {
            token.safeTransfer(account, amount);
        }
        
        emit Claimed(merkleRoot, account, amount, 0);
    }
    
    /**
     * @notice Batch claim for multiple distributions
     * @param merkleRoots Array of Merkle roots
     * @param amounts Array of amounts to claim
     * @param merkleProofs Array of Merkle proofs
     */
    function batchClaim(
        bytes32[] calldata merkleRoots,
        uint256[] calldata amounts,
        bytes32[][] calldata merkleProofs
    ) external nonReentrant whenNotPaused {
        uint256 length = merkleRoots.length;
        require(length == amounts.length && length == merkleProofs.length, "Length mismatch");
        
        for (uint256 i = 0; i < length; i++) {
            _claim(merkleRoots[i], msg.sender, amounts[i], merkleProofs[i]);
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Check if an account has claimed from a distribution
     * @param merkleRoot The Merkle root to check
     * @param account The account to check
     * @return True if already claimed
     */
    function isClaimed(bytes32 merkleRoot, address account) external view returns (bool) {
        return hasClaimed[merkleRoot][account];
    }
    
    /**
     * @notice Get distribution info
     * @param merkleRoot The Merkle root to query
     * @return Distribution information
     */
    function getDistribution(bytes32 merkleRoot) external view returns (DistributionInfo memory) {
        return distributions[merkleRoot];
    }
    
    /**
     * @notice Get remaining claimable amount for a distribution
     * @param merkleRoot The Merkle root to query
     * @return Remaining amount that can be claimed
     */
    function getRemainingAmount(bytes32 merkleRoot) external view returns (uint256) {
        DistributionInfo memory dist = distributions[merkleRoot];
        return dist.totalAmount - dist.claimedAmount;
    }
    
    /**
     * @notice Verify a Merkle proof without claiming
     * @param merkleRoot The Merkle root
     * @param account The account to verify
     * @param amount The amount in the proof
     * @param merkleProof The proof to verify
     * @return True if the proof is valid
     */
    function verifyProof(
        bytes32 merkleRoot,
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external pure returns (bool) {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(account, amount))));
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Emergency pause
     */
    function pause() external onlyDAO {
        _pause();
    }
    
    /**
     * @notice Unpause
     */
    function unpause() external onlyDAO {
        _unpause();
    }
    
    /**
     * @notice Emergency withdraw tokens
     * @param tokenAddress The token to withdraw (address(0) for ETH)
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(address tokenAddress, uint256 amount) external onlyDAO {
        if (tokenAddress == address(0)) {
            payable(dao).transfer(amount);
        } else {
            IERC20(tokenAddress).safeTransfer(dao, amount);
        }
        emit EmergencyWithdraw(tokenAddress, amount);
    }
    
    /**
     * @notice Sweep unclaimed tokens after distribution ends
     * @param merkleRoot The distribution to sweep
     */
    function sweepExpiredDistribution(bytes32 merkleRoot) external onlyDAO {
        DistributionInfo storage dist = distributions[merkleRoot];
        require(block.timestamp > dist.endTime, "Distribution not ended");
        require(dist.active, "Distribution not active");
        
        uint256 unclaimed = dist.totalAmount - dist.claimedAmount;
        if (unclaimed > 0 && !dist.shadowMode) {
            token.safeTransfer(dao, unclaimed);
        }
        
        dist.active = false;
    }
    
    // ============ Receive Ether ============
    
    receive() external payable {}
}