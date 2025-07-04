import React from 'react';
import { Link } from 'react-router-dom';
import TokenBalances from '../components/TokenBalances';
import TokenTransfer from '../components/TokenTransfer';

const WalletPage: React.FC = () => {
  const handleTransferComplete = () => {
    // Refresh balances after transfer
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            My Wallet
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Manage your testnet tokens on Polygon Amoy
          </p>
          <div className="mt-4">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Balances</h2>
            <TokenBalances />
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    This is a testnet environment. These tokens have no real value.
                  </p>
                  <div className="mt-2">
                    <a
                      href="https://faucet.polygon.technology/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-yellow-700 underline hover:text-yellow-600"
                    >
                      Get test MATIC from the faucet →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Send Tokens</h2>
            <TokenTransfer onTransferComplete={handleTransferComplete} />
            
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Need help?</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Make sure you're connected to the Polygon Amoy Testnet in your wallet.
                    </p>
                    <p className="mt-1">
                      Test tokens are available from the faucet link above.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
