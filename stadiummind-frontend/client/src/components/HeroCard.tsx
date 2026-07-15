import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface HeroCardProps {
  lastUpdated: Date | null;
  isLoading: boolean;
}

export default function HeroCard({ lastUpdated, isLoading }: HeroCardProps) {
  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-8 mb-8 shadow-premium"
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-10 blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Operations Command Center
            </h2>
            <p className="text-gray-600">
              MetLife Stadium (Demo) — FIFA World Cup 2026
            </p>
          </div>
          <div className="flex gap-2">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow-premium"
            >
              🔴 Live Event
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* AI Status */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                AI Status
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900">Ready</p>
            <p className="text-xs text-gray-500">All systems operational</p>
          </div>

          {/* Current Venue */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Venue
            </span>
            <p className="text-lg font-bold text-gray-900">MetLife Stadium</p>
            <p className="text-xs text-gray-500">New Jersey, USA</p>
          </div>

          {/* Last Updated */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Last Updated
            </span>
            <p className="text-lg font-bold text-gray-900">
              {isLoading ? 'Syncing...' : formatTime(lastUpdated)}
            </p>
            <p className="text-xs text-gray-500">Real-time data feed</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
