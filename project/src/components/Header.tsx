import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, BarChart3, Shield, Menu, X, ExternalLink, Newspaper, Wallet } from 'lucide-react';
import { useMetaMask } from '../hooks/useMetaMask';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const {
    isConnected,
    address: walletAddress,
    connect,
    disconnect,
    isConnecting
  } = useMetaMask();

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const formatWalletAddress = (address: string) => 
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <header className="bg-gradient-to-r from-gray-900 via-black to-gray-800 shadow-2xl border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Section: Logo & Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="relative">
                  <Shield className="h-8 w-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                  <div className="absolute inset-0 h-8 w-8 bg-cyan-400/20 rounded-full animate-pulse group-hover:animate-none"></div>
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  RescueChain
                </span>
              </Link>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ${
                  location.pathname === '/' 
                    ? 'border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/20' 
                    : 'border-transparent text-gray-300 hover:text-cyan-300 hover:border-gray-500'
                }`}
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                to="/simulator"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ${
                  location.pathname === '/simulator'
                    ? 'border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/20'
                    : 'border-transparent text-gray-300 hover:text-cyan-300 hover:border-gray-500'
                }`}
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                Disaster Simulator
              </Link>
              <Link
                to="/news"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ${
                  location.pathname === '/news' 
                    ? 'border-cyan-400 text-gray-100' 
                    : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gray-100'
                }`}
              >
                <Newspaper className="mr-1.5 h-4 w-4" />
                News Verification
              </Link>
              <Link
                to="/wallet"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ${
                  location.pathname === '/wallet' 
                    ? 'border-cyan-400 text-gray-100' 
                    : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gray-100'
                }`}
              >
                <Wallet className="mr-1.5 h-4 w-4" />
                Wallet
              </Link>
              <Link
                to="/test-wallet"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ${
                  location.pathname === '/test-wallet'
                    ? 'border-purple-400 text-purple-400 shadow-lg shadow-purple-400/20'
                    : 'border-transparent text-gray-300 hover:text-purple-300 hover:border-gray-500'
                }`}
              >
                <div className="w-5 h-5 mr-2">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M20.5 3.5h-17A2.5 2.5 0 001 6v12a2.5 2.5 0 002.5 2.5h17a2.5 2.5 0 002.5-2.5V6a2.5 2.5 0 00-2.5-2.5zm-17 1h17a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5h-17A1.5 1.5 0 012 19.5v-12A1.5 1.5 0 013.5 6z"/>
                    <path d="M6 10h12v1H6z"/>
                    <path d="M6 13h8v1H6z"/>
                  </svg>
                </div>
                Wallet Test
              </Link>
            </nav>
          </div>

          {/* Right Section: User, Wallet & UPI Payment */}
          <div className="hidden md:flex items-center space-x-4">


            {/* Wallet Connection */}
            {isConnected && walletAddress ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 px-4 py-2 rounded-lg text-green-300 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                  <span className="font-mono">{formatWalletAddress(walletAddress)}</span>
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className={`px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                  isConnecting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                {isConnecting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </button>
            )}

            {/* NGO Donation Button */}
            <button
              onClick={() => {}}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              NGO Donation
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700/50">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-all ${
                  location.pathname === '/'
                    ? 'bg-gray-800 border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <BarChart3 className="mr-3 h-5 w-5" />
                  Dashboard
                </div>
              </Link>
              <Link
                to="/simulator"
                className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-all ${
                  location.pathname === '/simulator'
                    ? 'bg-gray-800 border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <AlertTriangle className="mr-3 h-5 w-5" />
                  Disaster Simulator
                </div>
              </Link>
              <Link
                to="/news"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/news'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                News Verification
              </Link>
              <Link
                to="/wallet"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/wallet'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Wallet className="mr-2 h-5 w-5" />
                Wallet
              </Link>
              <Link
                to="/test-wallet"
                className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-all ${
                  location.pathname === '/test-wallet'
                    ? 'bg-gray-800 border-purple-400 text-purple-400'
                    : 'border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-3">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                      <path d="M20.5 3.5h-17A2.5 2.5 0 001 6v12a2.5 2.5 0 002.5 2.5h17a2.5 2.5 0 002.5-2.5V6a2.5 2.5 0 00-2.5-2.5zm-17 1h17a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5h-17A1.5 1.5 0 012 19.5v-12A1.5 1.5 0 013.5 6z"/>
                      <path d="M6 10h12v1H6z"/>
                      <path d="M6 13h8v1H6z"/>
                    </svg>
                  </div>
                  Wallet Test
                </div>
              </Link>
            </div>
            
            {/* Mobile Wallet Connection */}
            <div className="pt-2 pb-3 px-4">
              {isConnected && walletAddress ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                      <span className="font-mono text-sm text-green-300">
                        {formatWalletAddress(walletAddress)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        disconnect();
                        setIsMenuOpen(false);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    await handleConnectWallet();
                    setIsMenuOpen(false);
                  }}
                  disabled={isConnecting}
                  className={`w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all ${
                    isConnecting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isConnecting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    'Connect Wallet'
                  )}
                </button>
              )}
              
              {/* Mobile Donation Button */}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 w-full px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                NGO Donation
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;