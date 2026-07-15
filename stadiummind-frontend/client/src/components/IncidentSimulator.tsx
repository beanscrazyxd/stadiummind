import { motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { triggerIncident } from '@/hooks/useOpsData';
import { toast } from 'sonner';

export default function IncidentSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGate, setSelectedGate] = useState<string>('A');
  const [selectedType, setSelectedType] = useState<string>('overcrowding');
  const [isLoading, setIsLoading] = useState(false);
  const [responsePlan, setResponsePlan] = useState<string | null>(null);

  const handleTriggerIncident = async () => {
    setIsLoading(true);
    try {
      const plan = await triggerIncident(selectedGate, selectedType);
      setResponsePlan(plan);
      toast.success('Incident triggered successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to trigger incident');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-premium-lg flex items-center justify-center transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AlertTriangle className="w-6 h-6" />
      </motion.button>

      {/* Floating Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-24 left-6 w-80 bg-white rounded-3xl border border-gray-200 shadow-premium-lg overflow-hidden ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 shadow-premium">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Incident Simulator
          </h3>
          <p className="text-xs opacity-90">For demo & testing purposes</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Gate Selection */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Select Gate
            </label>
            <Select value={selectedGate} onValueChange={setSelectedGate} disabled={isLoading}>
              <SelectTrigger className="w-full rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Gate A (North)</SelectItem>
                <SelectItem value="B">Gate B (East)</SelectItem>
                <SelectItem value="C">Gate C (South)</SelectItem>
                <SelectItem value="D">Gate D (West)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Incident Type Selection */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Incident Type
            </label>
            <Select value={selectedType} onValueChange={setSelectedType} disabled={isLoading}>
              <SelectTrigger className="w-full rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overcrowding">Overcrowding</SelectItem>
                <SelectItem value="medical">Medical Emergency</SelectItem>
                <SelectItem value="security">Security Threat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trigger Button */}
          <Button
            onClick={handleTriggerIncident}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-2xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Triggering...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Trigger Incident
              </>
            )}
          </Button>

          {/* Response Plan */}
          {responsePlan && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl"
            >
              <p className="text-xs font-semibold text-red-700 mb-2">Response Plan:</p>
              <p className="text-sm text-red-600 leading-relaxed">{responsePlan}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}
