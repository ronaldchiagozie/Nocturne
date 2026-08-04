import { Link } from 'react-router-dom';
import { FORMULATION_COUNT_WORD } from '../data/brand';

export function AboutPage() {
  return (
    <main className="bg-cream text-canvas min-h-screen">
      <section className="px-5 sm:px-8 md:px-12 pt-10 sm:pt-16 md:pt-24 lg:pt-28 pb-10 sm:pb-14 md:pb-20">
        <div className="mx-auto max-w-[34rem] text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-taupe-muted mb-4 sm:mb-0 sm:hidden">
            About
          </p>
          <p className="font-sans text-[14px] sm:text-sm text-canvas tracking-tight">
            Compounded. Intimate. Enduring.
          </p>

          <div className="mt-7 sm:mt-12 space-y-5 sm:space-y-6 font-sans text-[14px] sm:text-sm text-canvas/90 leading-[1.7]">
            <p>
              Founded in Lagos, Nocturne is an extrait house built on restraint —{' '}
              {FORMULATION_COUNT_WORD} formulations, each distilled for a different hour of the
              night.
            </p>
            <p>
              We compound in small batches from our Lekki atelier. No filler, no excess. Just
              extrait de parfum worn close to the skin, compounded to order and shipped when
              ready.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center mt-8 sm:mt-12 min-h-[44px] font-sans text-[14px] sm:text-sm text-canvas underline underline-offset-[5px] decoration-canvas/35 hover:decoration-canvas transition-colors"
          >
            Explore Nocturne
          </Link>
        </div>
      </section>

      <section className="w-full">
        <img
          src="/heroimage2.png"
          alt="Nocturne extrait compounded in the atelier"
          className="w-full h-auto object-cover aspect-[4/3] sm:aspect-[16/7] md:aspect-[16/5.5]"
          loading="lazy"
          decoding="async"
          width={1600}
          height={700}
        />
      </section>
    </main>
  );
}
