import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { SoundscapeProvider } from './context/SoundscapeContext';
import { StoreProvider } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';
import { ProductDetailProvider } from './context/ProductDetailContext';
import { SiteModalsProvider } from './context/SiteModalsContext';
import { CommandPalette } from './components/CommandPalette';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StoreLayout } from './components/StoreLayout';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';

const ShopPage = lazy(() => import('./pages/ShopPage').then((m) => ({ default: m.ShopPage })));
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
);
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then((m) => ({ default: m.LegalPage })));
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

function RouteFallback() {
  return (
    <div className="min-h-[40dvh] bg-cream flex items-center justify-center">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-taupe-muted">Loading…</p>
    </div>
  );
}

export default function App() {
  return (
    <SoundscapeProvider>
      <StoreProvider>
        <ToastProvider>
          <ProductDetailProvider>
            <SiteModalsProvider>
              <ErrorBoundary>
                <StoreLayout>
                  <ScrollToTop />
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/legal/:topic" element={<LegalPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </StoreLayout>
              </ErrorBoundary>
              <CommandPalette />
            </SiteModalsProvider>
          </ProductDetailProvider>
        </ToastProvider>
      </StoreProvider>
    </SoundscapeProvider>
  );
}
