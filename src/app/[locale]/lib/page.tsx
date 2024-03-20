"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";

import AwaitingLoader from "@/components/atoms/AwaitingLoader";
import Button from "@/components/atoms/Button";
import Checkbox from "@/components/atoms/Checkbox";
import Dialog from "@/components/atoms/Dialog";
import Switch from "@/components/atoms/Switch";
import TextField from "@/components/atoms/TextField";
import Badge from "@/components/badges/Badge";
import RangeBadge from "@/components/badges/RangeBadge";
import IncrementDecrementIconButton from "@/components/buttons/IncrementDecrementIconButton";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import ZoomButton from "@/components/buttons/ZoomButton";
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
          <Button onClick={() => setDialogOpened(true)} variant="outline">
            Open Dialog
          </Button>
        </div>

        <div className="inline-flex gap-1 ml-7">
          <Button size="regular">Regular contained button</Button>
          <Button size="regular" variant="outline">
            Regular outline button
          </Button>
        </div>

        <div className="inline-flex gap-1 ml-7">
          <Button size="small">Small contained button</Button>
          <Button size="small" variant="outline">
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

          <Switch checked={isSwitchOn} setChecked={() => setSwitchOn(!isSwitchOn)} />
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
          <AwaitingLoader size={30} />
          <AwaitingLoader />
          <AwaitingLoader size={70} />
        </div>
      </div>

      <div className="p-3 border border-primary-border">
        <h2 className="mb-3 border-b border-primary-border pb-3">Icon Buttons</h2>
        <div className="inline-flex gap-3 py-3 items-center">
          <SystemIconButton iconName="close" />

          <IncrementDecrementIconButton icon="add" />
          <IncrementDecrementIconButton icon="minus" />

          <ZoomButton icon="zoom-in" />
          <ZoomButton icon="zoom-out" />
        </div>
      </div>

      <div className="p-3 border border-primary-border">
        <h2 className="mb-3 border-b border-primary-border pb-3">Toasts</h2>
        <div className="inline-flex gap-3 py-3 items-center">
          <Button
            size="small"
            variant="outline"
            onClick={() => {
              addToast("This is success Toast");
            }}
          >
            Success
          </Button>

          <Button
            size="small"
            variant="outline"
            onClick={() => {
              addToast("This is info Toast", "info");
            }}
          >
            Info
          </Button>

          <Button
            size="small"
            variant="outline"
            onClick={() => {
              addToast("This is warning Toast", "warning");
            }}
          >
            Warning
          </Button>

          <Button
            size="small"
            variant="outline"
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
          <RangeBadge status="in-range" />
          <RangeBadge status="out-of-range" />
          <RangeBadge status="closed" />
          <span>|</span>
          <div className="flex gap-3 items-center">
            <Badge color="blue" text="Custom" />
            <Badge color="red" text="Risky" />
            <Badge color="grey" text="67% select" />
          </div>
        </div>
      </div>
    </div>
  );
}
