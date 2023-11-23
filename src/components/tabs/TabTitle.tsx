import React from "react";
import clsx from "clsx";

interface Props {
  title: string,
  index: number,
  selectedTab: number,
  setSelectedTab: (index: number) => void,
}

function TabTitle({ title, setSelectedTab, index, selectedTab }: Props) {
  return (
    <li role="button" className={clsx(
          "duration-200 hover:bg-table-fill py-2.5 w-full flex justify-center border border-primary-border last:border-l-0 last:rounded-r-1 first:rounded-l-1",
          index === selectedTab ? "bg-table-fill text-font-primary" : "bg-block-fill text-font-secondary"
        )} onClick={() => setSelectedTab(index)}>
      {title}
    </li>
  );
}

export default TabTitle;
