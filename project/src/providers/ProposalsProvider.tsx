import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Proposal } from '../types';
import { useGovernance, TransactionInfo } from '../blockchain/useGovernance';
import { useAccount } from 'wagmi';

interface ProposalsContextType {
  proposals: Proposal[];
  voteFor: (proposalId: string) => Promise<any>;
  voteAgainst: (proposalId: string) => Promise<any>;
  createProposal: (title: string, description: string, deadline: Date) => Promise<any>;
  userVotes: Record<string, 'for' | 'against'>;
  hasVoted: (proposalId: string) => boolean;
  isLoading: boolean;
  transactions: TransactionInfo[];
  getExplorerUrl: (txHash: string) => string;
}

const ProposalsContext = createContext<ProposalsContextType | undefined>(undefined);

export const useProposals = () => {
  const context = useContext(ProposalsContext);
  if (!context) {
    throw new Error('useProposals must be used within a ProposalsProvider');
  }
  return context;
};

interface ProposalsProviderProps {
  initialProposals: Proposal[];
  children: ReactNode;
}

export const ProposalsProvider = ({ initialProposals, children }: ProposalsProviderProps) => {
  const { isConnected } = useAccount();
  const { 
    proposals: blockchainProposals,
    userVotes,
    isLoading,
    voteFor,
    voteAgainst,
    createProposal,
    hasVoted,
    transactions,
    getExplorerUrl
  } = useGovernance();
  
  // Use blockchain proposals if connected, otherwise use initialProposals
  const proposals = isConnected && blockchainProposals.length > 0 
    ? blockchainProposals 
    : initialProposals;

  return (
    <ProposalsContext.Provider 
      value={{ 
        proposals, 
        voteFor, 
        voteAgainst, 
        createProposal,
        userVotes, 
        hasVoted,
        isLoading,
        transactions,
        getExplorerUrl
      }}
    >
      {children}
    </ProposalsContext.Provider>
  );
};