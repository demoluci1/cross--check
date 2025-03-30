import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useNetwork, NETWORKS } from '../providers/Web3Provider';
import { Button } from './ui/Button';

const Settings = () => {
  const { currentNetwork, setCurrentNetwork, isTestnet } = useNetwork();

  const handleNetworkChange = (network: string) => {
    setCurrentNetwork(network);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center">
        <SettingsIcon className="h-6 w-6 text-primary-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Network Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment
            </label>
            <div className="flex space-x-4">
              <Button
                variant={isTestnet ? "default" : "outline"}
                onClick={() => handleNetworkChange(NETWORKS.POLYGON_MUMBAI)}
                className={currentNetwork === NETWORKS.POLYGON_MUMBAI ? "ring-2 ring-primary-500" : ""}
              >
                Testnet (Mumbai)
              </Button>
              <Button
                variant={!isTestnet ? "default" : "outline"}
                onClick={() => handleNetworkChange(NETWORKS.POLYGON_MAINNET)}
                className={currentNetwork === NETWORKS.POLYGON_MAINNET ? "ring-2 ring-primary-500" : ""}
              >
                Mainnet (Polygon)
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isTestnet ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleNetworkChange(NETWORKS.POLYGON_MUMBAI)}
                    className={currentNetwork === NETWORKS.POLYGON_MUMBAI ? "ring-2 ring-primary-500" : ""}
                  >
                    Polygon Mumbai
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleNetworkChange(NETWORKS.ETHEREUM_SEPOLIA)}
                    className={currentNetwork === NETWORKS.ETHEREUM_SEPOLIA ? "ring-2 ring-primary-500" : ""}
                  >
                    Ethereum Sepolia
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleNetworkChange(NETWORKS.POLYGON_MAINNET)}
                    className={currentNetwork === NETWORKS.POLYGON_MAINNET ? "ring-2 ring-primary-500" : ""}
                  >
                    Polygon Mainnet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleNetworkChange(NETWORKS.ETHEREUM_MAINNET)}
                    className={currentNetwork === NETWORKS.ETHEREUM_MAINNET ? "ring-2 ring-primary-500" : ""}
                  >
                    Ethereum Mainnet
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Current network: {currentNetwork}</p>
          <p className="mt-2">
            {isTestnet 
              ? "Testnet environments are for development and testing only. Transactions don't use real assets."
              : "Mainnet environments use real assets. All transactions will require actual cryptocurrency."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;