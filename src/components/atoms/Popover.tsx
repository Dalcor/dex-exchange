import { JSX, PropsWithChildren, useState } from "react";
import {
  autoUpdate,
  FloatingFocusManager,
  offset, Placement,
  useClick,
  useDismiss, useFloating,
  useInteractions,
  useRole, useTransitionStyles
} from "@floating-ui/react";
import { flip, shift } from "@floating-ui/core";
import SelectButton from "@/components/atoms/SelectButton";

interface Props {
  buttonContent: string | JSX.Element,
  placement: Placement,
  isOpened?: boolean,
  setIsOpened?: (isOpened: boolean) => void,
  withArrow?: boolean
}
export default function Popover({buttonContent, placement, isOpened, setIsOpened, children, withArrow = true}: PropsWithChildren<Props>) {
  // const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpened,
    onOpenChange: setIsOpened,
    middleware: [
      offset(24),
      flip({ fallbackAxisSideDirection: "end" }),
      shift()
    ],
    placement,
    whileElementsMounted: autoUpdate
  });

  const {isMounted, styles: transitionStyles} = useTransitionStyles(context, {
    duration: {
      open: 200,
      close: 200
    },
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role
  ]);


  return (
    <>
      <SelectButton withArrow={withArrow} isOpen={isOpened} ref={refs.setReference} {...getReferenceProps()}>
        {buttonContent}
      </SelectButton>
      {isMounted && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={{...floatingStyles, ...transitionStyles}}
            {...getFloatingProps()}
          >
            {children}
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
}
