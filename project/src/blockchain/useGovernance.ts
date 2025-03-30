import { useAccount, useNetwork } from 'wagmi';
import { readContract, writeContract } from '@wagmi/core';
import { useState, useEffect } from 'react';
import { GovernanceABI, CONTRACT_ADDRESS, mapStatus } from './contracts';
import { Proposal } from '../types';

export interface TransactionInfo {
  hash: string;
  type: 'vote' | 'create';
  timestamp: number;
  proposalId: string;
}

export const useGovernance = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [isLoading, setIsLoading] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'for' | 'against'>>({});
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);

  // Get the explorer URL for the current chain
  const getExplorerUrl = (txHash: string) => {
    if (!chain) return `https://etherscan.io/tx/${txHash}`;
    
    // Use the chain's explorer or fall back to etherscan
    const baseUrl = chain.blockExplorers?.default.url || 'https://etherscan.io';
    return `${baseUrl}/tx/${txHash}`;
  };

  // Add transaction to history
  const addTransaction = (hash: string, type: 'vote' | 'create', proposalId: string) => {
    const txInfo: TransactionInfo = {
      hash,
      type,
      timestamp: Date.now(),
      proposalId
    };
    
    setTransactions(prev => [txInfo, ...prev]);
    
    // Also store in localStorage for persistence
    try {
      const storedTxs = localStorage.getItem('governdao_transactions');
      const txHistory = storedTxs ? JSON.parse(storedTxs) : [];
      localStorage.setItem('governdao_transactions', JSON.stringify([txInfo, ...txHistory]));
    } catch (error) {
      console.error('Failed to save transaction to localStorage:', error);
    }
  };

  // Save userVotes to localStorage
  const saveUserVotes = (votes: Record<string, 'for' | 'against'>) => {
    try {
      // Include wallet address in the storage key to separate votes by account
      const storageKey = `governdao_votes_${address}`;
      localStorage.setItem(storageKey, JSON.stringify(votes));
    } catch (error) {
      console.error('Failed to save votes to localStorage:', error);
    }
  };

  // Save proposals to localStorage
  const saveProposals = (proposalsToSave: Proposal[]) => {
    try {
      localStorage.setItem('governdao_proposals', JSON.stringify(proposalsToSave));
    } catch (error) {
      console.error('Failed to save proposals to localStorage:', error);
    }
  };

  // Load userVotes from localStorage
  const loadUserVotes = () => {
    if (!address) return;
    
    try {
      const storageKey = `governdao_votes_${address}`;
      const storedVotes = localStorage.getItem(storageKey);
      if (storedVotes) {
        const parsedVotes = JSON.parse(storedVotes);
        setUserVotes(parsedVotes);
      }
    } catch (error) {
      console.error('Failed to load votes from localStorage:', error);
    }
  };

  // Load transaction history, user votes, and proposals from localStorage on init
  useEffect(() => {
    try {
      // Load transactions
      const storedTxs = localStorage.getItem('governdao_transactions');
      if (storedTxs) {
        setTransactions(JSON.parse(storedTxs));
      }
      
      // Load proposals
      const storedProposals = localStorage.getItem('governdao_proposals');
      if (storedProposals) {
        setProposals(JSON.parse(storedProposals));
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }

    // Load user votes when address is available
    if (address) {
      loadUserVotes();
    }
  }, [address]);

  // Load all proposals from the blockchain
  const loadProposals = async () => {
    if (!isConnected || !address) return;
    
    setIsLoading(true);
    try {
      // Get the total number of proposals
      const count = await readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GovernanceABI,
        functionName: 'getProposalCount',
      });

      const proposalPromises = [];
      for (let i = 1; i <= Number(count); i++) {
        proposalPromises.push(loadProposal(i));
      }

      const loadedProposals = await Promise.all(proposalPromises);
      const filteredProposals = loadedProposals.filter(Boolean) as Proposal[];
      
      setProposals(filteredProposals);
      
      // Save proposals to localStorage
      saveProposals(filteredProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load a single proposal from the blockchain
  const loadProposal = async (proposalId: number): Promise<Proposal | null> => {
    try {
      const result = await readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GovernanceABI,
        functionName: 'getProposal',
        args: [BigInt(proposalId)],
      }) as [boolean, string, string, bigint, number, bigint, bigint, string];

      if (!result || !result[0]) return null;

      const [, title, description, deadline, status, forVotes, againstVotes, creator] = Array.isArray(result) ? result : [];
      
      // Check if this user has voted on this proposal
      const hasUserVoted = await readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GovernanceABI,
        functionName: 'hasVoted',
        args: [address as `0x${string}`, BigInt(proposalId)],
      });

      if (hasUserVoted) {
        const voteSupport = await readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: GovernanceABI,
          functionName: 'getVote',
          args: [address as `0x${string}`, BigInt(proposalId)],
        });
        
        // Update userVotes state with the new vote
        setUserVotes(prev => {
          const newVotes = {
            ...prev,
            [proposalId.toString()]: voteSupport ? 'for' as const : 'against' as const
          };
          
          // Save to localStorage whenever userVotes changes
          saveUserVotes(newVotes);
          
          return newVotes;
        });
      }

      return {
        id: proposalId.toString(),
        title: title || 'Untitled',
        description: description || '',
        deadline: new Date(Number(deadline) * 1000),
        status: mapStatus(Number(status)),
        votes: {
          for: Number(forVotes),
          against: Number(againstVotes)
        },
        creator: (creator ?? '').toString()
      };
    } catch (error) {
      console.error(`Error loading proposal ${proposalId}:`, error);
      return null;
    }
  };

  // Create a new proposal
  const createProposal = async (title: string, description: string, deadline: Date) => {
    if (!isConnected || !address) throw new Error('Wallet not connected');

    const deadlineTimestamp = Math.floor(deadline.getTime() / 1000);
    
    try {
      const tx = await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GovernanceABI,
        functionName: 'createProposal',
        args: [title, description, BigInt(deadlineTimestamp)],
      });
      
      // Add to transaction history
      addTransaction(tx.hash, 'create', '0'); // New proposal ID not known yet
      setTimeout(() => {
        loadProposals();
      }, 2000);
      
      return tx;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  };

  // Vote on a proposal
  const castVote = async (proposalId: string, support: boolean) => {
    if (!isConnected || !address) throw new Error('Wallet not connected');
    
    try {
      // First, update local state immediately for better UX
      setUserVotes(prev => {
        const newVotes = {
          ...prev,
          [proposalId]: support ? 'for' as const : 'against' as const
        };
        
        // Save to localStorage whenever userVotes changes
        saveUserVotes(newVotes);
        
        return newVotes;
      });
      
      // Update the proposal vote counts in local state
      setProposals(prev => {
        const updatedProposals = prev.map(p => {
          if (p.id === proposalId) {
            return {
              ...p,
              votes: {
                ...p.votes,
                for: support ? p.votes.for + 1 : p.votes.for,
                against: !support ? p.votes.against + 1 : p.votes.against
              }
            };
          }
          return p;
        });
        
        // Save updated proposals to localStorage
        saveProposals(updatedProposals);
        
        return updatedProposals;
      });
      
      // Try to send transaction to blockchain
      try {
        const tx = await writeContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: GovernanceABI,
          functionName: 'castVote',
          args: [BigInt(proposalId), support],
        });
        
        // Add to transaction history
        addTransaction(tx.hash, 'vote', proposalId);
        
        // Wait for the transaction to be mined and reload the proposal
        setTimeout(async () => {
          try {
            const updatedProposal = await loadProposal(Number(proposalId));
            if (updatedProposal) {
              setProposals(prev => 
                prev.map(p => p.id === proposalId ? updatedProposal : p)
              );
            }
          } catch (err) {
            console.error('Error reloading proposal after vote:', err);
          }
        }, 2000);
        
        return tx;
      } catch (blockchainError) {
        console.error('Blockchain transaction failed:', blockchainError);
        console.log('Continuing with local state update only');
        // We don't rethrow here - we've already updated the UI state
        // This allows the app to work without a real blockchain connection
        return null;
      }
    } catch (error) {
      console.error('Error in castVote:', error);
      throw error;
    }
  };

  // Vote for a proposal
  const voteFor = async (proposalId: string) => {
    return castVote(proposalId, true);
  };

  // Vote against a proposal
  const voteAgainst = async (proposalId: string) => {
    return castVote(proposalId, false);
  };

  // Check if user has voted on a proposal
  const hasVoted = (proposalId: string): boolean => {
    return proposalId in userVotes;
  };

  // Load proposals when connected
  useEffect(() => {
    if (isConnected && address) {
      loadProposals();
    }
  }, [isConnected, address, chain]);

  return {
    proposals,
    userVotes,
    isLoading,
    voteFor,
    voteAgainst,
    createProposal,
    hasVoted,
    loadProposals,
    transactions,
    getExplorerUrl
  };
};