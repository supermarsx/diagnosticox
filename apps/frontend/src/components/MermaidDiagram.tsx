import { useEffect, useId, useRef, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const id = useId().replace(/:/g, '_');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const mermaid = await import('mermaid');
        mermaid.default.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'neutral',
        });
        if (!isMounted || !containerRef.current) return;
        const { svg } = await mermaid.default.render(`m-${id}`, chart);
        containerRef.current.innerHTML = svg;
        setError(null);
      } catch (err: any) {
        console.error('Mermaid render error', err);
        if (isMounted) setError('Unable to render diagram.');
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [chart, id]);

  return (
    <div className="glass-card p-4 rounded-2xl shadow-sm">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      {error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div ref={containerRef} className="overflow-auto" />
      )}
    </div>
  );
}
