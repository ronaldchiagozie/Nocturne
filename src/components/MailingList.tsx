import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const MailingList: React.FC = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSuccess(true);
      setEmail('');
    }
  };

  return (
    <section className="w-full py-32 px-6 md:px-12 bg-[#0A0908] border-t border-cream/5 flex flex-col justify-center items-center select-none">
      <div className="max-w-md w-full text-center space-y-8">
        <span className="font-mono text-[9px] uppercase tracking-widest text-taupe-muted block">
          BATCH ANNOUNCEMENTS
        </span>
        
        <h3 className="font-serif text-2xl text-cream tracking-tight">
          Limited editions. Released quietly.
        </h3>
        
        <p className="font-body-italic text-sm text-taupe-muted italic leading-relaxed font-light">
          We do not send newsletters or promotional updates. We send one notification when Nocturne No. 08 is compounded.
        </p>

        <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-3 pt-4">
          <input
            type="email"
            required
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent border-b border-cream/20 py-3 text-cream font-mono text-sm focus:outline-none focus:border-amber-accent transition-colors duration-300"
          />
          <button
            type="submit"
            className="border border-cream/30 text-cream text-[9px] uppercase tracking-[0.25em] px-6 py-3 hover:bg-cream hover:text-canvas hover:border-cream transition-all duration-300 font-sans cursor-pointer whitespace-nowrap"
          >
            Notify me
          </button>
        </form>

        <AnimatePresence>
          {success && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[9px] text-amber-accent uppercase tracking-widest pt-2"
            >
              [Email registered. We will write to you once.]
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
