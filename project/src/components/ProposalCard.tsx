import React from 'react';
import { Calendar, Users, CheckCircle, XCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { Proposal } from '../types';
import { Card } from './ui/Card';
import * as Progress from '@radix-ui/react-progress';
import { Link } from 'react-router-dom';
import { useProposals } from '../providers/ProposalsProvider';
import { Button } from './ui/Button';

interface ProposalCardProps {
  proposal: Proposal;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal }) => {
  const { transactions, getExplorerUrl } = useProposals();
  
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

  const totalVotes = proposal.votes.for + proposal.votes.against;
  const forPercentage = totalVotes > 0 ? (proposal.votes.for / totalVotes) * 100 : 0;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Find the latest transaction related to this proposal
  const latestTransaction = transactions.find(tx => tx.proposalId === proposal.id);

  return (
    <Card className="group overflow-hidden flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
          {proposal.status}
        </span>
        <span className="text-xs text-gray-500">ID: {proposal.id}</span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
        {proposal.title}
      </h3>
      
      <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{proposal.description}</p>
      
      <div className="text-sm text-gray-500 mb-4">
        <div className="flex items-center mb-2">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Deadline: {formatDate(proposal.deadline)}</span>
        </div>
        
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2" />
          <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
        </div>
      </div>
      
      <div className="mt-2">
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
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <Link 
          to={`/proposals/${proposal.id}`} 
          className="text-primary-600 font-medium text-sm flex items-center hover:text-primary-700"
        >
          View details <ArrowRight className="ml-1 w-4 h-4" />
        </Link>

        {latestTransaction && (
          <a 
            href={getExplorerUrl(latestTransaction.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
          >
            <Button variant="ghost" size="sm" className="py-1 h-7 flex items-center">
              <ExternalLink className="h-3 w-3 mr-1" />
              Blockchain
            </Button>
          </a>
        )}
      </div>
    </Card>
  );
};

export default ProposalCard;