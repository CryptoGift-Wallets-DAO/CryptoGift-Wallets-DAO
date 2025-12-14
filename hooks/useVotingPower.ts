/**
 * 🗳️ useVotingPower Hook
 *
 * Custom hook for managing ERC20Votes voting power delegation.
 * Provides utilities to check delegation status and activate voting power.
 *
 * CGC Token uses OpenZeppelin's ERC20Votes which requires users to
 * explicitly delegate their votes (to themselves or others) before
 * their token balance counts as voting power in the DAO.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { useState, useEffect, useCallback } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi, type Address } from 'viem';
import { useAccount } from '@/lib/thirdweb';

// CGC Token Contract Address (Base Mainnet)
const CGC_TOKEN_ADDRESS = '0x5e3a61b550328f3D8C44f60b3e10a49D3d806175' as const;

// Minimal ABI for ERC20Votes delegation functions
const ERC20_VOTES_ABI = parseAbi([
  'function delegate(address delegatee) external',
  'function delegates(address account) view returns (address)',
  'function getVotes(address account) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
]);

export interface VotingPowerStatus {
  /** User's CGC token balance */
  balance: bigint;
  /** User's current voting power */
  votingPower: bigint;
  /** Address the user has delegated to (address(0) if not delegated) */
  delegatee: Address | null;
  /** Whether voting power is activated (delegated to self or another) */
  isActivated: boolean;
  /** Whether the user has CGC tokens but no voting power */
  needsActivation: boolean;
}

export interface UseVotingPowerReturn {
  /** Current voting power status */
  status: VotingPowerStatus | null;
  /** Whether the status is loading */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Activate voting power by delegating to self */
  activateVotingPower: () => Promise<void>;
  /** Delegate to a specific address */
  delegateTo: (delegatee: Address) => Promise<void>;
  /** Whether a delegation transaction is pending */
  isPending: boolean;
  /** Whether the last delegation was successful */
  isSuccess: boolean;
  /** Transaction hash of pending/completed delegation */
  txHash: `0x${string}` | undefined;
  /** Refetch the voting power status */
  refetch: () => void;
}

/**
 * Hook to manage ERC20Votes voting power delegation
 *
 * @returns Voting power status and functions to activate/delegate
 */
export function useVotingPower(): UseVotingPowerReturn {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<Error | null>(null);

  // Read balance
  const {
    data: balance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useReadContract({
    address: CGC_TOKEN_ADDRESS,
    abi: ERC20_VOTES_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Read voting power
  const {
    data: votingPower,
    isLoading: isLoadingVotes,
    refetch: refetchVotes,
  } = useReadContract({
    address: CGC_TOKEN_ADDRESS,
    abi: ERC20_VOTES_ABI,
    functionName: 'getVotes',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Read delegatee
  const {
    data: delegatee,
    isLoading: isLoadingDelegatee,
    refetch: refetchDelegatee,
  } = useReadContract({
    address: CGC_TOKEN_ADDRESS,
    abi: ERC20_VOTES_ABI,
    functionName: 'delegates',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Write contract for delegation
  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  // Wait for transaction receipt
  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Compute status
  const status: VotingPowerStatus | null = address ? {
    balance: balance ?? 0n,
    votingPower: votingPower ?? 0n,
    delegatee: delegatee === '0x0000000000000000000000000000000000000000' ? null : (delegatee as Address),
    isActivated: delegatee !== '0x0000000000000000000000000000000000000000',
    needsActivation: (balance ?? 0n) > 0n && (votingPower ?? 0n) === 0n,
  } : null;

  // Refetch all data
  const refetch = useCallback(() => {
    refetchBalance();
    refetchVotes();
    refetchDelegatee();
  }, [refetchBalance, refetchVotes, refetchDelegatee]);

  // Refetch after successful transaction
  useEffect(() => {
    if (isSuccess) {
      // Wait a bit for the blockchain to update
      const timeout = setTimeout(() => {
        refetch();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess, refetch]);

  // Handle errors
  useEffect(() => {
    if (writeError) {
      setError(writeError);
    } else if (confirmError) {
      setError(confirmError);
    }
  }, [writeError, confirmError]);

  // Activate voting power by delegating to self
  const activateVotingPower = useCallback(async () => {
    if (!address) {
      setError(new Error('Wallet not connected'));
      return;
    }

    setError(null);
    resetWrite();

    try {
      writeContract({
        address: CGC_TOKEN_ADDRESS,
        abi: ERC20_VOTES_ABI,
        functionName: 'delegate',
        args: [address],
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to activate voting power'));
    }
  }, [address, writeContract, resetWrite]);

  // Delegate to a specific address
  const delegateTo = useCallback(async (delegateeAddress: Address) => {
    if (!address) {
      setError(new Error('Wallet not connected'));
      return;
    }

    setError(null);
    resetWrite();

    try {
      writeContract({
        address: CGC_TOKEN_ADDRESS,
        abi: ERC20_VOTES_ABI,
        functionName: 'delegate',
        args: [delegateeAddress],
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delegate'));
    }
  }, [address, writeContract, resetWrite]);

  return {
    status,
    isLoading: isLoadingBalance || isLoadingVotes || isLoadingDelegatee,
    error,
    activateVotingPower,
    delegateTo,
    isPending: isWritePending || isConfirming,
    isSuccess,
    txHash,
    refetch,
  };
}

export default useVotingPower;
