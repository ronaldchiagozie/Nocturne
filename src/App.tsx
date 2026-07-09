import { useState, useEffect, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { IngredientSection } from './components/IngredientSection';
import { PersonalizationSection } from './components/PersonalizationSection';
import { NotesSection } from './components/NotesSection';
import { SimulationDrawer } from './components/SimulationDrawer';
import { MailingList } from './components/MailingList';
import { SimulatedOrder } from './types';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import our beautiful local product bottle shot
import bottleImg from './assets/images/nocturne_bottle_1783603366619.jpg';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<SimulatedOrder[]>([]);
  const personalizationRef = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const apertureRef = useRef<HTMLDivElement>(null);

  // Load orders from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nocturne_batches');
      if (stored) {
        setOrders(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse batches from localStorage', e);
    }
  }, []);

  // Set up GSAP ScrollTrigger timeline for the pinned viewport layers
  useEffect(() => {
    if (!containerRef.current || !apertureRef.current || !bottleRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1, // Smoothly scrubs the timeline animations with scroll velocity
        },
      });

      // Scale up the aperture mask and simultaneously reduce bottle's opacity over the first 50%
      tl.to(apertureRef.current, {
        scale: 6,
        duration: 0.5,
        ease: 'power2.out',
      }, 0);

      tl.to(bottleRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: 'power2.out',
      }, 0);

      // Create a nice hold state for the second half of the scroll to let the text sink in
      tl.to({}, { duration: 0.5 });
    });

    return () => ctx.revert();
  }, []);

  // Save orders to LocalStorage on change
  const saveOrders = (updatedOrders: SimulatedOrder[]) => {
    setOrders(updatedOrders);
    try {
      localStorage.setItem('nocturne_batches', JSON.stringify(updatedOrders));
    } catch (e) {
      console.error('Failed to save batches to localStorage', e);
    }
  };

  const handleOrderCreated = (newOrder: SimulatedOrder) => {
    const updated = [newOrder, ...orders];
    saveOrders(updated);
    // Give a short delay then open drawer to show current compounding status
    setTimeout(() => {
      setDrawerOpen(true);
    }, 1000);
  };

  const handleDeleteOrder = (id: string) => {
    const updated = orders.filter((o) => o.id !== id);
    saveOrders(updated);
  };

  const handleAdvanceStatus = (id: string) => {
    const updated = orders.map((o) => {
      if (o.id === id) {
        const nextStatus: Record<string, SimulatedOrder['status']> = {
          Received: 'Compounding',
          Compounding: 'Dispatched',
          Dispatched: 'Dispatched',
        };
        return { ...o, status: nextStatus[o.status] };
      }
      return o;
    });
    saveOrders(updated);
  };

  const scrollToPersonalize = () => {
    personalizationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-canvas text-cream selection:bg-amber-accent selection:text-cream flex flex-col font-sans overflow-x-hidden">
      
      {/* Tiny minimalist navigation bar */}
      <Navigation
        onPersonalizeClick={scrollToPersonalize}
        onBatchesClick={() => setDrawerOpen(true)}
        batchCount={orders.length}
      />

      {/* Rebuilt pinned canvas viewport with absolute layering constraints */}
      <div ref={containerRef} className="relative h-[250vh] w-full bg-canvas">
        <div ref={stickyRef} className="w-screen h-screen overflow-hidden sticky top-0 flex items-center justify-center bg-canvas">
          
          {/* Layer 1 (Bottom): The dark background canvas with elegant typography */}
          <div className="absolute inset-0 bg-canvas z-0 flex flex-col justify-between p-6 md:p-12 select-none">
            {/* Background subtle radial gradient to lift the look */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,90,46,0.06)_0%,transparent_70%)] pointer-events-none z-0"></div>
            
            {/* Header Info inside Layer 1 */}
            <div className="relative z-10 flex justify-between items-baseline border-b border-cream/5 pb-4 pt-20">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-taupe-muted">
                NOCTURNE NO. 07
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-taupe-muted">
                EDITION BATCH // FULL EXHIBITION
              </span>
            </div>

            {/* Hero display text centered in Layer 1 */}
            <div className="relative z-10 my-auto text-center space-y-8 max-w-2xl mx-auto flex flex-col items-center justify-center">
              <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight text-cream leading-none font-medium">
                Worn after <br />
                <span className="font-body-italic italic font-normal text-amber-accent">dark.</span>
              </h2>
              <p className="font-body-italic text-lg md:text-xl text-taupe-muted italic leading-relaxed font-light max-w-lg mx-auto">
                &ldquo;A fragrance for the hours no one else sees. No florals, no compliments &mdash; dark, textured, quietly dangerous.&rdquo;
              </p>
              <div className="pt-4">
                <button
                  onClick={scrollToPersonalize}
                  className="group border border-cream/30 text-cream text-[10px] uppercase tracking-[0.25em] px-8 py-4 hover:bg-cream hover:text-canvas hover:border-cream transition-all duration-300 font-sans font-semibold cursor-pointer flex items-center space-x-2"
                >
                  <span>Formulate custom label</span>
                  <span className="group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
                </button>
              </div>
            </div>

            {/* Slogan repetition inside Layer 1 */}
            <div className="relative z-10 pt-8 flex flex-col md:flex-row md:justify-between items-baseline gap-4 border-t border-cream/5 text-[11px]">
              <span className="font-mono text-taupe-muted uppercase tracking-wider">
                [THE REPEATED TRUTH]
              </span>
              <p className="font-sans text-cream/90 font-medium uppercase tracking-[0.15em] max-w-md">
                “One scent. Worn differently by everyone who wears it.”
              </p>
            </div>
          </div>

          {/* Layer 2 (Middle): Centered product bottle */}
          <div
            ref={bottleRef}
            className="absolute inset-0 flex items-center justify-center z-10 p-8 select-none pointer-events-none overflow-hidden"
          >
            <div className="w-full max-w-xs md:max-w-sm aspect-[3/4] flex items-center justify-center relative">
              <img
                src={bottleImg}
                alt="Nocturne Bottle Showcase"
                referrerPolicy="no-referrer"
                sizes="(max-width: 768px) 280px, 384px"
                className="w-full h-full object-contain filter brightness-[0.8] contrast-[1.1] drop-shadow-[0_10px_35px_rgba(0,0,0,0.85)]"
              />
              <div className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-widest text-taupe-muted bg-canvas/80 px-2 py-0.5 backdrop-blur-xs">
                No. 07 Bottle // 50ml
              </div>
            </div>
          </div>

          {/* Layer 3 (Top): The SVG Aperture overlay mask */}
          <div
            ref={apertureRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden"
            style={{ transformOrigin: 'center center' }}
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid slice"
              className="w-full h-full text-canvas fill-current"
            >
              <path
                fillRule="evenodd"
                className="fill-canvas text-canvas"
                d="M 0 0 H 100 V 100 H 0 Z M 50 50 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0"
              />
              {/* Technical Concentric rings indicating mechanical aperture */}
              <circle
                cx="50"
                cy="50"
                r="12.2"
                fill="none"
                stroke="#8A5A2E"
                strokeWidth="0.15"
                opacity="0.8"
              />
              <circle
                cx="50"
                cy="50"
                r="15"
                fill="none"
                stroke="#6B655C"
                strokeWidth="0.08"
                opacity="0.4"
              />
              {/* Delicate mechanical line guides */}
              <line x1="50" y1="38" x2="38" y2="44" stroke="#8A5A2E" strokeWidth="0.08" opacity="0.5" />
              <line x1="38" y1="44" x2="42" y2="58" stroke="#8A5A2E" strokeWidth="0.08" opacity="0.5" />
              <line x1="42" y1="58" x2="58" y2="58" stroke="#8A5A2E" strokeWidth="0.08" opacity="0.5" />
              <line x1="58" y1="58" x2="62" y2="44" stroke="#8A5A2E" strokeWidth="0.08" opacity="0.5" />
              <line x1="62" y1="44" x2="50" y2="38" stroke="#8A5A2E" strokeWidth="0.08" opacity="0.5" />
            </svg>
          </div>

        </div>
      </div>

      {/* Massive whitespace gap and presentation line */}
      <section className="w-full py-40 px-6 md:px-12 flex flex-col justify-center items-center text-center bg-canvas">
        <div className="max-w-xl space-y-8">
          <span className="font-mono text-[9px] uppercase tracking-widest text-taupe-muted">
            THE NEATNESS MANIFESTO
          </span>
          <p className="font-body-italic text-2xl md:text-3xl text-cream/90 italic leading-relaxed font-light">
            We do not manufacture lifestyle dreams or design compliments. We measure precious resins, aged wood shards, and bitter citrus oils. The product is the only subject.
          </p>
        </div>
      </section>

      {/* Interactive Ingredients Block (Section 02) */}
      <IngredientSection />

      {/* Slogan repetition 2: Everyday^ style */}
      <section className="w-full py-24 px-6 md:px-12 bg-[#0E0C0B] border-t border-b border-cream/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <span className="font-mono text-[10px] text-taupe-muted uppercase tracking-widest">
            NOCTURNE ACCENT No. 07
          </span>
          <p className="font-serif text-2xl md:text-3xl text-cream tracking-tight max-w-lg leading-snug">
            “One scent. Worn differently by everyone who wears it.”
          </p>
        </div>
      </section>

      {/* Interactive Personalization Customizer (Section 03) */}
      <PersonalizationSection
        sectionRef={personalizationRef}
        onOrderCreated={handleOrderCreated}
      />

      {/* Composition Analysis Sheet (Section 04) */}
      <NotesSection />

      {/* Interactive Batches drawer containing active simulation */}
      <SimulationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        orders={orders}
        onDeleteOrder={handleDeleteOrder}
        onAdvanceStatus={handleAdvanceStatus}
      />

      {/* Slogan repetition 3: Everyday^ style, closing */}
      <section className="w-full py-32 px-6 md:px-12 bg-canvas flex flex-col justify-center items-center text-center">
        <div className="max-w-2xl space-y-6">
          <span className="font-mono text-[9px] uppercase tracking-widest text-taupe-muted">
            CLOSING REMARKS
          </span>
          <h4 className="font-serif text-3xl md:text-4xl text-cream tracking-tight">
            Nocturne No. 07. Limited batch.
          </h4>
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-cream/75 pt-2">
            “One scent. Worn differently by everyone who wears it.”
          </p>
        </div>
      </section>

      {/* Mailing List subscription */}
      <MailingList />

      {/* Footer */}
      <footer className="w-full py-12 px-6 md:px-12 bg-canvas border-t border-cream/5 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] text-taupe-muted uppercase tracking-widest font-mono">
        <div>
          &copy; 2026 Nocturne Fragrances Ltd.
        </div>
        <div className="flex space-x-6">
          <span>BATCH NO. 07</span>
          <span>ESTABLISHED LONDON</span>
        </div>
      </footer>

    </div>
  );
}
