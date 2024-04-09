"use client";

import { useEffect, useState } from "react";
import { formatGwei, GetFeeHistoryReturnType } from "viem";
import {
  useBlock,
  useEstimateFeesPerGas,
  useEstimateMaxPriorityFeePerGas,
  useGasPrice,
  usePublicClient,
} from "wagmi";

import Container from "@/components/atoms/Container";
import { formatFloat } from "@/functions/formatFloat";
import { IIFE } from "@/functions/iife";

function formatGweiIfExist(value: bigint | undefined | null) {
  return value != null ? formatFloat(formatGwei(value)) : "Loading...";
}

function getAverageValueFromArray(arr: number[]) {
  const sortedArr = arr.sort();
  let sum = sortedArr[4] + sortedArr[5];

  // const filteredArr = arr.filter((v) => Boolean(v));
  // const filteredArr = arr;
  // for (let i = 0; i < filteredArr.length; i++) {
  //   sum += arr[i];
  // }
  return sortedArr[2];
}

const percentiles = [5, 10, 15, 85];
export default function GasPage() {
  const { data: gasPrice, refetch: refetchGasPrice } = useGasPrice();
  const { data: estimatedMaxPriorityFee, refetch: refetchMaxPriority } =
    useEstimateMaxPriorityFeePerGas();
  const { data: estimatedFees, refetch: refetchFeesPerGas } = useEstimateFeesPerGas();
  const { data: block } = useBlock({ watch: true, blockTag: "latest" });

  const [feeHistory, setFeeHistory] = useState<GetFeeHistoryReturnType>();

  const publicClient = usePublicClient();

  const [averages, setAverages] = useState([0, 0, 0, 0]);

  console.log(formatGwei(BigInt(10000000)));

  useEffect(() => {
    IIFE(async () => {
      if (!publicClient) {
        return;
      }

      const _feeHistory = await publicClient.getFeeHistory({
        blockCount: 5,
        rewardPercentiles: percentiles,
      });

      const __feeHistory = await publicClient.estimateMaxPriorityFeePerGas();

      console.log(_feeHistory);
      console.log(__feeHistory);

      const firstPercentileArr: number[] = [];
      const secondPercentileArr: number[] = [];
      const thirdPercentileArr: number[] = [];
      const fourthPercentileArr: number[] = [];

      _feeHistory?.reward?.map((reward) => {
        firstPercentileArr.push(+formatGwei(reward[0]));
        secondPercentileArr.push(+formatGwei(reward[1]));
        thirdPercentileArr.push(+formatGwei(reward[2]));
        fourthPercentileArr.push(+formatGwei(reward[3]));
      });

      setAverages([
        getAverageValueFromArray(firstPercentileArr),
        getAverageValueFromArray(secondPercentileArr),
        getAverageValueFromArray(thirdPercentileArr),
        getAverageValueFromArray(fourthPercentileArr),
      ]);

      setFeeHistory(_feeHistory);
    });
  }, [publicClient, block]);

  useEffect(() => {
    refetchGasPrice();
    refetchFeesPerGas();
    refetchMaxPriority();
  }, [block, refetchFeesPerGas, refetchGasPrice, refetchMaxPriority]);

  return (
    <Container>
      <h1 className="text-24 font-bold text-center">Gas tracking & predictions</h1>
      <div className="flex my-10 gap-3 flex-col">
        <div className="p-5 rounded-2 flex justify-between bg-tertiary-bg">
          <span>Gas price:</span>
          <span>{formatGweiIfExist(gasPrice)}</span>
        </div>
        <div className="p-5 rounded-2 flex justify-between bg-tertiary-bg">
          <span>Estimated maxFeePerGas:</span>
          <span>{formatGweiIfExist(estimatedFees?.maxFeePerGas)}</span>
        </div>
        <div className="p-5 rounded-2 flex justify-between bg-tertiary-bg">
          <span>Estimated maxPriorityV1:</span>
          <span>{formatGweiIfExist(estimatedFees?.maxPriorityFeePerGas)}</span>
        </div>
        <div className="p-5 rounded-2 flex justify-between bg-tertiary-bg">
          <span>Estimated maxProrityFeeV2:</span>
          <span>{formatGweiIfExist(estimatedMaxPriorityFee)}</span>
        </div>
        <div className="p-5 rounded-2 flex justify-between bg-tertiary-bg">
          <span>Base fee from last block: </span>
          <span>{formatGweiIfExist(block?.baseFeePerGas)}</span>
        </div>
        <div className="p-5 rounded-2 flex justify-between bg-tertiary-bg">
          <span>Base fee-s history:</span>
          <span className="flex flex-col gap-2">
            {feeHistory?.baseFeePerGas.map((v) => <span>{formatGweiIfExist(v)}</span>)}
          </span>
          <span className="flex flex-col gap-2">
            {feeHistory?.baseFeePerGas.map((v) => (
              <span>{formatGweiIfExist(v ? (v * BigInt(12)) / BigInt(10) : null)}</span>
            ))}
          </span>
        </div>
        {/*<div className="p-5 rounded-2 flex justify-between bg-tertiary-bg">*/}
        {/*  <span>Gas used ratio-s:</span>*/}
        {/*  <span className="flex flex-col gap-2">*/}
        {/*    {" "}*/}
        {/*    {feeHistory?.gasUsedRatio.map((v) => <span>{v}</span>)}*/}
        {/*  </span>*/}
        {/*</div>*/}
        <div className="p-5 rounded-2 flex justify-between bg-tertiary-bg">
          <span>Fee history:</span>
          <div className="grid">
            <span className="grid w-[800px] grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr]">
              <span>Base Fee</span>
              <span>Used Block Ratio</span>
              <span>{percentiles[0]} percentile</span>
              <span>{percentiles[1]} percentile</span>
              <span>{percentiles[2]} percentile</span>
              <span>{percentiles[3]} percentile</span>
            </span>
            <span className="grid w-[800px] grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr]">
              {feeHistory?.reward?.map((v, index) => (
                <>
                  <span>{formatGweiIfExist(feeHistory?.baseFeePerGas[index])}</span>
                  <span>{feeHistory?.gasUsedRatio[index]}</span>
                  {v.map((_v) => (
                    <span>{formatGweiIfExist(_v)}</span>
                  ))}
                </>
              ))}
            </span>
            <div className="h-[1px] bg-white my-2" />
            <span className="grid w-[800px] grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr]">
              <div>
                {formatGweiIfExist(feeHistory?.baseFeePerGas[feeHistory.baseFeePerGas.length - 1])}
              </div>
              <div>No data</div>
              <div>{formatFloat(averages[0])}</div>
              <div>{formatFloat(averages[1])}</div>
              <div>{formatFloat(averages[2])}</div>
              <div>{formatFloat(averages[3])}</div>
            </span>
          </div>
        </div>
      </div>
    </Container>
  );
}
