import clsx from "clsx";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";

import DialogHeader from "@/components/atoms/DialogHeader";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Popover from "@/components/atoms/Popover";
import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonSize } from "@/components/buttons/Button";
import IconButton from "@/components/buttons/IconButton";
import TabButton from "@/components/buttons/TabButton";
import RecentTransaction from "@/components/common/RecentTransaction";
import { wallets } from "@/config/wallets";
import { copyToClipboard } from "@/functions/copyToClipboard";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import addToast from "@/other/toast";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactionsStore";

interface Props {
  setOpenedWallet: (isOpen: boolean) => void;
  isMobile?: boolean;
}

export default function AccountDialog({ setOpenedWallet, isMobile = false }: Props) {
  const { disconnect } = useDisconnect();
  const { isConnected, address, connector } = useAccount();
  const [isOpenedAccount, setIsOpenedAccount] = useState(false);

  const { data } = useBalance({ address });

  const { transactions, clearTransactions } = useRecentTransactionsStore();

  const chainId = useCurrentChainId();

  const _transactions = useMemo(() => {
    if (address && transactions[address]) {
      return transactions[address];
    }

    return [];
  }, [address, transactions]);
  // const connectorKey = useMemo(() => {
  //   if(connector instanceof MetaMaskConnector) {
  //     return "metamask";
  //   }
  //
  //   if(connector instanceof KeystoreConnector) {
  //     return "keystore";
  //   }
  //
  //   if(connector instanceof WalletConnectConnector) {
  //     return "wc";
  //   }
  //
  //   return "unknown";
  //
  // }, [connector]);

  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      {isConnected && address ? (
        <div className={clsx(!isMobile && "hidden md:block")}>
          <Popover
            isOpened={isOpenedAccount}
            setIsOpened={setIsOpenedAccount}
            placement={"bottom-start"}
            trigger={
              <SelectButton
                className="py-1 xl:py-2 text-14 xl:text-16"
                isOpen={isOpenedAccount}
                fullWidth={isMobile}
                onClick={() => setIsOpenedAccount(!isOpenedAccount)}
              >
                <span className="flex gap-2 items-center">
                  <Svg iconName="wallet" />
                  {`${address.slice(0, 5)}...${address.slice(-3)}`}
                </span>
              </SelectButton>
            }
          >
            <div className="bg-primary-bg rounded-5 border border-secondary-border shadow-popup">
              <DialogHeader onClose={() => setIsOpenedAccount(false)} title="My wallet" />
              <div className="pl-10 pr-10 min-w-[600px]">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <Image src={wallets.metamask.image} alt="" width={48} height={48} />
                    <div>
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
                    </div>

                    <div className="flex gap-1">
                      <IconButton
                        iconName="copy"
                        onClick={async () => {
                          await copyToClipboard(address || "");
                          addToast("Successfully copied!");
                        }}
                      />
                      <a
                        target="_blank"
                        href={getExplorerLink(ExplorerLinkType.ADDRESS, address, chainId)}
                      >
                        <IconButton iconName="forward" />
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="flex items-center gap-2 hover:text-green duration-200"
                  >
                    Disconnect
                    <Svg iconName="logout" />
                  </button>
                </div>
                <div className="relative bg-gradient-to-r from-[#3C4C4A] to-[#70C59E] rounded-2">
                  <div className="absolute right-0 top-0 bottom-0 bg-account-card-pattern mix-blend-screen bg-no-repeat bg-right w-full h-full" />
                  <div className="relative mb-5 px-5 pt-4 pb-3 grid gap-3 z-10">
                    <div>
                      <div className="text-12 text-secondary-text">Total Balance</div>
                      <div className="text-32 text-primary-text font-medium">$0.00</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 bg-secondary-bg p-1 gap-1 rounded-3 mb-3">
                  {["Tokens", "Transactions"].map((title, index) => {
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

                {activeTab == 0 && (
                  <div className="flex flex-col items-center justify-center h-[408px] overflow-scroll gap-2">
                    <EmptyStateIcon iconName="assets" />
                    <span className="text-secondary-text">All assets will be displayed here.</span>
                  </div>
                )}

                {activeTab == 1 && (
                  <div className="h-[408px] overflow-scroll">
                    {_transactions.length ? (
                      <>
                        <div className="flex justify-between items-center mb-3">
                          <span>Total transactions: {_transactions.length}</span>
                          <button
                            onClick={clearTransactions}
                            className="border-primary-border flex items-center rounded-5 border text-14 py-1.5 pl-6 gap-2 pr-[18px] hover:bg-white/20 duration-200 hover:border-primary-text"
                          >
                            Clear all
                            <Svg iconName="delete" />
                          </button>
                        </div>
                        <div className="flex flex-col gap-1 pb-3">
                          {_transactions.map((transaction) => {
                            return (
                              <RecentTransaction transaction={transaction} key={transaction.hash} />
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Image src="/empty/empty-history.svg" width={80} height={80} alt="" />
                        <span className="text-secondary-text">
                          All transaction will be displayed here.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Popover>
        </div>
      ) : (
        <div className={clsx(!isMobile && "hidden md:block")}>
          <Button
            fullWidth={isMobile}
            size={ButtonSize.MEDIUM}
            tabletSize={ButtonSize.SMALL}
            mobileSize={ButtonSize.SMALL}
            className="md:rounded-2 md:font-normal"
            onClick={() => setOpenedWallet(true)}
          >
            Connect wallet
          </Button>
        </div>
      )}
    </>
  );
}
