import { motion } from 'framer-motion';
import { AlertTriangle, Clock } from 'lucide-react';
import { Incident } from '@/hooks/useOpsData';

interface IncidentTimelineProps {
  incidents: Incident[];
}

export default function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  const getIncidentColor = (type: string) => {
    switch (type) {
      case 'overcrowding':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'medical':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'security':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'overcrowding':
        return '👥';
      case 'medical':
        return '🏥';
      case 'security':
        return '🔒';
      default:
        return '⚠️';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (incidents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center shadow-premium"
      >
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-lg font-bold text-emerald-900 mb-2">All Clear</h3>
        <p className="text-emerald-700">No recent incidents detected</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Incidents</h2>

      <div className="space-y-3">
        {incidents.slice(0, 5).map((incident, idx) => (
          <motion.div
            key={`${incident.timestamp}-${idx}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`${getIncidentColor(incident.type)} border rounded-2xl p-4 flex items-start gap-4 shadow-premium hover:shadow-premium-lg transition-all`}
          >
            {/* Icon */}
            <div className="text-2xl flex-shrink-0 mt-1">
              {getIncidentIcon(incident.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm capitalize">
                  {incident.type} at Gate {incident.location}
                </h4>
                <span className="text-xs font-medium flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatTime(incident.timestamp)}
                </span>
              </div>
              <p className="text-xs opacity-75">
                {incident.type === 'overcrowding'
                  ? 'High density detected - staff notified'
                  : incident.type === 'medical'
                  ? 'Medical team dispatched to location'
                  : 'Security team alerted'}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {incidents.length > 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center"
        >
          <p className="text-sm text-gray-600">
            +{incidents.length - 5} more incident{incidents.length - 5 !== 1 ? 's' : ''}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
