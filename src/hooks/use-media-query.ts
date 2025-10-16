import { useEffect, useState } from 'react';

const isClient = () => typeof window !== 'undefined';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (!isClient()) {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (!isClient()) {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(query);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener('change', listener);
    setMatches(mediaQueryList.matches);

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
};
