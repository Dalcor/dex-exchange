import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useAccount, useDisconnect } from "wagmi";

import DialogHeader from "@/components/atoms/DialogHeader";
import Drawer from "@/components/atoms/Drawer";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Popover from "@/components/atoms/Popover";
import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonSize } from "@/components/buttons/Button";
import IconButton from "@/components/buttons/IconButton";
import TabButton from "@/components/buttons/TabButton";
import RecentTransaction from "@/components/common/RecentTransaction";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import { config } from "@/config/wagmi/config";
import { wallets } from "@/config/wallets";
import { copyToClipboard } from "@/functions/copyToClipboard";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import truncateMiddle from "@/functions/truncateMiddle";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import addToast from "@/other/toast";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactionsStore";

function AccountDialogContent({ setIsOpenedAccount, activeTab, setActiveTab }: any) {
  const tToast = useTranslations("Toast");
  const tRecentTransactions = useTranslations("RecentTransactions");
  const t = useTranslations("Wallet");

  const { address } = useAccount();
  const { disconnect } = useDisconnect({ config });

  const chainId = useCurrentChainId();

  const { transactions, clearTransactions } = useRecentTransactionsStore();

  const _transactions = useMemo(() => {
    if (address && transactions[address]) {
      return transactions[address];
    }

    return [];
  }, [address, transactions]);

  return (
    <>
      <DialogHeader onClose={() => setIsOpenedAccount(false)} title={t("my_wallet")} />
      <div className="md:px-10 px-4 md:w-[600px] w-full">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Image src={wallets.metamask.image} alt="" width={48} height={48} />
            <div>
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : t("not_connected")}
            </div>

            <div className="flex gap-1">
              <IconButton
                iconName="copy"
                onClick={async () => {
                  await copyToClipboard(address || "");
                  addToast(tToast("successfully_copied"));
                }}
              />
              {address && (
                <a
                  target="_blank"
                  href={getExplorerLink(ExplorerLinkType.ADDRESS, address, chainId)}
                >
                  <IconButton iconName="forward" />
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => disconnect()}
            className="flex items-center gap-2 hover:text-green duration-200"
          >
            {t("disconnect")}
            <Svg iconName="logout" />
          </button>
        </div>
        <div className="relative bg-gradient-to-r from-[#3C4C4A] to-[#70C59E] rounded-2">
          <div className="absolute right-0 top-0 bottom-0 bg-account-card-pattern mix-blend-screen bg-no-repeat bg-right w-full h-full" />
          <div className="relative mb-5 px-5 pt-4 pb-3 grid gap-3 z-10">
            <div>
              <div className="text-12 text-secondary-text">{t("total_balance")}</div>
              <div className="text-32 text-primary-text font-medium">$0.00</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 bg-secondary-bg p-1 gap-1 rounded-3 mb-3">
          {[t("tokens"), t("transactions")].map((title, index) => {
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
          <div className="flex flex-col items-center justify-center h-[408px] overflow-auto gap-2">
            <EmptyStateIcon iconName="assets" />
            <span className="text-secondary-text">{t("assets_will_be_displayed_here")}</span>
          </div>
        )}

        {activeTab == 1 && (
          <div className="h-[408px] overflow-auto">
            {_transactions.length ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span>
                    {tRecentTransactions("total_transactions")} {_transactions.length}
                  </span>
                  <button
                    onClick={clearTransactions}
                    className="border-primary-border flex items-center rounded-5 border text-14 py-1.5 pl-6 gap-2 pr-[18px] hover:bg-white/20 duration-200 hover:border-primary-text"
                  >
                    {tRecentTransactions("clear_all")}
                    <Svg iconName="delete" />
                  </button>
                </div>
                <div className="flex flex-col gap-1 pb-3">
                  {_transactions.map((transaction) => {
                    return <RecentTransaction transaction={transaction} key={transaction.hash} />;
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Image src="/empty/empty-history.svg" width={80} height={80} alt="" />
                <span className="text-secondary-text">
                  {tRecentTransactions("transactions_will_be_displayed_here")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function AccountDialog() {
  const { isConnected, address, connector } = useAccount();

  const { setIsOpened: setOpenedWallet } = useConnectWalletDialogStateStore();

  const [activeTab, setActiveTab] = useState(0);

  const _isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  const [isOpenedAccount, setIsOpenedAccount] = useState(false);

  const trigger = useMemo(
    () => (
      <SelectButton
        className="py-1 xl:py-2 text-14 xl:text-16 w-full md:w-auto flex items-center justify-center"
        isOpen={isOpenedAccount}
        onClick={() => setIsOpenedAccount(!isOpenedAccount)}
      >
        <span className="flex gap-2 items-center">
          <Svg iconName="wallet" />
          {truncateMiddle(address || "", { charsFromStart: 5, charsFromEnd: 3 })}
        </span>
      </SelectButton>
    ),
    [address, isOpenedAccount],
  );

  return (
    <>
      {isConnected && address ? (
        <>
          {_isMobile ? (
            <>
              {trigger}
              <Drawer placement="bottom" isOpen={isOpenedAccount} setIsOpen={setIsOpenedAccount}>
                <AccountDialogContent
                  setIsOpenedAccount={setIsOpenedAccount}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </Drawer>
            </>
          ) : (
            <div>
              <Popover
                isOpened={isOpenedAccount}
                setIsOpened={setIsOpenedAccount}
                placement={"bottom-start"}
                trigger={trigger}
              >
                <div className="bg-primary-bg rounded-5 border border-secondary-border shadow-popup">
                  <AccountDialogContent
                    setIsOpenedAccount={setIsOpenedAccount}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </div>
              </Popover>
            </div>
          )}
        </>
      ) : (
        <div>
          <Button
            size={ButtonSize.MEDIUM}
            tabletSize={ButtonSize.SMALL}
            mobileSize={ButtonSize.SMALL}
            className="md:rounded-2 md:font-normal w-full md:w-auto"
            onClick={() => setOpenedWallet(true)}
          >
            Connect wallet
          </Button>
        </div>
      )}
    </>
  );
}
