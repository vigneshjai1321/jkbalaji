'use client';

import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { fallbackForJewelleryAsset, resolvePublicAssetUrl } from '@/lib/site-asset-url';

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
};

export function PublicAssetImg({ src, alt, className, ...rest }: Props) {
  const [current, setCurrent] = useState(() => resolvePublicAssetUrl(src));

  useEffect(() => {
    setCurrent(resolvePublicAssetUrl(src));
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      src={current}
      alt={alt ?? ''}
      className={className}
      onError={() => setCurrent(fallbackForJewelleryAsset(src))}
    />
  );
}
