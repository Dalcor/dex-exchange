import { PropsWithChildren } from "react";

import useInitializeDB from "@/hooks/useInitializeDB";

export default function DatabaseProvider({ children }: PropsWithChildren) {
  useInitializeDB();

  return <>{children}</>;
}
