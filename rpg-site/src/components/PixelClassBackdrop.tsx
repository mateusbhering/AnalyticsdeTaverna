"use client";

import { useEffect, useState, type CSSProperties } from "react";

const SLOTS = 24;
const spriteStyle = (sprite: number): CSSProperties => ({
  backgroundPosition: `${(sprite % 6) * 20}% ${sprite < 6 ? 0 : 100}%`,
});

/** Figurantes decorativos; não participam dos dados ou das regras do jogo. */
export default function PixelClassBackdrop() {
  const [sprites, setSprites] = useState(() =>
    Array.from({ length: SLOTS }, (_, index) => ({ current: index % 12, previous: index % 12, turn: 0 })),
  );

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (motion.matches || document.hidden) return;
      const selected = new Set(Array.from({ length: 3 }, () => Math.floor(Math.random() * SLOTS)));
      setSprites((items) => items.map((item, index) => selected.has(index)
        ? { previous: item.current, current: (item.current + 1 + Math.floor(Math.random() * 11)) % 12, turn: item.turn + 1 }
        : item));
    }, 1800);
    return () => window.clearInterval(timer);
  }, []);

  return <div className="pixel-class-backdrop" aria-hidden="true">
    {sprites.map((sprite, index) => <div className="pixel-class-extra" key={index}>
      <div className="pixel-class-swap" key={sprite.turn}>
        {sprite.turn > 0 && <span className="pixel-class-outgoing" style={spriteStyle(sprite.previous)} />}
        <span className={sprite.turn > 0 ? "pixel-class-incoming" : undefined} style={spriteStyle(sprite.current)} />
      </div>
    </div>)}
  </div>;
}
