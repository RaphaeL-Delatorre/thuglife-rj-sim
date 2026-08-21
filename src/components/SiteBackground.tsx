import { useEffect, useState } from "react";

import heroAsset from "@/assets/tl.png.asset.json";
import news1Asset from "@/assets/tl-2.png.asset.json";
import news2Asset from "@/assets/tl-3.png.asset.json";
import news3Asset from "@/assets/tl-4.png.asset.json";

export const DEFAULT_WALLPAPERS = [heroAsset.url, news1Asset.url, news2Asset.url, news3Asset.url];

export function wallpapersFromSettings(settings: Record<string, string>): string[] {
  const raw = settings["wallpapers"] ?? "";
  const list = raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : DEFAULT_WALLPAPERS;
}

export function wallpaperIntervalFromSettings(settings: Record<string, string>): number {
  const seconds = Number(settings["wallpaperInterval"] ?? 3);
  return Number.isFinite(seconds) ? Math.max(1, Math.min(300, Math.floor(seconds))) * 1000 : 3000;
}

export function SiteBackground({ settings }: { settings: Record<string, string> }) {
  const slides = wallpapersFromSettings(settings);
  const interval = wallpaperIntervalFromSettings(settings);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % slides.length), interval);
    return () => window.clearInterval(id);
  }, [slides.length, interval]);

  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [active, slides.length]);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {slides.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${src})`, opacity: i === active ? 1 : 0 }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, oklch(0.58 0.245 27 / 0.28) 0%, transparent 55%), linear-gradient(180deg, oklch(0.09 0.01 20 / 0.82), oklch(0.09 0.01 20 / 0.94))",
        }}
      />
      <div className="tl-scanlines absolute inset-0 opacity-40 mix-blend-overlay" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(100% 100% at 50% 50%, transparent 45%, oklch(0 0 0 / 0.85) 100%)",
        }}
      />
    </div>
  );
}
