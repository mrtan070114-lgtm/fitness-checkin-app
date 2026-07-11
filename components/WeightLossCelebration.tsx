"use client";

import Image from "next/image";
import { Flag, Heart, UserRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { scheduleCelebrationAutoClose } from "@/lib/celebration";

type WeightLossCelebrationProps = {
  previousWeight: number;
  currentWeight: number;
  weightLoss: number;
};

function formatWeight(value: number) {
  return value.toFixed(1);
}

export function WeightLossCelebration({
  weightLoss
}: WeightLossCelebrationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeCelebration = useCallback(() => {
    setIsOpen(false);

    const url = new URL(window.location.href);
    for (const parameter of ["celebrate", "previousWeight", "currentWeight", "weightLoss"]) {
      url.searchParams.delete(parameter);
    }
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => buttonRef.current?.focus());
    const cancelAutoClose = scheduleCelebrationAutoClose(closeCelebration);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCelebration();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      cancelAutoClose();
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [closeCelebration, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="weight-celebration-backdrop">
      <section
        aria-describedby="weight-celebration-description"
        aria-labelledby="weight-celebration-title"
        aria-modal="true"
        className="weight-celebration-dialog"
        role="dialog"
      >
        <div className="weight-celebration-copy">
          <h2 id="weight-celebration-title">今天的你，值得庆祝</h2>
          <p id="weight-celebration-description">
            体重下降 <strong>{formatWeight(weightLoss)} kg</strong>，离目标又近了一步
          </p>
        </div>

        <Image
          alt="爱心环绕上升箭头的鼓励插画"
          className="weight-celebration-art"
          height={512}
          priority
          src="/weight-loss-celebration-heart.png"
          width={512}
        />

        <div className="weight-celebration-journey" aria-label="持续坚持，向目标前进">
          <span><i><UserRound size={17} aria-hidden="true" /></i><small>现在</small></span>
          <span className="weight-celebration-route" aria-hidden="true"><Heart size={14} /><small>持续坚持</small></span>
          <span><i><Flag size={17} aria-hidden="true" /></i><small>目标</small></span>
        </div>

        <button
          className="weight-celebration-button"
          onClick={closeCelebration}
          ref={buttonRef}
          type="button"
        >
          我会坚持下去
        </button>

        <div className="weight-celebration-countdown" aria-label="10 秒后自动关闭">
          <span className="weight-celebration-countdown-track" aria-hidden="true" />
          <small>10 秒后自动关闭</small>
        </div>
      </section>
    </div>
  );
}
