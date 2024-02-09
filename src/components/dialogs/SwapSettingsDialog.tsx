import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import Tooltip from "@/components/atoms/Tooltip";
import TextField from "@/components/atoms/TextField";
import React, { PropsWithChildren } from "react";
import clsx from "clsx";

function SettingsButtons({children}: PropsWithChildren) {
  return <div className="grid rounded-2 flex-grow grid-cols-4">
    {children}
  </div>
}
function SettingsButton({text, isActive = false}: {text: string, isActive?: boolean}) {
  return <button className={clsx(
    "duration-200 hover:bg-tertiary-bg py-2.5 px-6 w-full flex justify-center border border-primary-border border-r-0 last:border-r last:rounded-r-1 first:rounded-l-1",
    isActive ? "bg-tertiary-bg text-primary-text" : "bg-primary-bg text-secondary-text"
    )}>{text}</button>
}
interface Props {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void
}
export default function SwapSettingsDialog({isOpen, setIsOpen}: Props) {
  return <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
    <DialogHeader onClose={() => setIsOpen(false)} title="Settings" />
    <div className="px-10 pt-10 pb-5.5 w-[550px]">
      <div className="flex justify-between items-center mb-1">
        <div className="flex gap-1 items-center">
          <h3 className="font-bold text-16">Max slippage</h3>
          <Tooltip text="Tooltip" />
        </div>
        <span className="text-secondary-text">0,5% Auto</span>
      </div>
      <div className="flex gap-5">
        <span><SettingsButton isActive text="Auto" /></span>
        <SettingsButtons>
          <SettingsButton isActive text="0.1%" />
          <SettingsButton text="0.5%" />
          <SettingsButton text="1%" />
          <SettingsButton text="Custom" />
        </SettingsButtons>
      </div>

      <div className="mt-5">
        <TextField
          defaultValue={10}
          label="Transaction deadline"
          tooltipText="Tooltip text"
          helperText=""
        />
      </div>
    </div>
  </Dialog>
}
