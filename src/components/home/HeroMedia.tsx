"use client";

import { useEffect, useState } from "react";
import { SmartImage } from "@/components/SmartImage";

type HeroMediaProps = {
  mediaType: "image" | "video";
  imageUrl: string | null;
  videoUrl: string | null;
};

type ResolvedMedia = "image" | "video" | "empty";

function resolveMedia(mediaType: HeroMediaProps["mediaType"], imageUrl: string | null, videoUrl: string | null): ResolvedMedia {
  if (mediaType === "video") {
    if (videoUrl) return "video";
    if (imageUrl) return "image";
  } else {
    if (imageUrl) return "image";
    if (videoUrl) return "video";
  }

  return "empty";
}

export function HeroMedia({ mediaType, imageUrl, videoUrl }: HeroMediaProps) {
  const [activeMedia, setActiveMedia] = useState<ResolvedMedia>(() => resolveMedia(mediaType, imageUrl, videoUrl));

  useEffect(() => {
    setActiveMedia(resolveMedia(mediaType, imageUrl, videoUrl));
  }, [imageUrl, mediaType, videoUrl]);

  if (activeMedia === "video" && videoUrl) {
    return (
      <video
        key={videoUrl}
        src={videoUrl}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setActiveMedia(imageUrl ? "image" : "empty")}
      />
    );
  }

  if (activeMedia === "image" && imageUrl) {
    return (
      <SmartImage
        src={imageUrl}
        alt="Homepage hero"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
    );
  }

  return (
    <div
      className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(163,137,104,0.22),transparent_45%),linear-gradient(145deg,#2b2926,#151412)]"
      aria-hidden="true"
    />
  );
}
