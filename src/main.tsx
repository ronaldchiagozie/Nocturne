import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import {initLenisScroll} from './hooks/useLenis.ts';
import {preloadCriticalImages} from './utils/preloadImages.ts';
import './index.css';

preloadCriticalImages();
initLenisScroll();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
