import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
// import GovernancePage from './pages/GovernancePage';
import SimulatorPage from './pages/SimulatorPage';
import { initBlockchain } from './utils/blockchain';
import NewsVerificationPage from './pages/NewsVerification';
import NotFound from './pages/NotFound';
import { Signup } from './pages/Signup';
import Login from './pages/Login';



function App() {
  useEffect(() => {
    // Initialize blockchain connection
    initBlockchain().catch(console.error);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path = "/signup" element = {<Signup/>}/>
            <Route path = "/login" element = {<Login/>}/>
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/News" element={<NewsVerificationPage />} />
            <Route path="*" element = {<NotFound/>}/>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;