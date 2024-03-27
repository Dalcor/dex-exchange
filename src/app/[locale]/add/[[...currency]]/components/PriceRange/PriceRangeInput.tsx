import { useCallback, useEffect, useState } from "react";

import IncrementDecrementIconButton from "@/components/buttons/IncrementDecrementIconButton";

import { NumericalInput } from "./NumericalInput";

interface Props {
  title: string;
  value: string;
  onUserInput: (typedValue: string) => void;
  decrement: () => string;
  increment: () => string;
  prependSymbol?: string;
  maxDecimals?: number;
}
export default function PriceRangeInput({
  title,
  value,
  onUserInput,
  decrement,
  increment,
  prependSymbol,
  maxDecimals,
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
      className="bg-secondary-bg rounded-1 p-5 flex justify-between items-center"
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
        <span className="text-12 text-secondary-text">DAI per ETH</span>
      </div>
      <div className="flex flex-col gap-2">
        <IncrementDecrementIconButton icon="add" onClick={handleIncrement} />
        <IncrementDecrementIconButton icon="minus" onClick={handleDecrement} />
      </div>
    </div>
  );
}
