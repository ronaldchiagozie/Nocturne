import React, { useState } from 'react';
import { Ingredient } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// Import local generated images securely
import woodImg from '../assets/images/nocturne_wood_1783603381395.jpg';
import citrusImg from '../assets/images/nocturne_citrus_1783603396739.jpg';
import pepperImg from '../assets/images/nocturne_pepper_1783603428459.jpg';

const INGREDIENTS: Ingredient[] = [
  {
    id: 'oud',
    name: 'Oud',
    weight: '250g',
    category: 'Aged resinous',
    description: 'A deep, oil-dense agarwood harvested from old mineral forests. It burns slowly, releasing a dense, dark smoke that anchors the formula.',
    imageUrl: woodImg,
  },
  {
    id: 'bitter-orange',
    name: 'Bitter Orange',
    weight: '120g',
    category: 'Cold-pressed rind',
    description: 'Stripped of typical citrus sweetness. Exposes the bone-dry, citric oil of the orange rind, creating a sharp opening that immediately dissipates.',
    imageUrl: citrusImg,
  },
  {
    id: 'black-pepper',
    name: 'Black Pepper',
    weight: '85g',
    category: 'Cracked spice',
    description: 'Black pepper crushed under weight. A sharp, hot spice note that breaks the quietness of the wood, introducing a dry texture.',
    imageUrl: pepperImg,
  },
];

export const IngredientSection: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  return (
    <section className="w-full min-screen py-32 px-6 md:px-12 flex flex-col justify-center select-none bg-canvas border-t border-cream/5">
      <div className="max-w-5xl mx-auto w-full">
        {/* Section Label */}
        <div className="mb-12 flex justify-between items-baseline">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted">
            Section 02 // Ingredients
          </span>
          <span className="font-mono text-[10px] text-taupe-muted">
            [03 Raw Elements]
          </span>
        </div>

        {/* Big quiet heading */}
        <h2 className="font-serif text-3xl md:text-5xl text-cream tracking-tight mb-20 max-w-xl">
          Five notes. One shape you’ll recognize on yourself before anyone else does.
        </h2>

        {/* Master layout: Left side images, right side description switcher */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          
          {/* Left: The plain product macro photo representation */}
          <div className="relative aspect-square w-full bg-[#12100E] border border-cream/5 overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedIdx}
                src={INGREDIENTS[selectedIdx].imageUrl}
                alt={INGREDIENTS[selectedIdx].name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.1] grayscale hover:grayscale-0 transition-all duration-700"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
              />
            </AnimatePresence>
            
            {/* Minimal overlay labels on image */}
            <div className="absolute bottom-4 left-4 font-mono text-[10px] tracking-wider text-cream/70 bg-canvas/60 px-2 py-1 backdrop-blur-xs">
              {INGREDIENTS[selectedIdx].name} // {INGREDIENTS[selectedIdx].weight}
            </div>
          </div>

          {/* Right: Detailed interactive list */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="flex flex-col space-y-6">
              {INGREDIENTS.map((item, idx) => {
                const isActive = idx === selectedIdx;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedIdx(idx)}
                    className="text-left py-4 border-b border-cream/10 focus:outline-none cursor-pointer group flex justify-between items-baseline"
                  >
                    <div>
                      <span className="font-serif text-xl tracking-tight text-cream group-hover:text-amber-accent transition-colors duration-300">
                        {item.name}
                      </span>
                      <span className="ml-3 font-mono text-[9px] uppercase tracking-widest text-taupe-muted">
                        {item.category}
                      </span>
                    </div>
                    <span className={`font-mono text-[10px] transition-colors duration-300 ${isActive ? 'text-amber-accent' : 'text-taupe-muted group-hover:text-cream'}`}>
                      {isActive ? '● active' : `0${idx + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quiet italicized description box */}
            <div className="min-h-[120px] pt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <p className="font-body-italic text-lg text-cream/90 italic leading-relaxed font-light">
                    “{INGREDIENTS[selectedIdx].description}”
                  </p>
                  <div className="flex space-x-6 text-[10px] uppercase tracking-[0.2em] text-taupe-muted font-sans">
                    <div>
                      Weight: <span className="text-cream font-mono">{INGREDIENTS[selectedIdx].weight}</span>
                    </div>
                    <div>
                      Extraction: <span className="text-cream">{INGREDIENTS[selectedIdx].category}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
