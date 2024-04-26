import { Address } from "viem";

import Svg from "@/components/atoms/Svg";
import { TokenStandard } from "@/sdk_hybrid/entities/token";

export default function TokenAddressWithStandard({
  tokenAddress,
  standard,
}: {
  tokenAddress: Address | undefined;
  standard: TokenStandard;
}) {
  return (
    <div className="flex text-10">
      <div className="border rounded-l-2 border-primary-bg bg-quaternary-bg px-2 flex items-center text-secondary-text">
        {standard}
      </div>
      <a
        href={`https://sepolia.etherscan.io/address/${tokenAddress}`}
        target="_blank"
        className="bg-secondary-bg pl-2 pr-1 flex gap-1 py-px text-secondary-text hover:text-primary-text
         hover:bg-green-bg duration-200 border border-primary-bg rounded-r-2 items-center border-l-0"
      >
        {tokenAddress && `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-6)}`}
        <Svg size={16} iconName="forward" />
      </a>
    </div>
  );
}
