// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * @title CGC Token (CryptoGift Coin)
 * @author CryptoGift Wallets Team
 * @notice Governance token for the CryptoGift Wallets DAO
 * @dev Fixed supply ERC20 token with voting capabilities for Aragon DAO
 * 
 * Features:
 * - Fixed supply of 1,000,000 tokens
 * - 18 decimals standard
 * - EIP-2612 permit for gasless approvals
 * - ERC20Votes for on-chain governance
 * - No mint or burn functions after deployment
 * - Fully compatible with Aragon TokenVoting plugin
 */
contract CGCToken is ERC20, ERC20Permit, ERC20Votes {
    /// @notice Total supply of CGC tokens (1 million with 18 decimals)
    uint256 public constant TOTAL_SUPPLY = 1_000_000 * 10**18;
    
    /// @notice Timestamp when the token was deployed
    uint256 public immutable deploymentTimestamp;
    
    /// @notice Address of the DAO that receives initial supply
    address public immutable dao;
    
    /// @notice Emitted when the token contract is deployed
    event TokenDeployed(address indexed dao, uint256 totalSupply, uint256 timestamp);
    
    /**
     * @notice Deploys the CGC token and mints total supply to DAO
     * @param _dao Address of the Aragon DAO that will receive all tokens
     * @dev The DAO address should be the Aragon DAO contract, not an EOA
     */
    constructor(address _dao) 
        ERC20("CryptoGift Coin", "CGC")
        ERC20Permit("CryptoGift Coin")
    {
        require(_dao != address(0), "CGCToken: DAO address cannot be zero");
        
        dao = _dao;
        deploymentTimestamp = block.timestamp;
        
        // Mint entire supply to the DAO treasury
        _mint(_dao, TOTAL_SUPPLY);
        
        emit TokenDeployed(_dao, TOTAL_SUPPLY, block.timestamp);
    }
    
    /**
     * @notice Returns the number of decimals used by the token
     * @return decimals The number of decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
    
    // ============ Required Overrides ============
    
    /**
     * @dev Override required by Solidity for tokens with multiple inheritance
     */
    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, amount);
    }
    
    /**
     * @dev Override required for nonce management in permit functionality
     */
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
    
    /**
     * @notice Returns token metadata for external integrations
     * @return name Token name
     * @return symbol Token symbol
     * @return decimals Token decimals
     * @return totalSupply Total token supply
     * @return version Contract version
     */
    function getTokenInfo() 
        external 
        view 
        returns (
            string memory,
            string memory,
            uint8,
            uint256,
            string memory
        ) 
    {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            "1.0.0"
        );
    }
    
    /**
     * @notice Check if an address has any voting power
     * @param account Address to check
     * @return hasVotingPower True if the address can vote
     */
    function hasVotingPower(address account) external view returns (bool) {
        return getVotes(account) > 0;
    }
    
    /**
     * @notice Returns the voting power of an account at current block
     * @param account Address to check
     * @return votingPower Current voting power
     */
    function getCurrentVotes(address account) external view returns (uint256) {
        return getVotes(account);
    }
    
    /**
     * @notice Returns the percentage of total supply held by an address
     * @param account Address to check
     * @return percentage Percentage with 2 decimal precision (10000 = 100%)
     */
    function getSupplyPercentage(address account) external view returns (uint256) {
        if (totalSupply() == 0) return 0;
        return (balanceOf(account) * 10000) / totalSupply();
    }
}