import React from "react";

import Svg from "@/components/atoms/Svg";
import Badge from "@/components/badges/Badge";

export default function ExternalConverterLink() {
  return (
    <a
      target="_blank"
      href="https://gorbatiukcom.github.io/token-converter/"
      className="flex items-center gap-1 pl-4 pr-5 justify-between rounded-2 bg-primary-bg border-l-4 border-l-green py-3 hover:bg-green-bg duration-200"
    >
      <div className="flex items-center gap-1">
        <Svg iconName="convert" className="text-green mr-1 flex-shrink-0" />
        Convert your <Badge text="ERC-20" /> tokens to <Badge text="ERC-223" />
      </div>
      <Svg className="text-primary-text" iconName="forward" />
    </a>
  );
}
