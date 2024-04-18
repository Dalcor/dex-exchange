import Image from "next/image";
import { Address } from "viem";

import Svg from "@/components/atoms/Svg";
import TrustBadge from "@/components/badges/TrustBadge";
import { Token, TokenStandard } from "@/sdk_hybrid/entities/token";

interface Props {
  tokenA: Token | undefined;
  tokenB: Token | undefined;
}
export default function SelectedTokensInfo({ tokenA, tokenB }: Props) {
  return (
    <div className="w-full bg-primary-bg p-10 grid gap-3 rounded-5">
      <SelectedTokensInfoItem token={tokenA} />
      <SelectedTokensInfoItem token={tokenB} />
    </div>
  );
}

function TokenAddress({
  tokenAddress,
  standard,
}: {
  tokenAddress: Address | undefined;
  standard: TokenStandard;
}) {
  return (
    <div className="flex text-12 overflow-hidden rounded-20">
      <div className="bg-green-bg px-2 flex items-center text-green">{standard}</div>
      <div className="bg-secondary-bg pl-2 pr-[13px] flex gap-1 py-1 text-secondary-text">
        {tokenAddress && `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-6)}`}
        <Svg size={16} iconName="arrow-bottom" />
      </div>
    </div>
  );
}

function AddressPair({ token }: { token: Token | undefined }) {
  return (
    <div className="flex gap-2 items-center">
      <TokenAddress tokenAddress={token?.address0 as Address | undefined} standard="ERC-20" />
      <TokenAddress tokenAddress={token?.address1 as Address | undefined} standard="ERC-223" />
    </div>
  );
}
function SelectedTokensInfoItem({ token }: { token: Token | undefined }) {
  return (
    <div className="bg-tertiary-bg rounded-3 py-2.5 px-5 flex flex-wrap justify-between items-center @container relative z-20">
      <div className="flex items-center gap-2">
        <Image src={token?.logoURI || ""} alt="Ethereum" width={32} height={32} />
        <div className="flex flex-col">
          <div className="flex gap-2 items-center">
            {token?.name?.replace("Token ", "")}
            {/*Tether*/}
            <div className="hidden @[620px]:block">
              <AddressPair token={token} />
            </div>
          </div>
          <div className="text-secondary-text text-12">{token?.symbol}</div>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <TrustBadge rate="high" />
        <div className="flex items-center">
          <span className="text-secondary-text text-14">5</span>
          <div className="text-placeholder-text w-10 h-10 flex items-center justify-center">
            <Svg iconName="list" />
          </div>
        </div>

        <div className="w-10 h-10 flex items-center justify-center">
          <Svg iconName="details" />
        </div>
      </div>
      <div className="@[620px]:hidden w-full mt-3">
        <AddressPair token={token} />
      </div>
    </div>
  );
}
