import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";

function LinkGroupTitle({ text }: { text: string }) {
  return <div className="text-secondary-text uppercase leading-8">{text}</div>;
}

function FooterLink({ href, text }: { href: string; text: string }) {
  return (
    <div>
      <a
        target="_blank"
        href={href}
        className="font-medium uppercase duration-200 hover:text-green"
      >
        {text}
      </a>
    </div>
  );
}

const footerLinks = [
  {
    text: "ERC20 & ERC223 Token Converter",
    href: "https://github.com/Dexaran/EIPs/blob/patch-7/EIPS/eip-7417.md",
  },
  {
    text: "ERC223 Front Page",
    href: "https://dexaran.github.io/erc223",
  },
  {
    text: "Page source codes",
    href: "https://github.com/Dexaran/Dex223-ICO-page/tree/main",
  },
];

const socialLinks = [
  {
    text: "Telegram",
    href: "https://t.me/Dexaran",
  },
  {
    text: "Twitter",
    href: "https://twitter.com/Dexaran",
  },
  {
    text: "Callisto",
    href: "https://twitter.com/CallistoSupport",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-primary-border bg-black">
      <Container>
        <div className="py-10 flex justify-between">
          <div className="flex gap-[160px]">
            <div className="grid gap-3">
              <LinkGroupTitle text="Useful links" />
              {footerLinks.map(({ text, href }) => {
                return <FooterLink key={text} href={href} text={text} />;
              })}
            </div>
            <div className="grid gap-3">
              <LinkGroupTitle text="Social media" />
              {socialLinks.map(({ text, href }) => {
                return <FooterLink key={text} href={href} text={text} />;
              })}
            </div>
          </div>
          <div className="text-right">
            <div className="rounded-1 bg-primary-bg py-1.5 px-3 flex gap-1 text-left border-r-4 border-green">
              <span className="h-6 pt-0.5 block text-green">
                <Svg iconName="info" />
              </span>
              <span>Dedicated social media for DEX223 will be announced soon</span>
            </div>
          </div>
        </div>
      </Container>
      <div className="border-t border-primary-border">
        <Container>
          <div className="py-6 px-0 flex justify-between">
            <div style={{ maxWidth: 872 }}>
              <span className="text-secondary-text">
                Disclaimer: Cryptocurrency may be unregulated in your jurisdiction. The value of
                cryptocurrencies may go down as well as up. Profits may be subject to capital gains
                or other taxes applicable in your jurisdiction.
              </span>
            </div>
            <span className="text-secondary-text text-right">
              Copyright © 2023 DEX223 <br /> All Rights Reserved
            </span>
          </div>
        </Container>
      </div>
    </footer>
  );
}
