import clsx from "clsx";
import { useMemo } from "react";

interface Props {
  size?: number;
  type?: "circular" | "linear" | "awaiting";
}

export default function Preloader({ size = 24, type = "circular" }: Props) {
  switch (type) {
    case "circular":
      return (
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center relative"
        >
          <div
            style={{ borderWidth: size > 50 ? 4 : 2 }}
            className="rounded-full border-4 border-transparent border-t-green border-l-green border-r-green top-0 left-0 w-full h-full bg-transparent animate-spin"
          />
        </div>
      );
    case "linear":
      return (
        <div className="flex items-center gap-[5px]">
          <span className="block rounded-full w-2 h-2 animate-flicker1 bg-green" />
          <span className="block rounded-full w-2 h-2 animate-flicker2 bg-green" />
          <span className="block rounded-full w-2 h-2 animate-flicker3 bg-green" />
        </div>
      );
    case "awaiting":
      const internalSize = useMemo(() => {
        return size / Math.sqrt(2);
      }, [size]);

      return (
        <div className="flex items-center justify-center" style={{ width: size, height: size }}>
          <div
            style={{ width: internalSize, height: internalSize }}
            className={`rotate-45 relative`}
          >
            {[0, 1, 2, 3, 4].map((v) => {
              return (
                <div
                  key={v}
                  className="absolute animate-orbit w-full h-full"
                  style={{ animationDelay: `${v * 100}ms`, opacity: 1 - 0.2 * (v + 1), zIndex: v }}
                >
                  <div
                    style={{
                      width: internalSize / 5,
                      height: internalSize / 5,
                      boxShadow: `0px 0px ${internalSize / 2.5}px 2px #3ae374`,
                    }}
                    className="absolute top-0 left-0 shadow-orbit w-[10px] h-[10px] bg-green rounded-full"
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
  }
}

export function CircularProgress({ size = 24 }: Props) {
  return (
    <div
      className="MuiCircularProgressIndeterminate"
      role="progressbar"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg viewBox="22 22 44 44">
        <circle
          className="MuiCircularProgressCircleIndeterminate stroke-green"
          cx="44"
          cy="44"
          r="20.2"
          fill="none"
          strokeWidth="3.6"
        />
      </svg>
    </div>
  );
}
