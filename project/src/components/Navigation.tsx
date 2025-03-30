import React, { useState } from 'react';
import { Home, FileText, Plus, Vote, PieChart, User, Menu, X, Settings as SettingsIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/react';
import { Button } from './ui/Button';
import { useNetwork } from '../providers/Web3Provider';

const Navigation = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/proposals', icon: FileText, label: 'Proposals' },
    { path: '/create', icon: Plus, label: 'Create' },
    { path: '/vote', icon: Vote, label: 'Vote' },
    { path: '/results', icon: PieChart, label: 'Results' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const handleWalletClick = async () => {
    if (isConnected) {
      try {
        await disconnect();
        // Clear any stored connection data
        localStorage.removeItem('wagmi.connected');
        localStorage.removeItem('wagmi.store');
        localStorage.removeItem('wagmi.wallet');
        localStorage.removeItem('wc@2:client:0.3//session');
      } catch (error) {
        console.error("Error disconnecting wallet:", error);
      }
    } else {
      open();
    }
  };

  return (
    <nav className="bg-surface sticky top-0 z-10 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Vote className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Cross-Check</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="hidden md:flex md:space-x-6">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive(path)
                      ? 'border-primary-600 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Link>
              ))}
            </div>
            
            <div className="ml-6">
              <Button 
                onClick={handleWalletClick}
                variant={isConnected ? "outline" : "default"}
                size="md"
              >
                {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActive(path)
                    ? 'bg-primary-50 border-l-4 border-primary-600 text-primary-700'
                    : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4 py-3">
              <Button 
                onClick={handleWalletClick}
                variant={isConnected ? "outline" : "default"}
                size="md"
                fullWidth
              >
                {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;