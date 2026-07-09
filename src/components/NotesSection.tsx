import React from 'react';
import { NoteItem } from '../types';

const NOTES_DATA: NoteItem[] = [
  {
    id: 'oud',
    name: 'Oud (resinous agarwood)',
    intensity: 9,
    character: 'smoky, dark, textured',
    percentage: '40%',
    description: 'The heavyweight base that centers the scent profile. Aged resinous bark, slow-burning and intense.',
  },
  {
    id: 'bitter-orange',
    name: 'Bitter orange (cold-pressed)',
    intensity: 7,
    character: 'citric, bone-dry, sharp',
    percentage: '25%',
    description: 'The opening contrast. A sharp burst of dry rind oils that evaporates instantly, leaving no sweet trace.',
  },
  {
    id: 'black-pepper',
    name: 'Black pepper (cracked)',
    intensity: 6,
    character: 'hot, dry, mineral',
    percentage: '15%',
    description: 'Crushed peppercorns that pierce the dense resin, introducing a warm, textured spice layer.',
  },
  {
    id: 'cedarwood',
    name: 'Cedarwood (dry timber)',
    intensity: 5,
    character: 'woody, dry, cedar-oil',
    percentage: '12%',
    description: 'A clean, structural timber backing that supports the oud and prevents it from turning sweet.',
  },
  {
    id: 'ambergris',
    name: 'Ambergris (mineral salt)',
    intensity: 4,
    character: 'salt, marine, clean-skin',
    percentage: '8%',
    description: 'A quiet, warm ocean-salt undertone that binds the formula to the skin, making it personal.',
  },
];

export const NotesSection: React.FC = () => {
  return (
    <section className="w-full py-32 px-6 md:px-12 bg-canvas border-t border-cream/5 select-none">
      <div className="max-w-5xl mx-auto w-full">
        {/* Section header */}
        <div className="mb-12 flex justify-between items-baseline">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe-muted">
            Section 04 // Composition
          </span>
          <span className="font-mono text-[10px] text-taupe-muted">
            [Lab Breakdown]
          </span>
        </div>

        <h2 className="font-serif text-3xl md:text-5xl text-cream tracking-tight mb-20 max-w-xl">
          Five notes. One shape you&rsquo;ll recognize on yourself before anyone else does.
        </h2>

        {/* Minimal Lab Sheet Container */}
        <div className="border border-cream/10 p-6 md:p-12 space-y-12 bg-[#0F0D0C]">
          {/* Header of the sheet */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cream/10 pb-6 gap-4">
            <div>
              <span className="font-mono text-[10px] tracking-widest text-amber-accent uppercase font-bold">
                Nocturne Formula No. 07
              </span>
              <p className="font-serif italic text-sm text-cream/70 mt-1">
                Batch Analysis Sheet // Verified Composition
              </p>
            </div>
            <div className="font-mono text-[9px] text-taupe-muted text-left md:text-right space-y-0.5">
              <div>EDITION: NO. 07</div>
              <div>COMPOUND VOLUME: 50ML</div>
              <div>DENSITY: 0.874 G/ML</div>
            </div>
          </div>

          {/* Notes list with slider visuals */}
          <div className="space-y-8">
            {NOTES_DATA.map((note, index) => (
              <div key={note.id} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-mono text-[9px] text-taupe-muted">
                      0{index + 1}.
                    </span>
                    <span className="font-sans text-sm font-medium text-cream uppercase tracking-wider">
                      {note.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 font-mono text-[10px]">
                    <span className="text-taupe-muted">CHARACTER: {note.character}</span>
                    <span className="text-amber-accent font-bold">{note.percentage}</span>
                  </div>
                </div>

                {/* Customized slider visual */}
                <div className="h-[2px] bg-cream/10 relative w-full overflow-hidden">
                  <div
                    className="h-full bg-amber-accent"
                    style={{ width: note.percentage }}
                  ></div>
                </div>

                {/* Subtext description in quiet italic serif */}
                <p className="font-body-italic text-sm text-cream/70 italic max-w-2xl font-light pl-4 border-l border-cream/5">
                  &ldquo;{note.description}&rdquo;
                </p>
              </div>
            ))}
          </div>

          {/* Verification stamp */}
          <div className="border-t border-cream/10 pt-8 flex justify-between items-center text-[9px] font-mono text-taupe-muted">
            <span>NOCTURNE LABORATORY GROUP</span>
            <span>VERIFIED IN LONDON, UK</span>
          </div>
        </div>
      </div>
    </section>
  );
};
