import { flip, shift } from "@floating-ui/core";
import {
  autoUpdate,
  FloatingFocusManager,
  offset,
  Placement,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";
import React, { PropsWithChildren, ReactElement } from "react";

interface Props {
  placement: Placement;
  isOpened?: boolean;
  setIsOpened?: (isOpened: boolean) => void;
  trigger: ReactElement;
}

export default function Popover({
  placement,
  isOpened,
  setIsOpened,
  children,
  trigger,
}: PropsWithChildren<Props>) {
  const { refs, floatingStyles, context } = useFloating({
    open: isOpened,
    onOpenChange: setIsOpened,
    middleware: [offset(24), flip({ fallbackAxisSideDirection: "end" }), shift()],
    placement,
    whileElementsMounted: autoUpdate,
  });

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: {
      open: 200,
      close: 200,
    },
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <>
      {React.cloneElement(trigger, { ...getReferenceProps, ref: refs.setReference })}
      {isMounted && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, ...transitionStyles, zIndex: 2 }}
            {...getFloatingProps()}
          >
            {children}
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
}
