import React, { useMemo, useState } from "react";
import { AutoSizer, List } from "react-virtualized";

import Checkbox from "@/components/atoms/Checkbox";
import DialogHeader from "@/components/atoms/DialogHeader";
import Input from "@/components/atoms/Input";
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
export default function TokensAndLists({ setContent, handleClose, setTokenForPortfolio }: Props) {
  const { activeTab, setActiveTab } = useManageTokensDialogStore();

  const lists = useTokenLists();
  const [onlyCustom, setOnlyCustom] = useState(false);

  const tokens = useTokens(onlyCustom);

  const [value, setValue] = useState("");

  const filteredTokens = useMemo(() => {
    return value ? tokens.filter((t) => t.name && t.name.toLowerCase().startsWith(value)) : tokens;
  }, [tokens, value]);

  return (
    <>
      <DialogHeader onClose={handleClose} title="Manage tokens" />
      <div className="w-full md:w-[600px] h-[580px] flex flex-col px-4 md:px-10">
        <div className="grid grid-cols-2 bg-secondary-bg p-1 gap-1 rounded-3  mb-3">
          {["Lists", "Tokens"].map((title, index) => {
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
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search name or paste address"
              />
            </div>

            <Button
              endIcon="import-list"
              variant={ButtonVariant.OUTLINED}
              onClick={() => setContent("import-list")}
              className="mt-3"
            >
              Import list
            </Button>

            <div className="flex flex-col mt-3 overflow-scroll flex-grow">
              {lists
                ?.filter((l) => Boolean(l.list.tokens.length))
                ?.map((tokenList) => {
                  return (
                    <TokenListItem
                      toggle={() => {
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
          </div>
        )}

        {activeTab === 1 && (
          <div className="flex-grow flex flex-col">
            <div className="flex gap-3">
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search name or paste address"
              />
            </div>

            <Button
              endIcon="import-token"
              variant={ButtonVariant.OUTLINED}
              onClick={() => setContent("import-token")}
              className="mt-3"
            >
              Import token
            </Button>

            <div className="flex justify-between items-center my-3">
              <div>Total: {filteredTokens.length}</div>
              <div>
                <Checkbox
                  checked={onlyCustom}
                  handleChange={() => setOnlyCustom(!onlyCustom)}
                  id="only-custom"
                  label="Only custom"
                />
              </div>
            </div>

            <div className="flex flex-col overflow-scroll flex-grow">
              <div style={{ flex: "1 1 auto" }} className="pb-[1px]">
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

                    if (!filteredTokens.length && onlyCustom) {
                      return <div>No custom tokens yet</div>;
                    }

                    if (!filteredTokens.length) {
                      return <div>No tokens yet</div>;
                    }
                  }}
                </AutoSizer>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
