import { useEffect, useState } from 'react';
import { useOpsData } from '@/hooks/useOpsData';
import Navigation from '@/components/Navigation';
import HeroCard from '@/components/HeroCard';
import GateCard from '@/components/GateCard';
import AmenitiesSection from '@/components/AmenitiesSection';
import IncidentTimeline from '@/components/IncidentTimeline';
import AIAssistant from '@/components/AIAssistant';
import IncidentSimulator from '@/components/IncidentSimulator';
import { Loader2 } from 'lucide-react';

// Static gate and amenity metadata
const GATES = [
  { id: 'A', name: 'Gate A', zone: 'North', capacity: 8000 },
  { id: 'B', name: 'Gate B', zone: 'East', capacity: 6000 },
  { id: 'C', name: 'Gate C', zone: 'South', capacity: 7000 },
  { id: 'D', name: 'Gate D', zone: 'West', capacity: 5000 },
];

const AMENITIES = [
  { id: 'R1', type: 'restroom' as const, name: 'Restroom North-1', near_gate: 'A' },
  { id: 'R2', type: 'restroom' as const, name: 'Restroom East-1', near_gate: 'B' },
  { id: 'R3', type: 'restroom' as const, name: 'Restroom South-1', near_gate: 'C' },
  { id: 'R4', type: 'restroom' as const, name: 'Restroom West-1', near_gate: 'D' },
  { id: 'F1', type: 'food' as const, name: 'Food Court North', near_gate: 'A' },
  { id: 'F2', type: 'food' as const, name: 'Food Court East', near_gate: 'B' },
  { id: 'F3', type: 'food' as const, name: 'Food Court South', near_gate: 'C' },
  { id: 'M1', type: 'medical' as const, name: 'Medical Station 1', near_gate: 'A' },
  { id: 'M2', type: 'medical' as const, name: 'Medical Station 2', near_gate: 'C' },
];

export default function Home() {
  const { data, loading, error, lastUpdated, refetch } = useOpsData(5000);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (error && !data) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation onRefresh={refetch} isLive={isOnline} />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold text-red-900 mb-2">Connection Error</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation onRefresh={refetch} isLive={isOnline} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Card */}
        <HeroCard lastUpdated={lastUpdated} isLoading={loading} />

        {/* Loading State */}
        {loading && !data ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading live data...</span>
          </div>
        ) : data ? (
          <>
            {/* Gates Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gates Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {GATES.map((gate, idx) => (
                  <GateCard
                    key={gate.id}
                    gateId={gate.id}
                    gateName={gate.name}
                    zone={gate.zone}
                    capacity={gate.capacity}
                    data={data.gates[gate.id]}
                    index={idx}
                  />
                ))}
              </div>
            </section>

            {/* Amenities Section */}
            <section className="mb-12">
              <AmenitiesSection amenities={AMENITIES} liveData={data.amenities} />
            </section>

            {/* Incidents Section */}
            <section>
              <IncidentTimeline incidents={data.incidents} />
            </section>
          </>
        ) : null}
      </main>

      {/* Floating Components */}
      <AIAssistant />
      <IncidentSimulator />
    </div>
  );
}
