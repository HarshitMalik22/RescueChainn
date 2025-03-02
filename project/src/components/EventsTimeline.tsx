import React from 'react';
import { DisasterEvent, NGO } from '../types';
import { Droplets, Activity, ExternalLink } from 'lucide-react';

interface EventsTimelineProps {
  events: DisasterEvent[];
  ngos: NGO[];
}

const EventsTimeline: React.FC<EventsTimelineProps> = ({ events, ngos }) => {
  // Sort events by timestamp, newest first
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getEventIcon = (type: 'flood' | 'earthquake') => {
    return type === 'flood' ? (
      <div className="bg-blue-100 p-2 rounded-full">
        <Droplets className="h-5 w-5 text-blue-500" />
      </div>
    ) : (
      <div className="bg-orange-100 p-2 rounded-full">
        <Activity className="h-5 w-5 text-orange-500" />
      </div>
    );
  };

  const getNGOForEvent = (event: DisasterEvent) => {
    // In a real app, we would have a relationship between events and NGOs
    // For demo purposes, we'll just return the first NGO that specializes in this type of disaster
    return ngos.find(ngo => 
      ngo.specialization === event.type || ngo.specialization === 'both'
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">Recent Events</h2>
        <p className="text-gray-400 mt-1">Timeline of disaster events and responses</p>
      </div>
      
      <div className="p-6">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="inline-block p-3 bg-gray-800 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p>No events recorded yet. Trigger a disaster simulation to see events here.</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {sortedEvents.map((event, eventIdx) => {
                const ngo = getNGOForEvent(event);
                
                return (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== sortedEvents.length - 1 ? (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-700"
                          aria-hidden="true"
                        />
                      ) : null}
                      
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          {getEventIcon(event.type)}
                        </div>
                        
                        <div className="min-w-0 flex-1 py-1.5">
                          <div className="text-sm text-gray-400">
                            <div className="font-medium text-white text-lg">
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)} Event
                              <span className="ml-2 text-sm font-medium text-gray-400">
                                Severity: {event.severity}/10
                              </span>
                            </div>
                            
                            <span className="whitespace-nowrap text-sm">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                            
                            <div className="mt-2 text-sm text-gray-300">
                              <p>
                                Location: {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}
                              </p>
                              
                              {event.fundsReleased && (
                                <div className="mt-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                                  <p className="flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      Funds Released
                                    </span>
                                    {ngo && (
                                      <span className="text-blue-300">to {ngo.name}</span>
                                    )}
                                  </p>
                                  
                                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <p className="text-gray-500">Amount</p>
                                      <p className="font-medium text-white">{(event.severity * 0.1).toFixed(2)} USDC</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">SMS Notification</p>
                                      <p className="font-medium text-green-400">Sent ✓</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {event.transactionHash && (
                                <a
                                  href={`https://mumbai.polygonscan.com/tx/${event.transactionHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 text-blue-400 hover:text-blue-300 inline-flex items-center text-sm"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View Transaction
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsTimeline;