// import React, { useState, useEffect } from 'react';
// import { DAOProposal, NGO } from '../types';
// import { createProposal, castVote, executeProposal, isWalletConnected } from '../utils/blockchain';
// import { supabase } from '../utils/supabase';
// import { Users, Check, X, ExternalLink, AlertTriangle } from 'lucide-react';

// interface DAOGovernanceProps {
//   ngos: NGO[];
// }

// const DAOGovernance: React.FC<DAOGovernanceProps> = ({ ngos }) => {
//   const [proposals, setProposals] = useState<DAOProposal[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isCreatingProposal, setIsCreatingProposal] = useState(false);
//   const [newProposal, setNewProposal] = useState({
//     title: '',
//     description: '',
//     amount: 0.1,
//     recipient: '',
//   });
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [walletConnected, setWalletConnected] = useState(false);

//   useEffect(() => {
//     fetchProposals();
//     setWalletConnected(isWalletConnected());
//   }, []);

//   const fetchProposals = async () => {
//     setIsLoading(true);
//     try {
//       // In a real app, this would fetch from Supabase
//       const mockProposals: DAOProposal[] = [
//         {
//           id: '1',
//           title: 'Emergency Flood Relief Fund',
//           description: 'Allocate funds for immediate response to flooding in Southeast Asia',
//           amount: 0.5,
//           recipient: '0x1234567890123456789012345678901234567890',
//           status: 'active',
//           votesFor: 15,
//           votesAgainst: 3,
//           createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
//           expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
//         },
//         {
//           id: '2',
//           title: 'Earthquake Early Warning System',
//           description: 'Fund development of improved sensor network for earthquake detection',
//           amount: 1.2,
//           recipient: '0x0987654321098765432109876543210987654321',
//           status: 'executed',
//           votesFor: 25,
//           votesAgainst: 2,
//           createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
//           expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
//         },
//       ];
      
//       setProposals(mockProposals);
//     } catch (error) {
//       console.error('Error fetching proposals:', error);
//       setError('Failed to load proposals. Please try again later.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCreateProposal = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!walletConnected) {
//       setError('Please connect your wallet first to create a proposal.');
//       return;
//     }
    
//     setIsCreatingProposal(true);
//     setError(null);
//     setSuccess(null);
    
//     try {
//       if (!newProposal.title || !newProposal.description || !newProposal.amount || !newProposal.recipient) {
//         throw new Error('All fields are required');
//       }
      
//       // Call blockchain utility
//       const result = await createProposal(
//         newProposal.title,
//         newProposal.description,
//         newProposal.recipient,
//         newProposal.amount.toString()
//       );
      
//       if (result.success) {
//         // Create a new proposal object
//         const createdProposal: DAOProposal = {
//           id: result.proposalId,
//           title: newProposal.title,
//           description: newProposal.description,
//           amount: newProposal.amount,
//           recipient: newProposal.recipient,
//           status: 'pending',
//           votesFor: 0,
//           votesAgainst: 0,
//           createdAt: new Date().toISOString(),
//           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
//         };
        
//         // In a real app, store in Supabase
//         // await supabase.from('proposals').insert(createdProposal);
        
//         setProposals([createdProposal, ...proposals]);
//         setSuccess('Proposal created successfully!');
        
//         // Reset form
//         setNewProposal({
//           title: '',
//           description: '',
//           amount: 0.1,
//           recipient: '',
//         });
//       } else {
//         throw new Error('Failed to create proposal on the blockchain');
//       }
//     } catch (error) {
//       console.error('Error creating proposal:', error);
//       setError(error instanceof Error ? error.message : 'Failed to create proposal');
//     } finally {
//       setIsCreatingProposal(false);
//     }
//   };

//   const handleVote = async (proposalId: string, support: boolean) => {
//     if (!walletConnected) {
//       setError('Please connect your wallet first to vote.');
//       return;
//     }
    
//     setError(null);
//     setSuccess(null);
    
//     try {
//       // Call blockchain utility
//       const result = await castVote(proposalId, support);
      
//       if (result.success) {
//         // Update the proposal in state
//         setProposals(proposals.map(p => {
//           if (p.id === proposalId) {
//             return {
//               ...p,
//               votesFor: support ? p.votesFor + 1 : p.votesFor,
//               votesAgainst: support ? p.votesAgainst : p.votesAgainst + 1,
//             };
//           }
//           return p;
//         }));
        
//         setSuccess(`Vote cast successfully!`);
//       } else {
//         throw new Error('Failed to cast vote on the blockchain');
//       }
//     } catch (error) {
//       console.error('Error voting on proposal:', error);
//       setError('Failed to cast vote. Please try again.');
//     }
//   };

//   const handleExecute = async (proposal: DAOProposal) => {
//     if (!walletConnected) {
//       setError('Please connect your wallet first to execute a proposal.');
//       return;
//     }
    
//     setError(null);
//     setSuccess(null);
    
//     try {
//       // In a real app, this would call the blockchain with proper parameters
//       const result = await executeProposal(
//         proposal.id,
//         [proposal.recipient],
//         [Math.floor(proposal.amount * 1e18)],
//         ['0x'],
//         proposal.title
//       );
      
//       if (result.success) {
//         // Update the proposal in state
//         setProposals(proposals.map(p => {
//           if (p.id === proposal.id) {
//             return {
//               ...p,
//               status: 'executed',
//             };
//           }
//           return p;
//         }));
        
//         setSuccess(`Proposal executed successfully!`);
//       } else {
//         throw new Error('Failed to execute proposal on the blockchain');
//       }
//     } catch (error) {
//       console.error('Error executing proposal:', error);
//       setError('Failed to execute proposal. Please try again.');
//     }
//   };

//   return (
//     <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
//       <div className="p-6 border-b border-gray-700">
//         <h2 className="text-2xl font-bold text-white flex items-center">
//           <Users className="mr-2 text-blue-400" />
//           DAO Governance
//         </h2>
//         <p className="text-gray-400 mt-1">Create and vote on proposals for disaster relief funding</p>
//       </div>
      
//       {/* Create Proposal Form */}
//       <div className="p-6 bg-gray-800 border-b border-gray-700">
//         <h3 className="text-lg font-semibold mb-4 text-blue-300">Create New Proposal</h3>
        
//         {!walletConnected && (
//           <div className="mb-4 p-4 bg-yellow-900 border-l-4 border-yellow-500 text-yellow-100 rounded">
//             <div className="flex">
//               <AlertTriangle className="h-5 w-5 text-yellow-300 mr-2" />
//               <p>Please connect your wallet to create and vote on proposals.</p>
//             </div>
//           </div>
//         )}
        
//         <form onSubmit={handleCreateProposal}>
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//             <div className="col-span-2">
//               <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
//               <input
//                 type="text"
//                 value={newProposal.title}
//                 onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
//                 placeholder="Emergency Relief Fund"
//                 disabled={!walletConnected}
//               />
//             </div>
            
//             <div className="col-span-2">
//               <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
//               <textarea
//                 value={newProposal.description}
//                 onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
//                 rows={3}
//                 placeholder="Describe the purpose of this proposal..."
//                 disabled={!walletConnected}
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">Amount (ETH)</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 min="0.01"
//                 value={newProposal.amount}
//                 onChange={(e) => setNewProposal({...newProposal, amount: parseFloat(e.target.value)})}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
//                 disabled={!walletConnected}
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">Recipient NGO</label>
//               <select
//                 value={newProposal.recipient}
//                 onChange={(e) => setNewProposal({...newProposal, recipient: e.target.value})}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
//                 disabled={!walletConnected}
//               >
//                 <option value="">Select an NGO</option>
//                 {ngos.map(ngo => (
//                   <option key={ngo.id} value={ngo.walletAddress}>
//                     {ngo.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
          
//           <div className="mt-4">
//             <button
//               type="submit"
//               disabled={isCreatingProposal || !walletConnected}
//               className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
//                 isCreatingProposal || !walletConnected
//                   ? 'bg-gray-600 cursor-not-allowed' 
//                   : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg'
//               }`}
//             >
//               {isCreatingProposal ? (
//                 <span className="flex items-center justify-center">
//                   <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Creating...
//                 </span>
//               ) : (
//                 'Create Proposal'
//               )}
//             </button>
//           </div>
          
//           {error && (
//             <div className="mt-4 p-3 bg-red-900 text-red-100 rounded-md border border-red-700">
//               {error}
//             </div>
//           )}
          
//           {success && (
//             <div className="mt-4 p-3 bg-green-900 text-green-100 rounded-md border border-green-700">
//               {success}
//             </div>
//           )}
//         </form>
//       </div>
      
//       {/* Proposals List */}
//       <div className="p-6">
//         <h3 className="text-lg font-semibold mb-4 text-blue-300">Active Proposals</h3>
        
//         {isLoading ? (
//           <div className="text-center py-8">
//             <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//             <p className="mt-2 text-gray-400">Loading proposals...</p>
//           </div>
//         ) : proposals.length === 0 ? (
//           <div className="text-center py-8 text-gray-400">
//             <div className="inline-block p-3 bg-gray-800 rounded-full mb-3">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//             </div>
//             <p>No proposals found. Create one to get started.</p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {proposals.map(proposal => (
//               <div key={proposal.id} className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
//                 <div className="p-4 bg-gray-800 border-b border-gray-700">
//                   <div className="flex justify-between items-center">
//                     <h4 className="text-lg font-medium text-white">{proposal.title}</h4>
//                     <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
//                       proposal.status === 'active' 
//                         ? 'bg-green-900 text-green-300 border border-green-700' 
//                         : proposal.status === 'executed' 
//                           ? 'bg-blue-900 text-blue-300 border border-blue-700' 
//                           : proposal.status === 'defeated' 
//                             ? 'bg-red-900 text-red-300 border border-red-700' 
//                             : 'bg-yellow-900 text-yellow-300 border border-yellow-700'
//                     }`}>
//                       {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
//                     </span>
//                   </div>
//                 </div>
                
//                 <div className="p-4">
//                   <p className="text-gray-300 mb-3">{proposal.description}</p>
                  
//                   <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
//                     <div className="bg-gray-700 p-2 rounded">
//                       <span className="text-gray-400">Amount:</span>
//                       <span className="ml-1 font-medium text-white">{proposal.amount} ETH</span>
//                     </div>
//                     <div className="bg-gray-700 p-2 rounded">
//                       <span className="text-gray-400">Recipient:</span>
//                       <span className="ml-1 font-medium text-white">
//                         {ngos.find(ngo => ngo.walletAddress === proposal.recipient)?.name || 
//                           `${proposal.recipient.substring(0, 6)}...${proposal.recipient.substring(38)}`}
//                       </span>
//                     </div>
//                     <div className="bg-gray-700 p-2 rounded">
//                       <span className="text-gray-400">Created:</span>
//                       <span className="ml-1 font-medium text-white">
//                         {new Date(proposal.createdAt).toLocaleDateString()}
//                       </span>
//                     </div>
//                     <div className="bg-gray-700 p-2 rounded">
//                       <span className="text-gray-400">Expires:</span>
//                       <span className="ml-1 font-medium text-white">
//                         {new Date(proposal.expiresAt).toLocaleDateString()}
//                       </span>
//                     </div>
//                   </div>
                  
//                   {/* Voting Progress */}
//                   <div className="mb-4">
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className="text-gray-300">Votes: {proposal.votesFor} For / {proposal.votesAgainst} Against</span>
//                       <span className="text-gray-300">
//                         {Math.round(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst || 1) * 100)}% Approval
//                       </span>
//                     </div>
//                     <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
//                       <div 
//                         className="bg-blue-600 h-2.5 rounded-full" 
//                         style={{ width: `${proposal.votesFor / (proposal.votesFor + proposal.votesAgainst || 1) * 100}%` }}
//                       ></div>
//                     </div>
//                   </div>
                  
//                   {/* Action Buttons */}
//                   {proposal.status === 'active' && (
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => handleVote(proposal.id, true)}
//                         disabled={!walletConnected}
//                         className={`flex-1 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center ${
//                           !walletConnected
//                             ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
//                             : 'bg-green-600 hover:bg-green-700 text-white'
//                         }`}
//                       >
//                         <Check className="mr-1" size={16} />
//                         Vote For
//                       </button>
//                       <button
//                         onClick={() => handleVote(proposal.id, false)}
//                         disabled={!walletConnected}
//                         className={`flex-1 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center ${
//                           !walletConnected
//                             ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
//                             : 'bg-red-600 hover:bg-red-700 text-white'
//                         }`}
//                       >
//                         <X className="mr-1" size={16} />
//                         Vote Against
//                       </button>
//                       {proposal.votesFor > proposal.votesAgainst && (
//                         <button
//                           onClick={() => handleExecute(proposal)}
//                           disabled={!walletConnected}
//                           className={`flex-1 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center ${
//                             !walletConnected
//                               ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
//                               : 'bg-blue-600 hover:bg-blue-700 text-white'
//                           }`}
//                         >
//                           <ExternalLink className="mr-1" size={16} />
//                           Execute
//                         </button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DAOGovernance;