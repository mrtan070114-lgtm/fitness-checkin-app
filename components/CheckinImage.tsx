"use client";

import { useMemo, useState } from "react";
import { getCheckinImageUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/browser";

type CheckinImageProps = {
  imageUrl: string | null;
  alt: string;
  className?: string;
  errorClassName?: string;
};

export function CheckinImage({ imageUrl, alt, className = "record-image", errorClassName = "image-error-inline" }: CheckinImageProps) {
  const [failed, setFailed] = useState(false);

  const resolvedSrc = useMemo(() => {
    if (!imageUrl) return null;

    try {
      return getCheckinImageUrl(createClient(), imageUrl);
    } catch (error) {
      console.error("无法解析打卡图片地址", { image_url: imageUrl, error });
      return imageUrl;
    }
  }, [imageUrl]);

  if (!resolvedSrc) {
    return null;
  }

  if (failed) {
    return (
      <div className={errorClassName}>
        <span>图片加载失败</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        alt={alt}
        src={resolvedSrc}
        loading="lazy"
        decoding="async"
        onError={() => {
          console.error("图片加载失败", { image_url: imageUrl, resolvedSrc });
          setFailed(true);
        }}
      />
    </div>
  );
}
