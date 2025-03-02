export interface Sensor {
  id: string;
  name: string;
  type: 'flood' | 'earthquake';
  location: {
    lat: number;
    lng: number;
  };
  status: 'normal' | 'warning' | 'critical';
  severity: number;
  lastReading: number;
  peopleKilled: number;
  lastUpdated: string;
}

export interface DisasterEvent {
  id: string;
  sensorId: string;
  type: 'flood' | 'earthquake';
  severity: number;
  damageDone: number;
  peopleKilled: number;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
  };
  fundsReleased: boolean;
  transactionHash?: string;
}

export interface NGO {
  id: string;
  name: string;
  specialization: 'flood' | 'earthquake' | 'both';
  walletAddress: string;
  phone: string;
  email: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'executed' | 'defeated';
  amount: number;
  recipient: string;
  votesFor: number;
  votesAgainst: number;
  createdAt: string;
  expiresAt: string;
}