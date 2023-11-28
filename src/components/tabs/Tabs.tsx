import React, { ReactElement, useState } from "react";
import TabTitle from "./TabTitle";

interface Props {
  children: ReactElement[],
  defaultTab?: number
  activeTab?: number,
  setActiveTab?: any
}

function Tabs({ children, defaultTab = 0, activeTab = 0, setActiveTab = null }: Props) {
  const [selectedTab, setSelectedTab] = useState(defaultTab || 0);

  return (
    <div>
      <ul className="flex rounded-1 w-full">
        {children.map((item, index) => (
          <TabTitle
            key={index}
            selectedTab={activeTab || selectedTab}
            title={item.props.title}
            index={index}
            setSelectedTab={setActiveTab || setSelectedTab}
          />
        ))}

      </ul>
      {children[activeTab || selectedTab]}
    </div>
  );
}

export default Tabs;
