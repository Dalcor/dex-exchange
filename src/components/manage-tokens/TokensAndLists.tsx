import { useTranslations } from "next-intl";
import React, { LegacyRef, ReactNode, Ref, useEffect, useMemo, useState } from "react";
import { AutoSizer, List } from "react-virtualized";

import Checkbox from "@/components/atoms/Checkbox";
import DialogHeader from "@/components/atoms/DialogHeader";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Input from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Button, { ButtonVariant } from "@/components/buttons/Button";
import TabButton from "@/components/buttons/TabButton";
import ManageTokenItem from "@/components/manage-tokens/ManageTokenItem";
import TokenListItem from "@/components/manage-tokens/TokenListItem";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";
import { db } from "@/db/db";
import { useTokenLists, useTokens } from "@/hooks/useTokenLists";
import { Token } from "@/sdk_hybrid/entities/token";
import { useManageTokensDialogStore } from "@/stores/useManageTokensDialogStore";

interface Props {
  setContent: (content: ManageTokensDialogContent) => void;
  handleClose: () => void;
  setTokenForPortfolio: (token: Token) => void;
}

function ButtonTooltip({ text }: { text: string }) {
  return (
    <Tooltip
      customOffset={18}
      renderTrigger={(ref, refProps) => {
        return (
          <div
            ref={ref.setReference}
            {...refProps}
            className="w-12 h-full rounded-r-2 border-r border-y border-green flex items-center justify-center hover:bg-green-bg duration-200 cursor-pointer"
          >
            <Svg iconName="info" />
          </div>
        );
      }}
      text={text}
    />
  );
}
export default function TokensAndLists({ setContent, handleClose, setTokenForPortfolio }: Props) {
  const t = useTranslations("ManageTokens");
  const { activeTab, setActiveTab } = useManageTokensDialogStore();

  const lists = useTokenLists();
  const [onlyCustom, setOnlyCustom] = useState(false);

  const tokens = useTokens(onlyCustom);

  const [listSearchValue, setListSearchValue] = useState("");
  const [tokensSearchValue, setTokensSearchValue] = useState("");

  const [filteredTokens, isTokenFilterActive] = useMemo(() => {
    return tokensSearchValue
      ? [tokens.filter((t) => t.name && t.name.toLowerCase().startsWith(tokensSearchValue)), true]
      : [tokens, false];
  }, [tokens, tokensSearchValue]);

  const [filteredLists, isListFilterActive] = useMemo(() => {
    return listSearchValue
      ? [
          lists?.filter(
            ({ list }) => list.name && list.name.toLowerCase().startsWith(listSearchValue),
          ),
          true,
        ]
      : [lists, false];
  }, [lists, listSearchValue]);

  return (
    <>
      <DialogHeader onClose={handleClose} title={t("manage_tokens")} />
      <div className="w-full md:w-[600px] h-[580px] flex flex-col px-4 md:px-10">
        <div className="grid grid-cols-2 bg-secondary-bg p-1 gap-1 rounded-3  mb-3">
          {[t("lists"), t("tokens")].map((title, index) => {
            return (
              <TabButton
                key={title}
                inactiveBackground="bg-primary-bg"
                size={48}
                active={index === activeTab}
                onClick={() => setActiveTab(index)}
              >
                {title}
              </TabButton>
            );
          })}
        </div>

        {activeTab === 0 && (
          <div className="flex-grow flex flex-col">
            <div className="flex gap-3">
              <Input
                value={listSearchValue}
                onChange={(e) => setListSearchValue(e.target.value)}
                placeholder={t("search_list_name")}
              />
            </div>

            <div className="w-full flex items-center mt-3">
              <Button
                endIcon="import-list"
                variant={ButtonVariant.OUTLINED}
                onClick={() => setContent("import-list")}
                className="rounded-r-0 xl:rounded-r-0 flex-grow"
              >
                {t("import_list")}
              </Button>

              <ButtonTooltip text={t("import_list_tooltip")} />
            </div>

            {Boolean(filteredLists?.length && !isListFilterActive) && (
              <div className="flex flex-col mt-3 overflow-auto flex-grow">
                {filteredLists
                  ?.filter((l) => Boolean(l.list.tokens.length))
                  ?.map((tokenList) => {
                    return (
                      <TokenListItem
                        toggle={async () => {
                          (db.tokenLists as any).update(tokenList.id, {
                            enabled: !tokenList.enabled,
                          });
                        }}
                        tokenList={tokenList}
                        key={tokenList.id}
                      />
                    );
                  })}
              </div>
            )}
            {Boolean(filteredLists && !filteredLists.length && isListFilterActive) && (
              <div className="flex items-center justify-center gap-2 flex-col h-full">
                <EmptyStateIcon iconName="search-list" />
                <span className="text-secondary-text">List not found</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 1 && (
          <div className="flex-grow flex flex-col">
            <div className="flex gap-3">
              <Input
                value={tokensSearchValue}
                onChange={(e) => setTokensSearchValue(e.target.value)}
                placeholder={t("search_name_or_paste_address")}
              />
            </div>

            <div className="w-full flex items-center mt-3">
              <Button
                endIcon="import-token"
                variant={ButtonVariant.OUTLINED}
                onClick={() => setContent("import-token")}
                className="rounded-r-0 xl:rounded-r-0 flex-grow"
              >
                {t("import_token")}
              </Button>

              <ButtonTooltip text={t("import_token_tooltip")} />
            </div>

            <div className="flex justify-between items-center my-3">
              <div>
                {t("total")}{" "}
                {onlyCustom ? (
                  <>{t("custom_tokens_amount", { amount: tokens.length })}</>
                ) : (
                  tokens.length
                )}
              </div>
              <div>
                <Checkbox
                  checked={onlyCustom}
                  handleChange={() => setOnlyCustom(!onlyCustom)}
                  id="only-custom"
                  label={t("only_custom")}
                />
              </div>
            </div>

            <div className="flex flex-col overflow-auto flex-grow">
              <div style={{ flex: "1 1 auto" }} className="pb-[1px]">
                {Boolean(filteredTokens.length) && (
                  <AutoSizer>
                    {({ width, height }) => {
                      if (filteredTokens.length) {
                        return (
                          <List
                            width={width}
                            height={height}
                            rowCount={filteredTokens.length}
                            rowHeight={60}
                            rowRenderer={({ key, index, isScrolling, isVisible, style }) => {
                              return (
                                <div key={key} style={style}>
                                  <ManageTokenItem
                                    setTokenForPortfolio={setTokenForPortfolio}
                                    token={filteredTokens[index]}
                                  />
                                </div>
                              );
                            }}
                          />
                        );
                      }
                    }}
                  </AutoSizer>
                )}
                {Boolean(!filteredTokens.length && onlyCustom && !isTokenFilterActive) && (
                  <div className="flex items-center justify-center gap-2 flex-col h-full">
                    <EmptyStateIcon iconName="custom" />
                    <span className="text-secondary-text">{t("no_custom_yet")}</span>
                  </div>
                )}
                {Boolean(!filteredTokens.length && !onlyCustom && !isTokenFilterActive) && (
                  <div className="flex items-center justify-center gap-2 flex-col h-full">
                    <EmptyStateIcon iconName="tokens" />
                    <span className="text-secondary-text">{t("no_tokens_yet")}</span>
                  </div>
                )}
                {Boolean(!filteredTokens.length && isTokenFilterActive) && (
                  <div className="flex items-center justify-center gap-2 flex-col h-full">
                    <EmptyStateIcon iconName="search" />
                    <span className="text-secondary-text">{t("token_not_found")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
