import clsx from "clsx";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

import { useTwoVersionsInfoStore } from "@/app/[locale]/swap/stores/useTwoVersionsInfoStore";
import Collapse from "@/components/atoms/Collapse";
import Svg from "@/components/atoms/Svg";

export default function TwoVersionsInfo() {
  const t = useTranslations("Swap");
  const { isOpened, setIsOpened } = useTwoVersionsInfoStore();

  return (
    <div className="bg-standard-gradient border-l-4 border-green rounded-2 overflow-hidden text-14">
      <button
        onClick={() => setIsOpened(!isOpened)}
        className="px-5 py-2 flex justify-between font-medium w-full items-center"
      >
        {t("tokens_in_two_standards_title")}
        <Svg
          className={clsx(isOpened ? "-rotate-180" : "", "duration-200")}
          iconName="small-expand-arrow"
        />
      </button>
      <Collapse open={isOpened}>
        <div className="px-5 pb-2.5">{t("tokens_in_two_standards_paragraph")}</div>
      </Collapse>
    </div>
  );
}
