interface Props {
  size?: number;
}

export default function Preloader({ size = 24 }: Props) {
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
