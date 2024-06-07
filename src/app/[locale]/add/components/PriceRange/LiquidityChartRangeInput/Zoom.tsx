import { ScaleLinear, select, zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from "d3";
import { forwardRef, useEffect, useMemo, useRef } from "react";

import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";

import { ZoomLevels } from "../../../hooks/types";

export const ZoomOverlay = forwardRef(
  ({ height, width, ...props }: { height: number; width: number }, ref: any) => (
    <rect
      ref={ref}
      className="fill-transparent cursor-grab active:cursor-grabbing"
      style={{
        height,
        width,
      }}
      {...props}
    />
  ),
);
ZoomOverlay.displayName = "ZoomOverlay";

export default function Zoom({
  svg,
  xScale,
  setZoom,
  width,
  height,
  resetBrush,
  showResetButton,
  zoomLevels,
}: {
  svg: SVGElement | null;
  xScale: ScaleLinear<number, number>;
  setZoom: (transform: ZoomTransform) => void;
  width: number;
  height: number;
  resetBrush: () => void;
  showResetButton: boolean;
  zoomLevels: ZoomLevels;
}) {
  const zoomBehavior = useRef<ZoomBehavior<Element, unknown>>();

  const [zoomIn, zoomOut, zoomInitial, zoomReset] = useMemo(
    () => [
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .transition()
          .call(zoomBehavior.current.scaleBy, 2),
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .transition()
          .call(zoomBehavior.current.scaleBy, 0.5),
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .transition()
          .call(zoomBehavior.current.scaleTo, 0.5),
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .call(zoomBehavior.current.transform, zoomIdentity.translate(0, 0).scale(1))
          .transition()
          .call(zoomBehavior.current.scaleTo, 0.5),
    ],
    [svg],
  );

  useEffect(() => {
    if (!svg) return;

    zoomBehavior.current = zoom()
      .scaleExtent([zoomLevels.min, zoomLevels.max])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", ({ transform }: { transform: ZoomTransform }) => {
        setZoom(transform);
      });

    select(svg as Element).call(zoomBehavior.current);
  }, [
    height,
    width,
    setZoom,
    svg,
    xScale,
    zoomBehavior,
    zoomLevels,
    zoomLevels.max,
    zoomLevels.min,
  ]);

  useEffect(() => {
    // reset zoom to initial on zoomLevel change
    zoomInitial();
  }, [zoomInitial, zoomLevels]);

  return (
    <div className="flex gap-2 justify-end items-center w-100">
      <IconButton variant={IconButtonVariant.CONTROL} iconName="zoom-in" onClick={zoomIn} />
      <IconButton variant={IconButtonVariant.CONTROL} iconName="zoom-out" onClick={zoomOut} />
      <div
        onClick={() => {
          resetBrush();
          zoomReset();
        }}
        className="cursor-pointer rounded-2 hover:bg-green-bg bg-transparent duration-200 text-primary-text px-3 py-1"
      >
        Refresh
      </div>
    </div>
  );
}
