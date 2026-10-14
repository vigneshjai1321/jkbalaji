'use client';

import Image from 'next/image';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { fallbackForRealEstateAsset, resolvePublicAssetUrl } from '@/lib/site-asset-url';

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

function isExternal(url: string) {
  return url.startsWith('http://') || url.startsWith('https://');
}

/** Local public files use native `<img>` (reliable with flat `/assets/images/*`). Remote URLs use `next/image` + Unsplash fallback. */
export function SiteImage({ src, alt, width = 1200, height = 800, fill, className, priority, sizes }: Props) {
  const [current, setCurrent] = useState(() => resolvePublicAssetUrl(src));

  useEffect(() => {
    setCurrent(resolvePublicAssetUrl(src));
  }, [src]);

  const handleLocalError = () => {
    setCurrent(fallbackForRealEstateAsset(src));
  };

  if (!isExternal(current)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current}
          alt={alt}
          className={clsx('absolute inset-0 h-full w-full object-cover', className)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={handleLocalError}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={current}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={handleLocalError}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={current}
        alt={alt}
        fill
        className={clsx('object-cover', className)}
        priority={priority}
        sizes={sizes ?? '(max-width: 768px) 100vw, 50vw'}
        unoptimized
        onError={handleLocalError}
      />
    );
  }

  return (
    <Image
      src={current}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      unoptimized
      onError={handleLocalError}
    />
  );
}
