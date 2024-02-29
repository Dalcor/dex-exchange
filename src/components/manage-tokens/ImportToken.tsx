import DialogHeader from "@/components/atoms/DialogHeader";
import Input from "@/components/atoms/Input";
import { AvailableChains } from "@/components/dialogs/stores/useConnectWalletStore";
import { useAccount, useReadContract } from "wagmi";
import { ERC20_ABI } from "@/config/abis/erc20";
import { Address, isAddress } from "viem";
import { useState } from "react";
import { useTokenListsStore } from "@/stores/useTokenListsStore";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";
import Svg from "@/components/atoms/Svg";
import Checkbox from "@/components/atoms/Checkbox";
import Button from "@/components/atoms/Button";
import addToast from "@/other/toast";

interface Props {
  setContent: (content: ManageTokensDialogContent) => void,
  handleClose: () => void
}

export default function ImportToken({ setContent, handleClose }: Props) {
  const [tokenAddressToImport, setTokenAddressToImport] = useState("");
  const { chainId } = useAccount();

  const { data: tokenName, isFetched } = useReadContract({
    abi: ERC20_ABI,
    functionName: "name",
    chainId,
    address: tokenAddressToImport! as Address,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport)
    }
  });

  const { data: tokenSymbol } = useReadContract({
    abi: ERC20_ABI,
    functionName: "symbol",
    address: tokenAddressToImport! as Address,
    chainId,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport)
    }
  })

  const { data: tokenDecimals } = useReadContract({
    abi: ERC20_ABI,
    functionName: "decimals",
    address: tokenAddressToImport! as Address,
    chainId,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport)
    }
  });

  const { addTokenToCustomTokenList } = useTokenListsStore();
  const [checkedUnderstand, setCheckedUnderstand] = useState<boolean>(false);


  return <>
    <DialogHeader onBack={() => setContent("default")} onClose={handleClose} title="Import token"/>
    <div className="w-[550px] px-10 pb-10 min-h-[580px] flex flex-col">
      <Input value={tokenAddressToImport} onChange={(e) => setTokenAddressToImport(e.target.value)}
             placeholder="Import token"/>

      {tokenName && tokenDecimals && tokenSymbol && <>
        <div className="flex-grow">

          <div className="flex items-center gap-3 py-2.5 mt-3 mb-3">
            <img className="w-12 h-12" width={48} height={48} src="/tokens/placeholder.svg" alt=""/>
            <div className="flex flex-col text-16">
              <span className="text-primary-text">{tokenSymbol}</span>
              <span className="text-secondary-text">{tokenName}</span>
            </div>
          </div>
          <div className="px-5 py-3 flex gap-2 rounded-1 border border-orange bg-orange-bg">
            <Svg className="text-orange shrink-0" iconName="warning"/>
            <p className="text-16 text-primary-text flex-grow">
              Create tokens with caution, as including fake versions of existing tokens is possible. Be aware that
              certain tokens may not align with DEX223 services. Importing custom tokens acknowledges and accepts
              associated risks. Learn more about potential risks before proceeding
            </p>
          </div>

        </div>

        <div className="flex flex-col gap-5">
          <Checkbox checked={checkedUnderstand} handleChange={() => setCheckedUnderstand(!checkedUnderstand)}
                    id="approve-list-import" label="I understand"/>
          <Button fullWidth size="regular" disabled={!checkedUnderstand} onClick={() => {
            if (chainId && tokenName && tokenDecimals && tokenSymbol) {
              addTokenToCustomTokenList(chainId as AvailableChains, {
                address: tokenAddressToImport,
                name: tokenName,
                decimals: tokenDecimals,
                symbol: tokenSymbol,
                chainId
              });
            }
            setContent("default");
            addToast("Token imported");
          }}>Import {tokenSymbol}
          </Button>
        </div>
      </>}
    </div>
  </>
}
