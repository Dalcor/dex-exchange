import { ScaleLinear } from "d3";
import { useMemo } from "react";

const StyledLine = ({ children, ...props }: any) => (
  <line className="stroke-[#FFFFFF] opacity-50 stroke-[2px] fill-none" {...props}>
    {children}
  </line>
);

export const Line = ({
  value,
  xScale,
  innerHeight,
}: {
  value: number;
  xScale: ScaleLinear<number, number>;
  innerHeight: number;
}) =>
  useMemo(
    () => <StyledLine x1={xScale(value)} y1="0" x2={xScale(value)} y2={innerHeight} />,
    [value, xScale, innerHeight],
  );
