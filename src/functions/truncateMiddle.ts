export default function truncateMiddle(
  value: string,
  options: {
    charsFromStart: number;
    charsFromEnd: number;
  } = { charsFromStart: 6, charsFromEnd: 6 },
) {
  return `${value.slice(0, options.charsFromStart)}...${value.slice(-options.charsFromEnd)}`;
}
