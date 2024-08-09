"use client";

import Image from "next/image";

import Container from "@/components/atoms/Container";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonVariant } from "@/components/buttons/Button";
import SelectedTokensInfo from "@/components/common/SelectedTokensInfo";
import TokensPair from "@/components/common/TokensPair";
import { FEE_AMOUNT_DETAIL } from "@/config/constants/liquidityFee";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import { renderShortAddress } from "@/functions/renderAddress";
import { Link, useRouter } from "@/navigation";

import { usePoolData } from "../../hooks";

export default function ExplorePoolPage({
  params,
}: {
  params: {
    chainId: string;
    poolAddress: string;
  };
}) {
  const { chainId, poolAddress } = params;
  const router = useRouter();

  const { data, loading, ...restData } = usePoolData({
    chainId,
    poolAddress,
  } as any);

  if (!data?.pool || loading)
    return (
      <Container>
        <div className="flex justify-center items-center w-full h-[70dvh]">
          <Preloader type="awaiting" size={48} />
        </div>
      </Container>
    );

  const { pool } = data;

  return (
    <Container>
      <div className="w-full md:w-[800px] md:mx-auto md:mt-[40px] mb-5 bg-primary-bg px-10 pb-10 rounded-5">
        <div className="flex justify-between items-center py-1.5 -mx-3">
          <button
            onClick={() => router.push("/pools")}
            className="flex items-center w-12 h-12 justify-center"
          >
            <Svg iconName="back" />
          </button>
          <h2 className="text-20 font-bold">Stats</h2>
          <div className="w-12"></div>
        </div>

        <div className="bg-tertiary-bg rounded-[12px] p-5">
          <div className="flex gap-2 items-center">
            <TokensPair tokenA={pool.token0} tokenB={pool.token1} />
            <span className="text-secondary-text bg-quaternary-bg rounded-20 px-2">
              {`${(FEE_AMOUNT_DETAIL as any)[pool.feeTier as any].label} %`}
            </span>
            <a
              target="_blank"
              href={getExplorerLink(ExplorerLinkType.ADDRESS, pool.id, chainId as any)}
            >
              <div className="flex items-center gap-1 bg-secondary-bg rounded-[8px] px-2 py-1 text-secondary-text hover:text-primary-text">
                <span className="text-12">{renderShortAddress(pool.id)}</span>
                <Svg iconName="forward" size={16} />
              </div>
            </a>
          </div>
          <div className="flex flex-col mt-4 bg-quaternary-bg px-5 py-4 rounded-[12px] gap-3">
            <span className="font-bold">Pool balances</span>
            <div className="flex justify-between">
              <div className="flex gap-1">
                <span>{formatFloat(pool.token0.totalValueLocked)}</span>
                <Image
                  src="/tokens/placeholder.svg"
                  alt="Ethereum"
                  width={24}
                  height={24}
                  className="h-[24px] w-[24px] md:h-[24px] md:w-[24px]"
                />
                <span>{pool.token0?.symbol}</span>
              </div>
              <div className="flex gap-1">
                <span>{formatFloat(pool.token1.totalValueLocked)}</span>
                <Image
                  src="/tokens/placeholder.svg"
                  alt="Ethereum"
                  width={24}
                  height={24}
                  className="h-[24px] w-[24px] md:h-[24px] md:w-[24px]"
                />
                <span>{pool.token1?.symbol}</span>
              </div>
            </div>
            <div className="bg-green h-2 w-full rounded-[20px] overflow-hidden">
              <div
                className="bg-purple h-2"
                style={{
                  width: `${(Number(pool.token0.totalValueLocked) * 100) / (Number(pool.token0.totalValueLocked) + Number(pool.token1.totalValueLocked))}%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <Link href={`/swap?tokenA=${pool.token0.id}&tokenB=${pool.token1.id}`} className="w-full">
            <Button variant={ButtonVariant.OUTLINED} fullWidth>
              <span className="flex items-center gap-2">
                Swap
                <Svg iconName="swap" />
              </span>
            </Button>
          </Link>
          <Link
            href={`/add?tier=3000&tokenA=${pool.token0.id}&tokenB=${pool.token1.id}`}
            className="w-full"
          >
            <Button fullWidth>
              <span className="flex items-center gap-2">
                Add liquidity
                <Svg iconName="add" />
              </span>
            </Button>
          </Link>
        </div>

        <div className="flex w-full justify-between gap-4 mt-4">
          <div className="flex flex-col gap-1 bg-tertiary-bg rounded-[12px] p-4 w-full">
            <span className="text-secondary-text">TVL</span>
            <span className="text-24">{`$${pool.totalValueLockedUSD}`}</span>
          </div>
          <div className="flex flex-col gap-1 bg-tertiary-bg rounded-[12px] p-4 w-full">
            <span className="text-secondary-text">24H volume</span>
            <span className="text-24">{`$${pool.poolDayData?.[0]?.volumeUSD || 0}`}</span>
          </div>
          <div className="flex flex-col gap-1 bg-tertiary-bg rounded-[12px] p-4 w-full">
            <span className="text-secondary-text">24H fees</span>
            <span className="text-24">{`$${pool.poolDayData?.[0]?.feesUSD || 0}`}</span>
          </div>
        </div>
      </div>
      <div className="w-[800px] mx-auto mb-[40px] gap-5 flex flex-col">
        <SelectedTokensInfo
          tokenA={{ ...pool.token0, address0: pool.token0.id, address1: pool.token0.addressERC223 }}
          tokenB={{ ...pool.token1, address0: pool.token1.id, address1: pool.token1.addressERC223 }}
        />
      </div>
    </Container>
  );
}
