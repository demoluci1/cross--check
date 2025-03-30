import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { sepolia, polygon, polygonMumbai, mainnet } from 'wagmi/chains';
import { useState, createContext, useContext, useEffect } from 'react';

// Network options
export const NETWORKS = {
  ETHEREUM_MAINNET: 'ethereum_mainnet',
  ETHEREUM_SEPOLIA: 'ethereum_sepolia',
  POLYGON_MAINNET: 'polygon_mainnet',
  POLYGON_MUMBAI: 'polygon_mumbai',
};

// Context for network settings
interface NetworkContextType {
  currentNetwork: string;
  setCurrentNetwork: (network: string) => void;
  isTestnet: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  currentNetwork: NETWORKS.POLYGON_MUMBAI,
  setCurrentNetwork: () => {},
  isTestnet: true,
});

export const useNetwork = () => useContext(NetworkContext);

// Web3 provider component
export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [currentNetwork, setCurrentNetwork] = useState<string>(
    localStorage.getItem('network') || NETWORKS.POLYGON_MUMBAI
  );

  // Determine if current network is a testnet
  const isTestnet = currentNetwork === NETWORKS.ETHEREUM_SEPOLIA || 
                   currentNetwork === NETWORKS.POLYGON_MUMBAI;

  // Map network selection to chain
  const getChains = () => {
    switch (currentNetwork) {
      case NETWORKS.ETHEREUM_MAINNET:
        return [mainnet];
      case NETWORKS.ETHEREUM_SEPOLIA:
        return [sepolia];
      case NETWORKS.POLYGON_MAINNET:
        return [polygon];
      case NETWORKS.POLYGON_MUMBAI:
        return [polygonMumbai];
      default:
        return [polygonMumbai];
    }
  };

  const chains = getChains();
  const projectId = '23e5ea95c5d0a949d0bcd737f988845b';

  // Reconfigure when network changes
  useEffect(() => {
    localStorage.setItem('network', currentNetwork);
  }, [currentNetwork]);

  const { publicClient } = configureChains(chains as any, [w3mProvider({ projectId })]);
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, chains }),
    publicClient
  });

  const ethereumClient = new EthereumClient(wagmiConfig, chains);

  return (
    <NetworkContext.Provider value={{ currentNetwork, setCurrentNetwork, isTestnet }}>
      <WagmiConfig config={wagmiConfig}>
        {children}
      </WagmiConfig>

      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeMode="light"
        themeVariables={{
          '--w3m-font-family': 'Inter, sans-serif',
          '--w3m-accent-color': '#4F46E5'
        }}
      />
    </NetworkContext.Provider>
  );
}