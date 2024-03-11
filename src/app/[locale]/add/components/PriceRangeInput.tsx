import IncrementDecrementIconButton from "@/components/buttons/IncrementDecrementIconButton";

export default function PriceRangeInput() {
  return (
    <div className="bg-secondary-bg rounded-1 p-5 flex justify-between items-center">
      <div className="flex flex-col gap-1">
        <span className="text-12 text-secondary-text">Low price</span>
        <input
          className="font-medium text-16 bg-transparent border-0 outline-0"
          type="text"
          value={906.56209}
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
