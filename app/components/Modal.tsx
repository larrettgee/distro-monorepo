"use client";

import { useEffect, useState, type ReactNode, type AriaAttributes } from "react";

/**
 * Keeps a component mounted through its exit transition. `mounted` controls
 * presence in the tree; `show` flips one frame after mount (and back before
 * unmount) so CSS transitions can run on both open and close.
 */
export function usePresence(open: boolean, durationMs = 200) {
  const [mounted, setMounted] = useState(open);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShow(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setShow(false);
    const t = setTimeout(() => setMounted(false), durationMs);
    return () => clearTimeout(t);
  }, [open, durationMs]);

  return { mounted, show };
}

/**
 * Centered modal shell with a subtle fade-and-rise animation on open and close.
 * `onDismiss` (backdrop click + Escape) is optional — omit it for modals that
 * shouldn't be dismissible. The panel's own size/padding lives in
 * `panelClassName`; close buttons inside `children` keep their own handlers.
 */
export function Modal({
  open,
  onDismiss,
  panelClassName,
  overlayClassName = "z-[60]",
  backdropClassName = "bg-black/70",
  children,
  ...aria
}: {
  open: boolean;
  onDismiss?: () => void;
  panelClassName: string;
  overlayClassName?: string;
  backdropClassName?: string;
  children: ReactNode;
} & AriaAttributes) {
  const { mounted, show } = usePresence(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDismiss?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onDismiss]);

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 ${overlayClassName}`}>
      <div
        onClick={onDismiss}
        aria-hidden
        className={`absolute inset-0 transition-opacity duration-200 ease-out motion-reduce:transition-none ${backdropClassName} ${
          show ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        {...aria}
        className={`relative z-10 transition duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
          show ? "translate-y-0 scale-100 opacity-100" : "translate-y-1 scale-[0.98] opacity-0"
        } ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
