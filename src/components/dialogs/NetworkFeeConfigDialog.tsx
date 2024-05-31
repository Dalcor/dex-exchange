import clsx from "clsx";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { formatGwei, parseGwei } from "viem";

import useSwap from "@/app/[locale]/swap/hooks/useSwap";
import useSwapGas from "@/app/[locale]/swap/hooks/useSwapGas";
import {
  GasOption,
  useSwapGasSettingsStore,
} from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import Alert from "@/components/atoms/Alert";
import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Svg from "@/components/atoms/Svg";
import Switch from "@/components/atoms/Switch";
import TextField from "@/components/atoms/TextField";
import Tooltip from "@/components/atoms/Tooltip";
import Button, { ButtonVariant } from "@/components/buttons/Button";
import { formatFloat } from "@/functions/formatFloat";
import addToast from "@/other/toast";
import { GasFeeModel } from "@/stores/useRecentTransactionsStore";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const gasOptionTitle: Record<GasOption, string> = {
  [GasOption.CHEAP]: "Cheap",
  [GasOption.FAST]: "Fast",
  [GasOption.CUSTOM]: "Custom",
};

const gasOptionIcon: Record<GasOption, ReactNode> = {
  [GasOption.CHEAP]: <Svg iconName="cheap-gas" />,
  [GasOption.FAST]: <Svg iconName="fast-gas" />,
  [GasOption.CUSTOM]: <Svg iconName="custom-gas" />,
};

const gasOptions = [GasOption.CHEAP, GasOption.FAST, GasOption.CUSTOM];

function NetworkFeeDialogContent({
  setIsOpen,
  isAdvanced,
}: {
  setIsOpen: (isOpen: boolean) => void;
  isAdvanced: boolean;
}) {
  const { gasOption, gasPrice } = useSwapGasSettingsStore();

  const { estimatedGas } = useSwap();

  const {
    handleApply,
    estimatedMaxFeePerGas,
    estimatedMaxPriorityFeePerGas,
    estimatedGasPriceLegacy,
  } = useSwapGas();

  const [unsavedGasOption, setUnsavedGasOption] = useState(gasOption);
  const [unsavedMaxFeePerGas, setUnsavedMaxFeePerGas] = useState(
    gasPrice.model === GasFeeModel.EIP1559 ? gasPrice.maxFeePerGas || BigInt(0) : BigInt(0),
  );
  const [unsavedMaxPriorityFeePerGas, setUnsavedMaxPriorityFeePerGas] = useState(
    gasPrice.model === GasFeeModel.EIP1559 ? gasPrice.maxPriorityFeePerGas || BigInt(0) : BigInt(0),
  );

  const [unsavedGasPriceModel, setUnsavedGasPriceModel] = useState(gasPrice.model);
  const [unsavedGasPrice, setUnsavedGasPrice] = useState(
    gasPrice.model === GasFeeModel.LEGACY ? gasPrice.gasPrice || BigInt(0) : BigInt(0),
  );

  useEffect(() => {
    if (!unsavedMaxFeePerGas && estimatedMaxFeePerGas) {
      setUnsavedMaxFeePerGas(estimatedMaxFeePerGas);
    }
  }, [estimatedMaxFeePerGas, estimatedMaxPriorityFeePerGas, unsavedMaxFeePerGas]);

  useEffect(() => {
    if (!unsavedGasPrice && estimatedGasPriceLegacy) {
      setUnsavedGasPrice(estimatedGasPriceLegacy);
    }
  }, [estimatedGasPriceLegacy, unsavedGasPrice, unsavedMaxFeePerGas]);

  // useEffect(() => {
  //   if (!unsavedMaxPriorityFeePerGas && estimatedMaxPriorityFeePerGas) {
  //     setUnsavedMaxPriorityFeePerGas(estimatedMaxPriorityFeePerGas);
  //   }
  // }, [estimatedMaxPriorityFeePerGas, unsavedMaxFeePerGas, unsavedMaxPriorityFeePerGas]);

  const [unsavedGasLimit, setUnsavedGasLimit] = useState(estimatedGas || BigInt(130000));

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <>
      <div className="flex flex-col gap-2 px-4 md:px-10">
        {gasOptions.map((_gasOption) => {
          return (
            <div
              onClick={() => setUnsavedGasOption(_gasOption)}
              key={_gasOption}
              className={clsx(
                "w-full rounded-3 bg-tertiary-bg group cursor-pointer",
                unsavedGasOption === _gasOption && "cursor-auto",
              )}
            >
              <div
                className={clsx(
                  "flex justify-between px-5 items-center min-h-12",
                  GasOption.CUSTOM === _gasOption && "border-b border-primary-bg",
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={clsx(
                      "w-4 h-4 duration-200 before:duration-200 border bg-secondary-bg rounded-full before:w-2.5 before:h-2.5 before:absolute before:top-1/2 before:rounded-full before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 relative",
                      unsavedGasOption === _gasOption
                        ? "border-green before:bg-green"
                        : "border-secondary-border group-hover:border-green",
                    )}
                  />
                  {gasOptionIcon[_gasOption]}
                  {gasOptionTitle[_gasOption]}
                  <span className="text-secondary-text">
                    <Tooltip iconSize={20} text="Tooltip text" />
                  </span>
                  <span className="text-secondary-text">~45.13$</span>
                </div>
              </div>

              {_gasOption === GasOption.CUSTOM && (
                <div
                  className={clsx(
                    unsavedGasOption !== GasOption.CUSTOM && "opacity-30 pointer-events-none",
                  )}
                >
                  {!isAdvanced && (
                    <div className={clsx("px-5 pb-4")}>
                      <div className="grid gap-3 grid-cols-2 mt-4">
                        <TextField
                          placeholder="Base fee"
                          label="Base fee"
                          tooltipText="Base fee tooltip"
                          value={formatGwei(unsavedMaxFeePerGas || BigInt(0))}
                          onChange={(e) => setUnsavedMaxFeePerGas(parseGwei(e.target.value))}
                          helperText={
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setUnsavedMaxFeePerGas(estimatedMaxFeePerGas || BigInt(0));
                                }}
                                className="text-green"
                              >
                                Recommended
                              </button>{" "}
                              {estimatedMaxFeePerGas
                                ? formatFloat(formatGwei(estimatedMaxFeePerGas))
                                : "0"}{" "}
                              Gwei
                            </div>
                          }
                        />
                        <TextField
                          placeholder="Priority fee"
                          label="Priority fee"
                          tooltipText="Priority fee tooltip"
                          value={formatGwei(unsavedMaxPriorityFeePerGas || BigInt(0))}
                          onChange={(e) =>
                            setUnsavedMaxPriorityFeePerGas(parseGwei(e.target.value))
                          }
                          helperText={
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setUnsavedMaxPriorityFeePerGas(
                                    estimatedMaxPriorityFeePerGas || BigInt(0),
                                  );
                                }}
                                className="text-green"
                              >
                                Recommended
                              </button>{" "}
                              {estimatedMaxPriorityFeePerGas
                                ? formatFloat(formatGwei(estimatedMaxPriorityFeePerGas))
                                : "0"}{" "}
                              Gwei
                            </div>
                          }
                        />
                      </div>
                    </div>
                  )}

                  {isAdvanced && (
                    <div className="px-5 pb-4">
                      <div className="pb-5">
                        <div className="grid grid-cols-2 gap-1 p-1 rounded-3 bg-secondary-bg">
                          <button
                            className={clsx(
                              unsavedGasPriceModel === GasFeeModel.EIP1559
                                ? "bg-green-bg border-green"
                                : "bg-primary-bg border-transparent",
                              "flex flex-col gap-1 justify-center items-center py-3 px-5 border hover:bg-green-bg rounded-3 duration-200",
                            )}
                            onClick={() => setUnsavedGasPriceModel(GasFeeModel.EIP1559)}
                          >
                            <span className="flex items-center gap-1">
                              EIP-1559 <Tooltip text="WOOTLAMN" />
                            </span>
                            <span className="text-secondary-text text-12">
                              Network Fee = gasLimit × (Base Fee + PriorityFee)
                            </span>
                          </button>
                          <button
                            className={clsx(
                              unsavedGasPriceModel === GasFeeModel.LEGACY
                                ? "bg-green-bg border-green"
                                : "bg-primary-bg border-transparent",
                              "flex flex-col gap-1 justify-center items-center py-3 px-5 border hover:bg-green-bg rounded-3 duration-200",
                            )}
                            onClick={() => setUnsavedGasPriceModel(GasFeeModel.LEGACY)}
                          >
                            <span className="flex items-center gap-1">
                              Legacy <Tooltip text="WOOTLAMN" />
                            </span>
                            <span className="text-secondary-text text-12">
                              Network Fee = gasLimit × gasPrice
                            </span>
                          </button>
                        </div>
                        {unsavedGasPriceModel === GasFeeModel.EIP1559 && (
                          <>
                            <div className="grid gap-3 grid-cols-2 mt-4">
                              <TextField
                                placeholder="Base fee"
                                label="Base fee"
                                tooltipText="Base fee tooltip"
                                value={formatGwei(unsavedMaxFeePerGas || BigInt(0))}
                                onChange={(e) => setUnsavedMaxFeePerGas(parseGwei(e.target.value))}
                                helperText={
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setUnsavedMaxFeePerGas(estimatedMaxFeePerGas || BigInt(0));
                                      }}
                                      className="text-green"
                                    >
                                      Recommended
                                    </button>{" "}
                                    {estimatedMaxFeePerGas
                                      ? formatFloat(formatGwei(estimatedMaxFeePerGas))
                                      : "0"}{" "}
                                    Gwei
                                  </div>
                                }
                              />
                              <TextField
                                placeholder="Priority fee"
                                label="Priority fee"
                                tooltipText="Priority fee tooltip"
                                value={formatGwei(unsavedMaxPriorityFeePerGas || BigInt(0))}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    setUnsavedMaxPriorityFeePerGas(parseGwei(e.target.value));
                                  }
                                }}
                                helperText={
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setUnsavedMaxPriorityFeePerGas(
                                          estimatedMaxPriorityFeePerGas || BigInt(0),
                                        );
                                      }}
                                      className="text-green"
                                    >
                                      Recommended
                                    </button>{" "}
                                    {estimatedMaxPriorityFeePerGas
                                      ? formatFloat(formatGwei(estimatedMaxPriorityFeePerGas))
                                      : "0"}{" "}
                                    Gwei
                                  </div>
                                }
                              />
                            </div>
                            <Alert
                              text="Сhanging Priority Fee only in order to make transaction cheaper or
                                speed it up at a cost of paying higher fee."
                              type="info-border"
                            />
                          </>
                        )}
                        {unsavedGasPriceModel === GasFeeModel.LEGACY && (
                          <div className="mt-4">
                            <TextField
                              placeholder="Priority fee"
                              label="Priority fee"
                              tooltipText="Priority fee tooltip"
                              value={formatGwei(unsavedGasPrice || BigInt(0))}
                              onChange={(e) => setUnsavedGasPrice(parseGwei(e.target.value))}
                              helperText={
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setUnsavedGasPrice(estimatedGasPriceLegacy || BigInt(0));
                                    }}
                                    className="text-green"
                                  >
                                    Recommended
                                  </button>{" "}
                                  {estimatedGasPriceLegacy
                                    ? formatFloat(formatGwei(estimatedGasPriceLegacy))
                                    : "0"}{" "}
                                  Gwei
                                </div>
                              }
                            />
                          </div>
                        )}
                      </div>
                      <TextField
                        placeholder="Gas limit"
                        label="Gas limit"
                        tooltipText="gasLimit is a measure of actions that a contract can perform in your transaction. Setting gasLimit to a low value may result in your transaction not being able to perform the necessary actions (i.e. purchase tokens) and fail. We don't recommend changing this unless you absolutely know what you're doing."
                        value={unsavedGasLimit.toString()}
                        onChange={(e) => setUnsavedGasLimit(BigInt(e.target.value))}
                        helperText={
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                setUnsavedGasLimit(estimatedGas || BigInt(120000));
                              }}
                              className="text-green"
                            >
                              Estimated
                            </button>{" "}
                            {estimatedGas?.toString() || 120000} Gwei
                          </div>
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="px-4 pb-4 md:px-10 md:pb-10 pt-5 grid grid-cols-2 gap-3">
        <Button fullWidth onClick={handleCancel} variant={ButtonVariant.OUTLINED}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (unsavedGasOption !== GasOption.CUSTOM) {
              handleApply({ option: unsavedGasOption });
            } else {
              if (unsavedGasPriceModel === GasFeeModel.EIP1559 || !isAdvanced) {
                handleApply({
                  option: GasOption.CUSTOM,
                  gasSettings: {
                    model: GasFeeModel.EIP1559,
                    maxFeePerGas: unsavedMaxFeePerGas,
                    maxPriorityFeePerGas: unsavedMaxPriorityFeePerGas,
                  },
                });
              } else {
                if (unsavedGasPriceModel === GasFeeModel.LEGACY) {
                  handleApply({
                    option: GasOption.CUSTOM,
                    gasSettings: {
                      model: GasFeeModel.LEGACY,
                      gasPrice: unsavedGasPrice,
                    },
                  });
                }
              }
            }

            setIsOpen(false);
            addToast("Settings applied");
          }}
          fullWidth
        >
          Apply
        </Button>
      </div>
    </>
  );
}
export default function NetworkFeeConfigDialog({ isOpen, setIsOpen }: Props) {
  const [isAdvanced, setIsAdvanced] = useState(false);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="w-full md:w-[800px] duration-200">
        <DialogHeader
          onClose={() => setIsOpen(false)}
          title="Gas settings"
          settings={
            <div className="flex items-center gap-2">
              <span className="text-12">Advanced mode</span>
              <Switch checked={isAdvanced} handleChange={() => setIsAdvanced(!isAdvanced)} />
            </div>
          }
        />
        <NetworkFeeDialogContent setIsOpen={setIsOpen} isAdvanced={isAdvanced} />
      </div>
    </DrawerDialog>
  );
}
