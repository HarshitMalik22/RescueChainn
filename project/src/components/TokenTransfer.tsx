import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  getTokenBalance,
  getSupportedTokens,
  getMATICBalance,
  TESTNET_TOKENS
} from '../utils/blockchain';

interface TokenTransferProps {
  onTransferComplete?: () => void;
}

const TokenTransfer: React.FC<TokenTransferProps> = ({ onTransferComplete }) => {
  const [selectedToken, setSelectedToken] = useState<string>('MATIC');
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isSending, setIsSending] = useState<boolean>(false);

  const supportedTokens = [
    { symbol: 'MATIC', name: 'Matic', logoURI: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
    ...getSupportedTokens()
  ];

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        let balance;
        
        if (selectedToken === 'MATIC') {
          balance = await getMATICBalance();
        } else {
          const token = TESTNET_TOKENS[selectedToken as keyof typeof TESTNET_TOKENS];
          if (token) {
            balance = await getTokenBalance(token.address);
          }
        }
        
        setBalance(balance || '0');
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError('Failed to fetch token balance');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [selectedToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (!ethers.isAddress(recipient)) {
      setError('Invalid recipient address');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      setSuccess(null);

      // In a real implementation, you would call your smart contract here
      // For now, we'll simulate a successful transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(`Successfully sent ${amount} ${selectedToken} to ${recipient}`);
      setRecipient('');
      setAmount('');
      
      if (onTransferComplete) {
        onTransferComplete();
      }
    } catch (err) {
      console.error('Transfer error:', err);
      setError('Failed to complete the transfer');
    } finally {
      setIsSending(false);
    }
  };

  const handleMaxClick = () => {
    if (balance) {
      // Leave a small amount for gas
      const maxAmount = parseFloat(balance) * 0.99;
      setAmount(maxAmount.toFixed(6));
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Send Tokens</h3>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
              Token
            </label>
            <select
              id="token"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
            >
              {supportedTokens.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.name} ({token.symbol})
                </option>
              ))}
            </select>
            <div className="mt-1 text-sm text-gray-500">
              Balance: {isLoading ? 'Loading...' : `${parseFloat(balance).toFixed(6)} ${selectedToken}`}
              {!isLoading && parseFloat(balance) > 0 && (
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                >
                  (Max)
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              id="recipient"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="amount"
                step="any"
                min="0"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {selectedToken}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSending}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSending ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TokenTransfer;
