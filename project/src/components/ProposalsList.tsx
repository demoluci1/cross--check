import React from 'react';
import { Link } from 'react-router-dom';
import ProposalCard from './ProposalCard';
import { Button } from './ui/Button';
import { Plus, Filter } from 'lucide-react';
import { useProposals } from '../providers/ProposalsProvider';

interface ProposalsListProps {
  title: string;
  description: string;
  filterStatus?: 'active' | 'upcoming' | 'completed';
}

const ProposalsList: React.FC<ProposalsListProps> = ({ title, description, filterStatus }) => {
  const { proposals } = useProposals();
  
  // Apply filter if specified
  const filteredProposals = filterStatus 
    ? proposals.filter(proposal => proposal.status === filterStatus)
    : proposals;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-gray-600">{description}</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link to="/create">
            <Button variant="default" size="md" className="inline-flex items-center">
              <Plus className="mr-2 h-4 w-4" /> New Proposal
            </Button>
          </Link>
          
          <Button variant="outline" size="md" className="inline-flex items-center">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>
      
      {filteredProposals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No proposals found</h3>
          <p className="mt-1 text-gray-500">Get started by creating a new proposal.</p>
          <div className="mt-6">
            <Link to="/create">
              <Button variant="default" size="md" className="inline-flex items-center">
                <Plus className="mr-2 h-4 w-4" /> New Proposal
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
    </main>
  );
};

export default ProposalsList;