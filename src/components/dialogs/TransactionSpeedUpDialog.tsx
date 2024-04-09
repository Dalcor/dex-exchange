import clsx from "clsx";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { formatGwei } from "viem";
import { useBlock, useBlockNumber, useWalletClient } from "wagmi";

import { GasOption } from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import Button from "@/components/atoms/Button";
import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import { useTransactionSpeedUpDialogStore } from "@/components/dialogs/stores/useTransactionSpeedUpDialogStore";
import RecentTransaction from "@/components/others/RecentTransaction";

export enum SpeedUpOption {
  AUTO_INCREASE,
  CHEAP,
  FAST,
  CUSTOM,
}

const speedUpOptionTitle: Record<SpeedUpOption, string> = {
  [SpeedUpOption.AUTO_INCREASE]: "+10% increase",
  [SpeedUpOption.CHEAP]: "Cheap",
  [SpeedUpOption.FAST]: "Fast",
  [SpeedUpOption.CUSTOM]: "Custom",
};

const speedUpOptionIcon: Record<SpeedUpOption, ReactNode> = {
  [SpeedUpOption.AUTO_INCREASE]: <Svg iconName="auto-increase" />,
  [SpeedUpOption.CHEAP]: <Svg iconName="cheap-gas" />,
  [SpeedUpOption.FAST]: <Svg iconName="fast-gas" />,
  [SpeedUpOption.CUSTOM]: <Svg iconName="custom-gas" />,
};

const speedUpOptions = [
  SpeedUpOption.AUTO_INCREASE,
  SpeedUpOption.CHEAP,
  SpeedUpOption.FAST,
  SpeedUpOption.CUSTOM,
];
export default function TransactionSpeedUpDialog() {
  const { transaction, isOpen, handleClose } = useTransactionSpeedUpDialogStore();

  const [speedUpOption, setSpeedUpOption] = useState<SpeedUpOption>(SpeedUpOption.AUTO_INCREASE);

  const { data: walletClient } = useWalletClient();

  const handleSpeedUp = useCallback(() => {
    if (!transaction?.params || !walletClient) {
      return;
    }

    walletClient.writeContract({
      nonce: transaction.nonce,
      gas: BigInt(transaction.gas.gas) + BigInt(30000),
      ...transaction.params,
    });
  }, [transaction, walletClient]);

  if (!transaction) {
    return null;
  }

  return (
    <Dialog isOpen={isOpen} setIsOpen={handleClose}>
      <div className="w-[600px]">
        <DialogHeader onClose={handleClose} title="Speed up" />
        <div className="px-10 pb-10">
          <RecentTransaction transaction={transaction} showSpeedUp={false} />
          <div className="flex flex-col gap-2">
            {speedUpOptions.map((_speedUpOption) => {
              return (
                <div
                  onClick={() => setSpeedUpOption(_speedUpOption)}
                  key={_speedUpOption}
                  className={clsx(
                    "w-full rounded-3 bg-tertiary-bg group cursor-pointer",
                    speedUpOption === _speedUpOption && "cursor-auto",
                  )}
                >
                  <div
                    className={clsx(
                      "flex justify-between px-5 items-center min-h-12",
                      SpeedUpOption.CUSTOM === _speedUpOption && "border-b border-primary-bg",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={clsx(
                          "w-4 h-4 duration-200 before:duration-200 border bg-secondary-bg rounded-full before:w-2.5 before:h-2.5 before:absolute before:top-1/2 before:rounded-full before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 relative",
                          speedUpOption === _speedUpOption
                            ? "border-green before:bg-green"
                            : "border-secondary-border group-hover:border-green",
                        )}
                      />
                      {speedUpOptionTitle[_speedUpOption]}
                      {speedUpOptionIcon[_speedUpOption]}
                      <span className="text-secondary-text">
                        <Tooltip iconSize={20} text="Tooltip text" />
                      </span>
                      <span className="text-secondary-text">~45.13$</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div>{transaction?.nonce}</div>
        </div>
        <Button onClick={handleSpeedUp} fullWidth>
          Speed up
        </Button>
      </div>
    </Dialog>
  );
}
