import {
  arrow,
  autoUpdate,
  ExtendedRefs,
  flip,
  FloatingArrow,
  FloatingPortal,
  offset,
  ReferenceType,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
  VirtualElement,
} from "@floating-ui/react";
import React, { HTMLProps, LegacyRef, ReactNode, RefObject, useRef, useState } from "react";

import Svg from "@/components/atoms/Svg";

interface Props {
  text: string;
  iconSize?: number;
  renderTrigger?: (
    ref: {
      reference: React.MutableRefObject<ReferenceType | null>;
      floating: React.MutableRefObject<HTMLElement | null>;
      setReference: (node: ReferenceType | null) => void;
      setFloating: (node: HTMLElement | null) => void;
    } & ExtendedRefs<Element | VirtualElement>,
    refProps: Record<string, unknown>,
  ) => React.ReactNode;
  customOffset?: number;
}
export default function Tooltip({ text, iconSize = 24, renderTrigger, customOffset }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    // Make sure the tooltip stays on the screen
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(customOffset || 12),
      shift({
        padding: 10,
      }),
      flip({
        fallbackAxisSideDirection: "start",
      }),
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
      {renderTrigger ? (
        renderTrigger(refs, getReferenceProps())
      ) : (
        <span
          className="cursor-pointer text-secondary-text"
          ref={refs.setReference}
          {...getReferenceProps()}
        >
          <Svg size={iconSize} iconName="info" />
        </span>
      )}
      <FloatingPortal>
        {isMounted && (
          <div
            className="py-3 px-5 bg-primary-bg border border-primary-border rounded-2 max-w-[400px] shadow-tooltip relative z-[100]"
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
              fill={"#1D1E1E"}
            />
          </div>
        )}
      </FloatingPortal>
    </>
  );
}
