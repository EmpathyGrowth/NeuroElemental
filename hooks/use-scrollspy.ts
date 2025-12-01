'use client';

import * as React from 'react';

interface ScrollspyOptions {
  /**
   * IDs of elements to track
   */
  ids: string[];
  /**
   * Offset from top of viewport (useful for fixed headers)
   */
  offset?: number;
  /**
   * Root element to observe within (defaults to viewport)
   */
  root?: Element | null;
  /**
   * Threshold for intersection (0-1)
   */
  threshold?: number;
}

interface ScrollspyReturn {
  /**
   * Currently active section ID
   */
  activeId: string | null;
  /**
   * All visible section IDs
   */
  visibleIds: string[];
  /**
   * Scroll to a specific section
   */
  scrollTo: (id: string, behavior?: ScrollBehavior) => void;
}

/**
 * useScrollspy - Track which section is currently in view
 */
export function useScrollspy({
  ids,
  offset = 0,
  root = null,
  threshold = 0.3,
}: ScrollspyOptions): ScrollspyReturn {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [visibleIds, setVisibleIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible: string[] = [];

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.push(entry.target.id);
          }
        });

        setVisibleIds((prev) => {
          const newVisible = [...prev];
          entries.forEach((entry) => {
            const index = newVisible.indexOf(entry.target.id);
            if (entry.isIntersecting && index === -1) {
              newVisible.push(entry.target.id);
            } else if (!entry.isIntersecting && index !== -1) {
              newVisible.splice(index, 1);
            }
          });
          return newVisible;
        });

        // Determine the most relevant active section
        const visibleElements = elements.filter((el) =>
          entries.some((e) => e.target === el && e.isIntersecting)
        );

        if (visibleElements.length > 0) {
          // Use the first visible element based on original order
          const firstVisible = ids.find((id) =>
            visibleElements.some((el) => el.id === id)
          );
          if (firstVisible) {
            setActiveId(firstVisible);
          }
        }
      },
      {
        root,
        rootMargin: `-${offset}px 0px -50% 0px`,
        threshold,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [ids, offset, root, threshold]);

  const scrollTo = React.useCallback(
    (id: string, behavior: ScrollBehavior = 'smooth') => {
      const element = document.getElementById(id);
      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior });
      }
    },
    [offset]
  );

  return { activeId, visibleIds, scrollTo };
}

/**
 * useScrollProgress - Track scroll progress through a page or element
 */
export function useScrollProgress(elementRef?: React.RefObject<HTMLElement>): number {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (elementRef?.current) {
        const element = elementRef.current;
        const { scrollTop, scrollHeight, clientHeight } = element;
        const scrollableHeight = scrollHeight - clientHeight;
        setProgress(scrollableHeight > 0 ? scrollTop / scrollableHeight : 0);
      } else {
        const scrollTop = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0);
      }
    };

    const target = elementRef?.current || window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [elementRef]);

  return progress;
}

/**
 * useScrollDirection - Detect scroll direction
 */
export function useScrollDirection(): 'up' | 'down' | null {
  const [direction, setDirection] = React.useState<'up' | 'down' | null>(null);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setDirection('up');
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return direction;
}

/**
 * useInView - Check if element is in viewport
 */
export function useInView(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0,
        ...options,
      }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [ref, options]);

  return isInView;
}

/**
 * useScrollTo - Smooth scroll utility
 */
export function useScrollTo() {
  const scrollToElement = React.useCallback(
    (elementOrId: string | HTMLElement, offset = 0, behavior: ScrollBehavior = 'smooth') => {
      const element =
        typeof elementOrId === 'string'
          ? document.getElementById(elementOrId)
          : elementOrId;

      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior });
      }
    },
    []
  );

  const scrollToTop = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({ top: 0, behavior });
  }, []);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior,
    });
  }, []);

  return { scrollToElement, scrollToTop, scrollToBottom };
}
