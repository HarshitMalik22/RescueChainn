import { supabase } from './supabase';
import { Sensor, NGO, DisasterEvent } from '../types';

// Fetch sensors from Supabase
export const fetchSensors = async (): Promise<Sensor[]> => {
  try {
    const { data, error } = await supabase
      .from('sensors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(sensor => ({
      id: sensor.id,
      name: sensor.name,
      type: sensor.type,
      location: {
        lat: parseFloat(sensor.location_lat),
        lng: parseFloat(sensor.location_lng)
      },
      status: sensor.status,
      severity: sensor.severity,
      lastReading: sensor.last_reading,
      peopleKilled: sensor.people_killed,
      lastUpdated: sensor.last_updated
    }));
  } catch (error) {
    console.error('Error fetching sensors:', error);
    return [];
  }
};

// Fetch NGOs from Supabase
export const fetchNGOs = async (): Promise<NGO[]> => {
  try {
    const { data, error } = await supabase
      .from('ngos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(ngo => ({
      id: ngo.id,
      name: ngo.name,
      specialization: ngo.specialization,
      walletAddress: ngo.wallet_address,
      phone: ngo.phone,
      email: ngo.email,
      location: {
        lat: parseFloat(ngo.location_lat),
        lng: parseFloat(ngo.location_lng)
      }
    }));
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    return [];
  }
};

// Fetch disaster events from Supabase
export const fetchDisasterEvents = async (): Promise<DisasterEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('disaster_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(event => ({
      id: event.id,
      sensorId: event.sensor_id,
      type: event.type,
      severity: event.severity,
      damageDone: event.damage_done,
      peopleKilled: event.people_killed,
      timestamp: event.created_at,
      location: {
        lat: parseFloat(event.location_lat),
        lng: parseFloat(event.location_lng)
      },
      fundsReleased: event.funds_released,
      transactionHash: event.transaction_hash
    }));
  } catch (error) {
    console.error('Error fetching disaster events:', error);
    return [];
  }
};

// Create a new disaster event
export const createDisasterEvent = async (event: Omit<DisasterEvent, 'id'>): Promise<DisasterEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('disaster_events')
      .insert({
        sensor_id: event.sensorId,
        type: event.type,
        severity: event.severity,
        damage_done: event.damageDone,
        people_killed: event.peopleKilled,
        location_lat: event.location.lat,
        location_lng: event.location.lng,
        funds_released: event.fundsReleased,
        transaction_hash: event.transactionHash
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      sensorId: data.sensor_id,
      type: data.type,
      severity: data.severity,
      damageDone: data.damage_done,
      peopleKilled: data.people_killed,
      timestamp: data.created_at,
      location: {
        lat: parseFloat(data.location_lat),
        lng: parseFloat(data.location_lng)
      },
      fundsReleased: data.funds_released,
      transactionHash: data.transaction_hash
    };
  } catch (error) {
    console.error('Error creating disaster event:', error);
    return null;
  }
};

// Update sensor status
export const updateSensorStatus = async (
  sensorId: string, 
  status: 'normal' | 'warning' | 'critical',
  severity: number,
  lastReading: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('sensors')
      .update({
        status,
        severity,
        last_reading: lastReading,
        last_updated: new Date().toISOString()
      })
      .eq('id', sensorId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating sensor status:', error);
    return false;
  }
};