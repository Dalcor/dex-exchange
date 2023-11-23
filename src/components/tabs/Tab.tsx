import React from "react";

interface Props {
  title: string,
  children: any
}

function Tab({ children }: Props) {
  return <div className="flex-grow">{children}</div>;
}

export default Tab;
