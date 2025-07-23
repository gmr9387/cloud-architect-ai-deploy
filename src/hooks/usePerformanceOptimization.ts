import { useCallback, useMemo, useRef, useEffect } from 'react';

// Performance optimization hooks for React components

/**
 * Debounce hook for expensive operations
 */
export const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Throttle hook for high-frequency events
 */
export const useThrottle = (callback: (...args: any[]) => void, delay: number) => {
  const lastExecuted = useRef<number>(0);

  const throttledCallback = useCallback((...args: any[]) => {
    const now = Date.now();
    
    if (now - lastExecuted.current >= delay) {
      callback(...args);
      lastExecuted.current = now;
    }
  }, [callback, delay]);

  return throttledCallback;
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (
  threshold: number = 0.1,
  rootMargin: string = '0px'
) => {
  const targetRef = useRef<HTMLElement>(null);
  const isIntersecting = useRef<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting.current = entry.isIntersecting;
      },
      { threshold, rootMargin }
    );

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [threshold, rootMargin]);

  return { targetRef, isIntersecting: isIntersecting.current };
};

/**
 * Memoized calculation hook
 */
export const useMemoizedCalculation = <T>(
  calculation: () => T,
  dependencies: any[]
): T => {
  return useMemo(calculation, dependencies);
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitoring = (componentName: string) => {
  const renderStart = useRef<number>(performance.now());

  useEffect(() => {
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart.current;
    
    if (renderTime > 16) { // More than one frame (60fps)
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }
    
    renderStart.current = performance.now();
  });

  const measureFunction = useCallback((fn: () => void, operationName: string) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${componentName}.${operationName} took ${(end - start).toFixed(2)}ms`);
  }, [componentName]);

  return { measureFunction };
};