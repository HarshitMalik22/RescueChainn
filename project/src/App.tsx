import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import { initBlockchain } from './utils/blockchain';

import { Toaster } from 'react-hot-toast';

// Lazy load components for better performance
const Header = lazy(() => import('./components/Header'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SimulatorPage = lazy(() => import('./pages/SimulatorPage'));
const NewsVerificationPage = lazy(() => import('./pages/NewsVerification'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const MetaMaskTest = lazy(() => import('./components/MetaMaskTest'));

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
    <h2 className="mb-4 text-2xl font-bold text-red-600">Something went wrong</h2>
    <pre className="p-4 mb-6 overflow-auto text-sm text-left text-red-500 bg-red-50 rounded-lg max-w-2xl">
      {error.message}
    </pre>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Try again
    </button>
  </div>
);

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// AppRoutes component
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/simulator" element={<SimulatorPage />} />
    <Route path="/news" element={<NewsVerificationPage />} />
    <Route path="/wallet" element={<WalletPage />} />
    <Route path="/test-wallet" element={<MetaMaskTest />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

// Main App component
function App() {
  useEffect(() => {
    // Initialize blockchain connection
    initBlockchain().catch(console.error);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="container mx-auto px-4 py-8">
                <AppRoutes />
              </main>
            </div>
            <Toaster position="top-right" />
          </Suspense>
        </Router>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;