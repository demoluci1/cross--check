import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProposalsList from './components/ProposalsList';
import CreateProposal from './components/CreateProposal';
import ProposalDetail from './components/ProposalDetail';
import VotePage from './components/VotePage';
import ResultsPage from './components/ResultsPage';
import ProfilePage from './components/ProfilePage';
import Settings from './components/Settings';
import { Web3Provider } from './providers/Web3Provider';
import { ProposalsProvider } from './providers/ProposalsProvider';
import { Proposal } from './types';

// Mock data for demonstration
const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Implement Community Treasury',
    description: 'Proposal to establish a community-managed treasury for funding future development initiatives and community projects. This will allow for decentralized allocation of resources.',
    deadline: new Date('2024-04-01'),
    status: 'active',
    votes: { for: 156, against: 23 },
    creator: '0x1234...5678'
  },
  {
    id: '2',
    title: 'Protocol Upgrade v2.0',
    description: 'Major protocol upgrade to improve scalability and reduce gas fees for all transactions. This upgrade introduces layer 2 solutions.',
    deadline: new Date('2024-03-25'),
    status: 'upcoming',
    votes: { for: 0, against: 0 },
    creator: '0x8765...4321'
  },
  {
    id: '3',
    title: 'Governance Parameter Updates',
    description: 'Update the voting threshold and quorum requirements for proposal approvals to better reflect the growing community size.',
    deadline: new Date('2024-04-15'),
    status: 'active',
    votes: { for: 78, against: 42 },
    creator: '0xabcd...1234'
  },
  {
    id: '4',
    title: 'Strategic Partnership with DeFi Protocol',
    description: 'Establish a strategic partnership with a leading DeFi protocol to enhance liquidity and cross-platform interoperability.',
    deadline: new Date('2024-04-10'),
    status: 'active',
    votes: { for: 112, against: 34 },
    creator: '0x2468...1357'
  }
];

function App() {
  return (
    <Web3Provider>
      <ProposalsProvider initialProposals={mockProposals}>
        <Router>
          <div className="min-h-screen bg-background">
            <Navigation />
            
            <Routes>
              <Route path="/" element={<ProposalsList title="Active Proposals" description="Vote on current proposals or create new ones for the community." filterStatus="active" />} />
              <Route path="/proposals" element={<ProposalsList title="All Proposals" description="Browse and vote on all community proposals." />} />
              <Route path="/proposals/:id" element={<ProposalDetail />} />
              <Route path="/create" element={<CreateProposal />} />
              <Route path="/vote" element={<VotePage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </Router>
      </ProposalsProvider>
    </Web3Provider>
  );
}

export default App;