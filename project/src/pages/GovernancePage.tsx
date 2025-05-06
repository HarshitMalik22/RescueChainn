// import React from 'react';
// // import DAOGovernance from '../components/DAOGovernance';
// import { NGO } from '../types';
// import { Shield,  } from 'lucide-react';

// const GovernancePage: React.FC = () => {
//   // Mock NGOs - in a real app, this would be fetched from Supabase
//   const mockNGOs: NGO[] = [
//     {
//       id: 'ngo-1',
//       name: 'Flood Relief International',
//       walletAddress: '0x1234567890123456789012345678901234567890',
//       phone: '+1234567890',
//       email: 'info@floodrelief.org',
//       location: { lat: 13.8, lng: 100.6 },
//       specialization: 'flood',
//     },
//     {
//       id: 'ngo-2',
//       name: 'Earthquake Response Team',
//       walletAddress: '0x0987654321098765432109876543210987654321',
//       phone: '+0987654321',
//       email: 'help@earthquakeresponse.org',
//       location: { lat: 35.7, lng: 139.7 },
//       specialization: 'earthquake',
//     },
//     {
//       id: 'ngo-3',
//       name: 'Global Disaster Aid',
//       walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
//       phone: '+1122334455',
//       email: 'contact@globaldisasteraid.org',
//       location: { lat: 19.1, lng: 72.9 },
//       specialization: 'both',
//     },
//   ];

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold flex items-center">
//           <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//             DAO Governance
//           </span>
//         </h1>
//         <p className="mt-2 text-gray-600">
//           Participate in decentralized decision-making for disaster relief fund allocation
//         </p>
//       </div>
      
//       <div className="mb-8 bg-gradient-to-r from-blue-900 to-indigo-900 border-l-4 border-blue-500 p-5 rounded-lg shadow-lg">
//         <div className="flex">
//           <div className="flex-shrink-0">
//             <Shield className="h-6 w-6 text-blue-300" />
//           </div>
//           <div className="ml-3">
//             <h3 className="text-lg font-medium text-white">About RescueChain DAO</h3>
//             <div className="mt-2 text-blue-200 space-y-1">
//               <p>
//                 The RescueChain DAO allows stakeholders to vote on fund allocation proposals for disaster relief efforts.
//               </p>
//               <p>
//                 Each proposal requires a majority vote to be executed, ensuring transparent and democratic decision-making.
//               </p>
//               <p>
//                 When executed, funds are automatically transferred to the recipient NGO via smart contracts on the Polygon blockchain.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* <DAOGovernance ngos={mockNGOs} /> */}
//     </div>
//   );
// };

// export default GovernancePage;