import Image from "next/image";

import SelectButton from "@/components/atoms/SelectButton";

export default function TokenInput({
  setIsOpenedTokenPick,
}: {
  setIsOpenedTokenPick: (isOpened: boolean) => void;
}) {
  return (
    <div className="px-5 py-4 bg-secondary-bg rounded-1 border border-primary-border">
      <span className="text-14 block mb-2 text-secondary-text">You pay</span>
      <div className="flex items-center mb-2 justify-between">
        <input
          className="h-12 bg-transparent outline-0 border-0 text-32"
          placeholder="0"
          type="text"
        />
        <SelectButton onClick={() => setIsOpenedTokenPick(true)} size="large">
          <span className="flex gap-2 items-center">
            <Image src="/tokens/ETH.svg" alt="Ethereum" width={32} height={32} />
            ETH
          </span>
        </SelectButton>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-14 block mb-2 text-secondary-text">$3,220.40</span>
        <span className="text-14 block mb-2 text-secondary-text">Balance: 0 ETH</span>
      </div>
    </div>
  );
}
