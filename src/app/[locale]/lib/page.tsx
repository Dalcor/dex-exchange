"use client";
import { useState } from "react";
import Button from "@/components/atoms/Button";
import Dialog from "@/components/atoms/Dialog";
import Checkbox from "@/components/atoms/Checkbox";
import { useTranslations } from "next-intl";
export default function Lib({ params: { locale } }: { params: { locale: string } }) {

  const [isDialogOpened, setDialogOpened] = useState(false);
  const [isCheckboxChecked, setCheckboxChecked] = useState(false);

  const t = useTranslations('Trade');

  return (<div className="grid gap-2 mt-4">
      {t( "trade")}
      <div className="p-3 border border-primary-border">
        <h2 className="mb-3">Buttons</h2>
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
        <h2 className="mb-3">Checkbox/Radio</h2>
        <div className="inline-flex gap-1">
          <Checkbox checked={isCheckboxChecked} id="test" label="This is checkbox" handleChange={() => {
            setCheckboxChecked(!isCheckboxChecked)
          }} />
        </div>
      </div>

    </div>
  )
}
