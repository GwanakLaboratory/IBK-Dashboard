import { useEffect, useRef, useState } from 'react';

type CardImageProps = {
  src: string;
  alt: string;
};

/**
 * 카드 상품 이미지. 자리(128×80)를 미리 잡아 두고 불러오는 동안 스켈레톤을 보여줘서,
 * 이미지가 늦게 떠도 옆 내용이 밀리지 않는다.
 */
export function CardImage({ src, alt }: CardImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // 캐시된 이미지는 onLoad 전에 이미 다 불러와져 있을 수 있다
  useEffect(() => {
    setLoaded(Boolean(imageRef.current?.complete));
  }, [src]);

  return (
    <div className="relative h-20 w-32 shrink-0">
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse rounded-lg bg-slate-200"
        />
      )}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`size-full rounded-lg object-contain transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
