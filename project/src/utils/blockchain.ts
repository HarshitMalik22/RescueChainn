import { ethers, BrowserProvider, Signer, Contract } from 'ethers';

// Extended MetaMask types
type MetaMaskEventCallback = (...args: unknown[]) => void;

interface EthereumProvider {
  isMetaMask?: boolean;
  isConnected: () => boolean;
  request: <T = unknown>(args: { method: string; params?: unknown[] }) => Promise<T>;
  on: (event: string, callback: MetaMaskEventCallback) => void;
  removeListener: (event: string, callback: MetaMaskEventCallback) => void;
  chainId: string;
  selectedAddress: string | null;
  networkVersion: string;
  _metamask?: {
    isUnlocked: () => Promise<boolean>;
  };
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Token configurations for testnet
export const TESTNET_TOKENS = {
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    // Testnet USDC contract address (replace with actual testnet USDC address if available)
    address: '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23',
    logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  },
  DAI: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    // Testnet DAI contract address (replace with actual testnet DAI address if available)
    address: '0x5eD8BD53B0c3fa3dEaDf13630CCd0042eF5a1116',
    logoURI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
  },
  WMATIC: {
    name: 'Wrapped Matic',
    symbol: 'WMATIC',
    decimals: 18,
    // Wrapped Matic address on Amoy testnet
    address: '0x9c3C9283D3e44854697Cd22D3FAA240Cfb032889',
    logoURI: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  }
};

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
    tokens: TESTNET_TOKENS,
    faucetUrl: 'https://faucet.polygon.technology/',
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

// Complete ERC20 ABI for USDC
const usdcABI = [
  // ERC20 Standard Functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// Contract addresses - use environment variables or fallback to testnet defaults
const daoContractAddress = import.meta.env.VITE_DAO_CONTRACT_ADDRESS || '0x1111111111111111111111111111111111111111';
const usdcContractAddress = import.meta.env.VITE_USDC_CONTRACT_ADDRESS || TESTNET_TOKENS.USDC.address;

// Global variables for blockchain connection
let _signer: Signer | null = null;
let _provider: BrowserProvider | null = null;
let daoContract: Contract | null = null;
let usdcContract: Contract | null = null;
const tokenContracts: { [key: string]: Contract | null } = {}; // To store token contract instances
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

// Event listeners for MetaMask events
const setupEventListeners = (onDisconnect?: () => Promise<void> | void) => {
  // Clean up any existing listeners first
  if (cleanupListeners) {
    cleanupListeners();
    cleanupListeners = null;
  }
  
  if (!window.ethereum) {
    cleanupResources();
    throw new Error('Ethereum provider not found');
  }

  const handleAccountsChanged = async (accounts: unknown) => {
    try {
      const accountsArray = accounts as string[];
      if (!accountsArray || accountsArray.length === 0) {
        console.log('No accounts connected');
        isConnected = false;
        currentAccount = null;
        
        // Trigger disconnect callback if provided
        if (onDisconnect) {
          try {
            await Promise.resolve(onDisconnect());
          } catch (error) {
            console.error('Error in onDisconnect callback:', error);
          }
        }
      } else if (accountsArray[0] !== currentAccount) {
        // Account changed, update the current account
        currentAccount = accountsArray[0];
        
        // Re-initialize contracts with the new account
        if (_signer) {
          try {
            await initContracts(_signer);
            console.log('Contracts reinitialized for new account');
          } catch (error) {
            console.error('Failed to reinitialize contracts:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error in accountsChanged handler:', error);
    }
  };

  const handleChainChanged = (chainId: unknown) => {
    const chainIdStr = String(chainId);
    console.log('Chain changed:', chainIdStr);
    // Only reload if we're actually connected to a different chain
    if (chainIdStr !== NETWORKS.amoy.chainId) {
      window.location.reload();
    }
  };

  const handleDisconnect = (error: unknown) => {
    const errorObj = error as { code?: number; message?: string };
    console.log('MetaMask disconnected:', errorObj);
    isConnected = false;
    currentAccount = null;
    
    if (onDisconnect) {
      const result = onDisconnect();
      if (result && typeof result.catch === 'function') {
        result.catch(console.error);
      }
    }
  };

  // Add event listeners
  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', handleChainChanged);
  window.ethereum.on('disconnect', handleDisconnect);

  // Create cleanup function
  const cleanupFunction = () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    }
  };
  
  // Store the cleanup function
  cleanupListeners = cleanupFunction;
  
  return cleanupFunction;
};

export const isMetaMaskInstalled = (): boolean => {
  const ethereum = window.ethereum as any; // Use type assertion to avoid TypeScript errors
  return typeof window !== 'undefined' && 
         ethereum !== undefined && 
         ethereum.isMetaMask === true;
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

// Initialize contracts with proper types and event listeners
const initContracts = async (signer: Signer): Promise<() => void> => {
  try {
    if (!daoContractAddress || !usdcContractAddress) {
      throw new Error('Contract addresses not configured');
    }
    
    // Initialize contracts with the signer
    daoContract = new Contract(daoContractAddress, daoABI, signer);
    usdcContract = new Contract(usdcContractAddress, usdcABI, signer);
    
    // Verify USDC contract
    const isUSDCTokenValid = await verifyUSDCToken(usdcContract);
    if (!isUSDCTokenValid) {
      console.warn('USDC contract verification failed');
    }
    
    const address = await signer.getAddress();
    console.log('Contracts initialized with signer:', address);
    
    // Set up contract event listeners and get cleanup function
    const cleanupEventListeners = setupContractEventListeners();
    
    // Return cleanup function
    return () => {
      if (cleanupEventListeners) {
        cleanupEventListeners();
      }
    };
    
  } catch (error) {
    console.error('Failed to initialize contracts:', error);
    throw error;
  }
};

// Set up contract event listeners
const setupContractEventListeners = () => {
  if (!daoContract || !_provider) return;
  
  try {
    // Create a listener function for FundsReleased events with proper typing
    const onFundsReleased = (from: string, to: string, amount: bigint, event: ethers.EventLog) => {
      console.log('FundsReleased event:', { from, to, amount, event });
      window.dispatchEvent(new CustomEvent('fundsReleased', { 
        detail: { from, to, amount, event } 
      }));
    };
    
    // Listen for USDCReleased events
    const onUSDCFundsReleased = (from: string, to: string, amount: bigint, event: ethers.EventLog) => {
      console.log('USDCReleased event:', { from, to, amount, event });
      window.dispatchEvent(new CustomEvent('usdcReleased', { 
        detail: { from, to, amount, event } 
      }));
    };
    
    // Set up event listeners
    daoContract.on('FundsReleased', onFundsReleased);
    daoContract.on('USDCReleased', onUSDCFundsReleased);
    
    console.log('Contract event listeners set up');
    
    // Return cleanup function
    return () => {
      if (daoContract) {
        daoContract.off('FundsReleased', onFundsReleased);
        daoContract.off('USDCReleased', onUSDCFundsReleased);
      }
    };
  } catch (error) {
    console.error('Failed to set up contract event listeners:', error);
    return () => {}; // Return empty cleanup function on error
  }
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

export const connectWallet = async (): Promise<BlockchainConnection> => {
  if (!isMetaMaskInstalled()) {
    throw new Error(
      'MetaMask not detected. Please install the MetaMask extension to use this feature.'
    );
  }

  try {
    // Request account access
    const accounts = await window.ethereum!.request({
      method: 'eth_requestAccounts'
    }) as string[];
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect an account in MetaMask.');
    }
    
    return await initBlockchain();
  } catch (error) {
    if ((error as { code: number }).code === 4001) {
      throw new Error('Please connect your MetaMask account to continue');
    }
    throw error;
  }
};

export const initBlockchain = async (onDisconnect?: () => Promise<void>): Promise<BlockchainConnection> => {
  try {
    // Validate MetaMask installation
    if (!isMetaMaskInstalled()) {
      throw new Error(
        'MetaMask not detected. Please install the MetaMask extension to use this feature.'
      );
    }

    // Set up event listeners first to catch any changes during initialization
    const cleanupEventListeners = setupEventListeners(onDisconnect);
    let cleanupContractListeners: (() => void) | null = null;
    
    try {
      // Check if already connected
      const connectedAccount = await checkConnection();
      
      if (!connectedAccount) {
        throw new Error('Please connect your wallet first');
      }
      
      // Create provider and signer
      const provider = new BrowserProvider(window.ethereum!);
      const network = await provider.getNetwork();
      
      // Ensure we're on the correct network
      if (network.chainId !== 80002n) {
        try {
          await switchToAmoy();
          // Reload after network switch
          window.location.reload();
          throw new Error('Switching network...');
        } catch (error) {
          if ((error as { code: number }).code === 4001) {
            throw new Error('Please switch to the Polygon Amoy Testnet to continue');
          }
          throw error;
        }
      }
      
      // Get signer and address
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Initialize contracts and get cleanup function
      cleanupContractListeners = await initContracts(signer);
      
      // Update global state
      currentAccount = address;
      isConnected = true;
      _signer = signer;
      _provider = provider;
      
      console.log('Blockchain connection established:', {
        address,
        chainId: network.chainId.toString(),
        network: network.name
      });
      
      return {
        address,
        chainId: `0x${network.chainId.toString(16)}`,
        provider,
        signer,
      };
      
    } catch (error) {
      // Clean up on error
      cleanupEventListeners();
      if (cleanupContractListeners) {
        cleanupContractListeners();
      }
      cleanupResources();
      
      console.error('Failed to initialize blockchain:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to connect to MetaMask. Please try again.'
      );
    }
  } catch (error) {
    console.error('Blockchain initialization error:', error);
    throw error;
  }
};

/**
 * Checks if the wallet is currently connected
 * @returns boolean indicating if wallet is connected
 */
export const isWalletConnected = (): boolean => {
  return isConnected && !!currentAccount;
};

/**
 * Disconnects the wallet
 */
export const disconnectWallet = async (): Promise<void> => {
  cleanupResources();
  currentAccount = null;
  isConnected = false;
  _signer = null;
  _provider = null;
};

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
    const event = (receipt.logs as Log[]).find(
      (log: Log) => 
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

// Helper function to verify USDC contract
const verifyUSDCToken = async (contract: ethers.Contract) => {
  try {
    // Check basic ERC20 functions
    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals()
    ]);
    
    console.log(`USDC Token: ${name} (${symbol}) with ${decimals} decimals`);
    return true;
  } catch (error) {
    console.error('USDC contract verification failed:', error);
    return false;
  }
};

export const releaseUSDC = async (recipient: string, amount: string) => {
  try {
    if (!_signer) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    // Validate recipient address
    if (!ethers.isAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }

    // Get the current signer's address
    const senderAddress = await _signer.getAddress();
    
    // Create a new contract instance with the signer
    const usdcContract = new ethers.Contract(
      usdcContractAddress,
      usdcABI,
      _signer
    );
    
    // Verify the contract
    const isValidUSDC = await verifyUSDCToken(usdcContract);
    if (!isValidUSDC) {
      throw new Error('Invalid USDC contract at the specified address');
    }

    // Convert the amount to USDC's smallest unit (USDC typically has 6 decimals)
    const decimals = await usdcContract.decimals();
    const amountInUnits = ethers.parseUnits(amount, decimals);

    console.log(`Releasing ${amount} USDC to ${recipient}`);
    
    // Check balance first
    const balance = await usdcContract.balanceOf(senderAddress);
    
    if (balance < amountInUnits) {
      throw new Error(`Insufficient USDC balance. Current: ${ethers.formatUnits(balance, decimals)} USDC, Required: ${amount} USDC`);
    }
    
    // Execute the transaction
    const tx = await usdcContract.transfer(recipient, amountInUnits, {
      gasLimit: 500000 // Fixed gas limit to avoid estimation issues
    });
    
    console.log('USDC transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('USDC transaction confirmed:', receipt);
    
    // Check for the Transfer event in the receipt
    const transferEventTopic = ethers.id('Transfer(address,address,uint256)');
    const fromTopic = '0x' + '0'.repeat(24) + senderAddress.slice(2).toLowerCase();
    const toTopic = '0x' + '0'.repeat(24) + recipient.slice(2).toLowerCase();
    
    const event = (receipt.logs as Log[]).find(
      (log: Log) => 
        log.address.toLowerCase() === usdcContractAddress.toLowerCase() &&
        log.topics[0] === transferEventTopic &&
        log.topics[1] === fromTopic &&
        log.topics[2] === toTopic
    );
    
    if (!event) {
      console.warn('Transfer event not found in transaction receipt');
      console.log('Available logs:', receipt.logs);
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
  const signer = getSigner();
  if (!signer) return '0';
  
  try {
    const address = await signer.getAddress();
    const balance = await signer.provider?.getBalance(address) || 0;
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error fetching MATIC balance:', error);
    return '0';
  }
};

/**
 * Get token balance for a specific token
 * @param tokenAddress The token contract address
 * @returns Formatted token balance as string
 */
export const getTokenBalance = async (tokenAddress: string): Promise<string> => {
  if (!_signer || !_provider) return '0';
  
  try {
    // Use existing contract instance or create a new one
    if (!tokenContracts[tokenAddress]) {
      tokenContracts[tokenAddress] = new ethers.Contract(
        tokenAddress,
        usdcABI, // Using the same ABI as it's standard ERC20
        _provider
      );
    }
    
    const tokenContract = tokenContracts[tokenAddress];
    if (!tokenContract) return '0';
    
    const userAddress = await _signer.getAddress();
    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();
    
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error(`Error fetching token balance for ${tokenAddress}:`, error);
    return '0';
  }
};

/**
 * Get all supported testnet tokens for the current network
 * @returns Array of token configurations
 */
export const getSupportedTokens = () => {
  return Object.values(TESTNET_TOKENS);
};

/**
 * Get token information by symbol
 * @param symbol Token symbol (e.g., 'USDC', 'DAI')
 * @returns Token configuration or null if not found
 */
export const getTokenInfo = (symbol: string) => {
  return TESTNET_TOKENS[symbol as keyof typeof TESTNET_TOKENS] || null;
};