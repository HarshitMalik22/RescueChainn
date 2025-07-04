import React, { useState } from 'react';
import { Sensor, DisasterEvent, NGO } from '../types';
import { AlertTriangle, Users, DollarSign, RefreshCw } from 'lucide-react';
import Map from '../components/Map';

// Mock data for the dashboard
const mockSensors: Sensor[] = [
  { 
    id: '1', 
    name: 'Flood Sensor 1', 
    type: 'flood', 
    location: { lat: 18.5204, lng: 73.8567 }, 
    status: 'normal',
    severity: 0,
    lastReading: 0,
    peopleKilled: 0,
    lastUpdated: new Date().toISOString()
  },
  { 
    id: '2', 
    name: 'Earthquake Sensor 1', 
    type: 'earthquake', 
    location: { lat: 18.5304, lng: 73.8667 }, 
    status: 'normal',
    severity: 0,
    lastReading: 0,
    peopleKilled: 0,
    lastUpdated: new Date().toISOString()
  }
];

const mockNGOs: NGO[] = [
  { 
    id: '1', 
    name: 'Flood Rescue Team', 
    specialization: 'flood',
    walletAddress: '0x123...abc',
    phone: '+1234567890',
    email: 'flood@rescue.org',
    location: { lat: 18.5204, lng: 73.8567 }
  },
  { 
    id: '2', 
    name: 'Earthquake Response', 
    specialization: 'earthquake',
    walletAddress: '0x456...def',
    phone: '+1987654321',
    email: 'eq@response.org',
    location: { lat: 18.5304, lng: 73.8667 }
  }
];

const mockEvents: DisasterEvent[] = [
  { 
    id: '1', 
    sensorId: '1',
    type: 'flood', 
    location: { lat: 18.5204, lng: 73.8567 }, 
    severity: 8,
    damageDone: 50000,
    peopleKilled: 2,
    timestamp: new Date().toISOString(),
    fundsReleased: false
  },
  { 
    id: '2', 
    sensorId: '2',
    type: 'earthquake', 
    location: { lat: 18.5304, lng: 73.8667 }, 
    severity: 6,
    damageDone: 25000,
    peopleKilled: 1,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    fundsReleased: true,
    transactionHash: '0x789...xyz'
  }
];

const Dashboard: React.FC = () => {
  const [sensors] = useState<Sensor[]>(mockSensors);
  const [ngos] = useState<NGO[]>(mockNGOs);
  const [events] = useState<DisasterEvent[]>(mockEvents);
  
  // These handlers are kept for future implementation
  const handleReportEvent = () => {
    // TODO: Implement event reporting
    console.log('Report event clicked');
  };
  
  const handleViewNGOs = () => {
    // TODO: Implement NGO view navigation
    console.log('View NGOs clicked');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">Disaster Response Dashboard</h1>
          <p className="text-gray-400">Monitor real-time disaster data and relief efforts</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:-translate-y-1 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-900/30 text-blue-400 mr-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Active Events</p>
                <p className="text-2xl font-bold text-white">
                  {events.filter(e => e.severity >= 5).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/20 hover:-translate-y-1 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-900/30 text-emerald-400 mr-4">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Active NGOs</p>
                <p className="text-2xl font-bold text-white">{ngos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-900/20 hover:-translate-y-1 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-900/30 text-yellow-400 mr-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Funds Raised</p>
                <p className="text-2xl font-bold text-white">$25,430</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20 hover:-translate-y-1 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-900/30 text-purple-400 mr-4">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Active Sensors</p>
                <p className="text-2xl font-bold text-white">
                  {sensors.filter(s => s.status !== 'critical').length}<span className="text-gray-500">/{sensors.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Section */}
            <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Disaster Map</h2>
              </div>
              <div className="h-96 w-full">
                <Map 
                  sensors={sensors} 
                  ngos={ngos} 
                  events={events} 
                  onSensorClick={(sensor) => {
                    // Handle sensor click if needed
                    console.log('Sensor clicked:', sensor);
                  }} 
                />
              </div>
            </div>

            {/* Events Section */}
            <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Recent Events</h2>
              </div>
              <div className="divide-y divide-gray-700">
                {events.map(event => (
                  <div key={event.id} className="p-6 hover:bg-gray-750/50 transition-colors duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            event.type === 'flood' 
                              ? 'bg-blue-900/30 text-blue-400' 
                              : 'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </span>
                          <span className="ml-3 text-sm text-gray-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-white">
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)} Event Detected
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2 items-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-700/50 text-gray-300">
                            Severity: <span className="ml-1 font-bold">{event.severity}/10</span>
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-700/50 text-gray-300">
                            Casualties: <span className="ml-1 font-bold">{event.peopleKilled}</span>
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-700/50 text-gray-300">
                            Damage: <span className="ml-1 font-bold">${event.damageDone.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                          event.fundsReleased 
                            ? 'bg-emerald-900/30 text-emerald-400' 
                            : 'bg-yellow-900/30 text-yellow-400'
                        }`}>
                          {event.fundsReleased ? 'Funds Released' : 'Funding Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sensors */}
            <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Connected Sensors</h2>
              </div>
              <div className="divide-y divide-gray-700">
                {sensors.map(sensor => (
                  <div key={sensor.id} className="p-4 hover:bg-gray-750/50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">{sensor.name}</h3>
                        <p className="text-sm text-gray-400">{sensor.type}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        sensor.status === 'critical' ? 'bg-red-900/30 text-red-400' :
                        sensor.status === 'warning' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-emerald-900/30 text-emerald-400'
                      }`}>
                        {sensor.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                <button
                  type="button"
                  onClick={handleReportEvent}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
                >
                  Report New Event
                </button>
                <button
                  type="button"
                  onClick={handleViewNGOs}
                  className="w-full flex justify-center py-2.5 px-4 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  View All NGOs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;