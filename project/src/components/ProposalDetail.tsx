import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, CheckCircle, XCircle, ArrowLeft, ExternalLink, Database } from 'lucide-react';
import { Proposal } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import * as Progress from '@radix-ui/react-progress';
import * as Separator from '@radix-ui/react-separator';
import { useAccount } from 'wagmi';
import { useProposals } from '../providers/ProposalsProvider';

const ProposalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { proposals, voteFor, voteAgainst, userVotes, hasVoted, transactions, getExplorerUrl } = useProposals();
  const [isVoting, setIsVoting] = useState(false);
  
  const proposal = proposals.find(p => p.id === id);
  
  if (!proposal) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Proposal Not Found</h2>
          <p className="text-gray-600 mb-6">The proposal you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate('/proposals')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Proposals
          </Button>
        </Card>
      </div>
    );
  }
  
  const totalVotes = proposal.votes.for + proposal.votes.against;
  const forPercentage = totalVotes > 0 ? (proposal.votes.for / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.votes.against / totalVotes) * 100 : 0;
  
  const formatDate = (date: Date | number) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVoteFor = () => {
    if (!id) return;
    setIsVoting(true);
    // Simulate a blockchain transaction with a slight delay
    setTimeout(() => {
      voteFor(id);
      setIsVoting(false);
    }, 1000);
  };

  const handleVoteAgainst = () => {
    if (!id) return;
    setIsVoting(true);
    // Simulate a blockchain transaction with a slight delay
    setTimeout(() => {
      voteAgainst(id);
      setIsVoting(false);
    }, 1000);
  };

  const userVoteOnThisProposal = id ? userVotes[id] : undefined;
  
  // Get all transactions related to this proposal
  const proposalTransactions = transactions.filter(tx => tx.proposalId === id);
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/proposals')}
          className="inline-flex items-center text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Proposals
        </button>
      </div>
      
      <Card>
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
            {proposal.status}
          </span>
        </div>
        
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap gap-x-6 gap-y-2">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Deadline: {formatDate(proposal.deadline)}</span>
          </div>
          
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
          </div>
          
          <div className="flex items-center">
            <span>Created by: {proposal.creator}</span>
          </div>
        </div>
        
        <div className="prose prose-primary max-w-none mb-6">
          <p className="text-gray-700">{proposal.description}</p>
        </div>
        
        <Separator.Root className="h-px bg-gray-200 my-6" />
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Voting Results</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">For: {proposal.votes.for} votes ({forPercentage.toFixed(1)}%)</span>
                </div>
                <span className="text-sm text-gray-500">{forPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <Progress.Root className="w-full h-full relative overflow-hidden rounded-full" value={forPercentage}>
                  <Progress.Indicator
                    className="h-full bg-green-500 transition-all duration-500 ease-in-out"
                    style={{ width: `${forPercentage}%` }}
                  />
                </Progress.Root>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center text-red-600">
                  <XCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Against: {proposal.votes.against} votes ({againstPercentage.toFixed(1)}%)</span>
                </div>
                <span className="text-sm text-gray-500">{againstPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <Progress.Root className="w-full h-full relative overflow-hidden rounded-full" value={againstPercentage}>
                  <Progress.Indicator
                    className="h-full bg-red-500 transition-all duration-500 ease-in-out"
                    style={{ width: `${againstPercentage}%` }}
                  />
                </Progress.Root>
              </div>
            </div>
          </div>
        </div>
        
        {/* Blockchain Transactions Section */}
        {proposalTransactions.length > 0 && (
          <>
            <Separator.Root className="h-px bg-gray-200 my-6" />
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-primary-500" />
                Blockchain Transactions
              </h2>
              
              <div className="space-y-4">
                {proposalTransactions.map((tx) => (
                  <div key={tx.hash} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.type === 'vote' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {tx.type === 'vote' ? 'Vote Transaction' : 'Create Proposal'}
                      </span>
                      <a 
                        href={getExplorerUrl(tx.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Button variant="ghost" size="sm" className="py-1 h-7 flex items-center">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View on Blockchain
                        </Button>
                      </a>
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Transaction Hash:</div>
                      <div className="flex items-center">
                        <code className="text-xs font-mono bg-gray-100 p-1 rounded text-gray-600 overflow-x-auto max-w-full">
                          {tx.hash}
                        </code>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(tx.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {proposal.status === 'active' && (
          <>
            <Separator.Root className="h-px bg-gray-200 my-6" />
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cast Your Vote</h2>
              
              {!isConnected ? (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">You need to connect your wallet to vote on this proposal.</p>
                  <Button onClick={() => document.querySelector('[class*="w3m-button"]')?.dispatchEvent(new Event('click'))}>
                    Connect Wallet
                  </Button>
                </div>
              ) : id && hasVoted(id) ? (
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Vote Successfully Cast</h3>
                  <p className="text-gray-600 mb-2">Thank you for participating in governance!</p>
                  <p className="text-sm font-medium">
                    {userVoteOnThisProposal === 'for' ? 
                      'You voted FOR this proposal' : 
                      'You voted AGAINST this proposal'}
                  </p>
                </div>
              ) : (
                <div className="flex gap-4">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700" 
                    onClick={handleVoteFor}
                    disabled={isVoting}
                  >
                    {isVoting ? 'Voting...' : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Vote For
                      </>
                    )}
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700" 
                    onClick={handleVoteAgainst}
                    disabled={isVoting}
                  >
                    {isVoting ? 'Voting...' : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Vote Against
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ProposalDetail;