import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircle, XCircle, Filter, ArrowRight, Loader, ExternalLink } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useProposals } from '../providers/ProposalsProvider';
import { Link } from 'react-router-dom';
import * as Progress from '@radix-ui/react-progress';
import * as Dialog from '@radix-ui/react-dialog';
import * as Toast from '@radix-ui/react-toast';

const VotePage: React.FC = () => {
  const { isConnected } = useAccount();
  const { proposals, voteFor, voteAgainst, userVotes, hasVoted, isLoading, transactions, getExplorerUrl } = useProposals();
  const [filter, setFilter] = useState<'all' | 'active'>('active');
  const [votingProposalId, setVotingProposalId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [latestTxHash, setLatestTxHash] = useState<string | null>(null);
  
  // Filter active proposals (ones that can be voted on)
  const activeProposals = proposals.filter(proposal => proposal.status === 'active');
  const displayedProposals = filter === 'active' ? activeProposals : proposals;
  
  const handleVoteFor = async (proposalId: string) => {
    if (!isConnected) return;
    
    setIsVoting(true);
    try {
      // Submit vote to blockchain
      const result = await voteFor(proposalId);
      
      // If we got a transaction hash back, save it
      if (result) {
        setLatestTxHash(result);
      }
      
      setToastMessage('Vote submitted successfully!');
      setToastType('success');
      setToastOpen(true);
    } catch (error) {
      console.error('Error voting:', error);
      setToastMessage('Error submitting vote. Please try again.');
      setToastType('error');
      setToastOpen(true);
    } finally {
      setIsVoting(false);
    }
  };

  const handleVoteAgainst = async (proposalId: string) => {
    if (!isConnected) return;
    
    setIsVoting(true);
    try {
      // Submit vote to blockchain
      const result = await voteAgainst(proposalId);
      
      // If we got a transaction hash back, save it
      if (result) {
        setLatestTxHash(result);
      }
      
      setToastMessage('Vote submitted successfully!');
      setToastType('success');
      setToastOpen(true);
    } catch (error) {
      console.error('Error voting:', error);
      setToastMessage('Error submitting vote. Please try again.');
      setToastType('error');
      setToastOpen(true);
    } finally {
      setIsVoting(false);
    }
  };

  const openVoteDialog = (proposalId: string) => {
    setVotingProposalId(proposalId);
    setLatestTxHash(null); // Reset transaction hash when opening dialog
  };

  const closeVoteDialog = () => {
    setVotingProposalId(null);
  };
  
  // Get the most recent transaction for a proposal
  const getProposalTransaction = (proposalId: string) => {
    return transactions.find(tx => tx.proposalId === proposalId && tx.type === 'vote');
  };
  
  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-md mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet to Vote</h2>
            <p className="text-gray-600 mb-6">You need to connect your wallet to see your voting options and participate in governance.</p>
            <Button 
              onClick={() => document.querySelector('[class*="w3m-button"]')?.dispatchEvent(new Event('click'))}
              size="lg"
            >
              Connect Wallet
            </Button>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vote on Proposals</h1>
          <p className="mt-2 text-gray-600">
            Cast your votes on active governance proposals to help shape the future of the project.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button 
            variant={filter === 'active' ? "default" : "outline"} 
            onClick={() => setFilter('active')}
            className="inline-flex items-center"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Active Proposals
          </Button>
          
          <Button 
            variant={filter === 'all' ? "default" : "outline"} 
            onClick={() => setFilter('all')}
            className="inline-flex items-center"
          >
            <Filter className="mr-2 h-4 w-4" /> All Proposals
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 text-primary-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading proposals from blockchain...</span>
        </div>
      ) : displayedProposals.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <XCircle className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Proposals Available</h3>
          <p className="mt-1 text-gray-500">
            {filter === 'active' 
              ? "There are no active proposals that require voting at this time."
              : "There are no proposals available."}
          </p>
          <div className="mt-6">
            <Link to="/create">
              <Button>Create a Proposal</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {displayedProposals.map((proposal) => {
            const totalVotes = proposal.votes.for + proposal.votes.against;
            const forPercentage = totalVotes > 0 ? (proposal.votes.for / totalVotes) * 100 : 0;
            const hasUserVoted = hasVoted(proposal.id);
            const userVoteType = userVotes[proposal.id];
            
            return (
              <Card key={proposal.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Link 
                      to={`/proposals/${proposal.id}`} 
                      className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {proposal.title}
                    </Link>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${proposal.status === 'active' ? 'bg-green-100 text-green-800' : 
                        proposal.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}`}
                    >
                      {proposal.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{proposal.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span>{proposal.votes.for} For</span>
                      </div>
                      
                      <div className="flex items-center text-red-600">
                        <XCircle className="w-4 h-4 mr-1" />
                        <span>{proposal.votes.against} Against</span>
                      </div>
                    </div>
                    
                    <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <Progress.Root className="w-full h-full relative overflow-hidden rounded-full" value={forPercentage}>
                        <Progress.Indicator
                          className="h-full bg-primary-500 transition-all duration-500 ease-in-out"
                          style={{ width: `${forPercentage}%` }}
                        />
                      </Progress.Root>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Link 
                      to={`/proposals/${proposal.id}`} 
                      className="text-primary-600 font-medium text-sm flex items-center hover:text-primary-700"
                    >
                      View details <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                    
                    {proposal.status === 'active' && (
                      hasUserVoted ? (
                        <div className="flex items-center text-sm">
                          <span className={`font-medium ${userVoteType === 'for' ? 'text-green-600' : 'text-red-600'}`}>
                            {userVoteType === 'for' ? 'Voted For' : 'Voted Against'}
                          </span>
                          <CheckCircle className="ml-1 w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <Button 
                          onClick={() => openVoteDialog(proposal.id)}
                          variant="default" 
                          size="sm"
                        >
                          Vote Now
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Voting Dialog */}
      <Dialog.Root open={votingProposalId !== null} onOpenChange={closeVoteDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 shadow-lg z-50 w-full max-w-md">
            {votingProposalId && (
              <>
                {hasVoted(votingProposalId) ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <Dialog.Title className="text-xl font-semibold text-gray-900 mb-2">
                      Vote Successfully Cast!
                    </Dialog.Title>
                    <p className="text-gray-600 mb-1">
                      Thank you for participating in governance.
                    </p>
                    <p className="text-sm font-medium mb-2">
                      {userVotes[votingProposalId] === 'for' ? 
                        'You voted FOR this proposal' : 
                        'You voted AGAINST this proposal'}
                    </p>
                    
                    {latestTxHash && (
                      <div className="mb-6 mt-4 bg-gray-50 p-3 rounded-md text-left">
                        <div className="text-xs text-gray-500 mb-1">Transaction Hash:</div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-mono text-gray-600 truncate max-w-[230px]">
                            {latestTxHash}
                          </div>
                          <a 
                            href={getExplorerUrl(latestTxHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-primary-600 hover:text-primary-700 ml-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        <a 
                          href={getExplorerUrl(latestTxHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:text-primary-700 flex items-center mt-2"
                        >
                          <span>View on Blockchain Explorer</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                    
                    <Button onClick={closeVoteDialog}>Close</Button>
                  </div>
                ) : (
                  <>
                    <Dialog.Title className="text-xl font-semibold text-gray-900 mb-2">
                      Cast Your Vote
                    </Dialog.Title>
                    <Dialog.Description className="text-gray-600 mb-6">
                      Vote on: {proposals.find(p => p.id === votingProposalId)?.title}
                    </Dialog.Description>
                    
                    <div className="space-y-4">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 justify-center py-3" 
                        onClick={() => handleVoteFor(votingProposalId)}
                        disabled={isVoting}
                      >
                        {isVoting ? (
                          <div className="flex items-center">
                            <Loader className="animate-spin w-5 h-5 mr-2" />
                            Casting Vote...
                          </div>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Vote For
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700 justify-center py-3" 
                        onClick={() => handleVoteAgainst(votingProposalId)}
                        disabled={isVoting}
                      >
                        {isVoting ? (
                          <div className="flex items-center">
                            <Loader className="animate-spin w-5 h-5 mr-2" />
                            Casting Vote...
                          </div>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 mr-2" />
                            Vote Against
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button variant="ghost" onClick={closeVoteDialog} disabled={isVoting}>
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      
      {/* Toast Notification */}
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          className={`${
            toastType === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
          } fixed bottom-4 right-4 z-50 rounded-lg shadow-lg border p-4 w-72`}
          open={toastOpen}
          onOpenChange={setToastOpen}
          duration={3000}
        >
          <Toast.Title className={`font-semibold ${
            toastType === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {toastType === 'success' ? 'Success' : 'Error'}
          </Toast.Title>
          <Toast.Description className={`text-sm mt-1 ${
            toastType === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {toastMessage}
          </Toast.Description>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>
    </main>
  );
};

export default VotePage;