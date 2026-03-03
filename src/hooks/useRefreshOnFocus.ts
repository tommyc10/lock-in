"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Re-runs a callback when the user navigates back to the page
 * or when the tab regains visibility.
 */
export function useRefreshOnFocus(callback: () => void) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  // Refresh when the route becomes active (but not on first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    callback();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh on tab visibility change
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") callback();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [callback]);
}
