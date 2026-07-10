import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NoteItem } from '../types';

gsap.registerPlugin(ScrollTrigger);

const NOTES: NoteItem[] = [
  { id: 'oud', name: 'Oud', weight: '250g', category: 'aged resinous', percentage: '40%', description: '' },
  { id: 'bitter-orange', name: 'Bitter orange', weight: '120g', category: 'cold-pressed rind', percentage: '25%', description: '' },
  { id: 'black-pepper', name: 'Black pepper', weight: '85g', category: 'cracked spice', percentage: '15%', description: '' },
  { id: 'cedarwood', name: 'Cedarwood', weight: '60g', category: 'dry timber', percentage: '12%', description: '' },
  { id: 'ambergris', name: 'Ambergris', weight: '35g', category: 'mineral salt', percentage: '8%', description: '' },
];

interface FormulaSheetProps {
  onCheckout: () => void;
}

export function FormulaSheet({ onCheckout }: FormulaSheetProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const highlightRow = (idx: number) => {
    setActiveIdx(idx);
    rowRefs.current.forEach((row, i) => {
      if (!row) return;
      gsap.to(row, {
        color: i === idx ? '#0D0B0A' : '#6B655C',
        duration: 0.4,
        ease: 'power2.out',
      });
    });
  };

  useGSAP(
    () => {
      rowRefs.current.forEach((row, idx) => {
        if (!row) return;
        ScrollTrigger.create({
          trigger: row,
          start: 'top 80%',
          end: 'bottom 20%',
          onEnter: () => highlightRow(idx),
          onEnterBack: () => highlightRow(idx),
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="w-full min-h-screen py-32 md:py-48 px-6 md:px-12 bg-cream"
    >
      <div className="max-w-sm md:max-w-md">
        <p className="font-body-italic italic text-sm md:text-base text-canvas leading-relaxed font-light max-w-xl mb-32 md:mb-48">
          Five notes. One shape you&rsquo;ll recognize on yourself before anyone else does.
        </p>

        <div className="space-y-10 md:space-y-14">
          {NOTES.map((note, idx) => (
            <div
              key={note.id}
              ref={(el) => {
                rowRefs.current[idx] = el;
              }}
              className="cursor-default transition-colors duration-300"
              style={{ color: idx === activeIdx ? '#0D0B0A' : '#6B655C' }}
              onMouseEnter={() => highlightRow(idx)}
            >
              <p className="font-body-italic italic text-sm md:text-base leading-relaxed font-light">
                {note.name}: {note.weight}, {note.category}.
              </p>
              <p className="font-mono text-[10px] tabular-nums mt-2">
                <span className="text-amber-accent">{note.percentage}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-32 md:mt-48">
          <button
            onClick={onCheckout}
            className="group text-left cursor-pointer focus:outline-none"
          >
            <span className="block font-sans text-[10px] uppercase tracking-[0.25em] text-canvas group-hover:text-canvas/80 transition-colors duration-300">
              [ secure a bottle from batch no. 07 ]
            </span>
            <span className="block font-mono text-[11px] tabular-nums text-canvas group-hover:text-canvas/80 transition-colors duration-300 mt-4">
              ₦180,000 / $120 →
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
