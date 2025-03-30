import React from 'react';
import { useAccount } from 'wagmi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { User, Vote, Clock, ExternalLink, CheckCircle, XCircle, Database } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import { Link } from 'react-router-dom';
import { useProposals } from '../providers/ProposalsProvider';
import { TransactionInfo } from '../blockchain/useGovernance';

const ProfilePage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { proposals, userVotes, transactions, getExplorerUrl } = useProposals();
  
  const formatDate = (date: Date | number) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get user voting history from the userVotes state
  const userVotingHistory = Object.entries(userVotes).map(([proposalId, voteType]) => {
    const proposal = proposals.find(p => p.id === proposalId);
    return proposal ? {
      proposalId,
      proposalTitle: proposal.title,
      vote: voteType,
      timestamp: new Date() // In a real app, we would store the timestamp when the vote was cast
    } : null;
  }).filter(Boolean);
  
  // Find the transaction for a specific proposal ID
  const getTransactionForProposal = (proposalId: string) => {
    return transactions.find(tx => tx.proposalId === proposalId && tx.type === 'vote');
  };
  
  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-md mx-auto">
          <Card className="p-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to view your profile and voting history.</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-primary-600" />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Wallet Address</h2>
                <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                  <span className="font-mono">{address}</span>
                  <a 
                    href={`https://etherscan.io/address/${address}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                <div className="w-full">
                  <Button onClick={() => document.querySelector('[class*="w3m-button"]')?.dispatchEvent(new Event('click'))} variant="outline" fullWidth>
                    Disconnect
                  </Button>
                </div>
              </div>
              
              <Separator.Root className="h-px bg-gray-200 my-6" />
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Governance Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Votes Cast:</span>
                    <span className="font-medium text-gray-900">{userVotingHistory.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Votes For:</span>
                    <span className="font-medium text-green-600">
                      {userVotingHistory.filter(h => h && h.vote === 'for').length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Votes Against:</span>
                    <span className="font-medium text-red-600">
                      {userVotingHistory.filter(h => h && h.vote === 'against').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Voting History</h2>
              
              {userVotingHistory.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <Vote className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Voting History</h3>
                  <p className="text-gray-500 mb-4">You haven't voted on any proposals yet.</p>
                  <Link to="/vote">
                    <Button>Start Voting</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userVotingHistory.map((historyItem) => historyItem && (
                    <div key={historyItem.proposalId} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Link 
                          to={`/proposals/${historyItem.proposalId}`}
                          className="text-lg font-medium text-gray-900 hover:text-primary-600"
                        >
                          {historyItem.proposalTitle}
                        </Link>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                          historyItem.vote === 'for' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {historyItem.vote === 'for' ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Voted for
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Voted against
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{formatDate(historyItem.timestamp)}</span>
                        </div>
                        
                        {getTransactionForProposal(historyItem.proposalId) && (
                          <a 
                            href={getExplorerUrl(getTransactionForProposal(historyItem.proposalId)!.hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
                          >
                            View on Blockchain
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
          
          {/* Blockchain Transactions Section */}
          <Card className="mt-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Database className="w-5 h-5 mr-2 text-primary-500" />
                Blockchain Transactions
              </h2>
              
              {transactions.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Blockchain Transactions</h3>
                  <p className="text-gray-500 mb-4">You haven't made any blockchain transactions yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Proposal
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((tx: TransactionInfo) => {
                        const proposal = tx.proposalId !== '0'
                          ? proposals.find(p => p.id === tx.proposalId)
                          : null;
                          
                        return (
                          <tr key={tx.hash}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                tx.type === 'vote' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {tx.type === 'vote' ? 'Vote' : 'Create Proposal'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(tx.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {proposal ? (
                                <Link 
                                  to={`/proposals/${proposal.id}`}
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  {proposal.title}
                                </Link>
                              ) : (
                                <span>New Proposal</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <a
                                href={getExplorerUrl(tx.hash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-900 flex items-center justify-end"
                              >
                                View <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;