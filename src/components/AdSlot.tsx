import { useEffect, useRef } from 'react';

export type AdFormat = 'horizontal' | 'rectangle' | 'vertical' | 'fluid';

interface AdSlotProps {
  slot: string;
  format?: AdFormat;
  className?: string;
  responsive?: boolean;
}

const AD_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || '';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
    _adsenseLoaded?: boolean;
  }
}

function loadAdSenseScript(client: string) {
  if (window._adsenseLoaded) return;
  window._adsenseLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  document.head.appendChild(s);
}

const FORMAT_STYLES: Record<AdFormat, React.CSSProperties> = {
  horizontal: { display: 'block', minHeight: 90, width: '100%' },
  rectangle: { display: 'inline-block', width: 300, height: 250 },
  vertical: { display: 'inline-block', width: 160, height: 600 },
  fluid: { display: 'block', textAlign: 'center' as const },
};

export default function AdSlot({ slot, format = 'horizontal', className = '', responsive = true }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!AD_CLIENT) return;
    loadAdSenseScript(AD_CLIENT);
  }, []);

  useEffect(() => {
    if (!AD_CLIENT || pushed.current) return;
    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // AdSense not loaded or blocked
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!AD_CLIENT) {
    return <AdPlaceholder format={format} className={className} />;
  }

  return (
    <div ref={containerRef} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={FORMAT_STYLES[format]}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={responsive ? 'auto' : undefined}
        data-full-width-responsive={responsive ? 'true' : undefined}
      />
    </div>
  );
}

function AdPlaceholder({ format, className }: { format: AdFormat; className: string }) {
  const heightMap: Record<AdFormat, string> = {
    horizontal: 'h-[90px]',
    rectangle: 'h-[250px] max-w-[300px]',
    vertical: 'h-[600px] max-w-[160px]',
    fluid: 'h-[100px]',
  };

  return (
    <div className={`${heightMap[format]} ${className} rounded-lg border border-dashed border-b2 bg-inset/50 flex items-center justify-center`}>
      <span className="text-[10px] text-t6">广告位</span>
    </div>
  );
}
