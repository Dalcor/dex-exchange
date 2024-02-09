import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import styles from "./Collapse.module.scss";
import clsx from "clsx";

interface Props {
  open: boolean
}
export default function Collapse({ children, open }: PropsWithChildren<Props>) {
  const [height, setHeight] = useState<number | undefined>(open
    ? undefined
    : 0);

  const isOpen = useRef<boolean>(open);

  const [overflow, setOverflow] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);
  const isChildrenChangeRef = useRef<boolean>(false);

  useEffect(
    () => {
      if (open) {
        setHeight(ref.current?.getBoundingClientRect().height);
        setTimeout(
          () => {
            setOverflow(true);
          },
          200
        );
      } else {
        setOverflow(false);
        setHeight(0);
      }
    },
    [open]
  );

  useEffect(
    () => {
      isOpen.current = open;
    },
    [open]
  );

  useEffect(
    () => {
      if (ref.current) {
        const ro = new ResizeObserver((entries) => {
          if (!isOpen.current) {
            return;
          }

          isChildrenChangeRef.current = true;
          for (let entry of entries) {
            setHeight(entry.contentRect.height);
          }
          setTimeout(
            () => {
              isChildrenChangeRef.current = false;
            },
            200
          );
        });

        ro.observe(ref.current);

        return () => {
          ro.disconnect();
        };
      }
    },
    [ref]
  );

  return <div className={
    clsx(
      "overflow-hidden ease-in-out",
      Boolean(isChildrenChangeRef.current) ? "duration-0" : "duration-200"
    )} style={{ height }}>
    <div ref={ref}>
      {children}
    </div>
  </div>;
}
