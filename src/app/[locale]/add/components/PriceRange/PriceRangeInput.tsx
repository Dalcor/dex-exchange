import { useCallback, useEffect, useState } from "react";

import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import { Token } from "@/sdk_hybrid/entities/token";

import { NumericalInput } from "./NumericalInput";

interface Props {
  title: string;
  value: string;
  onUserInput: (typedValue: string) => void;
  decrement: () => string;
  increment: () => string;
  prependSymbol?: string;
  maxDecimals?: number;
  tokenA?: Token | undefined;
  tokenB?: Token | undefined;
  noLiquidity?: boolean;
}
export default function PriceRangeInput({
  title,
  value,
  onUserInput,
  decrement,
  increment,
  prependSymbol,
  maxDecimals,
  tokenA,
  tokenB,
  noLiquidity,
}: Props) {
  //  for focus state, styled components doesnt let you select input parent container
  const [active, setActive] = useState(false);

  // let user type value and only update parent value on blur
  const [localValue, setLocalValue] = useState("");
  const [useLocalValue, setUseLocalValue] = useState(false);

  // animation if parent value updates local value
  const [pulsing, setPulsing] = useState<boolean>(false);

  const handleOnFocus = () => {
    setUseLocalValue(true);
    setActive(true);
  };

  const handleOnBlur = useCallback(() => {
    setUseLocalValue(false);
    setActive(false);
    onUserInput(localValue); // trigger update on parent value
  }, [localValue, onUserInput]);

  // for button clicks
  const handleDecrement = useCallback(() => {
    setUseLocalValue(false);
    onUserInput(decrement());
  }, [decrement, onUserInput]);

  const handleIncrement = useCallback(() => {
    setUseLocalValue(false);
    onUserInput(increment());
  }, [increment, onUserInput]);

  useEffect(() => {
    if (localValue !== value && !useLocalValue) {
      setTimeout(() => {
        setLocalValue(value); // reset local value to match parent
        setPulsing(true); // trigger animation
        setTimeout(function () {
          setPulsing(false);
        }, 1800);
      }, 0);
    }
  }, [localValue, useLocalValue, value]);

  return (
    <div
      className="bg-primary-bg rounded-3 p-5 flex justify-between items-center"
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
    >
      <div className="flex flex-col gap-1">
        <span className="text-12 text-secondary-text">{title}</span>
        <NumericalInput
          value={localValue}
          onUserInput={(value) => {
            setLocalValue(value);
          }}
          prependSymbol={prependSymbol}
          maxDecimals={maxDecimals}
        />
        <span className="text-12 text-secondary-text">
          {tokenA && tokenB ? `${tokenB.symbol} per ${tokenA.symbol}` : ""}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <IconButton
          variant={IconButtonVariant.CONTROL}
          iconName="add"
          onClick={handleIncrement}
          className="rounded-2 bg-secondary-bg hover:bg-green-bg duration-200 text-primary-text"
          disabled={noLiquidity}
        />
        <IconButton
          variant={IconButtonVariant.CONTROL}
          iconName="minus"
          onClick={handleDecrement}
          className="rounded-2 bg-secondary-bg hover:bg-green-bg duration-200 text-primary-text"
          disabled={noLiquidity}
        />
      </div>
    </div>
  );
}
