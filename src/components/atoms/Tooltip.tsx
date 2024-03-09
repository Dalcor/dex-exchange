import {
  arrow,
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";
import React, { useRef, useState } from "react";

import Svg from "@/components/atoms/Svg";

interface Props {
  text: string;
}
export default function Tooltip({ text }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    // Make sure the tooltip stays on the screen
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(12),
      flip({
        fallbackAxisSideDirection: "start",
      }),
      shift(),
      arrow({
        element: arrowRef,
      }),
    ],
  });

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: {
      open: 200,
      close: 200,
    },
  });

  // Event listeners to change the open state
  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  // Role props for screen readers
  const role = useRole(context, { role: "tooltip" });

  // Merge all the interactions into prop getters
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return (
    <>
      <span
        className="w-6 h-6 cursor-pointer text-secondary-text"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <Svg iconName="info" />
      </span>
      <FloatingPortal>
        {isMounted && (
          <div
            className="py-3 px-5 bg-primary-bg border border-primary-border rounded-2 max-w-[400px] shadow-tooltip relative"
            ref={refs.setFloating}
            style={{ ...floatingStyles, ...transitionStyles }}
            {...getFloatingProps()}
          >
            {text}
            <FloatingArrow
              ref={arrowRef}
              context={context}
              strokeWidth={1}
              stroke={"#5A5A5A"}
              fill={"#141316"}
            />
          </div>
        )}
      </FloatingPortal>
    </>
  );
}
