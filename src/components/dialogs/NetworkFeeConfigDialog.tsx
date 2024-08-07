import clsx from "clsx";
import { useFormik } from "formik";
import React, {
  ChangeEvent,
  FocusEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { formatGwei, parseGwei } from "viem";

import useSwapGas from "@/app/[locale]/swap/hooks/useSwapGas";
import {
  GasOption,
  useSwapGasSettingsStore,
} from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import Alert from "@/components/atoms/Alert";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Svg from "@/components/atoms/Svg";
import Switch from "@/components/atoms/Switch";
import TextField from "@/components/atoms/TextField";
import Tooltip from "@/components/atoms/Tooltip";
import Button, { ButtonVariant } from "@/components/buttons/Button";
import {
  baseFeeMultipliers,
  isEip1559Supported,
  SCALING_FACTOR,
} from "@/config/constants/baseFeeMultipliers";
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

function EIP1559Fields({
  maxFeePerGas,
  maxPriorityFeePerGas,
  handleChange,
  handleBlur,
  currentMaxFeePerGas,
  setMaxFeePerGasValue,
  setMaxPriorityFeePerGasValue,
  currentMaxPriorityFeePerGas,
  maxPriorityFeePerGasError,
  maxPriorityFeePerGasWarning,
  maxFeePerGasError,
  maxFeePerGasWarning,
}: {
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  setMaxFeePerGasValue: (value: string) => void;
  setMaxPriorityFeePerGasValue: (value: string) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: FocusEvent<HTMLInputElement>) => void;
  currentMaxFeePerGas: bigint | undefined;
  currentMaxPriorityFeePerGas: bigint | undefined;
  maxPriorityFeePerGasError: boolean;
  maxPriorityFeePerGasWarning: boolean;
  maxFeePerGasError: boolean;
  maxFeePerGasWarning: boolean;
}) {
  return (
    <div className="grid gap-3 grid-cols-2 mt-4">
      <TextField
        isError={maxFeePerGasError}
        isWarning={maxFeePerGasWarning}
        placeholder="Max fee"
        label="Max fee"
        name="maxFeePerGas"
        id="maxFeePerGas"
        tooltipText="Max fee tooltip"
        value={maxFeePerGas}
        onChange={(e) => {
          handleChange(e);
        }}
        onBlur={(e) => {
          handleBlur(e);
        }}
        helperText={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (currentMaxFeePerGas) {
                  setMaxFeePerGasValue(formatGwei(currentMaxFeePerGas));
                }

                // setUnsavedMaxFeePerGas( || BigInt(0));
              }}
              className="text-green"
            >
              Current
            </button>{" "}
            {currentMaxFeePerGas ? formatFloat(formatGwei(currentMaxFeePerGas)) : "0"} Gwei
          </div>
        }
      />

      <TextField
        isError={maxPriorityFeePerGasError}
        isWarning={maxPriorityFeePerGasWarning}
        placeholder="Priority fee"
        label="Priority fee"
        name="maxPriorityFeePerGas"
        id="maxPriorityFeePerGas"
        tooltipText="Max priority tooltip"
        value={maxPriorityFeePerGas}
        onChange={(e) => {
          handleChange(e);
        }}
        onBlur={(e) => {
          handleBlur(e);
        }}
        helperText={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (currentMaxPriorityFeePerGas) {
                  setMaxPriorityFeePerGasValue(formatGwei(currentMaxPriorityFeePerGas));
                }
              }}
              className="text-green"
            >
              Current
            </button>{" "}
            {currentMaxPriorityFeePerGas
              ? formatFloat(formatGwei(currentMaxPriorityFeePerGas))
              : "0"}{" "}
            Gwei
          </div>
        }
      />
    </div>
  );
}

function ErrorsAndWarnings({ errors, warnings }: { errors?: string[]; warnings?: string[] }) {
  return (
    <>
      {(!!errors?.length || !!warnings?.length) && (
        <div className="flex flex-col gap-5 mt-4">
          {errors?.map((err) => <Alert key={err} text={err} type="error" />)}
          {warnings?.map((war) => <Alert key={war} text={war} type="warning" />)}
        </div>
      )}
    </>
  );
}
function NetworkFeeDialogContent({
  setIsOpen,
  isAdvanced,
}: {
  setIsOpen: (isOpen: boolean) => void;
  isAdvanced: boolean;
}) {
  const chainId = useCurrentChainId();
  const { gasOption, gasPrice, setGasLimit, estimatedGas, gasLimit } = useSwapGasSettingsStore();

  const {
    handleApply,
    estimatedMaxFeePerGas,
    estimatedMaxPriorityFeePerGas,
    estimatedGasPriceLegacy,
  } = useSwapGas();

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (estimatedMaxFeePerGas && estimatedMaxPriorityFeePerGas && estimatedGasPriceLegacy) {
      if (
        gasPrice.model === GasFeeModel.EIP1559 &&
        gasPrice.maxFeePerGas &&
        gasPrice.maxPriorityFeePerGas
      ) {
        setIsInitialized(true);
      }
      if (gasPrice.model === GasFeeModel.LEGACY && gasPrice.gasPrice) {
        setIsInitialized(true);
      }
    }
  }, [estimatedGasPriceLegacy, estimatedMaxFeePerGas, estimatedMaxPriorityFeePerGas, gasPrice]);

  const formik = useFormik({
    enableReinitialize: !isInitialized,
    initialValues: {
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
      gasLimit: gasLimit ? gasLimit.toString() : estimatedGas.toString(),
    },
    onSubmit: (values, formikHelpers) => {
      if (values.gasOption !== GasOption.CUSTOM) {
        handleApply({ option: values.gasOption });
      } else {
        // Gas Option CUSTOM
        if (values.gasPriceModel === GasFeeModel.EIP1559 || !isAdvanced) {
          handleApply({
            option: GasOption.CUSTOM,
            gasSettings: {
              model: GasFeeModel.EIP1559,
              maxFeePerGas: parseGwei(values.maxFeePerGas),
              maxPriorityFeePerGas: parseGwei(values.maxPriorityFeePerGas),
            },
            gasLimit: BigInt(values.gasLimit),
          });
        } else {
          if (values.gasPriceModel === GasFeeModel.LEGACY) {
            handleApply({
              option: GasOption.CUSTOM,
              gasSettings: {
                model: GasFeeModel.LEGACY,
                gasPrice: parseGwei(values.gasPrice),
              },
              gasLimit: BigInt(values.gasLimit),
            });
          }
        }
      }

      setIsOpen(false);
      addToast("Settings applied");
      console.log(values);
    },
  });

  const { handleChange, handleBlur, touched, values, setFieldValue, handleSubmit } = formik;

  const maxFeePerGasError = useMemo(() => {
    return estimatedMaxFeePerGas &&
      touched.maxFeePerGas &&
      parseGwei(values.maxFeePerGas) < estimatedMaxFeePerGas
      ? "Max fee per gas is too low for current network condition"
      : undefined;
  }, [estimatedMaxFeePerGas, touched.maxFeePerGas, values.maxFeePerGas]);

  const maxFeePerGasWarning = useMemo(() => {
    return estimatedMaxFeePerGas &&
      touched.maxFeePerGas &&
      parseGwei(values.maxFeePerGas) > estimatedMaxFeePerGas * BigInt(3)
      ? "Max fee per gas is unnecessarily high for current network condition"
      : undefined;
  }, [estimatedMaxFeePerGas, touched.maxFeePerGas, values.maxFeePerGas]);

  const maxPriorityFeePerGasError = useMemo(() => {
    return touched.maxPriorityFeePerGas && parseGwei(values.maxPriorityFeePerGas) === BigInt(0)
      ? "Max priority fee per gas is too low for current network condition"
      : undefined;
  }, [touched.maxPriorityFeePerGas, values.maxPriorityFeePerGas]);

  const maxPriorityFeePerGasWarning = useMemo(() => {
    return touched.maxPriorityFeePerGas &&
      estimatedMaxPriorityFeePerGas &&
      parseGwei(values.maxPriorityFeePerGas) > estimatedMaxPriorityFeePerGas * BigInt(3)
      ? "Max priority fee per gas is unnecessarily high for current network condition"
      : undefined;
  }, [estimatedMaxPriorityFeePerGas, touched.maxPriorityFeePerGas, values.maxPriorityFeePerGas]);

  console.log(values.gasLimit);
  console.log(estimatedGas);
  console.log(touched);

  const gasLimitError = useMemo(() => {
    return touched.gasLimit && BigInt(values.gasLimit) < estimatedGas
      ? "Gas limit is lower then recommended"
      : undefined;
  }, [touched.gasLimit, values.gasLimit, estimatedGas]);

  const gasPriceErrors = useMemo(() => {
    const _errors: string[] = [];

    [maxPriorityFeePerGasError, maxFeePerGasError].forEach((v) => {
      if (v) {
        _errors.push(v);
      }
    });

    return _errors;
  }, [maxFeePerGasError, maxPriorityFeePerGasError]);

  const gasPriceWarnings = useMemo(() => {
    const _warnings: string[] = [];

    [maxPriorityFeePerGasWarning, maxFeePerGasWarning].forEach((v) => {
      if (v) {
        _warnings.push(v);
      }
    });

    return _warnings;
  }, [maxFeePerGasWarning, maxPriorityFeePerGasWarning]);

  const gasLimitErrors = useMemo(() => {
    const _errors: string[] = [];

    [gasLimitError].forEach((v) => {
      if (v) {
        _errors.push(v);
      }
    });

    return _errors;
  }, [gasLimitError]);

  return (
    <form onSubmit={handleSubmit}>
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
                  {!isAdvanced && isEip1559Supported(chainId) && (
                    <div className={clsx("px-5 pb-4")}>
                      <EIP1559Fields
                        maxPriorityFeePerGas={values.maxPriorityFeePerGas}
                        maxFeePerGas={values.maxFeePerGas}
                        setMaxFeePerGasValue={(value) => setFieldValue("maxFeePerGas", value)}
                        setMaxPriorityFeePerGasValue={(value) =>
                          setFieldValue("maxPriorityFeePerGas", value)
                        }
                        currentMaxFeePerGas={estimatedMaxFeePerGas}
                        currentMaxPriorityFeePerGas={estimatedMaxPriorityFeePerGas}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        maxFeePerGasError={!!maxFeePerGasError}
                        maxPriorityFeePerGasError={!!maxPriorityFeePerGasError}
                        maxFeePerGasWarning={!!maxFeePerGasWarning}
                        maxPriorityFeePerGasWarning={!!maxPriorityFeePerGasWarning}
                      />
                      <ErrorsAndWarnings errors={gasPriceErrors} warnings={gasPriceWarnings} />
                    </div>
                  )}

                  {!isAdvanced && !isEip1559Supported(chainId) && (
                    <div className={clsx("px-5 pb-4")}>
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
                        onBlur={(e) => {
                          handleBlur(e);
                        }}
                        helperText={
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (estimatedGasPriceLegacy) {
                                  setFieldValue("gasPrice", formatGwei(estimatedGasPriceLegacy));
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

                  {isAdvanced && !isEip1559Supported(chainId) && (
                    <div className={clsx("px-5 pb-4 flex flex-col gap-4")}>
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
                        onBlur={(e) => {
                          handleBlur(e);
                        }}
                        helperText={
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (estimatedGasPriceLegacy) {
                                  setFieldValue("gasPrice", formatGwei(estimatedGasPriceLegacy));
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
                      <TextField
                        placeholder="Gas limit"
                        label="Gas limit"
                        name="gasLimit"
                        id="gasLimit"
                        tooltipText="gasLimit is a measure of actions that a contract can perform in your transaction. Setting gasLimit to a low value may result in your transaction not being able to perform the necessary actions (i.e. purchase tokens) and fail. We don't recommend changing this unless you absolutely know what you're doing."
                        value={values.gasLimit}
                        onChange={(e) => setFieldValue("gasLimit", e.target.value)}
                        onBlur={(e) => {
                          handleBlur(e);
                        }}
                        isError={!!gasLimitError}
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
                      <ErrorsAndWarnings errors={gasLimitErrors} />
                    </div>
                  )}

                  {isAdvanced && isEip1559Supported(chainId) && (
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
                            onClick={() => setFieldValue("gasPriceModel", GasFeeModel.EIP1559)}
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
                          <>
                            <EIP1559Fields
                              maxPriorityFeePerGas={values.maxPriorityFeePerGas}
                              maxFeePerGas={values.maxFeePerGas}
                              setMaxFeePerGasValue={(value) => setFieldValue("maxFeePerGas", value)}
                              setMaxPriorityFeePerGasValue={(value) =>
                                setFieldValue("maxPriorityFeePerGas", value)
                              }
                              currentMaxFeePerGas={estimatedMaxFeePerGas}
                              currentMaxPriorityFeePerGas={estimatedMaxPriorityFeePerGas}
                              handleChange={handleChange}
                              handleBlur={handleBlur}
                              maxFeePerGasError={!!maxFeePerGasError}
                              maxPriorityFeePerGasError={!!maxPriorityFeePerGasError}
                              maxFeePerGasWarning={!!maxFeePerGasWarning}
                              maxPriorityFeePerGasWarning={!!maxPriorityFeePerGasWarning}
                            />
                            <ErrorsAndWarnings
                              errors={gasPriceErrors}
                              warnings={gasPriceWarnings}
                            />
                          </>
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
                              onBlur={(e) => {
                                handleBlur(e);
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
                        name="gasLimit"
                        id="gasLimit"
                        isError={!!gasLimitError}
                        tooltipText="gasLimit is a measure of actions that a contract can perform in your transaction. Setting gasLimit to a low value may result in your transaction not being able to perform the necessary actions (i.e. purchase tokens) and fail. We don't recommend changing this unless you absolutely know what you're doing."
                        value={values.gasLimit}
                        onChange={(e) => setFieldValue("gasLimit", e.target.value)}
                        onBlur={(e) => handleBlur(e)}
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
                      <ErrorsAndWarnings errors={gasLimitErrors} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-4 md:px-10 md:pb-10 pt-5 grid grid-cols-2 gap-3">
        <Button type="button" fullWidth onClick={handleCancel} variant={ButtonVariant.OUTLINED}>
          Cancel
        </Button>
        <Button
          disabled={Boolean(maxFeePerGasError || maxFeePerGasError || gasLimitError)}
          type="submit"
          fullWidth
        >
          Apply
        </Button>
      </div>
    </form>
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
