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
        className="rounded-full border-4 border-secondary-bg border-t-green top-0 left-0 w-full h-full bg-transparent animate-spin"
      />
    </div>
  );
}
