import { motion } from 'framer-motion';
import { Coffee, Heart, Droplet } from 'lucide-react';
import { Amenity } from '@/hooks/useOpsData';

interface AmenityData {
  id: string;
  type: 'restroom' | 'food' | 'medical';
  name: string;
  near_gate: string;
}

interface AmenitiesSectionProps {
  amenities: AmenityData[];
  liveData: Record<string, Amenity>;
}

export default function AmenitiesSection({ amenities, liveData }: AmenitiesSectionProps) {
  const getAmenityIcon = (type: string) => {
    switch (type) {
      case 'restroom':
        return <Droplet className="w-5 h-5" />;
      case 'food':
        return <Coffee className="w-5 h-5" />;
      case 'medical':
        return <Heart className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getAmenityColor = (type: string) => {
    switch (type) {
      case 'restroom':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'food':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'medical':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'restroom':
        return 'Restroom';
      case 'food':
        return 'Food';
      case 'medical':
        return 'Medical';
      default:
        return type;
    }
  };

  const groupedAmenities = {
    restroom: amenities.filter((a) => a.type === 'restroom'),
    food: amenities.filter((a) => a.type === 'food'),
    medical: amenities.filter((a) => a.type === 'medical'),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>

      <div className="space-y-6">
        {Object.entries(groupedAmenities).map(([type, items]) => (
          <div key={type}>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className={`p-2 rounded-lg ${getAmenityColor(type)}`}>
                {getAmenityIcon(type)}
              </span>
              {getTypeLabel(type)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((amenity, idx) => {
                const data = liveData[amenity.id];
                const queueMinutes = data?.queue_minutes || 0;

                return (
                  <motion.div
                    key={amenity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -2 }}
                    className={`${getAmenityColor(type)} border rounded-2xl p-4 transition-all duration-300 shadow-premium hover:shadow-premium-lg`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{amenity.name}</h4>
                      <span className="text-xs font-bold">{queueMinutes}m</span>
                    </div>
                    <p className="text-xs opacity-75">Near Gate {amenity.near_gate}</p>
                    <div className="mt-3 pt-3 border-t border-current/10">
                      <div className="w-full h-1.5 bg-current/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((queueMinutes / 20) * 100, 100)}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full bg-current/60 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
