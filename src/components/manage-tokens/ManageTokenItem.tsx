import { useState } from "react";
import { useAccount } from "wagmi";

import Dialog from "@/components/atoms/Dialog";
import IconButton from "@/components/buttons/IconButton";
import { Token } from "@/sdk_hybrid/entities/token";
import { useTokenListsStore } from "@/stores/useTokenListsStore";

export default function ManageTokenItem({ token }: { token: Token }) {
  const [open, setOpen] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);

  const { chainId } = useAccount();

  const { removeCustomToken } = useTokenListsStore();

  return (
    <div>
      <div className="flex justify-between py-1.5 px-10">
        <div className="flex gap-3 items-center">
          <img className="rounded-full" width={40} height={40} src={token.logoURI} alt="" />
          <div className="flex flex-col">
            <span>{token.name}</span>
            <div className="flex gap-1 items-center text-secondary-text">
              Found in 1 token-lists
              {/*<Popover*/}
              {/*  placement="top-end"*/}
              {/*  isOpened={isPopoverOpened}*/}
              {/*  setIsOpened={() => setPopoverOpened(!isPopoverOpened)}*/}
              {/*  trigger={*/}
              {/*    <button onClick={() => setPopoverOpened(true)}*/}
              {/*            className="text-secondary-text hover:text-primary-text duration-200 relative">*/}
              {/*      <Svg iconName="settings"/>*/}
              {/*    </button>*/}
              {/*  }>*/}
              {/*  <div className="flex flex-col gap-3 p-5 border-secondary-border border bg-primary-bg rounded-1">*/}
              {/*    v1.0.30*/}
              {/*    <a href="#" className="flex items-center text-green hover:text-green-hover duration-200 gap-2">*/}
              {/*      See*/}
              {/*      <Svg iconName="forward"/>*/}
              {/*    </a>*/}
              {/*    <button className="bg-red py-0.5 px-2 rounded-5 text-black hover:bg-red-hover duration-200">Remove*/}
              {/*    </button>*/}
              {/*  </div>*/}
              {/*</Popover>*/}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/*{token.lists?.includes("custom") && (*/}
          {/*  <>*/}
          {/*    <DeleteIconButton onClick={() => setDeleteOpened(true)} />*/}
          {/*    <Dialog isOpen={deleteOpened} setIsOpen={setDeleteOpened}>*/}
          {/*      <DialogHeader onClose={() => setDeleteOpened(false)} title="Remove token" />*/}
          {/*      Are you sure you want delete this token? It will be removed only from your custom*/}
          {/*      token list.*/}
          {/*      <div className="grid grid-cols-2 gap-2">*/}
          {/*        <button onClick={() => setDeleteOpened(false)}>Cancel</button>*/}
          {/*        <button*/}
          {/*          onClick={() => {*/}
          {/*            if (chainId) {*/}
          {/*              removeCustomToken(chainId as DexChainId, token.address as Address);*/}
          {/*              setDeleteOpened(false);*/}
          {/*            }*/}
          {/*          }}*/}
          {/*        >*/}
          {/*          Remove*/}
          {/*        </button>*/}
          {/*      </div>*/}
          {/*    </Dialog>*/}
          {/*  </>*/}
          {/*)}*/}
          <IconButton onClick={() => setOpen(!open)} iconName="details" />
        </div>
      </div>
      <Dialog isOpen={open} setIsOpen={setOpen}>
        <div className="px-5 pt-3 w-[530px]">
          <div className="border-b border-primary-border pb-3 flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-secondary-text">Name</span>
              <span>{token.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-text">Symbol</span>
              <span>{token.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-text">Address</span>
              <span>{token.address0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-text">Decimals</span>
              <span>{token.decimals}</span>
            </div>
          </div>
          <p className="pt-3 text-secondary-text">Found in these token-lists:</p>
          <div className="flex flex-col gap-3 py-3">
            {/*{token.lists?.map((listId) => {*/}
            {/*  return (*/}
            {/*    <div className="flex gap-3 items-center" key={listId}>*/}
            {/*      <div className="px-2">*/}
            {/*        <Image width={32} height={32} src="/token-lists/BNB.svg" alt="" />*/}
            {/*      </div>*/}
            {/*      {listId}*/}
            {/*    </div>*/}
            {/*  );*/}
            {/*})}*/}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
