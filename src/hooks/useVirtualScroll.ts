import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  scrollingDelay?: number;
}

interface VirtualScrollResult<T> {
  virtualItems: Array<{
    index: number;
    start: number;
    end: number;
    item: T;
  }>;
  totalHeight: number;
  scrollTop: number;
  isScrolling: boolean;
  scrollToIndex: (index: number) => void;
  scrollToTop: () => void;
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
): VirtualScrollResult<T> {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    scrollingDelay = 150,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollElementRef = useRef<HTMLElement | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate visible range
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const total = items.length * itemHeight;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);

    return {
      startIndex: start,
      endIndex: end,
      totalHeight: total,
    };
  }, [items.length, itemHeight, scrollTop, containerHeight, overscan]);

  // Generate virtual items
  const virtualItems = useMemo(() => {
    const result = [];
    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight,
        item: items[i],
      });
    }
    return result;
  }, [items, startIndex, endIndex, itemHeight]);

  // Handle scroll events
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    const newScrollTop = target.scrollTop;
    
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after delay
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, scrollingDelay);
  }, [scrollingDelay]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    if (!scrollElementRef.current) return;
    
    const targetScrollTop = index * itemHeight;
    scrollElementRef.current.scrollTop = targetScrollTop;
    setScrollTop(targetScrollTop);
  }, [itemHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    scrollToIndex(0);
  }, [scrollToIndex]);

  // Set up scroll listener
  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    virtualItems,
    totalHeight,
    scrollTop,
    isScrolling,
    scrollToIndex,
    scrollToTop,
  };
}

// Hook for setting scroll element ref
export function useVirtualScrollElement() {
  const elementRef = useRef<HTMLDivElement>(null);
  
  const setScrollElement = useCallback((element: HTMLDivElement | null) => {
    elementRef.current = element;
  }, []);

  return [elementRef, setScrollElement] as const;
}