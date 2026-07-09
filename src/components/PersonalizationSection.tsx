import React, { useState, useEffect } from 'react';
import { PersonalizationConfig, SimulatedOrder } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import bottleImg from '../assets/images/nocturne_bottle_1783603366619.jpg';

interface PersonalizationSectionProps {
  onOrderCreated: (order: SimulatedOrder) => void;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}

export const PersonalizationSection: React.FC<PersonalizationSectionProps> = ({
  onOrderCreated,
  sectionRef,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderedSuccess, setOrderedSuccess] = useState(false);

  // Default current date formatted elegantly
  const [formattedDate, setFormattedDate] = useState('09.07.26');

  useEffect(() => {
    // Standard static date representing our canonical local time, formatted elegantly as Le Labo style (DD.MM.YY)
    setFormattedDate('09.07.26');
  }, []);

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const finalConfig: PersonalizationConfig = {
        name: name.trim() || 'You',
        location: location.trim() || 'London',
        date: formattedDate,
        message: message.trim() || 'Worn after dark.',
      };

      const newOrder: SimulatedOrder = {
        id: `N7-${Math.floor(1000 + Math.random() * 9000)}`,
        personalization: finalConfig,
        qty: 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Received',
      };

      onOrderCreated(newOrder);
      setIsSubmitting(false);
      setOrderedSuccess(true);
      
      // Clear success notification after 5 seconds
      setTimeout(() => {
        setOrderedSuccess(false);
      }, 5000);
    }, 1200);
  };

  // Safe variables for live-rendered label
  const displayName = name.trim() || 'You';
  const displayLocation = location.trim() || 'London';
  const displayMessage = message.trim() || 'Worn after dark.';

  return (
    <section
      ref={sectionRef}
      className="w-full min-h-screen py-32 px-6 md:px-12 bg-canvas flex flex-col justify-center border-t border-cream/5 select-none scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* Section header */}
        <div className="mb-12 flex justify-between items-baseline">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted">
            Section 03 // Compounding
          </span>
          <span className="font-mono text-[10px] text-taupe-muted">
            [Lab Personalization]
          </span>
        </div>

        <h2 className="font-serif text-3xl md:text-5xl text-cream tracking-tight mb-20 max-w-xl">
          A graceful default. Personalized by the hands that formulate it.
        </h2>

        {/* Form and Preview Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
          
          {/* Form Side (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <form onSubmit={handleOrderSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="block font-mono text-[9px] uppercase tracking-widest text-taupe-muted">
                  Recipient name
                </label>
                <input
                  type="text"
                  maxLength={18}
                  placeholder="You"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-cream/20 py-3 text-cream font-mono text-sm tracking-wider focus:outline-none focus:border-amber-accent transition-colors duration-300"
                />
                <span className="text-[9px] font-body-italic text-taupe-muted block italic">
                  Leaves standard default &ldquo;You&rdquo; if omitted.
                </span>
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[9px] uppercase tracking-widest text-taupe-muted">
                  Compounding location
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="London"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent border-b border-cream/20 py-3 text-cream font-mono text-sm tracking-wider focus:outline-none focus:border-amber-accent transition-colors duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[9px] uppercase tracking-widest text-taupe-muted">
                  Custom inscription
                </label>
                <input
                  type="text"
                  maxLength={36}
                  placeholder="Worn after dark."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-transparent border-b border-cream/20 py-3 text-cream font-mono text-sm tracking-wider focus:outline-none focus:border-amber-accent transition-colors duration-300"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full border border-cream/30 text-cream text-[10px] uppercase tracking-[0.25em] py-4 hover:bg-cream hover:text-canvas hover:border-cream transition-all duration-300 font-sans font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <span>Compounding...</span>
                  ) : (
                    <span>Print Label & Compounding No. 07</span>
                  )}
                </button>
              </div>
            </form>

            {/* Success notification */}
            <AnimatePresence>
              {orderedSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 p-4 border border-amber-accent/30 bg-amber-accent/5 flex flex-col space-y-1.5"
                >
                  <span className="font-mono text-[9px] uppercase tracking-widest text-amber-accent font-semibold">
                    [Label Dispatched to Compounding Lab]
                  </span>
                  <p className="font-body-italic text-sm text-cream/80 italic font-light">
                    Your custom-stamped bottle of Nocturne No. 07 has been added to our live formulation batches.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Real-time Visual Apothecary Preview (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-[#110F0E] border border-cream/5 p-8 relative overflow-hidden group">
            {/* Subtle light leak or glow background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-accent/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-accent/15 transition-all duration-700"></div>

            <div className="relative w-full max-w-[340px] aspect-[3/4] flex items-center justify-center">
              {/* Product Bottle */}
              <img
                src={bottleImg}
                alt="Nocturne Bottle Live Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.05]"
              />

              {/* Absolutely positioned label superimposed over the bottle */}
              <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] sm:w-[200px] aspect-[1.3/1] bg-[#F3EFEB] border border-[#DDD5CC] shadow-[0_4px_24px_rgba(0,0,0,0.6)] p-3 text-[#22211F] flex flex-col justify-between select-none">
                {/* Paper texture overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0.05)_100%)] mix-blend-overlay pointer-events-none"></div>

                {/* Header info */}
                <div className="flex justify-between items-baseline border-b border-[#D5CBBF] pb-1.5">
                  <span className="font-mono text-[9px] font-bold tracking-[0.1em] text-[#2C2B29]">
                    NOCTURNE
                  </span>
                  <span className="font-mono text-[7px] text-[#7A7268]">
                    No. 07
                  </span>
                </div>

                {/* Specifics */}
                <div className="space-y-1.5 py-1.5 font-mono text-[7px] text-[#443F38]">
                  <div className="flex justify-between">
                    <span className="text-[#888075]">COMPOUNDED:</span>
                    <span className="font-medium text-[#1A1A18]">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888075]">FOR:</span>
                    <span className="font-bold text-[#1A1A18] uppercase truncate max-w-[110px]">
                      {displayName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888075]">IN:</span>
                    <span className="font-medium text-[#1A1A18] truncate max-w-[110px]">
                      {displayLocation}
                    </span>
                  </div>
                </div>

                {/* Footer dedication */}
                <div className="border-t border-[#D5CBBF] pt-1.5 flex justify-between items-center">
                  <span className="font-body-italic italic text-[7px] text-[#554E44] max-w-[110px] truncate">
                    &ldquo;{displayMessage}&rdquo;
                  </span>
                  <span className="font-mono text-[6px] tracking-widest text-[#9C9488]">
                    50ML / 1.7 FL.OZ
                  </span>
                </div>
              </div>
            </div>

            {/* Quiet instructions under the bottle preview */}
            <div className="mt-4 text-center">
              <span className="font-mono text-[8px] uppercase tracking-widest text-taupe-muted">
                Interactive Compounding Label Simulator
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
