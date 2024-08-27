/* eslint-disable @next/next/no-img-element */
"use client";

import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Address, isAddress } from "viem";
import { useAccount } from "wagmi";

import Checkbox from "@/components/atoms/Checkbox";
import Container from "@/components/atoms/Container";
import DialogHeader from "@/components/atoms/DialogHeader";
import Input, { SearchInput } from "@/components/atoms/Input";
import Popover from "@/components/atoms/Popover";
import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import TextField from "@/components/atoms/TextField";
import Tooltip from "@/components/atoms/Tooltip";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import IconButton, {
  IconButtonSize,
  IconButtonVariant,
  IconSize,
} from "@/components/buttons/IconButton";
import TabButton from "@/components/buttons/TabButton";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import { toDataUrl } from "@/functions/blockies";
import { clsxMerge } from "@/functions/clsxMerge";
import { copyToClipboard } from "@/functions/copyToClipboard";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import truncateMiddle from "@/functions/truncateMiddle";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { usePortfolioSearchParams } from "@/hooks/usePortfolioSearchParams";
import { useRouter } from "@/navigation";
import addToast from "@/other/toast";

import { Balances } from "./components/Balances";
import { Deposited } from "./components/Deposited";
import { LendingOrders } from "./components/LendingOrders";
import { LiquidityPositions } from "./components/LiquidityPositions";
import { MarginPositions } from "./components/MarginPositions";
import { usePortfolioStore } from "./stores/usePortfolioStore";

const AddWalletInput = () => {
  const t = useTranslations("Portfolio");

  const [tokenAddressToImport, setTokenAddressToImport] = useState("");

  const error =
    Boolean(tokenAddressToImport) && !isAddress(tokenAddressToImport)
      ? t("enter_in_correct_format")
      : "";

  return (
    <>
      <div className={clsx("relative w-full", !error && "mb-5")}>
        <Input
          className={clsxMerge("pr-12")}
          value={tokenAddressToImport}
          onChange={(e) => setTokenAddressToImport(e.target.value)}
          placeholder={t("balances_search_placeholder")}
        />
        <div
          className={clsx("absolute right-1 flex items-center justify-center h-full w-10 top-0")}
        >
          <IconButton
            variant={IconButtonVariant.ADD}
            buttonSize={IconButtonSize.REGULAR}
            iconSize={IconSize.REGULAR}
            handleAdd={() => {}}
          />
        </div>
      </div>
      {error && <p className="text-12 text-red-input mt-1">{error}</p>}
    </>
  );
};

export type ManageWalletsPopoverContent = "add" | "addConnect" | "list" | "manage";

const PopoverTitles: { [key in ManageWalletsPopoverContent]: string } = {
  add: "Add wallet",
  addConnect: "Add wallet",
  list: "My wallets",
  manage: "Manage wallets",
};

const ManageWallets = ({ setIsOpened }: { setIsOpened: (isOpened: boolean) => void }) => {
  const t = useTranslations("Portfolio");
  const tWallet = useTranslations("Wallet");
  const { isConnected } = useAccount();

  const [content, setContent] = useState<ManageWalletsPopoverContent>("list");

  const { setIsOpened: setWalletConnectOpened } = useConnectWalletDialogStateStore();
  const { addresses, activeAddresses, computed } = usePortfolioStore();

  return (
    <div className="bg-primary-bg rounded-5 border border-secondary-border shadow-popup min-w-[450px]">
      <DialogHeader
        onClose={() => {
          setIsOpened(false);
        }}
        title={PopoverTitles[content]}
      />
      <div className="flex flex-col px-5 pb-5 border-t border-primary-border">
        {content === "add" ? (
          <div className="flex flex-col pt-5">
            <AddWalletInput />
            {!isConnected && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-full h-[1px] bg-secondary-border" />
                  <span className="text-secondary-text">or</span>
                  <div className="w-full h-[1px] bg-secondary-border" />
                </div>
                <Button
                  onClick={() => setWalletConnectOpened(true)}
                  fullWidth
                  colorScheme={ButtonColor.LIGHT_GREEN}
                >
                  {tWallet("connect_wallet")}
                </Button>
              </>
            )}
          </div>
        ) : content === "addConnect" ? (
          <>
            <AddWalletInput />
            <div className="flex items-center gap-3 mb-5">
              <div className="w-full h-[1px] bg-secondary-border" />
              <span className="text-secondary-text">or</span>
              <div className="w-full h-[1px] bg-secondary-border" />
            </div>
            <Button
              onClick={() => setWalletConnectOpened(true)}
              fullWidth
              colorScheme={ButtonColor.LIGHT_GREEN}
            >
              {tWallet("connect_wallet")}
            </Button>
          </>
        ) : content === "list" ? (
          <>
            <div className="flex justify-between text-green text-18 font-medium">
              <span className="py-2 cursor-pointer hover:text-green-hover">Select all</span>
              <span className="py-2 cursor-pointer hover:text-green-hover">Manage</span>
            </div>
            <div className="flex flex-col gap-3">
              {addresses.map(({ address, isActive }) => (
                <div
                  key={address}
                  className="flex items-center px-5 py-[10px] bg-tertiary-bg rounded-3 gap-3"
                >
                  <Checkbox checked={isActive} handleChange={() => {}} id="lol" />
                  <img
                    key={address}
                    className={clsx("w-10 h-10 m-h-10 m-w-10 rounded-2 border-2 border-primary-bg")}
                    src={toDataUrl(address)}
                    alt={address}
                  />

                  <div className="flex flex-col">
                    <span className="font-medium">
                      {truncateMiddle(address || "", { charsFromStart: 6, charsFromEnd: 6 })}
                    </span>
                    <span className="text-secondary-text text-14">$22.23</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : content === "manage" ? (
          <></>
        ) : null}
      </div>
    </div>
  );
};

type ActiveTab = "balances" | "margin" | "lending" | "positions" | "deposited";
export function Portfolio({ activeTab }: { activeTab: ActiveTab }) {
  // usePortfolioSearchParams();

  const chainId = useCurrentChainId();
  const { isConnected, address, connector } = useAccount();
  const router = useRouter();
  const t = useTranslations("Portfolio");
  const tToast = useTranslations("Toast");

  const [isOpened, setIsOpened] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { addresses, activeAddresses } = usePortfolioStore();

  const trigger = useMemo(
    () => (
      <SelectButton
        className="py-1 xl:py-2 text-14 xl:text-16 w-full md:w-full flex items-center justify-center"
        isOpen={isOpened}
        onClick={() => setIsOpened(!isOpened)}
      >
        {activeAddresses.length ? (
          <div className="flex ">
            {activeAddresses.slice(0, 3).map((ad, index) => (
              <img
                key={ad}
                className={clsx(
                  "w-6 h-6 m-h-6 m-w-6 rounded-1 border-2 border-primary-bg",
                  index > 0 && "ml-[-8px]",
                )}
                src={toDataUrl(ad)}
                alt={ad}
              />
            ))}
            <span className="ml-2 whitespace-nowrap">{`${activeAddresses.length} wallets`}</span>
          </div>
        ) : (
          <span className="pl-2">Add wallet</span>
        )}
      </SelectButton>
    ),
    [activeAddresses, isOpened],
  );

  return (
    <Container>
      <div className="p-10 flex flex-col">
        <div className="flex w-full justify-between">
          <h1 className="text-40 font-medium">{t("title")}</h1>
          <div className="flex gap-3">
            <Popover
              isOpened={isOpened}
              setIsOpened={setIsOpened}
              placement={"bottom-end"}
              trigger={trigger}
            >
              <ManageWallets setIsOpened={setIsOpened} />
            </Popover>
            <SearchInput
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t("search_placeholder")}
              className="bg-primary-bg w-[480px]"
            />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap rounded-3 p-5 bg-primary-bg gap-3">
          <div className="flex">
            {activeAddresses.slice(0, 3).map((ad, index) => (
              <img
                key={ad}
                className={clsx(
                  "w-10 h-10 m-h-10 m-w-10 rounded-2 border-2 border-primary-bg",
                  index > 0 && "ml-[-12px]",
                )}
                src={toDataUrl(ad)}
                alt={ad}
              />
            ))}
            {activeAddresses.length > 3 && (
              <div className="w-10 h-10 m-h-10 m-w-10 bg-tertiary-bg rounded-2 border-2 border-primary-bg ml-[-12px] flex justify-center items-center">{`+${activeAddresses.length - 3}`}</div>
            )}
          </div>

          {activeAddresses.map((ad) => (
            <div key={ad} className="flex items-center gap-1 p-r pl-3 bg-tertiary-bg rounded-2">
              <a
                className="flex gap-2 cursor-pointer hover:text-green-hover"
                target="_blank"
                href={getExplorerLink(ExplorerLinkType.ADDRESS, ad, chainId)}
              >
                {truncateMiddle(ad || "", { charsFromStart: 5, charsFromEnd: 3 })}
                <Svg iconName="forward" />
              </a>
              <IconButton
                buttonSize={IconButtonSize.SMALL}
                iconName="copy"
                iconSize={IconSize.REGULAR}
                onClick={async () => {
                  await copyToClipboard(ad);
                  addToast(tToast("successfully_copied"));
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-5 w-full grid grid-cols-5 bg-primary-bg p-1 gap-1 rounded-3">
          <TabButton
            inactiveBackground="bg-secondary-bg"
            size={48}
            active={activeTab === "balances"}
            onClick={() => router.push("/portfolio")}
          >
            Balances
          </TabButton>
          <TabButton
            inactiveBackground="bg-secondary-bg"
            size={48}
            active={activeTab === "margin"}
            onClick={() => router.push("/portfolio/margin")}
          >
            Margin positions
          </TabButton>
          <TabButton
            inactiveBackground="bg-secondary-bg"
            size={48}
            active={activeTab === "lending"}
            onClick={() => router.push("/portfolio/lending")}
          >
            Lending orders
          </TabButton>
          <TabButton
            inactiveBackground="bg-secondary-bg"
            size={48}
            active={activeTab === "positions"}
            onClick={() => router.push("/portfolio/liquidity")}
          >
            Liquidity positions
          </TabButton>
          <TabButton
            inactiveBackground="bg-secondary-bg"
            size={48}
            active={activeTab === "deposited"}
            onClick={() => router.push("/portfolio/deposited")}
          >
            Deposited to contract
          </TabButton>
        </div>
        {/* Wallet assets */}
        {activeTab === "balances" ? (
          <Balances />
        ) : activeTab === "margin" ? (
          <MarginPositions />
        ) : activeTab === "lending" ? (
          <LendingOrders />
        ) : activeTab === "positions" ? (
          <LiquidityPositions />
        ) : activeTab === "deposited" ? (
          <Deposited />
        ) : null}
      </div>
    </Container>
  );
}
