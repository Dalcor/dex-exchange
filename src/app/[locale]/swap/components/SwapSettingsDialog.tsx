import clsx from "clsx";
import React, {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  PropsWithChildren,
  useCallback,
  useState,
} from "react";

import { useSwapSettingsStore } from "@/app/[locale]/swap/stores/useSwapSettingsStore";
import Button from "@/components/atoms/Button";
import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import TextField from "@/components/atoms/TextField";
import Tooltip from "@/components/atoms/Tooltip";
import addToast from "@/other/toast";

function SettingsButtons({ children }: PropsWithChildren) {
  return <div className="grid rounded-2 flex-grow grid-cols-4 gap-3">{children}</div>;
}

interface SettingsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  isActive?: boolean;
}

function SettingsButton({ text, isActive = false, ...props }: SettingsButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "duration-200 py-2.5 px-6 w-full border flex justify-center rounded-2 ",
        isActive
          ? "bg-green-bg shadow-checkbox border-green text-primary-text"
          : "bg-secondary-bg border-transparent hover:bg-green-bg text-secondary-text",
      )}
    >
      {text}
    </button>
  );
}

interface SettingsInputProps extends InputHTMLAttributes<HTMLInputElement> {
  isActive?: boolean;
}
function SettingsInput({ isActive, ...props }: SettingsInputProps) {
  return (
    <input
      {...props}
      className={clsx(
        "focus:border-green focus:outline-0  focus:bg-green-bg focus:shadow-checkbox rounded-2 duration-200 hover:bg-tertiary-bg py-2.5 px-3 text-center placeholder:text-center placeholder:text-secondary-text w-full border",
        isActive
          ? "bg-green-bg shadow-checkbox border-green text-primary-text"
          : "bg-secondary-bg border-transparent hover:bg-green-bg text-secondary-text",
      )}
    />
  );
}
interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

enum SlippageType {
  AUTO,
  CUSTOM,
  LOW,
  MEDIUM,
  HIGH,
}

type DefaultType = Exclude<SlippageType, SlippageType.AUTO | SlippageType.CUSTOM>;

const values: Record<DefaultType, number> = {
  [SlippageType.LOW]: 0.01,
  [SlippageType.MEDIUM]: 0.5,
  [SlippageType.HIGH]: 1,
};

const defaultTypes: DefaultType[] = [SlippageType.LOW, SlippageType.MEDIUM, SlippageType.HIGH];

function getTitle(slippageType: SlippageType, value: string) {
  switch (slippageType) {
    case SlippageType.LOW:
    case SlippageType.MEDIUM:
    case SlippageType.HIGH:
      return `${values[slippageType]}%`;

    case SlippageType.AUTO:
      return "Auto";
    case SlippageType.CUSTOM:
      return `${value}% Custom`;
  }
}

export default function SwapSettingsDialog({ isOpen, setIsOpen }: Props) {
  const { setSlippage, setDeadline, deadline, slippage } = useSwapSettingsStore();

  const [customSlippage, setCustomSlippage] = useState("");
  const [customDeadline, setCustomDeadline] = useState(deadline);
  const [slippageType, setSlippageType] = useState<SlippageType>(SlippageType.MEDIUM);

  const handleSave = useCallback(() => {
    setDeadline(customDeadline);

    switch (slippageType) {
      case SlippageType.LOW:
        setSlippage(values[SlippageType.LOW]);
        break;
      case SlippageType.MEDIUM:
        setSlippage(values[SlippageType.MEDIUM]);
        break;
      case SlippageType.HIGH:
        setSlippage(values[SlippageType.HIGH]);
        break;
      case SlippageType.AUTO:
        setSlippage(values[SlippageType.MEDIUM]);
        break;
      case SlippageType.CUSTOM:
        setSlippage(+customSlippage);
        break;
    }

    setIsOpen(false);
    addToast("Settings applied");
  }, [customDeadline, customSlippage, setDeadline, setIsOpen, setSlippage, slippageType]);

  return (
    <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Settings" />
      <div className="px-10 pt-10 pb-5.5 w-[600px]">
        <div className="flex justify-between items-center mb-1">
          <div className="flex gap-1 items-center">
            <h3 className="font-bold text-16">Max slippage</h3>
            <Tooltip text="Tooltip" />
          </div>
          <span className="text-secondary-text">{getTitle(slippageType, customSlippage)}</span>
        </div>
        <div className="flex gap-5">
          <span>
            <SettingsButton
              onClick={() => setSlippageType(SlippageType.AUTO)}
              isActive={slippageType === SlippageType.AUTO}
              text="Auto"
            />
          </span>
          <SettingsButtons>
            {defaultTypes.map((sl) => {
              return (
                <SettingsButton
                  key={sl}
                  onClick={() => setSlippageType(sl)}
                  isActive={slippageType === sl}
                  text={`${values[sl]}%`}
                />
              );
            })}
            <SettingsInput
              onFocus={() => setSlippageType(SlippageType.CUSTOM)}
              placeholder="Custom"
              value={customSlippage}
              onChange={(e) => setCustomSlippage(e.target.value)}
              isActive={slippageType === SlippageType.CUSTOM}
            />
          </SettingsButtons>
        </div>

        <div className="mt-5">
          <TextField
            value={customDeadline}
            onChange={(e) => {
              setCustomDeadline(+e.target.value);
            }}
            label="Transaction deadline"
            tooltipText="Tooltip text"
            helperText=""
          />
        </div>

        <Button fullWidth onClick={handleSave}>
          Save settings
        </Button>
      </div>
    </Dialog>
  );
}
