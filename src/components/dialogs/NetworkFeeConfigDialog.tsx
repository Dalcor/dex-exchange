import clsx from "clsx";
import { Form, Formik } from "formik";
import React, { ReactNode, useCallback, useState } from "react";
import { formatGwei, parseGwei } from "viem";

import useSwap from "@/app/[locale]/swap/hooks/useSwap";
import useSwapGas from "@/app/[locale]/swap/hooks/useSwapGas";
import {
  GasOption,
  useSwapGasSettingsStore,
} from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Svg from "@/components/atoms/Svg";
import Switch from "@/components/atoms/Switch";
import TextField from "@/components/atoms/TextField";
import Tooltip from "@/components/atoms/Tooltip";
import Button, { ButtonVariant } from "@/components/buttons/Button";
import { baseFeeMultipliers, SCALING_FACTOR } from "@/config/constants/baseFeeMultipliers";
import { formatFloat } from "@/functions/formatFloat";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import addToast from "@/other/toast";
import { DexChainId } from "@/sdk_hybrid/chains";
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

function getInitialCustomValue(
  initialOption: GasOption,
  estimatedValue: bigint | undefined,
  initialValue: bigint | undefined,
  chainId: DexChainId,
) {
  if (initialOption === GasOption.CUSTOM && initialValue) {
    return formatGwei(initialValue);
  }

  if (estimatedValue) {
    return formatGwei(
      (estimatedValue * baseFeeMultipliers[chainId][GasOption.CHEAP]) / SCALING_FACTOR,
    );
  }
  return "";
}
function NetworkFeeDialogContent({
  setIsOpen,
  isAdvanced,
}: {
  setIsOpen: (isOpen: boolean) => void;
  isAdvanced: boolean;
}) {
  const chainId = useCurrentChainId();
  const { gasOption, gasPrice } = useSwapGasSettingsStore();

  const { estimatedGas } = useSwap();

  const {
    handleApply,
    estimatedMaxFeePerGas,
    estimatedMaxPriorityFeePerGas,
    estimatedGasPriceLegacy,
  } = useSwapGas();

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  console.log(gasPrice);

  return (
    <Formik
      // enableReinitialize
      initialValues={{
        maxFeePerGas: getInitialCustomValue(
          gasOption,
          estimatedMaxFeePerGas,
          gasPrice.model === GasFeeModel.EIP1559 ? gasPrice.maxFeePerGas : undefined,
          chainId,
        ),
        maxPriorityFeePerGas: getInitialCustomValue(
          gasOption,
          estimatedMaxPriorityFeePerGas,
          gasPrice.model === GasFeeModel.EIP1559 ? gasPrice.maxPriorityFeePerGas : undefined,
          chainId,
        ),
        gasPrice: getInitialCustomValue(
          gasOption,
          estimatedGasPriceLegacy,
          gasPrice.model === GasFeeModel.LEGACY ? gasPrice.gasPrice : undefined,
          chainId,
        ),
        gasOption,
        gasPriceModel: gasPrice.model,
        gasLimit: estimatedGas ? estimatedGas.toString() : "100000",
      }}
      onSubmit={(values, formikHelpers) => {
        if (values.gasOption !== GasOption.CUSTOM) {
          handleApply({ option: values.gasOption });
        } else {
          if (values.gasPriceModel === GasFeeModel.EIP1559 || !isAdvanced) {
            handleApply({
              option: GasOption.CUSTOM,
              gasSettings: {
                model: GasFeeModel.EIP1559,
                maxFeePerGas: parseGwei(values.maxFeePerGas),
                maxPriorityFeePerGas: parseGwei(values.maxPriorityFeePerGas),
              },
            });
          } else {
            if (values.gasPriceModel === GasFeeModel.LEGACY) {
              handleApply({
                option: GasOption.CUSTOM,
                gasSettings: {
                  model: GasFeeModel.LEGACY,
                  gasPrice: parseGwei(values.gasPrice),
                },
              });
            }
          }
        }

        setIsOpen(false);
        addToast("Settings applied");
        console.log(values);
      }}
    >
      {({
        submitForm,
        isSubmitting,
        handleChange,
        handleBlur,
        values,
        errors,
        touched,
        setFieldValue,
      }) => {
        return (
          <Form>
            <div className="flex flex-col gap-2 px-4 md:px-10">
              {gasOptions.map((_gasOption) => {
                return (
                  <div
                    onClick={() => setFieldValue("gasOption", _gasOption)}
                    key={_gasOption}
                    className={clsx(
                      "w-full rounded-3 bg-tertiary-bg group cursor-pointer",
                      values.gasOption === _gasOption && "cursor-auto",
                    )}
                  >
                    <div
                      className={clsx(
                        "flex justify-between px-5 items-center min-h-12",
                        GasOption.CUSTOM === _gasOption && "border-primary-bg",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={clsx(
                            "w-4 h-4 duration-200 before:duration-200 border bg-secondary-bg rounded-full before:w-2.5 before:h-2.5 before:absolute before:top-1/2 before:rounded-full before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 relative",
                            values.gasOption === _gasOption
                              ? "border-green before:bg-green"
                              : "border-secondary-border group-hover:border-green",
                          )}
                        />
                        {gasOptionIcon[_gasOption]}
                        {gasOptionTitle[_gasOption]}
                        <span className="text-secondary-text">
                          <Tooltip iconSize={20} text="Tooltip text" />
                        </span>
                        <span className="text-secondary-text">~0.00$</span>
                      </div>
                    </div>

                    {_gasOption === GasOption.CUSTOM && (
                      <div
                        className={clsx(
                          values.gasOption !== GasOption.CUSTOM && "opacity-30 pointer-events-none",
                        )}
                      >
                        {!isAdvanced && (
                          <div className={clsx("px-5 pb-4")}>
                            <div className="grid gap-3 grid-cols-2 mt-4">
                              <TextField
                                placeholder="Max fee"
                                label="Max fee"
                                name="maxFeePerGas"
                                id="maxFeePerGas"
                                tooltipText="Max fee tooltip"
                                value={values.maxFeePerGas}
                                onChange={(e) => {
                                  handleChange(e);
                                  // setEmail(e.target.value);
                                }}
                                helperText={
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (estimatedMaxFeePerGas) {
                                          setFieldValue(
                                            "maxFeePerGas",
                                            formatGwei(estimatedMaxFeePerGas),
                                          );
                                        }

                                        // setUnsavedMaxFeePerGas( || BigInt(0));
                                      }}
                                      className="text-green"
                                    >
                                      Current
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
                                name="maxPriorityFeePerGas"
                                id="maxPriorityFeePerGas"
                                tooltipText="Max priority tooltip"
                                value={values.maxPriorityFeePerGas}
                                onChange={(e) => {
                                  handleChange(e);
                                }}
                                helperText={
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (estimatedMaxPriorityFeePerGas) {
                                          setFieldValue(
                                            "maxPriorityFeePerGas",
                                            formatGwei(estimatedMaxPriorityFeePerGas),
                                          );
                                        }
                                      }}
                                      className="text-green"
                                    >
                                      Current
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
                                  type="button"
                                  className={clsx(
                                    values.gasPriceModel === GasFeeModel.EIP1559
                                      ? "bg-green-bg border-green"
                                      : "bg-primary-bg border-transparent",
                                    "flex flex-col gap-1 justify-center items-center py-3 px-5 border hover:bg-green-bg rounded-3 duration-200",
                                  )}
                                  onClick={() =>
                                    setFieldValue("gasPriceModel", GasFeeModel.EIP1559)
                                  }
                                >
                                  <span className="flex items-center gap-1">
                                    EIP-1559 <Tooltip text="WOOTLAMN" />
                                  </span>
                                  <span className="text-secondary-text text-12">
                                    Network Fee = gasLimit × (Base Fee + PriorityFee)
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  className={clsx(
                                    values.gasPriceModel === GasFeeModel.LEGACY
                                      ? "bg-green-bg border-green"
                                      : "bg-primary-bg border-transparent",
                                    "flex flex-col gap-1 justify-center items-center py-3 px-5 border hover:bg-green-bg rounded-3 duration-200",
                                  )}
                                  onClick={() => setFieldValue("gasPriceModel", GasFeeModel.LEGACY)}
                                >
                                  <span className="flex items-center gap-1">
                                    Legacy <Tooltip text="WOOTLAMN" />
                                  </span>
                                  <span className="text-secondary-text text-12">
                                    Network Fee = gasLimit × gasPrice
                                  </span>
                                </button>
                              </div>
                              {values.gasPriceModel === GasFeeModel.EIP1559 && (
                                <div className="grid gap-3 grid-cols-2 mt-4">
                                  <TextField
                                    placeholder="Max fee"
                                    label="Max fee"
                                    name="maxFeePerGas"
                                    id="maxFeePerGas"
                                    tooltipText="Max fee tooltip"
                                    value={values.maxFeePerGas}
                                    onChange={(e) => {
                                      handleChange(e);
                                      // setEmail(e.target.value);
                                    }}
                                    helperText={
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (estimatedMaxFeePerGas) {
                                              setFieldValue(
                                                "maxFeePerGas",
                                                formatGwei(estimatedMaxFeePerGas),
                                              );
                                            }

                                            // setUnsavedMaxFeePerGas( || BigInt(0));
                                          }}
                                          className="text-green"
                                        >
                                          Current
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
                                    name="maxPriorityFeePerGas"
                                    id="maxPriorityFeePerGas"
                                    tooltipText="Max priority tooltip"
                                    value={values.maxPriorityFeePerGas}
                                    onChange={(e) => {
                                      handleChange(e);
                                    }}
                                    helperText={
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (estimatedMaxPriorityFeePerGas) {
                                              setFieldValue(
                                                "maxPriorityFeePerGas",
                                                formatGwei(estimatedMaxPriorityFeePerGas),
                                              );
                                            }
                                          }}
                                          className="text-green"
                                        >
                                          Current
                                        </button>{" "}
                                        {estimatedMaxPriorityFeePerGas
                                          ? formatFloat(formatGwei(estimatedMaxPriorityFeePerGas))
                                          : "0"}{" "}
                                        Gwei
                                      </div>
                                    }
                                  />
                                </div>
                              )}
                              {values.gasPriceModel === GasFeeModel.LEGACY && (
                                <div className="mt-4">
                                  <TextField
                                    placeholder="Gas price"
                                    label="Gas price"
                                    name="gasPrice"
                                    id="gasPrice"
                                    tooltipText="Gas price tooltip"
                                    value={values.gasPrice}
                                    onChange={(e) => {
                                      handleChange(e);
                                    }}
                                    helperText={
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (estimatedGasPriceLegacy) {
                                              setFieldValue(
                                                "gasPrice",
                                                formatGwei(estimatedGasPriceLegacy),
                                              );
                                            }
                                          }}
                                          className="text-green"
                                        >
                                          Current
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
                              value={values.gasLimit}
                              onChange={(e) => setFieldValue("gasLimit", e.target.value)}
                              helperText={
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      setFieldValue(
                                        "gasLimit",
                                        estimatedGas ? estimatedGas.toString() : "100000",
                                      );
                                    }}
                                    className="text-green"
                                  >
                                    Estimated
                                  </button>{" "}
                                  {estimatedGas ? estimatedGas?.toString() : 100000} Gwei
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
              <Button type="submit" fullWidth>
                Apply
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
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
