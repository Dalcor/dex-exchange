import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { Address, isAddress } from "viem";
import { useReadContract } from "wagmi";

import Alert from "@/components/atoms/Alert";
import Checkbox from "@/components/atoms/Checkbox";
import DialogHeader from "@/components/atoms/DialogHeader";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import Svg from "@/components/atoms/Svg";
import TextField from "@/components/atoms/TextField";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button, { ButtonSize } from "@/components/buttons/Button";
import IconButton, {
  IconButtonSize,
  IconButtonVariant,
  IconSize,
} from "@/components/buttons/IconButton";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";
import { ERC20_ABI } from "@/config/abis/erc20";
import { TOKEN_CONVERTER_ABI } from "@/config/abis/tokenConverter";
import { db } from "@/db/db";
import { copyToClipboard } from "@/functions/copyToClipboard";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import truncateMiddle from "@/functions/truncateMiddle";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useTokenLists } from "@/hooks/useTokenLists";
import addToast from "@/other/toast";
import { CONVERTER_ADDRESS } from "@/sdk_hybrid/addresses";
import { ADDRESS_ZERO } from "@/sdk_hybrid/constants";
import { Token } from "@/sdk_hybrid/entities/token";

interface Props {
  setContent: (content: ManageTokensDialogContent) => void;
  handleClose: () => void;
}

function EmptyState({
  tokenAddressToImport,
  isFound,
}: {
  tokenAddressToImport: string;
  isFound: boolean;
}) {
  const t = useTranslations("ManageTokens");

  if (!tokenAddressToImport) {
    return (
      <div className="flex-grow flex justify-center items-center flex-col gap-2">
        <EmptyStateIcon iconName="imported" />
        <p className="text-secondary-text text-center">{t("to_import_a_token")}</p>
      </div>
    );
  }

  if (!isAddress(tokenAddressToImport)) {
    return (
      <div className="flex items-center justify-center gap-2 flex-col flex-grow">
        <EmptyStateIcon iconName="warning" />
        <span className="text-red-input">{t("enter_valid")}</span>
      </div>
    );
  }

  if (!isFound) {
    return (
      <div className="flex items-center justify-center gap-2 flex-col flex-grow">
        <EmptyStateIcon iconName="search" />
        <span className="text-secondary-text">{t("token_not_found")}</span>
      </div>
    );
  }
}

export default function ImportToken({ setContent, handleClose }: Props) {
  const t = useTranslations("ManageTokens");
  const tToast = useTranslations("Toast");
  const [tokenAddressToImport, setTokenAddressToImport] = useState("");
  const chainId = useCurrentChainId();
  const tokenLists = useTokenLists();

  const { data: tokenName, isFetched } = useReadContract({
    abi: ERC20_ABI,
    functionName: "name",
    chainId,
    address: tokenAddressToImport! as Address,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport),
    },
  });

  const { data: tokenSymbol } = useReadContract({
    abi: ERC20_ABI,
    functionName: "symbol",
    address: tokenAddressToImport! as Address,
    chainId,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport),
    },
  });

  const { data: tokenDecimals } = useReadContract({
    abi: ERC20_ABI,
    functionName: "decimals",
    address: tokenAddressToImport! as Address,
    chainId,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport),
    },
  });

  const { data: erc223Address } = useReadContract({
    abi: TOKEN_CONVERTER_ABI,
    functionName: "getERC223WrapperFor",
    address: CONVERTER_ADDRESS[chainId],
    args: [tokenAddressToImport as Address],
    chainId,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport),
    },
  });

  const { data: predictedErc223Address } = useReadContract({
    abi: TOKEN_CONVERTER_ABI,
    functionName: "predictWrapperAddress",
    address: CONVERTER_ADDRESS[chainId],
    args: [tokenAddressToImport as Address, true],
    chainId,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport),
    },
  });

  const [checkedUnderstand, setCheckedUnderstand] = useState<boolean>(false);

  const custom = useTokenLists(true);

  const alreadyImported = useMemo(() => {
    return !!(custom && custom?.[0]?.list.tokens.find((v) => v.address0 === tokenAddressToImport));
  }, [custom, tokenAddressToImport]);

  const isERC223TokenExists = useMemo(() => {
    return !!(erc223Address?.[0] && erc223Address[0] !== ADDRESS_ZERO);
  }, [erc223Address]);

  const erc223AddressToShow = useMemo(() => {
    if (isERC223TokenExists) {
      return erc223Address![0];
    }

    if (predictedErc223Address) {
      return predictedErc223Address;
    }

    return;
  }, [erc223Address, isERC223TokenExists, predictedErc223Address]);

  return (
    <>
      <DialogHeader
        onBack={() => setContent("default")}
        onClose={handleClose}
        title={t("import_token")}
      />
      <div className="w-full md:w-[600px] px-4 pb-4 md:px-10 md:pb-10 min-h-[580px] flex flex-col">
        <TextField
          label={t("import_token")}
          value={tokenAddressToImport}
          onChange={(e) => setTokenAddressToImport(e.target.value)}
          placeholder={t("token_address_placeholder")}
          error={
            Boolean(tokenAddressToImport) && !isAddress(tokenAddressToImport)
              ? t("enter_in_correct_format")
              : ""
          }
        />

        <EmptyState
          tokenAddressToImport={tokenAddressToImport}
          isFound={Boolean(
            tokenName && typeof tokenDecimals !== "undefined" && tokenSymbol && erc223Address?.[0],
          )}
        />

        {tokenName && typeof tokenDecimals !== "undefined" && tokenSymbol && erc223Address?.[0] && (
          <>
            <div className="flex-grow">
              <div className="flex items-center gap-3 pb-2.5 mt-0.5 mb-3">
                <img
                  className="w-12 h-12"
                  width={48}
                  height={48}
                  src="/tokens/placeholder.svg"
                  alt=""
                />
                <div className="flex flex-col text-16">
                  <span className="text-primary-text">{tokenSymbol}</span>
                  <span className="text-secondary-text">
                    {tokenName} ({t("decimals_amount", { decimals: tokenDecimals })})
                  </span>
                </div>
              </div>
              {!alreadyImported && erc223AddressToShow && (
                <>
                  <div className="mb-4 flex flex-col gap-4 px-5 pb-5 pt-4 bg-tertiary-bg rounded-3">
                    <div className="grid grid-cols-[1fr_auto_32px] gap-x-2">
                      <span className="text-secondary-text flex items-center gap-1">
                        {t("address")} <Badge variant={BadgeVariant.COLORED} text="ERC-20" />{" "}
                      </span>
                      <ExternalTextLink
                        color="white"
                        text={truncateMiddle(tokenAddressToImport)}
                        href={getExplorerLink(
                          ExplorerLinkType.ADDRESS,
                          tokenAddressToImport,
                          chainId,
                        )}
                        className="justify-between"
                      />
                      <IconButton
                        iconSize={IconSize.SMALL}
                        variant={IconButtonVariant.DEFAULT}
                        buttonSize={IconButtonSize.SMALL}
                        iconName="copy"
                        onClick={async () => {
                          await copyToClipboard(tokenAddressToImport);
                          addToast(tToast("successfully_copied"));
                        }}
                      />
                      <span className="text-secondary-text flex items-center gap-1">
                        {t("address")}{" "}
                        <Badge
                          variant={BadgeVariant.COLORED}
                          text="ERC-223"
                          color={isERC223TokenExists ? "green" : "blue"}
                        />{" "}
                      </span>
                      <div className="h-8 flex items-center">
                        {truncateMiddle(erc223AddressToShow)}
                      </div>
                      <IconButton
                        iconSize={IconSize.SMALL}
                        variant={IconButtonVariant.DEFAULT}
                        buttonSize={IconButtonSize.SMALL}
                        iconName="copy"
                        onClick={async () => {
                          await copyToClipboard(erc223AddressToShow);
                          addToast(tToast("successfully_copied"));
                        }}
                      />
                    </div>

                    {predictedErc223Address && !isERC223TokenExists && (
                      <Alert text={t("predicted_alert")} type="info-border" />
                    )}
                  </div>
                  <div className="px-5 py-3 flex gap-2 rounded-1 border border-orange bg-orange-bg">
                    <Svg className="text-orange shrink-0" iconName="warning" />
                    <p className="text-16 text-primary-text flex-grow">
                      {t("import_token_warning")}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-5 mt-5">
              {!alreadyImported && (
                <Checkbox
                  checked={checkedUnderstand}
                  handleChange={() => setCheckedUnderstand(!checkedUnderstand)}
                  id="approve-list-import"
                  label={t("i_understand")}
                />
              )}
              <Button
                fullWidth
                size={ButtonSize.MEDIUM}
                disabled={!checkedUnderstand || alreadyImported}
                onClick={async () => {
                  if (
                    chainId &&
                    tokenName &&
                    tokenDecimals &&
                    tokenSymbol &&
                    erc223Address?.[0] &&
                    predictedErc223Address
                  ) {
                    const currentCustomList = tokenLists?.find((t) => t.id === `custom-${chainId}`);

                    const token = new Token(
                      chainId,
                      tokenAddressToImport as Address,
                      isERC223TokenExists ? erc223Address[0] : predictedErc223Address,
                      tokenDecimals,
                      tokenSymbol,
                      tokenName,
                      "/tokens/placeholder.svg",
                    );

                    if (!currentCustomList) {
                      await db.tokenLists.add({
                        id: `custom-${chainId}`,
                        enabled: true,
                        chainId,
                        list: {
                          name: "Custom token list",
                          version: {
                            minor: 0,
                            major: 0,
                            patch: 0,
                          },
                          tokens: [token],
                          logoURI: "/token-list-placeholder.svg",
                        },
                      });
                    } else {
                      (db.tokenLists as any).update(`custom-${chainId}`, {
                        "list.tokens": [...currentCustomList.list.tokens, token],
                      });
                    }
                  }
                  setContent("default");
                  addToast(t("imported_successfully"));
                }}
              >
                {alreadyImported
                  ? t("already_imported")
                  : t("import_symbol", { symbol: tokenSymbol })}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
