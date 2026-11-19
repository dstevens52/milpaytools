'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Renders `children` only once this box comes within `margin` of the viewport (P1 #7,
 * docs/perf/p1-step1-report.md). Used with next/dynamic so a below-the-fold chart's code
 * (recharts, ~90 KB compressed) downloads when the visitor scrolls toward it, not with the page
 * or with a link prefetch. The box keeps its size (className/style) before and after, so nothing
 * shifts. Without IntersectionObserver it renders at once.
 */
export function WhenVisible({
  children,
  className,
  margin = '400px 0px',
}: {
  children: ReactNode;
  className?: string;
  margin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true); // eslint-disable-line react-hooks/set-state-in-effect -- one-time fallback for old browsers
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : null}
    </div>
  );
}
