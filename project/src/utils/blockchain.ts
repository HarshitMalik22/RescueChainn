import { ethers, BrowserProvider, Signer, Contract } from 'ethers';

// Type definitions for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

// Network configurations
const NETWORKS = {
  amoy: {
    chainId: '0x13882', // 80002 in decimal
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
  },
};

// ABI for DAO contract with events
const daoABI = [
  // Functions
  "function release(address recipient, uint256 amount) external returns (bool)",
  "function getBalance() external view returns (uint256)",
  "function releaseUSDC(address recipient, uint256 amount) external returns (bool)",
  "function getUSDCBalance() external view returns (uint256)",
  // Events
  "event FundsReleased(address indexed recipient, uint256 amount)",
  "event USDCReleased(address indexed recipient, uint256 amount)"
];

// Minimal ERC20 ABI for USDC
const usdcABI = [
  "function transfer(address recipient, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

// Contract addresses - replace with actual deployed contract addresses
const daoContractAddress = import.meta.env.VITE_DAO_CONTRACT_ADDRESS || '0x1111111111111111111111111111111111111111';
const usdcContractAddress = import.meta.env.VITE_USDC_CONTRACT_ADDRESS || '0x2222222222222222222222222222222222222222';

// Global variables for blockchain connection
let _signer: Signer | null = null;
let _provider: BrowserProvider | null = null;
let daoContract: Contract | null = null;
let usdcContract: Contract | null = null;
let isConnected = false;
let currentAccount: string | null = null;
let cleanupListeners: (() => void) | null = null;

/**
 * Clean up all blockchain resources and reset state
 * @internal
 */
const cleanupResources = () => {
  if (cleanupListeners) {
    cleanupListeners();
    cleanupListeners = null;
  }
  _signer = null;
  _provider = null;
  daoContract = null;
  usdcContract = null;
  isConnected = false;
  currentAccount = null;
};

// Getters for signer and provider
export const getSigner = (): Signer | null => _signer;
export const getProvider = (): BrowserProvider | null => _provider;

// Event listeners for account and chain changes
const setupEventListeners = (onDisconnect?: () => Promise<void> | void) => {
  // Clean up any existing listeners
  if (cleanupListeners) {
    cleanupListeners();
    cleanupListeners = null;
  }
  
  // If no ethereum provider, cleanup and throw
  if (!window.ethereum) {
    cleanupResources();
    throw new Error('Ethereum provider not found');
  }


  const handleAccountsChanged = (accounts: unknown) => {
    try {
      const accountsArray = accounts as string[];
      if (accountsArray.length === 0) {
        console.log('Please connect to MetaMask.');
        isConnected = false;
        currentAccount = null;
        if (onDisconnect) {
          const result = onDisconnect();
          if (result && typeof result.catch === 'function') {
            result.catch(console.error);
          }
        }
      } else if (accountsArray[0] !== currentAccount) {
        currentAccount = accountsArray[0];
        // Update contracts with new signer if needed
        if (_signer) {
          initContracts(_signer).catch(console.error);
        }
      }
    } catch (error) {
      console.error('Error in accountsChanged handler:', error);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };



  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', handleChainChanged);

  // Store the cleanup function
  const cleanupFunction = () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };
  
  // Update the cleanup listeners
  cleanupListeners = cleanupFunction;
  
  // Return the cleanup function for direct use if needed
  return cleanupFunction;
};

export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
};

export const getCurrentChainId = async (): Promise<string> => {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return chainId as string;
};

export const switchToAmoy = async (): Promise<void> => {
  if (!window.ethereum) throw new Error('No crypto wallet found');

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORKS.amoy.chainId }],
    });
  } catch (switchError: unknown) {
    // This error code indicates that the chain has not been added to MetaMask
    if ((switchError as { code?: number }).code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORKS.amoy],
        });
      } catch (addError) {
        console.error('Error adding Amoy network:', addError);
        throw new Error('Failed to add Amoy network to MetaMask');
      }
    } else {
      console.error('Error switching to Amoy network:', switchError);
      throw new Error('Failed to switch to Amoy network');
    }
  }
};

// Initialize contracts with proper types
const initContracts = async (signer: Signer): Promise<void> => {
  if (!daoContractAddress || !usdcContractAddress) {
    throw new Error('Contract addresses not configured');
  }
  
  // Initialize contracts with the signer
  daoContract = new Contract(daoContractAddress, daoABI, signer);
  usdcContract = new Contract(usdcContractAddress, usdcABI, signer);
  
  const address = await signer.getAddress();
  console.log('Contracts initialized with signer:', address);
};

/**
 * Represents an active blockchain connection
 */
export interface BlockchainConnection {
  /** The blockchain provider (e.g., MetaMask) */
  provider: BrowserProvider;
  /** The signer for transactions */
  signer: Signer;
  /** The connected wallet address */
  address: string;
  /** The current chain ID */
  chainId: string;
}

/**
 * Check if the user is already connected to MetaMask
 */
const checkConnection = async (): Promise<string | null> => {
  if (!window.ethereum) return null;
  
  const accounts = await window.ethereum.request({ 
    method: 'eth_accounts' 
  }) as string[];
  
  return accounts.length > 0 ? accounts[0] : null;
};

export const initBlockchain = async (onDisconnect?: () => Promise<void>): Promise<BlockchainConnection> => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error(
        'MetaMask not detected. Please install the MetaMask extension to use this feature.'
      );
    }

    // First check if already connected
    const connectedAccount = await checkConnection();
    
    // Set up event listeners for account/chain changes
    setupEventListeners(onDisconnect);

    // If not connected, request connection
    if (!connectedAccount) {
      try {
        // This will trigger the MetaMask popup
        await window.ethereum!.request({
          method: 'wallet_requestPermissions',
          params: [{
            eth_accounts: {}
          }]
        });
      } catch (error) {
        // User rejected the request
        if ((error as { code: number }).code === 4001) {
          throw new Error('Please connect your MetaMask account to continue');
        }
        throw error;
      }
    }

    // Now request accounts - this won't show a popup if already connected
    const accounts = (await window.ethereum!.request({
      method: 'eth_requestAccounts',
    })) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect an account in MetaMask.');
    }

    // Create provider and signer
    const provider = new BrowserProvider(window.ethereum!);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // Switch to Amoy network
    await switchToAmoy();
    
    // Verify network again after switching
    const { chainId } = await provider.getNetwork();
    if (chainId !== 80002n) {
      throw new Error('Please switch to the Polygon Amoy Testnet in MetaMask');
    }

    // Initialize contracts with the signer
    await initContracts(signer);
    
    // Update global state
    currentAccount = address;
    isConnected = true;
    _signer = signer;
    _provider = provider;

    return {
      address,
      chainId: `0x${chainId.toString(16)}`,
      provider,
      signer,
    };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
};

export const isWalletConnected = () => isConnected;

export const getWalletAddress = async () => {
  if (!signer) return null;
  try {
    return await signer.getAddress();
  } catch (error) {
    console.error('Failed to get wallet address:', error);
    return null;
  }
};

export const releaseFunds = async (recipient: string, amount: string) => {
  try {
    if (!daoContract || !_signer) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    // Validate recipient address
    if (!ethers.isAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }

    // Convert the amount to a BigNumber assuming 18 decimals for MATIC
    const amountInWei = ethers.parseUnits(amount, 18);

    console.log(`Releasing ${amount} MATIC to ${recipient}`);
    
    // Get the current signer's address
    const signerAddress = await _signer.getAddress();
    
    // Create a new contract instance with the signer
    const contractWithSigner = new ethers.Contract(
      daoContractAddress,
      daoABI,
      _signer
    );
    
    // Execute the transaction
    const tx = await contractWithSigner.release(recipient, amountInWei, {
      from: signerAddress,
      gasLimit: 500000 // Fixed gas limit to avoid estimation issues
    });
    
    console.log('Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    // Check for the FundsReleased event in the receipt
    const event = receipt.logs.find(
      (log: any) => 
        log.address.toLowerCase() === daoContractAddress.toLowerCase() &&
        log.topics[0] === ethers.id('FundsReleased(address,uint256)')
    );
    
    if (!event) {
      console.warn('FundsReleased event not found in transaction receipt');
    }

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt?.blockNumber,
      eventEmitted: !!event
    };
  } catch (error) {
    console.error('Failed to release funds:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
};

// Define event interface for better type safety
interface Log {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
}

export const releaseUSDC = async (recipient: string, amount: string) => {
  try {
    if (!usdcContract || !_signer) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    // Validate recipient address
    if (!ethers.isAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }

    // Convert the amount to USDC's smallest unit (USDC typically has 6 decimals)
    const amountInUnits = ethers.parseUnits(amount, 6);

    console.log(`Releasing ${amount} USDC to ${recipient}`);
    
    // Get the current signer's address
    const senderAddress = await _signer.getAddress();
    
    // Create a new contract instance with the signer
    const contractWithSigner = new ethers.Contract(
      usdcContractAddress,
      usdcABI,
      _signer
    );
    
    // Check balance first
    const balance = await contractWithSigner.balanceOf(senderAddress);
    
    if (balance < amountInUnits) {
      throw new Error('Insufficient USDC balance');
    }
    
    // Execute the transaction
    const tx = await contractWithSigner.transfer(recipient, amountInUnits, {
      from: senderAddress,
      gasLimit: 500000 // Fixed gas limit to avoid estimation issues
    });
    
    console.log('USDC transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('USDC transaction confirmed:', receipt);
    
    // Check for the Transfer event in the receipt
    const event = (receipt.logs as Log[]).find(
      (log: Log) => 
        log.address.toLowerCase() === usdcContractAddress.toLowerCase() &&
        log.topics[0] === ethers.id('Transfer(address,address,uint256)') &&
        log.topics[1].toLowerCase() === '0x000000000000000000000000' + senderAddress.slice(2).toLowerCase() &&
        log.topics[2].toLowerCase() === '0x000000000000000000000000' + recipient.slice(2).toLowerCase()
    );
    
    if (!event) {
      console.warn('Transfer event not found in transaction receipt');
    }

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt?.blockNumber,
      eventEmitted: !!event
    };
  } catch (error) {
    console.error('Failed to release USDC funds:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'USDC transaction failed',
    };
  }
};

// Helper function to get user's USDC balance
export const getUSDCBalance = async (): Promise<string> => {
  const currentSigner = getSigner();
  if (!usdcContract || !currentSigner) {
    console.error('USDC contract not initialized or signer not available');
    return '0';
  }

  try {
    const address = await currentSigner.getAddress();
    const balance = await usdcContract.balanceOf(address);
    // USDC has 6 decimals
    return ethers.formatUnits(balance, 6);
  } catch (error) {
    console.error('Failed to get USDC balance:', error);
    return '0';
  }
};

// Helper function to get user's MATIC balance
export const getMATICBalance = async (): Promise<string> => {
  const currentSigner = getSigner();
  if (!currentSigner) {
    throw new Error('Wallet not connected');
  }

  try {
    const balance = await currentSigner.provider?.getBalance(await currentSigner.getAddress());
    if (!balance) return '0';
    
    // Format the balance with 4 decimal places
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Failed to get MATIC balance:', error);
    throw error;
  }
};