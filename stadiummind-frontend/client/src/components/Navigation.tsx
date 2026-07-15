import { motion } from 'framer-motion';
import { RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  onRefresh: () => void;
  isLive: boolean;
}

export default function Navigation({ onRefresh, isLive }: NavigationProps) {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">⚽</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">StadiumMind</h1>
            <p className="text-xs text-gray-500">Operations Command Center</p>
          </div>
        </div>

        {/* Center: Live Status */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 border border-emerald-200">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-emerald-500"
            />
            <span className="text-sm font-medium text-emerald-700">Live</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Refresh</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-gray-100 transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Profile</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
