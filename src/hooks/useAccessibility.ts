import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Screen reader announcements hook
 */
export const useAnnouncement = () => {
  const [announcement, setAnnouncement] = useState<string>('');

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 100);
  }, []);

  return { announcement, announce };
};

/**
 * Focus management hook
 */
export const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement>(null);

  const focusElement = useCallback(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, []);

  return { focusRef, focusElement };
};

/**
 * Reduced motion detection hook
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};