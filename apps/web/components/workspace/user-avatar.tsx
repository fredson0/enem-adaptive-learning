"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Garante tamanho consistente em URLs do Google (lh3.googleusercontent.com). */
export function normalizeGooglePhotoUrl(
  url: string | null | undefined,
  size = 96,
): string | null {
  if (!url?.trim()) return null;

  if (!url.includes("googleusercontent.com")) {
    return url;
  }

  const withoutSize = url.replace(/=s\d+(-c)?$/, "");
  return `${withoutSize}=s${size}-c`;
}

type UserAvatarProps = {
  name: string;
  fotoUrl?: string | null;
  className?: string;
  initialsClassName?: string;
};

export function UserAvatar({
  name,
  fotoUrl,
  className,
  initialsClassName,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = normalizeGooglePhotoUrl(fotoUrl);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-[var(--osmo-active)] text-xs font-semibold text-osmo",
          className,
          initialsClassName,
        )}
        aria-hidden
      >
        {getInitials(name || "U")}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      className={cn("shrink-0 rounded-full object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
