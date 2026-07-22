import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import {initLenisScroll} from './hooks/useLenis.ts';
import {preloadCriticalImages} from './utils/preloadImages.ts';
import './index.css';

preloadCriticalImages();
initLenisScroll();

document.documentElement.classList.remove('dark');
document.documentElement.style.colorScheme = 'light';
document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ece6d8');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
