import { useEffect, useState } from 'react';

export interface Gate {
  id: string;
  queue_minutes: number;
  density_pct: number;
}

export interface Amenity {
  id: string;
  queue_minutes: number;
}

export interface Incident {
  location: string;
  type: string;
  timestamp: number;
}

export interface OpsStatus {
  gates: Record<string, Gate>;
  amenities: Record<string, Amenity>;
  incidents: Incident[];
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export function useOpsData(refreshInterval: number = 5000) {
  const [data, setData] = useState<OpsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch(`${BACKEND_URL}/ops/status`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const newData = await response.json();
      setData(newData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
}

export async function queryOpsAssistant(question: string): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/ops/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.answer;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Failed to query assistant');
  }
}

export async function triggerIncident(location: string, incidentType: string): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/safety/trigger_incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, incident_type: incidentType }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.response_plan;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Failed to trigger incident');
  }
}
