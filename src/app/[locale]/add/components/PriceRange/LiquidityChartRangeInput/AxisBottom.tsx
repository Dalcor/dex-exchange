import { Axis as d3Axis, axisBottom, NumberValue, ScaleLinear, select } from "d3";
import { useMemo } from "react";

const StyledGroup = ({ children, transform, ...props }: { children: any; transform: string }) => (
  <g
    transform={transform}
    className="[&_text]:text-[#9B9B9B] [&_text]:translate-y-[5px] [&_line]:hidden"
    {...props}
  >
    {children}
  </g>
);

const Axis = ({ axisGenerator }: { axisGenerator: d3Axis<NumberValue> }) => {
  const axisRef = (axis: SVGGElement) => {
    axis &&
      select(axis)
        .call(axisGenerator)
        .call((g) => g.select(".domain").remove());
  };

  return <g ref={axisRef} />;
};

export const AxisBottom = ({
  xScale,
  innerHeight,
  offset = 0,
}: {
  xScale: ScaleLinear<number, number>;
  innerHeight: number;
  offset?: number;
}) =>
  useMemo(
    () => (
      <StyledGroup transform={`translate(0, ${innerHeight + offset})`}>
        <Axis axisGenerator={axisBottom(xScale).ticks(6)} />
      </StyledGroup>
    ),
    [innerHeight, offset, xScale],
  );
