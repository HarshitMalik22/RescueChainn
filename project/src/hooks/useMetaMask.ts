import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Signer } from 'ethers';

type WalletState = {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  provider: BrowserProvider | null;
  signer: Signer | null;
  error: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

type EthereumProvider = {
  isMetaMask?: boolean;
  request: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const useMetaMask = (): WalletState => {
  const [state, setState] = useState<Omit<WalletState, 'connect' | 'disconnect'>>({
    isConnected: false,
    address: null,
    chainId: null,
    provider: null,
    signer: null,
    error: null,
    isConnecting: false,
  });

  const updateState = (newState: Partial<Omit<WalletState, 'connect' | 'disconnect'>>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts: unknown) => {
      const accountsArray = accounts as string[];
      if (accountsArray.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        updateState({
          isConnected: false,
          address: null,
          provider: null,
          signer: null,
        });
      } else if (accountsArray[0] !== state.address) {
        updateState({ address: accountsArray[0] });
      }
    };

    const handleChainChanged = () => {
      // Reload the page when the chain changes
      window.location.reload();
    };

    const setupEventListeners = () => {
      if (!window.ethereum) return;

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup function
      return () => {
        if (!window.ethereum) return;
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    };

    setupEventListeners();
  }, [state.address]);

  const switchToAmoy = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected');
    }

    const chainId = '0x13882'; // Amoy testnet
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if ((switchError as { code?: number }).code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId,
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                blockExplorerUrls: ['https://amoy.polygonscan.com/'],
              },
            ],
          });
        } catch (error) {
          console.error('Failed to add Amoy network:', error);
          throw new Error('Failed to add Amoy network to MetaMask');
        }
      } else {
        console.error('Failed to switch to Amoy network:', switchError);
        throw switchError;
      }
    }
  }, []);

  const connect = useCallback(async () => {
    console.log('Attempting to connect to MetaMask...');
    
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        const errorMsg = 'MetaMask not detected! Please install the MetaMask extension.';
        console.error(errorMsg);
        updateState({ 
          isConnecting: false,
          error: errorMsg 
        });
        throw new Error(errorMsg);
      }

      console.log('MetaMask detected, requesting accounts...');
      updateState({ 
        isConnecting: true, 
        error: null 
      });

      try {
        // First, try to get accounts without prompting
        const initialAccounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        }) as string[];
        
        if (initialAccounts && initialAccounts.length > 0) {
          console.log('Already connected with account:', initialAccounts[0]);
          // If already connected, just update the state
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const { chainId } = await provider.getNetwork();
          
          updateState({
            isConnected: true,
            isConnecting: false,
            address,
            chainId: `0x${chainId.toString(16)}`,
            provider,
            signer,
            error: null,
          });
          return;
        }

        // If not connected, request access
        console.log('Requesting account access...');
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        }) as string[];

        if (!accounts || accounts.length === 0) {
          const errorMsg = 'No accounts found. Please connect an account in MetaMask.';
          console.error(errorMsg);
          throw new Error(errorMsg);
        }

        console.log('Connected with account:', accounts[0]);

        // Switch to Amoy testnet
        console.log('Switching to Amoy testnet...');
        await switchToAmoy();

        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const { chainId } = await provider.getNetwork();

        console.log('Successfully connected to:', {
          address,
          chainId: `0x${chainId.toString(16)}`,
          network: 'Polygon Amoy Testnet'
        });

        updateState({
          isConnected: true,
          isConnecting: false,
          address,
          chainId: `0x${chainId.toString(16)}`,
          provider,
          signer,
          error: null,
        });
      } catch (error) {
        console.error('Error during connection:', error);
        throw error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to MetaMask';
      console.error('MetaMask connection failed:', errorMessage);
      
      updateState({
        isConnected: false,
        isConnecting: false,
        address: null,
        provider: null,
        signer: null,
        error: errorMessage,
      });
      
      // Re-throw the error to be caught by the component
      throw error;
    }
  }, [switchToAmoy]);

  const disconnect = useCallback(() => {
    updateState({
      isConnected: false,
      address: null,
      chainId: null,
      provider: null,
      signer: null,
      error: null,
    });
  }, []);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = (await window.ethereum.request({ 
          method: 'eth_accounts' 
        })) as string[];
        
        if (accounts.length > 0) {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const { chainId } = await provider.getNetwork();

          updateState({
            isConnected: true,
            isConnecting: false,
            address,
            chainId: `0x${chainId.toString(16)}`,
            provider,
            signer,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error checking MetaMask connection:', error);
        updateState({
          isConnected: false,
          isConnecting: false,
          address: null,
          provider: null,
          signer: null,
          error: error instanceof Error ? error.message : 'Failed to check connection',
        });
      }
    };

    checkConnection();
  }, []);

  return {
    ...state,
    connect,
    disconnect,
  };
};
