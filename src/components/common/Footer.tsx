"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { formatGwei } from "viem";
import { useBlockNumber, useGasPrice } from "wagmi";

import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import useCurrentChainId from "@/hooks/useCurrentChainId";

type SocialLink = {
  title: any;
  href: string;
  icon: Extract<IconName, "telegram" | "x" | "discord">;
};

const socialLinks: SocialLink[] = [
  {
    title: "discussions",
    href: "https://t.me/Dex223_defi",
    icon: "telegram",
  },
  {
    title: "announcements",
    href: "https://t.me/Dex_223",
    icon: "telegram",
  },
  {
    title: "x",
    href: "https://twitter.com/Dex_223",
    icon: "x",
  },
  {
    title: "discord",
    href: "https://discord.gg/t5bdeGC5Jk",
    icon: "discord",
  },
];

function FooterLink({ href, title, icon }: SocialLink) {
  const t = useTranslations("Footer");

  return (
    <>
      <a
        target="_blank"
        href={href}
        className="lg:w-auto flex gap-2 bg-primary-bg rounded-5 py-2 pr-4 pl-5 hover:bg-green-bg duration-200 w-full whitespace-nowrap justify-center"
      >
        {t(title)}
        <Svg iconName={icon} />
      </a>
    </>
  );
}

export default function Footer() {
  const t = useTranslations("Footer");

  const chainId = useCurrentChainId();

  const { data: gasData, refetch } = useGasPrice({
    chainId: chainId || 1,
  });

  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  return (
    <>
      <div>
        <Container>
          <div className="py-5 px-5 flex justify-end items-center gap-2">
            <div className="flex items-center gap-1 text-12">
              <Svg size={16} className="text-secondary-text" iconName="gas" />
              <span>
                {t("gas")}{" "}
                <a
                  target="_blank"
                  className="text-green"
                  href={getExplorerLink(ExplorerLinkType.GAS_TRACKER, "", chainId)}
                >
                  {gasData ? formatFloat(formatGwei(gasData)) : ""} GWEI
                </a>
              </span>
            </div>
            <div className="bg-primary-border w-[1px] h-3" />
            <div className="flex items-center gap-1.5 text-12 group relative">
              {blockNumber ? (
                <a
                  target="_blank"
                  className="text-green"
                  href={getExplorerLink(ExplorerLinkType.BLOCK, blockNumber.toString(), chainId)}
                >
                  {blockNumber.toString()}
                </a>
              ) : null}
              <div className="w-1.5 h-1.5 rounded-full bg-green" />

              <div className="whitespace-nowrap text-14 opacity-0 pointer-events-none px-5 py-4 absolute group-hover:opacity-100 duration-200 bottom-9 rounded-3 right-0 bg-primary-bg border border-secondary-border before:w-2.5 before:h-2.5 before:-bottom-[6px] before:bg-primary-bg before:absolute before:right-9 before:rotate-45 before:border-secondary-border before:border-r before:border-b">
                <p>{t("most_recent_block")}</p>
                <p>{t("prices_update_on_every_block")}</p>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <footer className="before:h-[1px] before:bg-footer-border before:w-full before:absolute relative before:top-0 before:left-0 pb-[56px] md:pb-0">
        <Container>
          <div className="flex justify-between py-3 px-5 items-center flex-col-reverse lg:flex-row gap-3">
            <span className="text-12 text-secondary-text">
              © {new Date(Date.now()).getFullYear()} DEX223
            </span>
            <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-3 w-full lg:w-auto">
              {socialLinks.map((socialLink) => {
                return <FooterLink key={socialLink.title} {...socialLink} />;
              })}
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}
