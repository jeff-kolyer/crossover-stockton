import { useRef, useState } from "react";

export function useScrollReveal() {
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function onScroll() {
    setIsScrolling(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setIsScrolling(false), 650);
  }

  return { isScrolling, onScroll };
}
