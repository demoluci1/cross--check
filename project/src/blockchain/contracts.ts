// Smart contract ABI for Governance
export const GovernanceABI = [
  // Read functions
  {
    "inputs": [{ "name": "proposalId", "type": "uint256" }],
    "name": "getProposal",
    "outputs": [
      { "name": "id", "type": "uint256" },
      { "name": "title", "type": "string" },
      { "name": "description", "type": "string" },
      { "name": "deadline", "type": "uint256" },
      { "name": "status", "type": "uint8" }, // 0 = upcoming, 1 = active, 2 = completed
      { "name": "forVotes", "type": "uint256" },
      { "name": "againstVotes", "type": "uint256" },
      { "name": "creator", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProposalCount",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "voter", "type": "address" }, { "name": "proposalId", "type": "uint256" }],
    "name": "hasVoted",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "voter", "type": "address" }, { "name": "proposalId", "type": "uint256" }],
    "name": "getVote",
    "outputs": [{ "name": "", "type": "bool" }], // true = for, false = against
    "stateMutability": "view",
    "type": "function"
  },
  // Write functions
  {
    "inputs": [
      { "name": "title", "type": "string" },
      { "name": "description", "type": "string" },
      { "name": "deadline", "type": "uint256" }
    ],
    "name": "createProposal",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "proposalId", "type": "uint256" }, { "name": "support", "type": "bool" }],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract address for Sepolia testnet
export const CONTRACT_ADDRESS = "0x8B791913eB8C31236640898ca75b9c6116F2fFd7"; // Sepolia testnet contract address

// Mapping between blockchain status and our application status
export const mapStatus = (status: number): 'upcoming' | 'active' | 'completed' => {
  switch (status) {
    case 0: return 'upcoming';
    case 1: return 'active';
    case 2: return 'completed';
    default: return 'upcoming';
  }
};