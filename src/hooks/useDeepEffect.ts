import isEqual from "lodash.isequal";
import { useEffect, useRef } from "react";

const useDeepEffect = (callback: () => void | (() => void), deps: any[]) => {
  const ref = useRef<any[]>([]);

  if (!isEqual(deps, ref.current)) {
    ref.current = deps;
  }

  useEffect(callback, [ref.current]);
};

export default useDeepEffect;
