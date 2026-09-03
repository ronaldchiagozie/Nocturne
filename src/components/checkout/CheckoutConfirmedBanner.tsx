import { motion } from 'motion/react';

interface CheckoutStreamBannerProps {
  orderId: string;
  holder: string;
}

function buildStreamPhrase(orderId: string, holder: string, compact: boolean) {
  const name = holder.trim().toUpperCase() || 'ALLOCATED';
  if (compact) {
    const shortId = orderId.length > 10 ? `${orderId.slice(0, 10)}…` : orderId;
    return `ORDER SECURED · ${shortId} · ${name} · NOCTURNE LAGOS · `;
  }
  return `ORDER SECURED · BATCH ALLOCATED · ${orderId} · ${name} · NOCTURNE ATELIER LAGOS · STATUS: RECEIVED · COMPOUNDING QUEUED · `;
}

export function CheckoutStreamBanner({ orderId, holder }: CheckoutStreamBannerProps) {
  const phraseDesktop = buildStreamPhrase(orderId, holder, false);
  const phraseMobile = buildStreamPhrase(orderId, holder, true);
  const loopDesktop = `${phraseDesktop}${phraseDesktop}${phraseDesktop}`;
  const loopMobile = `${phraseMobile}${phraseMobile}${phraseMobile}`;

  return (
    <div className="checkout-stream-banner" aria-hidden>
      <div className="checkout-stream-track checkout-stream-track--mobile">
        <span className="checkout-stream-item checkout-stream-item--mobile">{loopMobile}</span>
        <span className="checkout-stream-item checkout-stream-item--mobile">{loopMobile}</span>
      </div>
      <div className="checkout-stream-track checkout-stream-track--desktop">
        <span className="checkout-stream-item checkout-stream-item--desktop">{loopDesktop}</span>
        <span className="checkout-stream-item checkout-stream-item--desktop">{loopDesktop}</span>
      </div>
    </div>
  );
}

interface CheckoutSecuredStampProps {
  orderId: string;
  allocationDate: string;
  itemCount: number;
}

function formatOrderRef(orderId: string): string {
  const clean = orderId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (clean.length <= 14) return clean;
  return clean.match(/.{1,4}/g)?.join(' · ') ?? clean;
}

export function CheckoutSecuredStamp({
  orderId,
  allocationDate,
  itemCount,
}: CheckoutSecuredStampProps) {
  const orderRef = formatOrderRef(orderId);

  return (
    <motion.div
      initial={false}
      animate={{ scale: 1, opacity: 0.92, rotate: -10 }}
      transition={{
        type: 'spring',
        stiffness: 460,
        damping: 24,
        mass: 0.85,
      }}
      className="checkout-stamp pointer-events-none mx-auto"
    >
      <div className="checkout-stamp-mark border-[3px] sm:border-[4px] lg:border-[5px] xl:border-[6px] border-red-800/70 px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 py-4 sm:py-6 md:py-7 lg:py-9 xl:py-10 text-center">
        <p className="font-mono text-[clamp(0.65rem,2.8vw,1rem)] lg:text-[clamp(0.8rem,1.1vw,1.05rem)] uppercase tracking-[0.14em] sm:tracking-[0.18em] lg:tracking-[0.22em] text-red-800/75 leading-relaxed">
          Order Secured · Batch Allocated
        </p>
        <p className="checkout-stamp-id checkout-stamp-id--compact font-mono uppercase tracking-[0.05em] sm:tracking-[0.08em] text-red-800/85 leading-tight mt-2.5 sm:mt-4 tabular-nums lg:hidden">
          {orderRef}
        </p>
        <p className="checkout-stamp-id checkout-stamp-id--full hidden lg:block font-mono uppercase tracking-[0.06em] xl:tracking-[0.08em] text-red-800/85 leading-tight mt-3 xl:mt-4 tabular-nums break-all">
          {orderId}
        </p>
        <p className="font-mono text-[clamp(0.65rem,2.5vw,1rem)] lg:text-[clamp(0.75rem,1vw,1rem)] uppercase tracking-[0.14em] sm:tracking-[0.18em] lg:tracking-[0.22em] text-red-800/60 mt-2.5 sm:mt-4 lg:mt-5">
          {allocationDate} · {itemCount} bottle{itemCount === 1 ? '' : 's'}
        </p>
      </div>
    </motion.div>
  );
}
