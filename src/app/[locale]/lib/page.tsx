"use client";
import { useState } from "react";
import Button from "@/components/atoms/Button";
import Dialog from "@/components/atoms/Dialog";
import Checkbox from "@/components/atoms/Checkbox";
import { useTranslations } from "next-intl";
import TextField from "@/components/atoms/TextField";
import Switch from "@/components/atoms/Switch";
export default function Lib({ params: { locale } }: { params: { locale: string } }) {

  const [isDialogOpened, setDialogOpened] = useState(false);
  const [isCheckboxChecked, setCheckboxChecked] = useState(false);
  const [isSwitchOn, setSwitchOn] = useState(false);

  const t = useTranslations('Trade');

  return (<div className="grid gap-2 mt-4">
      {t( "trade")}
      <div className="p-3 border border-primary-border">
        <h2 className="mb-3 border-b border-primary-border pb-3">Buttons</h2>
        <div className="inline-flex gap-1">
          <Button>Just button</Button>
          <Button onClick={() => setDialogOpened(true)} variant="outline">Open Dialog</Button>
        </div>

        <div className="inline-flex gap-1 ml-7">
          <Button size="small">Small contained button</Button>
          <Button size="small" variant="outline">Small outline button</Button>
        </div>

        <Dialog isOpen={isDialogOpened} setIsOpen={setDialogOpened}>
          <h2>Test dialog</h2>
          <button onClick={() => setDialogOpened(false)}>Close dialog</button>
        </Dialog>
      </div>

      <div className="p-3 border border-primary-border">
        <h2 className="mb-3 border-b border-primary-border pb-3">Checkbox/Radio</h2>
        <div className="inline-flex gap-3">
          <Checkbox checked={isCheckboxChecked} id="test" label="This is checkbox" handleChange={() => {
            setCheckboxChecked(!isCheckboxChecked)
          }} />

          <Switch checked={isSwitchOn} setChecked={() => setSwitchOn(!isSwitchOn)} />
        </div>
      </div>

      <div className="p-3 border border-primary-border">
        <h2 className="mb-3 border-b border-primary-border pb-3">Input Fields</h2>
        <div className="inline-flex gap-3">
          <TextField label="Text field" placeholder="Check it out" helperText="This is helper text" />
          <TextField label="Error text field" placeholder="Check it out" error="Something is wrong" />
        </div>
      </div>
    </div>
  )
}
