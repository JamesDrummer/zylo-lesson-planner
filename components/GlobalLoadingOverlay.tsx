"use client";

import { useEffect, useState } from "react";

export default function GlobalLoadingOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = 0;
    const onStart = () => {
      active++;
      setVisible(true);
    };
    const onEnd = () => {
      active = Math.max(0, active - 1);
      if (active === 0) setVisible(false);
    };
    (globalThis as unknown as { __zylo_loading__?: { onStart: () => void; onEnd: () => void } }).__zylo_loading__ = {
      onStart,
      onEnd,
    };
    return () => {
      delete (globalThis as unknown as { __zylo_loading__?: unknown }).__zylo_loading__;
    };
  }, []);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="animate-pulse rounded-2xl bg-white px-6 py-4 shadow">Loading...</div>
    </div>
  );
}


