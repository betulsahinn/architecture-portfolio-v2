"use client";

import NextImage, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, SyntheticEvent } from "react";

const RETRY_DELAYS = [500, 1500, 3000] as const;
type SmartImageProps = ImageProps & { fallbackLabel?: string };

function sourceUrl(src: ImageProps["src"]): string {
  if (typeof src === "string") return src;
  return "src" in src ? src.src : src.default.src;
}

function isR2Url(src: string): boolean {
  const publicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/+$/, "");
  return (
    src.includes(".r2.dev") ||
    src.startsWith("https://pub-") ||
    Boolean(publicUrl && (src === publicUrl || src.startsWith(`${publicUrl}/`)))
  );
}

function retryUrl(src: string, attempt: number): string {
  const url = new URL(src);
  url.searchParams.set("retry", String(attempt));
  return url.toString();
}

export function SmartImage({ fallbackLabel = "Image unavailable", ...props }: SmartImageProps) {
  const src = sourceUrl(props.src);
  const r2 = isR2Url(src);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<"loading" | "retrying" | "loaded" | "failed">("loading");
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setAttempt(0);
    setState("loading");
    if (retryTimer.current) clearTimeout(retryTimer.current);
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [src]);

  useEffect(() => {
    const image = imageRef.current;
    if (r2 && image?.complete && image.naturalWidth > 0) setState("loaded");
  }, [attempt, r2, src]);

  if (!r2) return <NextImage {...props} />;

  const fillStyle: CSSProperties | undefined = props.fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...props.style }
    : props.style;

  function handleLoad(event: SyntheticEvent<HTMLImageElement>) {
    if (retryTimer.current) clearTimeout(retryTimer.current);
    setState("loaded");
    props.onLoad?.(event);
  }

  function handleError(event: SyntheticEvent<HTMLImageElement>) {
    props.onError?.(event);
    if (attempt >= RETRY_DELAYS.length) {
      setState("failed");
      return;
    }

    setState("retrying");
    retryTimer.current = setTimeout(() => {
      setAttempt((current) => current + 1);
      setState("loading");
    }, RETRY_DELAYS[attempt]);
  }

  if (state === "failed") {
    return (
      <div
        role="img"
        aria-label={props.alt}
        className={`flex items-center justify-center bg-stone/25 text-center text-xs text-warm-gray ${props.className ?? ""}`}
        style={{
          ...fillStyle,
          ...(!props.fill && props.width && props.height
            ? { aspectRatio: `${props.width} / ${props.height}` }
            : {}),
        }}
      >
        <span className="px-4">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    // R2 public objects intentionally bypass the Next.js image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imageRef}
      key={`${src}-${attempt}`}
      src={attempt === 0 ? src : retryUrl(src, attempt)}
      alt={props.alt}
      className={`${props.className ?? ""} transition-opacity duration-150 ${state === "loaded" ? "bg-transparent opacity-100 grayscale-0 brightness-100 blur-none" : state === "retrying" ? "opacity-0" : "bg-stone/20 opacity-100"}`}
      loading={props.loading ?? (props.priority ? "eager" : "lazy")}
      fetchPriority={props.priority ? "high" : props.fetchPriority}
      width={props.fill ? undefined : props.width}
      height={props.fill ? undefined : props.height}
      sizes={props.sizes}
      style={{ ...fillStyle, color: "transparent", fontSize: 0 }}
      decoding={props.decoding ?? "async"}
      crossOrigin={props.crossOrigin}
      referrerPolicy={props.referrerPolicy}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
