import { ethers } from 'ethers';

// Simplified ABI for DAO contract
const daoABI = [
  "function release(address recipient, uint256 amount) external returns (bool)",
  "function getBalance() external view returns (uint256)"
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
const polygonRpcUrl = import.meta.env.VITE_POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com';

let provider: ethers.JsonRpcProvider;
let daoContract: ethers.Contract;
let usdcContract: ethers.Contract;
let signer: ethers.Signer | null = null;
let isConnected = false;

export const initBlockchain = async () => {
  try {
    // Connect to the Polygon Mumbai testnet
    provider = new ethers.JsonRpcProvider(polygonRpcUrl);

    // Initialize DAO and USDC contracts in read-only mode
    daoContract = new ethers.Contract(daoContractAddress, daoABI, provider);
    usdcContract = new ethers.Contract(usdcContractAddress, usdcABI, provider);

    console.log('Blockchain connection initialized successfully');
    return { provider, daoContract, usdcContract };
  } catch (error) {
    console.error('Failed to initialize blockchain connection:', error);
    throw error;
  }
};

export const connectWallet = async () => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    // Request account access from MetaMask
    const accounts = (await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    })) as string[];
    
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.');
    }

    // Create ethers provider and signer using MetaMask's provider
    const ethersProvider = new ethers.BrowserProvider(window.ethereum);
    signer = await ethersProvider.getSigner();

    // Check if we're on the correct network (Polygon Mumbai)
    const network = await ethersProvider.getNetwork();
    if (network.chainId !== 80001n) {
      try {
        // Try to switch to Polygon Mumbai
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }], // 80001 in hex
        });
      } catch (switchError: any) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x13881',
              chainName: 'Polygon Mumbai Testnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
              },
              rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
              blockExplorerUrls: ['https://mumbai.polygonscan.com/']
            }]
          });
        }
      }
    }

    // Reinitialize contracts with the signer for write operations
    daoContract = new ethers.Contract(daoContractAddress, daoABI, signer);
    usdcContract = new ethers.Contract(usdcContractAddress, usdcABI, signer);
    isConnected = true;

    // Listen for account changes and reload the page
    window.ethereum.on('accountsChanged', () => {
      window.location.reload();
    });

    // Listen for network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });

    console.log('Wallet connected successfully:', accounts[0]);
    return {
      success: true,
      address: accounts[0],
    };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
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
    if (!daoContract || !signer) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    // Validate recipient address
    if (!ethers.isAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }

    // Convert the amount to a BigNumber assuming 18 decimals for MATIC
    const amountInWei = ethers.parseUnits(amount, 18);

    console.log(`Releasing ${amount} MATIC to ${recipient}`);
    
    // Estimate gas first
    const gasEstimate = await daoContract.release.estimateGas(recipient, amountInWei);
    
    // Execute the transaction with a gas limit buffer
    const tx = await daoContract.release(recipient, amountInWei, {
      gasLimit: gasEstimate * 120n / 100n // 20% buffer
    });
    
    console.log('Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt?.blockNumber,
    };
  } catch (error) {
    console.error('Failed to release funds:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
};

export const releaseUSDC = async (recipient: string, amount: string) => {
  try {
    if (!usdcContract || !signer) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    // Validate recipient address
    if (!ethers.isAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }

    // Convert the amount to USDC's smallest unit (USDC typically has 6 decimals)
    const amountInUnits = ethers.parseUnits(amount, 6);

    console.log(`Releasing ${amount} USDC to ${recipient}`);
    
    // Check balance first
    const senderAddress = await signer.getAddress();
    const balance = await usdcContract.balanceOf(senderAddress);
    
    if (balance < amountInUnits) {
      throw new Error('Insufficient USDC balance');
    }

    // Estimate gas first
    const gasEstimate = await usdcContract.transfer.estimateGas(recipient, amountInUnits);
    
    // Execute the transaction
    const tx = await usdcContract.transfer(recipient, amountInUnits, {
      gasLimit: gasEstimate * 120n / 100n // 20% buffer
    });
    
    console.log('USDC transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('USDC transaction confirmed:', receipt);

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt?.blockNumber,
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
export const getUSDCBalance = async () => {
  try {
    if (!usdcContract || !signer) {
      return '0';
    }

    const address = await signer.getAddress();
    const balance = await usdcContract.balanceOf(address);
    
    // Convert from smallest unit to USDC (6 decimals)
    return ethers.formatUnits(balance, 6);
  } catch (error) {
    console.error('Failed to get USDC balance:', error);
    return '0';
  }
};

// Helper function to get user's MATIC balance
export const getMATICBalance = async () => {
  try {
    if (!signer) {
      return '0';
    }

    const balance = await signer.provider.getBalance(await signer.getAddress());
    
    // Convert from wei to MATIC (18 decimals)
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Failed to get MATIC balance:', error);
    return '0';
  }
};