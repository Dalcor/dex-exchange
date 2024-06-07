import React, { PropsWithChildren } from "react";
import { useMediaQuery } from "react-responsive";

import Dialog from "@/components/atoms/Dialog";
import Drawer from "@/components/atoms/Drawer";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export default function DrawerDialog({ isOpen, children, setIsOpen }: PropsWithChildren<Props>) {
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });

  return (
    <>
      {isMobile ? (
        <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
          {children}
        </Drawer>
      ) : (
        <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
          {children}
        </Dialog>
      )}
    </>
  );
}
