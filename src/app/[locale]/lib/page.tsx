"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";

import Checkbox from "@/components/atoms/Checkbox";
import Dialog from "@/components/atoms/Dialog";
import Preloader from "@/components/atoms/Preloader";
import Switch from "@/components/atoms/Switch";
import TextField from "@/components/atoms/TextField";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import RangeBadge, { PositionRangeStatus } from "@/components/badges/RangeBadge";
import Button from "@/components/buttons/Button";
import IconButton, { IconButtonVariant, IconSize } from "@/components/buttons/IconButton";
import addToast from "@/other/toast";

export default function Lib({ params: { locale } }: { params: { locale: string } }) {
  const [isDialogOpened, setDialogOpened] = useState(false);
  const [isCheckboxChecked, setCheckboxChecked] = useState(false);
  const [isSwitchOn, setSwitchOn] = useState(false);

  const t = useTranslations("Trade");

  return (
    <div className="grid gap-2 mt-4">
      {t("trade")}
      <div className="p-3 border border-primary-border">
        <h2 className="mb-3 border-b border-primary-border pb-3">Buttons</h2>
        <div className="inline-flex gap-1">
          <Button>Just button</Button>
          <Button onClick={() => setDialogOpened(true)} variant={ButtonVariant.OUTLINED}>
            Open Dialog
          </Button>
        </div>

        <div className="inline-flex gap-1 ml-7">
          <Button size="regular">Regular contained button</Button>
          <Button size="regular" variant={ButtonVariant.OUTLINED}>
            Regular outline button
          </Button>
        </div>

        <div className="inline-flex gap-1 ml-7">
          <Button size="small">Small contained button</Button>
          <Button size="small" variant={ButtonVariant.OUTLINED}>
            Small outline button
          </Button>
        </div>

        <Dialog isOpen={isDialogOpened} setIsOpen={setDialogOpened}>
          <h2>Test dialog</h2>
          <button onClick={() => setDialogOpened(false)}>Close dialog</button>
        </Dialog>
      </div>

      <div className="p-3 border border-primary-border">
        <h2 className="mb-3 border-b border-primary-border pb-3">Checkbox/Radio</h2>
        <div className="inline-flex gap-3">
          <Checkbox
            checked={isCheckboxChecked}
            id="test"
            label="This is checkbox"
            handleChange={() => {
              setCheckboxChecked(!isCheckboxChecked);
            }}
          />

          <Switch checked={isSwitchOn} handleChange={() => setSwitchOn(!isSwitchOn)} />
        </div>
      </div>

      <div className="p-3 border border-primary-border">
        <h2 className="mb-3 border-b border-primary-border pb-3">Input Fields</h2>
        <div className="inline-flex gap-3">
          <TextField
            label="Text field"
            placeholder="Check it out"
            helperText="This is helper text"
          />
          <TextField
            label="Error text field"
            placeholder="Check it out"
            error="Something is wrong"
          />
        </div>
      </div>

      <div className="p-3 border border-primary-border">
        <h2 className="mb-3 border-b border-primary-border pb-3">Awaiting loaders</h2>
        <div className="inline-flex gap-3 py-3">
          <Preloader type="awaiting" size={30} />
          <Preloader type="awaiting" />
          <Preloader type="awaiting" size={70} />
        </div>
      </div>

      <div className="p-3 border border-primary-border">
        <h2 className="mb-3 border-b border-primary-border pb-3">Icon Buttons</h2>
        <div className="inline-flex gap-3 py-3 items-center">
          <IconButton variant={IconButtonVariant.DEFAULT} iconName="add" />
          <IconButton
            variant={IconButtonVariant.CONTROL}
            iconName="zoom-in"
            iconSize={IconSize.SMALL}
          />
          <IconButton variant={IconButtonVariant.CLOSE} handleClose={() => null} />
          <IconButton
            variant={IconButtonVariant.DELETE}
            handleDelete={() => null}
            iconSize={IconSize.SMALL}
          />
        </div>
      </div>

      <div className="p-3 border border-primary-border">
        <h2 className="mb-3 border-b border-primary-border pb-3">Toasts</h2>
        <div className="inline-flex gap-3 py-3 items-center">
          <Button
            size="small"
            variant={ButtonVariant.OUTLINED}
            onClick={() => {
              addToast("This is success Toast");
            }}
          >
            Success
          </Button>

          <Button
            size="small"
            variant={ButtonVariant.OUTLINED}
            onClick={() => {
              addToast("This is info Toast", "info");
            }}
          >
            Info
          </Button>

          <Button
            size="small"
            variant={ButtonVariant.OUTLINED}
            onClick={() => {
              addToast("This is warning Toast", "warning");
            }}
          >
            Warning
          </Button>

          <Button
            size="small"
            variant={ButtonVariant.OUTLINED}
            onClick={() => {
              addToast("This is error Toast", "error");
            }}
          >
            Error
          </Button>
        </div>
      </div>

      <div className="p-3 border border-primary-border">
        <h2 className="mb-3 border-b border-primary-border pb-3">Pool labels</h2>
        <div className="inline-flex gap-3 py-3 items-center">
          <RangeBadge status={PositionRangeStatus.IN_RANGE} />
          <RangeBadge status={PositionRangeStatus.OUT_OF_RANGE} />
          <RangeBadge status={PositionRangeStatus.CLOSED} />
          <span>|</span>
          <div className="flex gap-3 items-center">
            <Badge color="blue" text="Custom" />
            <Badge color="red" text="Risky" />
            <Badge variant={BadgeVariant.PERCENTAGE} percentage={67} />
          </div>
        </div>
      </div>
    </div>
  );
}
