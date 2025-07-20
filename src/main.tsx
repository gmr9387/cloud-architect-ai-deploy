import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { performanceMonitor } from './utils/performance.ts'

// Initialize performance monitoring
if (process.env.NODE_ENV === 'development') {
  // Log insights in development mode
  setTimeout(() => {
    performanceMonitor.logInsights();
  }, 2000);
}

createRoot(document.getElementById("root")!).render(<App />);
