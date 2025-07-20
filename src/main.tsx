import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { performanceMonitor } from './utils/performance.ts'

// Register Service Worker for PWA capabilities
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Initialize performance monitoring
if (process.env.NODE_ENV === 'development') {
  // Log insights in development mode
  setTimeout(() => {
    performanceMonitor.logInsights();
  }, 2000);
}

// Preload critical resources
const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/inter.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload critical images
  const logoImg = new Image();
  logoImg.src = '/logo.svg';
};

// Initialize app with optimizations
preloadCriticalResources();

createRoot(document.getElementById("root")!).render(<App />);
