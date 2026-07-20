import { Routes, Route } from 'react-router-dom';
import { SoundscapeProvider } from './context/SoundscapeContext';
import { StoreProvider } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProductDetailProvider } from './context/ProductDetailContext';
import { StoreLayout } from './components/StoreLayout';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

export default function App() {
  return (
    <ThemeProvider>
      <SoundscapeProvider>
        <StoreProvider>
          <ToastProvider>
            <ProductDetailProvider>
              <StoreLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                </Routes>
              </StoreLayout>
            </ProductDetailProvider>
          </ToastProvider>
        </StoreProvider>
      </SoundscapeProvider>
    </ThemeProvider>
  );
}
