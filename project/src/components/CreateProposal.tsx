import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import PreviewProposal from './PreviewProposal';
import { Proposal } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import * as Tabs from '@radix-ui/react-tabs';
import * as Separator from '@radix-ui/react-separator';
import { AlertCircle, Loader } from 'lucide-react';
import { useProposals } from '../providers/ProposalsProvider';
import * as Toast from '@radix-ui/react-toast';

const CreateProposal: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { createProposal } = useProposals();
  const [proposalData, setProposalData] = useState<Partial<Proposal>>({
    title: '',
    description: '',
    deadline: undefined,
  });
  const [activeTab, setActiveTab] = useState('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setToastMessage('Please connect your wallet first');
      setToastType('error');
      setToastOpen(true);
      return;
    }

    if (!proposalData.title || !proposalData.description || !proposalData.deadline) {
      setToastMessage('Please fill in all fields');
      setToastType('error');
      setToastOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the blockchain createProposal function
      await createProposal(
        proposalData.title,
        proposalData.description || '',
        proposalData.deadline
      );
      
      setToastMessage('Proposal created successfully');
      setToastType('success');
      setToastOpen(true);
      
      // Navigate back to proposals list after successful creation
      setTimeout(() => {
        navigate('/proposals');
      }, 2000);
    } catch (error) {
      console.error('Error creating proposal:', error);
      setToastMessage('Failed to create proposal. Please try again.');
      setToastType('error');
      setToastOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Connection Required</h2>
          <p className="text-gray-600 mb-6">You need to connect your wallet to create a proposal.</p>
          <Button 
            onClick={() => document.querySelector('[class*="w3m-button"]')?.dispatchEvent(new Event('click'))}
            size="lg"
          >
            Connect Wallet
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Proposal</h1>
        <p className="mt-2 text-gray-600">Create a new proposal for the community to vote on.</p>
      </div>

      <Card className="overflow-hidden">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex border-b border-gray-200">
            <Tabs.Trigger 
              value="form" 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'form' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Form
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="preview" 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'preview' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Preview
            </Tabs.Trigger>
          </Tabs.List>

          <div className="p-6">
            <Tabs.Content value="form">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={proposalData.title}
                    onChange={(e) => setProposalData({ ...proposalData, title: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter proposal title"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    value={proposalData.description}
                    onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe your proposal"
                  />
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    id="deadline"
                    required
                    onChange={(e) => setProposalData({ ...proposalData, deadline: new Date(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader className="animate-spin w-4 h-4 mr-2" /> Creating Proposal...
                      </>
                    ) : (
                      'Create Proposal'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="ml-4"
                    onClick={() => setActiveTab('preview')}
                  >
                    Preview
                  </Button>
                </div>
              </form>
            </Tabs.Content>

            <Tabs.Content value="preview">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Proposal Preview</h2>
                <PreviewProposal proposal={proposalData} />
                
                <Separator.Root className="h-px bg-gray-200 my-6" />
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('form')}
                    className="mr-4"
                  >
                    Edit Proposal
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader className="animate-spin w-4 h-4 mr-2" /> Creating Proposal...
                      </>
                    ) : (
                      'Submit Proposal'
                    )}
                  </Button>
                </div>
              </div>
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </Card>

      {/* Toast Notification */}
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          className={`${
            toastType === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
          } fixed bottom-4 right-4 z-50 rounded-lg shadow-lg border p-4 w-72`}
          open={toastOpen}
          onOpenChange={setToastOpen}
          duration={4000}
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
    </div>
  );
};

export default CreateProposal;