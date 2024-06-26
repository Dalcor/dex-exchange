import { formatUnits } from "viem";

import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import { Token, TokenStandard } from "@/sdk_hybrid/entities/token";

import Badge from "../badges/Badge";
import Button from "../buttons/Button";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  standard: TokenStandard;
  amount?: bigint;
  revokeHandler: () => void;
  token: Token;
  isRevoking: boolean; // isRevoking or isWithdrawing
}

export const RevokeDialog = ({
  isOpen,
  setIsOpen,
  standard,
  amount,
  revokeHandler,
  token,
  isRevoking,
}: Props) => {
  return (
    <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader
        onClose={() => setIsOpen(false)}
        title={standard === "ERC-20" ? "Revoke" : "Withdraw"}
      />
      <div className="w-full md:w-[570px] px-4 pb-4 md:px-10 md:pb-10">
        <div className="flex gap-2 py-2 items-center">
          <span>{`${standard === "ERC-20" ? "Revoke" : "Withdraw"} ${token.symbol}`}</span>
          <Badge color="green" text={standard} />
        </div>
        <div className="flex justify-between bg-secondary-bg px-5 py-3 rounded-3 text-secondary-text mt-2">
          <span>{formatUnits(amount || BigInt(0), token.decimals)}</span>
          <span>{`Amount ${token.symbol}`}</span>
        </div>
        <div className="flex justify-between bg-tertiary-bg px-5 py-3 rounded-3 mb-5 mt-2">
          <div className="flex flex-col">
            <span className="text-14 text-secondary-text">Gas price</span>
            <span>- GWEI</span>
          </div>
          <div className="flex flex-col">
            <span className="text-14 text-secondary-text">Gas limit</span>
            <span>-</span>
          </div>
          <div className="flex flex-col">
            <span className="text-14 text-secondary-text">Fee</span>
            <span>- ETH</span>
          </div>
        </div>
        <Button fullWidth onClick={revokeHandler}>
          {isRevoking ? "Loading..." : <>{standard === "ERC-20" ? "Revoke" : "Withdraw"}</>}
        </Button>
      </div>
    </Dialog>
  );
};
