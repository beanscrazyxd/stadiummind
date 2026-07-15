import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Gate } from '@/hooks/useOpsData';

interface GateCardProps {
  gateId: string;
  gateName: string;
  zone: string;
  capacity: number;
  data: Gate;
  index: number;
}

export default function GateCard({
  gateId,
  gateName,
  zone,
  capacity,
  data,
  index,
}: GateCardProps) {
  const densityPct = data.density_pct;
  const queueMinutes = data.queue_minutes;

  // Determine status color based on density
  const getStatusColor = (pct: number) => {
    if (pct >= 80) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' };
    if (pct >= 60) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' };
    return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100' };
  };

  const status = getStatusColor(densityPct);

  // Simulate trend (in real app, would track history)
  const trend = Math.random() > 0.5 ? 'up' : 'down';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
      whileHover={{ y: -6 }}
      className={`${status.bg} ${status.border} border rounded-3xl p-6 transition-all duration-300 cursor-pointer shadow-premium hover:shadow-premium-lg`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{gateName}</h3>
          <p className="text-sm text-gray-600">{zone} Zone</p>
        </div>
        <div className={`${status.badge} ${status.text} px-3 py-1 rounded-full text-xs font-semibold`}>
          {densityPct}%
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Capacity</span>
          <span className="text-xs font-semibold text-gray-900">
            {Math.floor((densityPct / 100) * capacity).toLocaleString()} / {capacity.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${densityPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full transition-colors ${
              densityPct >= 80
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : densityPct >= 60
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
            }`}
          />
        </div>
      </div>

      {/* Queue & Trend */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 mb-1">Queue Time</p>
          <p className="text-2xl font-bold text-gray-900">{queueMinutes}m</p>
        </div>
        <div className="flex items-center gap-1">
          {trend === 'up' ? (
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-5 h-5 text-red-500" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ y: [0, 2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingDown className="w-5 h-5 text-emerald-500" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200/50">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${
              densityPct >= 80
                ? 'bg-red-500'
                : densityPct >= 60
                ? 'bg-yellow-500'
                : 'bg-emerald-500'
            }`}
          />
          <span className="text-xs font-medium text-gray-600">
            {densityPct >= 80
              ? 'Critical - Intervention needed'
              : densityPct >= 60
              ? 'Caution - Monitor closely'
              : 'Normal - All clear'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
