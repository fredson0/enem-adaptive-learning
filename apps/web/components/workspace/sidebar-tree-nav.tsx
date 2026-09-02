"use client";

import { SIDEBAR_ACCORDION_EASE } from "@/components/workspace/sidebar-accordion";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

const TREE_LIST_VARIANTS = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.028,
      staggerDirection: -1,
    },
  },
} as const;

const TREE_ITEM_VARIANTS = {
  hidden: {
    opacity: 0,
    y: -12,
    scaleY: 0.88,
  },
  show: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: {
      duration: 0.3,
      ease: SIDEBAR_ACCORDION_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scaleY: 0.9,
    transition: {
      duration: 0.2,
      ease: SIDEBAR_ACCORDION_EASE,
    },
  },
} as const;

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
  const reduceMotion = useReducedMotion() ?? false;
  const items = Children.toArray(children).filter(Boolean);

  const list = (
    <motion.div
      className="osmo-sidebar-tree__list"
      variants={TREE_LIST_VARIANTS}
      initial={reduceMotion ? "show" : "hidden"}
      animate="show"
      exit={reduceMotion ? "show" : "exit"}
    >
      {items.map((child, index) => (
        <motion.div
          key={getChildKey(child, index)}
          className={cn(
            "osmo-sidebar-tree__item",
            index === 0 && "osmo-sidebar-tree__item--first",
            index === items.length - 1 && "osmo-sidebar-tree__item--last",
          )}
          variants={TREE_ITEM_VARIANTS}
          style={{ transformOrigin: "top center" }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
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
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

export function SidebarTreeLink({
  href,
  active,
  children,
  className,
  onClick,
}: SidebarTreeLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block w-full rounded-lg px-3.5 py-2.5 text-[14px] transition-all duration-300",
        active
          ? "bg-[var(--osmo-active)] text-osmo ring-1 ring-[var(--osmo-ring)]"
          : "text-osmo-muted hover:bg-[var(--osmo-hover)] hover:text-osmo",
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
        "flex w-full items-center gap-2 rounded-lg px-3.5 py-2.5 text-left text-[14px] transition-all duration-300",
        dashed
          ? active
            ? "border border-[var(--osmo-border)] bg-[var(--osmo-active)] text-osmo"
            : "border border-dashed border-[var(--osmo-border)] text-osmo-muted hover:border-[var(--osmo-border)] hover:bg-[var(--osmo-hover)] hover:text-osmo"
          : active
            ? "bg-[var(--osmo-active)] text-osmo"
            : "text-osmo-muted hover:bg-[var(--osmo-hover)] hover:text-osmo",
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
        "block w-full rounded-lg px-3.5 py-3 text-left transition-all duration-300 ease-out",
        active
          ? "bg-[var(--osmo-active)] text-osmo ring-1 ring-[var(--osmo-ring)]"
          : "text-osmo-muted hover:bg-[var(--osmo-hover)] hover:text-osmo",
      )}
    >
      <p className="truncate text-sm font-medium">{title}</p>
      <p className="mt-0.5 truncate text-xs text-osmo-subtle">{preview}</p>
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
