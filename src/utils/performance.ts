// Performance monitoring utilities
// Track key metrics and provide performance insights

interface PerformanceMetrics {
  bundleSize?: number;
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  timeToInteractive?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    domContentLoaded: 0,
  };

  constructor() {
    this.initializeMetrics();
    this.observeWebVitals();
  }

  private initializeMetrics() {
    // Basic timing metrics
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
    }
  }

  private observeWebVitals() {
    if (typeof window === 'undefined') return;

    // Observe LCP (Largest Contentful Paint)
    this.observeLCP();
    
    // Observe FID (First Input Delay)
    this.observeFID();
    
    // Observe CLS (Cumulative Layout Shift)
    this.observeCLS();
  }

  private observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.largestContentfulPaint = lastEntry.startTime;
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }
  }

  private observeFID() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
      });
    });

    try {
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported
    }
  }

  private observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.cumulativeLayoutShift = clsValue;
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // CLS not supported
    }
  }

  // Bundle size tracking
  trackBundleSize() {
    if (typeof window === 'undefined') return;

    // Estimate bundle size from loaded resources
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalSize = 0;

    resources.forEach((resource) => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        totalSize += resource.transferSize || 0;
      }
    });

    this.metrics.bundleSize = totalSize;
    return totalSize;
  }

  // Performance score calculation
  calculatePerformanceScore(): number {
    const { largestContentfulPaint, firstInputDelay, cumulativeLayoutShift, loadTime } = this.metrics;
    
    let score = 100;

    // LCP scoring (good: <2.5s, needs improvement: 2.5s-4s, poor: >4s)
    if (largestContentfulPaint) {
      if (largestContentfulPaint > 4000) score -= 30;
      else if (largestContentfulPaint > 2500) score -= 15;
    }

    // FID scoring (good: <100ms, needs improvement: 100ms-300ms, poor: >300ms)
    if (firstInputDelay) {
      if (firstInputDelay > 300) score -= 25;
      else if (firstInputDelay > 100) score -= 10;
    }

    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (cumulativeLayoutShift) {
      if (cumulativeLayoutShift > 0.25) score -= 20;
      else if (cumulativeLayoutShift > 0.1) score -= 10;
    }

    // Load time scoring
    if (loadTime > 3000) score -= 15;
    else if (loadTime > 1000) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  // Get all metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Log performance insights
  logInsights() {
    const score = this.calculatePerformanceScore();
    const bundleSize = this.trackBundleSize();

    console.group('🚀 Performance Insights');
    console.log('Performance Score:', score);
    console.log('Bundle Size:', bundleSize ? `${(bundleSize / 1024).toFixed(2)} KB` : 'Unknown');
    console.log('Metrics:', this.getMetrics());
    
    // Provide recommendations
    if (score < 70) {
      console.warn('Performance needs improvement. Consider:');
      if (this.metrics.largestContentfulPaint && this.metrics.largestContentfulPaint > 2500) {
        console.warn('- Optimize LCP by reducing image sizes and improving server response times');
      }
      if (this.metrics.firstInputDelay && this.metrics.firstInputDelay > 100) {
        console.warn('- Reduce FID by optimizing JavaScript execution and using code splitting');
      }
      if (this.metrics.cumulativeLayoutShift && this.metrics.cumulativeLayoutShift > 0.1) {
        console.warn('- Improve CLS by setting dimensions for images and avoiding dynamic content insertion');
      }
    }
    
    console.groupEnd();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for React components
export const usePerformanceMetrics = () => {
  const getMetrics = () => performanceMonitor.getMetrics();
  const getScore = () => performanceMonitor.calculatePerformanceScore();
  const getBundleSize = () => performanceMonitor.trackBundleSize();

  return {
    getMetrics,
    getScore,
    getBundleSize,
    logInsights: () => performanceMonitor.logInsights(),
  };
};

// Utility functions for optimization
export const optimizationUtils = {
  // Debounce function for performance
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number): T => {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    }) as T;
  },

  // Throttle function for performance
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number): T => {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  },

  // Image lazy loading observer
  createImageObserver: (callback: (entries: IntersectionObserverEntry[]) => void) => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null;
    }

    return new IntersectionObserver(callback, {
      rootMargin: '50px 0px',
      threshold: 0.01,
    });
  },
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window !== 'undefined') {
    // Create global performance monitor instance
    window.__performanceMonitor = new PerformanceMonitor();
    
    // Register service worker for performance caching
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(error => {
        console.warn('Service Worker registration failed:', error);
      });
    }
    
    console.log('Performance monitoring initialized');
  }
};