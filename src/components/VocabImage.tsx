import { useState } from 'react';
import { Utensils } from 'lucide-react';

interface VocabImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function VocabImage({ src, alt, className = '', fallbackLabel }: VocabImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-slate-50 to-emerald-50 text-slate-500 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-8 h-8 mb-1.5 text-amber-500" />
        {fallbackLabel && (
          <span className="text-xs font-semibold text-slate-600">{fallbackLabel}</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
