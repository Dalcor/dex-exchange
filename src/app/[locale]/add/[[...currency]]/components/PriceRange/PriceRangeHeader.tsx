import clsx from "clsx";

import Switch from "@/components/atoms/Switch";

export const PriceRangeHeader = ({
  isFullRange,
  handleSetFullRange,
  isSorted,
  button0Text,
  button1Text,
  button0Handler,
  button1Handler,
}: {
  isSorted: boolean;
  isFullRange: boolean;
  handleSetFullRange: () => void;
  button0Text?: string;
  button1Text?: string;
  button0Handler: () => void;
  button1Handler: () => void;
}) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-16 font-bold">Set price range</h3>
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-primary-text text-12">Full range</span>
          <Switch checked={isFullRange} setChecked={handleSetFullRange} />
        </div>

        <div className="flex p-0.5 gap-0.5 rounded-2 bg-secondary-bg">
          <button
            onClick={button0Handler}
            className={clsx(
              "text-12 h-7 rounded-2 min-w-[60px] px-3 border duration-200",
              isSorted
                ? "bg-green-bg border-green text-primary-text"
                : "hover:bg-green-bg bg-primary-bg border-transparent text-secondary-text",
            )}
          >
            {button0Text}
          </button>
          <button
            onClick={button1Handler}
            className={clsx(
              "text-12 h-7 rounded-2 min-w-[60px] px-3 border duration-200",
              !isSorted
                ? "bg-green-bg border-green text-primary-text"
                : "hover:bg-green-bg bg-primary-bg border-transparent text-secondary-text",
            )}
          >
            {button1Text}
          </button>
        </div>
      </div>
    </div>
  );
};
