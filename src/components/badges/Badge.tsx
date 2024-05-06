import clsx from "clsx";

export enum BadgeVariant {
  COLORED,
  DEFAULT,
  PERCENTAGE,
}

type Props =
  | {
      variant?: BadgeVariant.COLORED;
      color?: "blue" | "red" | "green" | "purple";
      text: string;
    }
  | {
      variant: BadgeVariant.PERCENTAGE;
      percentage: number | string;
    }
  | {
      variant: BadgeVariant.DEFAULT;
      size?: "default" | "small";
      text: string;
    };
export default function Badge(props: Props) {
  switch (props.variant) {
    case BadgeVariant.COLORED:
    case undefined:
      const { text, color = "green" } = props;
      return (
        <div
          className={clsx(
            "rounded-5 px-2 py-px border text-12 font-medium",
            color === "blue" && "bg-blue-bg border-blue text-blue",
            color === "green" && "bg-green-bg border-green text-green",
            color === "purple" && "bg-purple-bg border-purple text-purple",
            color === "red" && "bg-red-bg border-red text-red",
          )}
        >
          {text}
        </div>
      );
    case BadgeVariant.DEFAULT:
      const { text: defaultText, size = "default" } = props;
      return (
        <div
          className={clsx(
            "bg-tertiary-bg text-secondary-text px-2 rounded-20 font-medium",
            size === "small" && "text-14",
          )}
        >
          {defaultText}
        </div>
      );
    case BadgeVariant.PERCENTAGE:
      const { percentage } = props;
      return (
        <div
          className={clsx(
            "border border-secondary-text text-secondary-text px-3 rounded-5 h-6 flex items-center justify-center",
          )}
        >
          {typeof percentage === "number" ? `${percentage}% select` : percentage}
        </div>
      );
  }
}
