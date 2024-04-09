import clsx from "clsx";
import { PropsWithChildren } from "react";

export default function Container({ children }: PropsWithChildren) {
  return <div className="max-w-[1366px] my-0 mx-auto">{children}</div>;
}
