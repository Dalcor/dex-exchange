import DialogHeader from "@/components/atoms/DialogHeader";
import clsx from "clsx";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import TokenListItem from "@/components/manage-tokens/TokenListItem";
import Checkbox from "@/components/atoms/Checkbox";
import { AutoSizer, List } from "react-virtualized";
import ManageTokenItem from "@/components/manage-tokens/ManageTokenItem";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";
import { useMemo, useState } from "react";
import { useTokenLists, useTokens } from "@/hooks/useTokenLists";
import Svg from "@/components/atoms/Svg";
import { useManageTokensDialogStore } from "@/stores/useManageTokensDialogStore";

interface Props {
  setContent: (content: ManageTokensDialogContent) => void,
  handleClose: () => void
}
export default function TokensAndLists({setContent, handleClose}: Props) {
  const {activeTab, setActiveTab} = useManageTokensDialogStore();

  const { lists, toggleTokenList } = useTokenLists();
  const tokens = useTokens();

  const [value, setValue] = useState("");

  const [onlyCustom, setOnlyCustom] = useState(false);


  const filteredTokens = useMemo(() => {
    const tokensAfterCustomCheck = onlyCustom ? tokens.filter(t => t.lists?.includes("custom")) : tokens;

    return value ? tokensAfterCustomCheck.filter(t => t.name.toLowerCase().startsWith(value)) : tokensAfterCustomCheck;
  }, [onlyCustom, tokens, value]);


  return <>
    <DialogHeader onClose={handleClose} title="Manage tokens"/>
    <div className="w-[550px] h-[580px] flex flex-col">
      <div className="grid grid-cols-2 mb-3 px-10">
        <button
          className={clsx("duration-200 rounded-l-1 hover:bg-tertiary-bg border border-primary-border py-2 ", activeTab === "lists" ? "text-primary-text bg-tertiary-bg" : "text-secondary-text")}
          onClick={() => setActiveTab("lists")}>Lists
        </button>
        <button
          className={clsx("duration-200 rounded-r-1 hover:bg-tertiary-bg border-y border-r border-primary-border py-2 ", activeTab === "tokens" ? "text-primary-text bg-tertiary-bg" : "text-secondary-text")}
          onClick={() => setActiveTab("tokens")}>Tokens
        </button>
      </div>

      {activeTab === "lists" && <div className="flex-grow flex flex-col">
        <div className="flex gap-3 px-10">
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search name or paste address"/>
        </div>

        <div className="flex flex-col mt-3 overflow-scroll flex-grow">
          {lists.map((tokenList) => {
            return <TokenListItem toggle={toggleTokenList} tokenList={tokenList} key={tokenList.id}/>
          })}
        </div>
        <button className="cursor-pointer w-full h-[60px] bg-tertiary-bg hover:bg-tertiary-hover duration-200 rounded-b-5" onClick={() => setContent("import-list")}>
            <span className="flex items-center justify-center gap-2">
              Import list
              <Svg iconName="import"/>
            </span>
        </button>
      </div>}

      {activeTab === "tokens" && <div className="flex-grow flex flex-col">
        <div className="flex gap-3 px-10">
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search name or paste address"/>

        </div>

        <div className="flex justify-between items-center px-10 my-3">
          <div>Total: {filteredTokens.length}</div>
          <div>
            <Checkbox checked={onlyCustom} handleChange={() => setOnlyCustom(!onlyCustom)} id="only-custom" label="Only custom" />
          </div>
        </div>

        <div className="flex flex-col overflow-scroll flex-grow">
          <div style={{ flex: '1 1 auto' }} className="pb-[1px]">
            <AutoSizer>
              {({ width, height }) => {
                return  <List
                  width={width}
                  height={height}
                  rowCount={filteredTokens.length}
                  rowHeight={60}
                  rowRenderer={({ key, index, isScrolling, isVisible, style }) => {
                    return <div key={key} style={style}>
                      <ManageTokenItem token={filteredTokens[index]}/>
                    </div>
                  }}
                />
              }}
            </AutoSizer>
          </div>
        </div>
        <button className="cursor-pointer w-full h-[60px] bg-tertiary-bg hover:bg-tertiary-hover duration-200 rounded-b-5" onClick={() => setContent("import-token")}>
            <span className="flex items-center justify-center gap-2">
              Import token
              <Svg iconName="import"/>
            </span>
        </button>
      </div>}
    </div>
  </>
}
