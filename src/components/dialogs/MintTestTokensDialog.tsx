import { useCallback, useEffect, useState } from "react";
import { Address, formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useBlockNumber,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Popover from "@/components/atoms/Popover";
import Preloader from "@/components/atoms/Preloader";
import SelectButton from "@/components/atoms/SelectButton";
import TextField, { InputLabel } from "@/components/atoms/TextField";
import Button from "@/components/buttons/Button";
import { useMintTestTokensDialogStore } from "@/components/dialogs/stores/useMintTestTokensDialogStore";
import { ERC20_ABI } from "@/config/abis/erc20";
import { ERC223_ABI } from "@/config/abis/erc223";
import { formatFloat } from "@/functions/formatFloat";
import { IIFE } from "@/functions/iife";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useTokens } from "@/hooks/useTokenLists";
import addToast from "@/other/toast";

export default function MintTestTokensDialog() {
  const { isOpen, handleOpen, handleClose } = useMintTestTokensDialogStore();
  const tokens = useTokens();

  const [isPopoverOpened, setPopoverOpened] = useState(false);

  const [amountToMint, setAmountToMint] = useState<string>("1000");
  const publicClient = usePublicClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { address, isConnected, connector } = useAccount();

  const chainId = useCurrentChainId();

  const { data: walletClient } = useWalletClient();

  const [tokenToMint, setTokenToMint] = useState(tokens[0]);

  useEffect(() => {
    if (tokens.length && !tokenToMint) {
      setTokenToMint(tokens[0]);
    }
  }, [tokenToMint, tokens]);

  const { data: balance, refetch } = useReadContract({
    abi: ERC20_ABI,
    functionName: "balanceOf",
    address: tokenToMint?.address0! as Address,
    chainId,
    args: [address as Address],
    query: {
      enabled: !!tokenToMint,
    },
  });

  const { data: latestBlock } = useBlockNumber({ watch: true });

  useEffect(() => {
    refetch();
  }, [latestBlock, refetch]);
  const handleMint = useCallback(() => {
    console.log(connector);

    if (!tokenToMint || !walletClient || !publicClient) {
      addToast("Not correct data", "error");
      return;
    }

    IIFE(async () => {
      if (!address) {
        return;
      }
      setIsLoading(true);

      try {
        const hash = await walletClient.writeContract({
          abi: ERC223_ABI,
          address: tokenToMint?.address0 as Address,
          functionName: "mint",
          args: [address, parseUnits(amountToMint, tokenToMint.decimals)],
        });
        setIsLoading(false);
        setIsPending(true);

        await publicClient.waitForTransactionReceipt({ hash });
        addToast("Minted successfully");
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
        setIsPending(false);
      }
    });
  }, [tokenToMint, amountToMint, connector, publicClient, walletClient]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={handleClose}>
      <DialogHeader onClose={handleClose} title="Get test tokens" />
      <div className="mx-auto pb-4 px-4 md:px-10 md:pb-10 rounded-2 bg-primary-bg md:w-[600px] w-full">
        <InputLabel label="Token for mint" />
        <div className="flex flex-col gap-4 relative">
          <Popover
            customOffset={5}
            isOpened={isPopoverOpened}
            setIsOpened={setPopoverOpened}
            placement="bottom-end"
            customStyles={{ width: "100%" }}
            trigger={
              <SelectButton
                variant="rectangle-secondary"
                onClick={() => setPopoverOpened(!isPopoverOpened)}
                fullWidth
                size="medium"
                className="flex-shrink-0 pl-5"
              >
                {tokenToMint?.symbol || "Select token"}
              </SelectButton>
            }
          >
            <div className="py-1 grid gap-1 bg-primary-bg shadow-popover rounded-3 overflow-hidden w-full">
              {tokens.map((token) => {
                return (
                  <div
                    key={token.address0}
                    onClick={() => {
                      setTokenToMint(token);
                      setPopoverOpened(false);
                    }}
                    role="button"
                    className="flex items-center gap-3 bg-primary-bg hover:bg-tertiary-bg duration-300 w-full min-w-[250px] px-10 h-10 justify-between"
                  >
                    <span className="text-secondary-text">{token.symbol}</span>
                  </div>
                );
              })}
            </div>
          </Popover>

          <TextField
            label="Amount of tokens"
            helperText={`Balance: ${balance && tokenToMint ? `${formatFloat(formatUnits(balance, tokenToMint.decimals))} ${tokenToMint.symbol}` : "0"}`}
            readOnly
            value={amountToMint}
            onChange={(e) => setAmountToMint(e.target.value)}
            placeholder="Amount"
          />

          {isConnected ? (
            <Button disabled={isLoading || isPending} onClick={handleMint}>
              {isLoading && (
                <span className="flex items-center gap-2">
                  <span>Waiting for confirmation</span>
                  <Preloader color="green" />
                </span>
              )}
              {isPending && (
                <span className="flex items-center gap-2">
                  <span>Minting in progress</span>
                  <Preloader color="green" />
                </span>
              )}
              {!isLoading && !isPending && "Mint tokens"}
            </Button>
          ) : (
            <Button disabled>Connect your wallet</Button>
          )}
        </div>
      </div>
    </DrawerDialog>
  );
}
