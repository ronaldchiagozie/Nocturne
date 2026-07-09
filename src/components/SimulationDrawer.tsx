import React from 'react';
import { SimulatedOrder } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Box, Sparkles, Loader2, Compass } from 'lucide-react';

interface SimulationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: SimulatedOrder[];
  onDeleteOrder: (id: string) => void;
  onAdvanceStatus: (id: string) => void;
}

export const SimulationDrawer: React.FC<SimulationDrawerProps> = ({
  isOpen,
  onClose,
  orders,
  onDeleteOrder,
  onAdvanceStatus,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-canvas/90 z-[99] cursor-pointer backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-[#0E0C0B] border-l border-cream/10 z-[100] shadow-2xl flex flex-col p-6 sm:p-8"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-cream/10 pb-6 mb-6">
              <div>
                <span className="font-mono text-[10px] tracking-widest text-amber-accent uppercase font-bold">
                  Active Batches
                </span>
                <h3 className="font-serif text-lg text-cream mt-0.5">
                  Lab Queue No. 07
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-taupe-muted hover:text-cream cursor-pointer transition-colors p-1.5 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {orders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-taupe-muted">
                    No active compounding tasks
                  </span>
                  <p className="font-body-italic text-sm text-cream/60 italic max-w-xs font-light">
                    “The lab is still. Formulate your personalized bottle of Nocturne No. 07 to initiate the process.”
                  </p>
                </div>
              ) : (
                orders.map((order) => {
                  return (
                    <div
                      key={order.id}
                      className="border border-cream/10 p-5 bg-[#12100F] relative space-y-4 group"
                    >
                      {/* Delete icon */}
                      <button
                        onClick={() => onDeleteOrder(order.id)}
                        className="absolute top-4 right-4 text-taupe-muted hover:text-red-400 transition-colors cursor-pointer p-1"
                        title="Delete batch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Batch code */}
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] bg-cream/10 text-cream px-2 py-0.5 font-bold">
                          {order.id}
                        </span>
                        <span className="font-mono text-[8px] text-taupe-muted uppercase">
                          Added at {order.timestamp}
                        </span>
                      </div>

                      {/* Configuration Details */}
                      <div className="font-mono text-[9px] text-cream/80 space-y-1 bg-canvas/50 p-3 border border-cream/5">
                        <div className="flex justify-between">
                          <span className="text-taupe-muted uppercase">FOR:</span>
                          <span className="text-cream uppercase font-bold">{order.personalization.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-taupe-muted uppercase">IN:</span>
                          <span className="text-cream truncate max-w-[150px]">{order.personalization.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-taupe-muted uppercase">INSCRIPTION:</span>
                          <span className="text-cream truncate max-w-[150px] italic">
                            &ldquo;{order.personalization.message}&rdquo;
                          </span>
                        </div>
                      </div>

                      {/* Simulated interactive status line */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="font-mono text-[8px] uppercase tracking-wider text-taupe-muted">
                            Lab Process:
                          </span>
                          <span className="font-mono text-[8px] uppercase tracking-widest text-amber-accent font-bold">
                            {order.status === 'Received' && '● Received'}
                            {order.status === 'Compounding' && '● Compounding'}
                            {order.status === 'Dispatched' && '● Dispatched'}
                          </span>
                        </div>

                        {/* Status bar */}
                        <div className="h-1 bg-cream/10 w-full rounded-full overflow-hidden flex">
                          <div
                            className={`h-full transition-all duration-500 ${
                              order.status === 'Received' ? 'w-1/3 bg-cream/40' :
                              order.status === 'Compounding' ? 'w-2/3 bg-amber-accent' :
                              'w-full bg-emerald-500'
                            }`}
                          ></div>
                        </div>

                        {/* Action buttons to trigger or advance status */}
                        <div className="flex justify-between items-center pt-2">
                          <button
                            onClick={() => onAdvanceStatus(order.id)}
                            disabled={order.status === 'Dispatched'}
                            className="font-sans text-[8px] uppercase tracking-widest text-cream hover:text-amber-accent disabled:text-taupe-muted transition-colors flex items-center space-x-1.5 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                          >
                            {order.status === 'Received' && (
                              <>
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                <span>Begin compounding</span>
                              </>
                            )}
                            {order.status === 'Compounding' && (
                              <>
                                <Box className="w-2.5 h-2.5" />
                                <span>Dispatch bottle</span>
                              </>
                            )}
                            {order.status === 'Dispatched' && (
                              <>
                                <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                                <span className="text-emerald-500">Formulation Completed</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer summary */}
            {orders.length > 0 && (
              <div className="border-t border-cream/10 pt-6 mt-6 space-y-4 font-mono text-[9px] text-taupe-muted">
                <div className="flex justify-between">
                  <span>TOTAL BATCHES</span>
                  <span className="text-cream">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>DISPATCH METHOD</span>
                  <span className="text-cream">HAND-PACKAGED / INSURED</span>
                </div>
                <p className="font-body-italic text-center italic text-cream/50 pt-2 text-[11px] leading-relaxed">
                  “Nocturne bottles are blended fresh in limited editions. Compounding takes 2-4 hours before dispatch.”
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
