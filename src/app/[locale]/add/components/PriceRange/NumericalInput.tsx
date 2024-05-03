import { escapeRegExp } from "@/functions/escapeRegExp";

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

export type NumericalInputProps = {
  value: string;
  onUserInput: (typedValue: string) => void;
  prependSymbol?: string;
  maxDecimals?: number;
};

export const NumericalInput = ({
  value,
  onUserInput,
  prependSymbol,
  maxDecimals,
}: NumericalInputProps) => {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === "" || inputRegex.test(escapeRegExp(nextUserInput))) {
      const decimalGroups = nextUserInput.split(".");
      if (maxDecimals && decimalGroups.length > 1 && decimalGroups[1].length > maxDecimals) {
        return;
      }

      onUserInput(nextUserInput);
    }
  };

  const formatValueWithLocale = (value: string | number) => {
    // TODO: local
    // const [searchValue, replaceValue] = localeUsesComma(formatterLocale)
    //   ? [/\./g, ","]
    //   : [/,/g, "."];
    const [searchValue, replaceValue] = [/,/g, "."];
    return value.toString().replace(searchValue, replaceValue);
  };

  const valueFormattedWithLocale = formatValueWithLocale(value);

  return (
    <input
      className="font-medium text-16 bg-transparent border-0 outline-0"
      type="text"
      value={
        prependSymbol && value ? prependSymbol + valueFormattedWithLocale : valueFormattedWithLocale
      }
      onChange={(event) => {
        if (prependSymbol) {
          const value = event.target.value;

          // cut off prepended symbol
          const formattedValue = value.toString().includes(prependSymbol)
            ? value.toString().slice(prependSymbol.length, value.toString().length + 1)
            : value;

          // replace commas with periods, because uniswap exclusively uses period as the decimal separator
          enforcer(formattedValue.replace(/,/g, "."));
        } else {
          enforcer(event.target.value.replace(/,/g, "."));
        }
      }}
    />
  );
};
