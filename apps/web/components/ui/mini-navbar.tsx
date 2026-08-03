"use client";

import React, { useEffect, useRef, useState } from "react";

const AnimatedNavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <a
      href={href}
      className="group relative inline-flex h-5 items-center overflow-hidden text-sm"
    >
      <div className="flex -translate-y-0 flex-col transition-transform duration-400 ease-out group-hover:-translate-y-1/2">
        <span className="text-gray-300">{children}</span>
        <span className="text-white">{children}</span>
      </div>
    </a>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState("rounded-full");
  const shapeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass("rounded-xl");
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass("rounded-full");
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const logoElement = (
    <div className="relative flex size-5 items-center justify-center">
      <span className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-gray-200 opacity-80" />
      <span className="absolute top-1/2 left-0 size-1.5 -translate-y-1/2 rounded-full bg-gray-200 opacity-80" />
      <span className="absolute top-1/2 right-0 size-1.5 -translate-y-1/2 rounded-full bg-gray-200 opacity-80" />
      <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-gray-200 opacity-80" />
    </div>
  );

  const navLinksData = [
    { label: "Manifesto", href: "#1" },
    { label: "Careers", href: "#2" },
    { label: "Discover", href: "#3" },
  ];

  const loginButtonElement = (
    <button
      type="button"
      className="w-full rounded-full border border-[#333] bg-[rgba(31,31,31,0.62)] px-4 py-2 text-xs text-gray-300 transition-colors duration-200 hover:border-white/50 hover:text-white sm:w-auto sm:px-3 sm:text-sm"
    >
      LogIn
    </button>
  );

  const signupButtonElement = (
    <div className="group relative w-full sm:w-auto">
      <div className="pointer-events-none absolute inset-0 -m-2 hidden rounded-full bg-gray-100 opacity-40 blur-lg transition-all duration-300 ease-out group-hover:-m-3 group-hover:opacity-60 group-hover:blur-xl sm:block" />
      <button
        type="button"
        className="relative z-10 w-full rounded-full bg-gradient-to-br from-gray-100 to-gray-300 px-4 py-2 text-xs font-semibold text-black transition-all duration-200 hover:from-gray-200 hover:to-gray-400 sm:w-auto sm:px-3 sm:text-sm"
      >
        Signup
      </button>
    </div>
  );

  return (
    <header
      className={`fixed top-6 left-1/2 z-20 flex w-[calc(100%-2rem)] -translate-x-1/2 transform flex-col items-center border border-[#333] bg-[#1f1f1f57] py-3 pl-6 pr-6 backdrop-blur-sm transition-[border-radius] duration-0 ease-in-out sm:w-auto ${headerShapeClass}`}
    >
      <div className="flex w-full items-center justify-between gap-x-6 sm:gap-x-8">
        <div className="flex items-center">{logoElement}</div>

        <nav className="hidden items-center space-x-4 text-sm sm:flex sm:space-x-6">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex sm:gap-3">
          {loginButtonElement}
          {signupButtonElement}
        </div>

        <button
          type="button"
          className="flex size-8 items-center justify-center text-gray-300 focus:outline-none sm:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? (
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`flex w-full flex-col items-center overflow-hidden transition-all duration-300 ease-in-out sm:hidden ${isOpen ? "max-h-[1000px] pt-4 opacity-100" : "pointer-events-none max-h-0 pt-0 opacity-0"}`}
      >
        <nav className="flex w-full flex-col items-center space-y-4 text-base">
          {navLinksData.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="w-full text-center text-gray-300 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-4 flex w-full flex-col items-center space-y-4">
          {loginButtonElement}
          {signupButtonElement}
        </div>
      </div>
    </header>
  );
}
