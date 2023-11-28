import { useEffect, useRef, useState } from "react";

export default function usePreloaderTimeout({ isLoading }: { isLoading: boolean }) {
  const [loadingInternal, setLoadingInternal] = useState(false);
  const loadingRef = useRef(isLoading);
  loadingRef.current = isLoading;

  useEffect(() => {
    if(isLoading) {
      const a = setTimeout(() => {
        if(Boolean(loadingRef.current)) {
          setLoadingInternal(true);
        }
      }, 100);
    } else {
      setLoadingInternal(false);
    }
  }, [isLoading]);

  return loadingInternal;
}
