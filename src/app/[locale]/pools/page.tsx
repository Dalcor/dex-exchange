"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import Container from "@/components/atoms/Container";
import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import TabButton from "@/components/buttons/TabButton";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useRouter } from "@/navigation";
import { Token } from "@/sdk_hybrid/entities/token";

import PoolsTable from "./PoolsTable";

export default function PoolsPage() {
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);

  const router = useRouter();

  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");
  const [tokenA, setTokenA] = useState(undefined as Token | undefined);
  const [tokenB, setTokenB] = useState(undefined as Token | undefined);
  const handlePick = useCallback(
    (token?: Token, tokenPicking?: "tokenA" | "tokenB") => {
      const currentlyPickingToken = tokenPicking || currentlyPicking;
      if (currentlyPickingToken === "tokenA") {
        if (!token) {
          setTokenA(undefined);
        } else {
          if (token === tokenB) {
            setTokenB(tokenA);
          }

          setTokenA(token);
        }
      }

      if (currentlyPickingToken === "tokenB") {
        if (!token) {
          setTokenB(undefined);
        } else {
          if (token === tokenA) {
            setTokenA(tokenB);
          }
          setTokenB(token);
        }
      }

      setIsOpenedTokenPick(false);
    },
    [currentlyPicking, setTokenA, setTokenB, tokenA, tokenB, setIsOpenedTokenPick],
  );

  return (
    <Container>
      <div className="py-[40px] px-10 flex flex-col items-center">
        <div className="flex w-full justify-between items-center mb-6">
          <div className="w-[384px] grid grid-cols-2 bg-secondary-bg p-1 gap-1 rounded-3">
            <TabButton inactiveBackground="bg-primary-bg" size={48} active>
              Pools
            </TabButton>
            <TabButton
              inactiveBackground="bg-primary-bg"
              size={48}
              active={false}
              onClick={() => router.push("/pools/positions")}
            >
              Liquidity positions
            </TabButton>
          </div>
          <div className="flex gap-2 items-center">
            <SelectButton
              variant="rectangle-primary"
              fullWidth
              onClick={() => {
                setCurrentlyPicking("tokenA");
                setIsOpenedTokenPick(true);
              }}
              size="medium"
              withArrow={!tokenA}
            >
              {tokenA ? (
                <span className="flex gap-2 items-center">
                  <Image
                    className="flex-shrink-0 hidden md:block"
                    src={tokenA?.logoURI || ""}
                    alt="Ethereum"
                    width={24}
                    height={24}
                  />
                  <Image
                    className="flex-shrink-0 block md:hidden"
                    src={tokenA?.logoURI || ""}
                    alt="Ethereum"
                    width={24}
                    height={24}
                  />
                  <span className="block overflow-ellipsis whitespace-nowrap w-[84px] md:w-[141px] overflow-hidden text-left">
                    {tokenA.symbol}
                  </span>
                  <Svg
                    className="flex-shrink-0"
                    iconName="close"
                    size={20}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePick(undefined, "tokenA");
                    }}
                  />
                </span>
              ) : (
                <span className="text-tertiary-text">Select token</span>
              )}
            </SelectButton>
            <span>—</span>
            <SelectButton
              variant="rectangle-primary"
              fullWidth
              onClick={() => {
                setCurrentlyPicking("tokenB");
                setIsOpenedTokenPick(true);
              }}
              size="medium"
              withArrow={!tokenB}
            >
              {tokenB ? (
                <span className="flex gap-2 items-center">
                  <Image
                    className="flex-shrink-0 hidden md:block"
                    src={tokenB?.logoURI || ""}
                    alt="Ethereum"
                    width={24}
                    height={24}
                  />
                  <Image
                    className="flex-shrink-0 block md:hidden"
                    src={tokenB?.logoURI || ""}
                    alt="Ethereum"
                    width={24}
                    height={24}
                  />
                  <span className="block overflow-ellipsis whitespace-nowrap w-[84px] md:w-[141px] overflow-hidden text-left">
                    {tokenB.symbol}
                  </span>
                  <Svg
                    className="flex-shrink-0"
                    iconName="close"
                    size={20}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePick(undefined, "tokenB");
                    }}
                  />
                </span>
              ) : (
                <span className="text-tertiary-text">Select token</span>
              )}
            </SelectButton>
          </div>
        </div>
        <PoolsTable
          filter={{
            token0Address: tokenA?.address0,
            token1Address: tokenB?.address0,
          }}
        />
      </div>
      <PickTokenDialog
        handlePick={handlePick}
        isOpen={isOpenedTokenPick}
        setIsOpen={setIsOpenedTokenPick}
      />
    </Container>
  );
}
