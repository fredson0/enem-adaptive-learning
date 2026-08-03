import { cn } from "@/lib/utils";

type SidebarAccordionProps = {
  open: boolean;
  children: React.ReactNode;
  className?: string;
};

export function SidebarAccordion({
  open,
  children,
  className,
}: SidebarAccordionProps) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className,
      )}
    >
      <div className="overflow-hidden">
        <div
          className={cn(
            "transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            open ? "opacity-100" : "opacity-0",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
