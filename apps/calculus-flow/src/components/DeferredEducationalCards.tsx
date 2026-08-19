import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const EducationalCards = lazy(() => import('./EducationalCards'));

export default function DeferredEducationalCards() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { rootMargin: '500px 0px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sentinelRef} aria-busy={shouldLoad ? undefined : true}>
      {shouldLoad && (
        <Suspense fallback={<p className="reference-loading">Loading calculus reference…</p>}>
          <EducationalCards />
        </Suspense>
      )}
    </div>
  );
}
