"use client";
import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

interface TaskCoverProps {
  url?: string;
}

export default function TaskCover({ url }: TaskCoverProps) {
  const [error, setError] = useState(false);

  if (!url || error) return null;

  return (
    <div className="relative w-full h-40 overflow-hidden rounded-t-2xl border-b border-slate-200/50 dark:border-white/5">
      <img
        src={url}
        alt="Task Cover"
        onError={() => setError(true)}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
      {/* Overlay sutil para mejorar el contraste */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
}