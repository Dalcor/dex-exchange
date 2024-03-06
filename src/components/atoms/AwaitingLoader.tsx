import { useMemo } from "react";

interface Props {
  size?: number;
}

export default function AwaitingLoader({ size = 50 }: Props) {
  // calculate internal size by dividing wanted size to √2. Value will be equal to
  // expected actual size for awaiting loader that doesn't affected by rotation or animation
  const internalSize = useMemo(() => {
    return size / Math.sqrt(2);
  }, [size]);

  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <div style={{ width: internalSize, height: internalSize }} className={`rotate-45 relative`}>
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
