import isEqual from "lodash.isequal";
import { useRef } from "react";

const useDeepMemo = <T>(factory: () => T, deps: any[]): T => {
  const ref = useRef<{ deps: any[]; value: T }>();

  if (!ref.current || !isEqual(deps, ref.current.deps)) {
    ref.current = {
      deps,
      value: factory(),
    };
  }

  return ref.current.value;
};

export default useDeepMemo;
