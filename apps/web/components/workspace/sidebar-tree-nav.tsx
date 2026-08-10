"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

type SidebarTreeProps = {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
  maxHeightClassName?: string;
};

export function SidebarTree({
  children,
  className,
  scrollable = false,
  maxHeightClassName = "max-h-[240px]",
}: SidebarTreeProps) {
  const items = Children.toArray(children).filter(Boolean);

  const list = (
    <div className="osmo-sidebar-tree__list">
      {items.map((child, index) => (
        <div
          key={getChildKey(child, index)}
          className={cn(
            "osmo-sidebar-tree__item",
            index === 0 && "osmo-sidebar-tree__item--first",
            index === items.length - 1 && "osmo-sidebar-tree__item--last",
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn("osmo-sidebar-tree", className)}>
      {scrollable ? (
        <div
          className={cn(
            "scrollbar-none overflow-y-auto pr-1",
            maxHeightClassName,
          )}
        >
          {list}
        </div>
      ) : (
        list
      )}
    </div>
  );
}

type SidebarTreeLinkProps = {
  href: string;
  active?: boolean;
  children: ReactNode;
  className?: string;
};

export function SidebarTreeLink({
  href,
  active,
  children,
  className,
}: SidebarTreeLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "block w-full rounded-[6px] px-3 py-2 text-sm transition-all duration-300",
        active
          ? "bg-[var(--osmo-active)] text-white ring-1 ring-white/10"
          : "text-white/55 hover:bg-[var(--osmo-hover)] hover:text-white/85",
        className,
      )}
    >
      {children}
    </Link>
  );
}

type SidebarTreeButtonProps = {
  onClick?: () => void;
  active?: boolean;
  dashed?: boolean;
  children: ReactNode;
  className?: string;
};

export function SidebarTreeButton({
  onClick,
  active,
  dashed = false,
  children,
  className,
}: SidebarTreeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-left text-sm transition-all duration-300",
        dashed
          ? active
            ? "border border-[var(--osmo-border)] bg-[var(--osmo-active)] text-white"
            : "border border-dashed border-[var(--osmo-border)] text-white/60 hover:border-white/20 hover:bg-[var(--osmo-hover)] hover:text-white"
          : active
            ? "bg-[var(--osmo-active)] text-white"
            : "text-white/55 hover:bg-[var(--osmo-hover)] hover:text-white/85",
        className,
      )}
    >
      {children}
    </button>
  );
}

type SidebarTreeChatButtonProps = {
  onClick?: () => void;
  active?: boolean;
  title: string;
  preview: string;
};

export function SidebarTreeChatButton({
  onClick,
  active,
  title,
  preview,
}: SidebarTreeChatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full rounded-[6px] px-3 py-2.5 text-left transition-all duration-300 ease-out",
        active
          ? "bg-[var(--osmo-active)] text-white ring-1 ring-white/10"
          : "text-white/60 hover:bg-[var(--osmo-hover)] hover:text-white",
      )}
    >
      <p className="truncate text-sm font-medium">{title}</p>
      <p className="mt-0.5 truncate text-xs text-white/40">{preview}</p>
    </button>
  );
}

function getChildKey(child: ReactNode, index: number) {
  if (isValidElement(child) && child.key != null) {
    return child.key;
  }

  if (isValidElement(child)) {
    const element = child as ReactElement<{ href?: string }>;
    if (element.props.href) {
      return element.props.href;
    }
  }

  return index;
}
