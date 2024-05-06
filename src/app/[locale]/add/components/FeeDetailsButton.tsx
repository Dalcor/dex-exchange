import { useState } from "react";
import { formatEther, formatGwei, formatUnits } from "viem";
import { useAccount } from "wagmi";

import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import Badge from "@/components/badges/Badge";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import { formatFloat } from "@/functions/formatFloat";

import { ApproveTransaction } from "../hooks/useLiquidityApprove";

export const FeeDetailsButton = ({
  approveTransactions,
  gasPrice,
}: {
  approveTransactions: ApproveTransaction[];
  gasPrice?: bigint;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { chain } = useAccount();

  const totalGasLimit = approveTransactions.reduce((acc, { estimatedGas }) => {
    return estimatedGas ? acc + estimatedGas : acc;
  }, BigInt(0));
  return (
    <div className="">
      <Button
        onClick={() => setIsOpen(true)}
        size={ButtonSize.EXTRA_SMALL}
        variant={ButtonVariant.OUTLINED}
      >
        Details
      </Button>

      <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
        <DialogHeader onClose={() => setIsOpen(false)} title="Fee details" />
        <div className="w-[570px] px-10 pb-4">
          {approveTransactions.map(({ token, standard, amount, estimatedGas }, index) => {
            return (
              <div key="1" className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div className="flex justify-center items-center rounded-full min-h-10 min-w-10 w-10 h-10 bg-green-bg">
                    {index + 1}
                  </div>
                  <div className="w-[2px] bg-green-bg h-full my-2 rounded-3"></div>
                </div>
                <div className="w-full">
                  <div className="flex gap-2 py-2 items-center">
                    <span>{`${standard === "ERC-20" ? "Approve" : "Deposit"} for ${token.symbol}`}</span>
                    <Badge color="green" text={standard} />
                  </div>
                  <div className="flex justify-between bg-secondary-bg px-5 py-3 rounded-3 text-secondary-text mt-2">
                    <span>{formatUnits(amount || BigInt(0), token.decimals)}</span>
                    <span>{`Amount ${token.symbol}`}</span>
                  </div>
                  <div className="flex justify-between bg-tertiary-bg px-5 py-3 rounded-3 mb-5 mt-2">
                    <div className="flex flex-col">
                      <span className="text-14 text-secondary-text">Gas price</span>
                      <span>{gasPrice ? formatFloat(formatGwei(gasPrice)) : ""} GWEI</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-14 text-secondary-text">Gas limit</span>
                      <span>{estimatedGas?.toString()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-14 text-secondary-text">Fee</span>
                      <span>{`${gasPrice && estimatedGas ? formatFloat(formatEther(gasPrice * estimatedGas)) : ""} ${chain?.nativeCurrency.symbol}`}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div key="1" className="flex gap-2">
            <div className="flex flex-col items-center">
              <div className="flex justify-center items-center rounded-full min-h-10 min-w-10 w-10 h-10 bg-green-bg">
                {approveTransactions.length + 1}
              </div>
            </div>
            <div className="w-full">
              <div className="flex gap-2 py-2 items-center">
                <span>Add liquidity</span>
              </div>
              <div className="flex justify-between bg-tertiary-bg px-5 py-3 rounded-3 mb-5 mt-2">
                <div className="flex flex-col">
                  <span className="text-14 text-secondary-text">Gas price</span>
                  <span>{gasPrice ? formatFloat(formatGwei(gasPrice)) : ""} GWEI</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-14 text-secondary-text">Gas limit</span>
                  <span>{0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-14 text-secondary-text">Fee</span>
                  <span>{`${gasPrice ? formatFloat(formatEther(gasPrice * BigInt(0))) : ""} ${chain?.nativeCurrency.symbol}`}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-1 justify-center items-center border-t pt-4 border-secondary-border">
            <span className="text-secondary-text">Total fee</span>
            <span className="font-bold">{`${gasPrice && totalGasLimit ? formatFloat(formatEther(gasPrice * totalGasLimit)) : ""} ${chain?.nativeCurrency.symbol}`}</span>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
