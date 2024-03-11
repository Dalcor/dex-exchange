import IncrementDecrementIconButton from "@/components/buttons/IncrementDecrementIconButton";

interface Props {
  title: string;
  value: string;
}
export default function PriceRangeInput({ title, value }: Props) {
  return (
    <div className="bg-secondary-bg rounded-1 p-5 flex justify-between items-center">
      <div className="flex flex-col gap-1">
        <span className="text-12 text-secondary-text">{title}</span>
        <input
          className="font-medium text-16 bg-transparent border-0 outline-0"
          type="text"
          value={value}
        />
        <span className="text-12 text-secondary-text">DAI per ETH</span>
      </div>
      <div className="flex flex-col gap-2">
        <IncrementDecrementIconButton icon="add" />
        <IncrementDecrementIconButton icon="minus" />
      </div>
    </div>
  );
}
