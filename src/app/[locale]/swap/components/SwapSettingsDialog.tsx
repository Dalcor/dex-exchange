import clsx from "clsx";
import { useTranslations } from "next-intl";
import React, {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  PropsWithChildren,
  useCallback,
  useState,
} from "react";

import {
  defaultTypes,
  SlippageType,
  useSwapSettingsStore,
  values,
} from "@/app/[locale]/swap/stores/useSwapSettingsStore";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Input from "@/components/atoms/Input";
import Tooltip from "@/components/atoms/Tooltip";
import Button, { ButtonVariant } from "@/components/buttons/Button";
import TextButton from "@/components/buttons/TextButton";
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

function getTitle(slippageType: SlippageType, value: string, t: any) {
  switch (slippageType) {
    case SlippageType.LOW:
    case SlippageType.MEDIUM:
    case SlippageType.HIGH:
      return `${values[slippageType]}%`;

    case SlippageType.AUTO:
      return t("auto");
    case SlippageType.CUSTOM:
      return `${value}% ${t("custom")}`;
  }
}

export default function SwapSettingsDialog({ isOpen, setIsOpen }: Props) {
  const t = useTranslations("Swap");

  const {
    setSlippage,
    setDeadline,
    deadline,
    slippage,
    slippageType: _slippageType,
    setSlippageType: _setSlippageType,
  } = useSwapSettingsStore();

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

    _setSlippageType(slippageType);

    setIsOpen(false);
    addToast(t("settings_applied"));
  }, [
    _setSlippageType,
    customDeadline,
    customSlippage,
    setDeadline,
    setIsOpen,
    setSlippage,
    slippageType,
    t,
  ]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);

    setTimeout(() => {
      if (_slippageType !== SlippageType.CUSTOM) {
        setCustomSlippage("");
      }

      setSlippageType(_slippageType);
      setCustomDeadline(deadline);
    }, 400);
  }, [_slippageType, deadline, setIsOpen]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title={t("settings")} />
      <div className="px-4 md:px-10 pt-4 md:pt-10 pb-4 md:pb-5.5 w-full md:w-[600px]">
        <div className="flex justify-between items-center mb-1">
          <div className="flex gap-1 items-center">
            <h3 className="font-bold text-16">{t("maximum_slippage")}</h3>
            <Tooltip text="Tooltip" />
          </div>
          <span className="text-secondary-text">{getTitle(slippageType, customSlippage, t)}</span>
        </div>
        <div className="flex gap-5">
          <span>
            <SettingsButton
              onClick={() => setSlippageType(SlippageType.AUTO)}
              isActive={slippageType === SlippageType.AUTO}
              text={t("auto")}
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
              placeholder={t("custom")}
              value={customSlippage}
              onChange={(e) => setCustomSlippage(e.target.value)}
              isActive={slippageType === SlippageType.CUSTOM}
            />
          </SettingsButtons>
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-center">
            <p className={clsx("text-16 font-bold mb-1 flex items-center gap-1")}>
              {t("transaction_deadline")}
              <Tooltip iconSize={24} text={"Tooltip text"} />
            </p>
            {customDeadline !== 20 && (
              <TextButton className="pr-0" endIcon="reset" onClick={() => setCustomDeadline(20)}>
                {t("set_default")}
              </TextButton>
            )}
          </div>

          <div className="relative">
            <Input
              className="pr-[100px]"
              value={customDeadline}
              onChange={(e) => {
                setCustomDeadline(+e.target.value);
              }}
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-secondary-text">
              {t("minutes")}
            </span>
          </div>

          <div className="text-12 mt-0.5 h-4" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button fullWidth variant={ButtonVariant.OUTLINED} onClick={handleCancel}>
            {t("cancel")}
          </Button>
          <Button fullWidth onClick={handleSave}>
            {t("save_settings")}
          </Button>
        </div>
      </div>
    </DrawerDialog>
  );
}
