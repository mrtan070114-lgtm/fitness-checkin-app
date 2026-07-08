"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  label?: string;
  className?: string;
};

export function BackButton({ label = "返回上一页", className = "" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      aria-label={label}
      className={className ? `back-button ${className}` : "back-button"}
      type="button"
      onClick={() => router.back()}
    >
      <ArrowLeft size={20} aria-hidden="true" />
    </button>
  );
}
