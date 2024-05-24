import Image from "next/image";

import { networks } from "@/config/networks";
import { DexChainId } from "@/sdk_hybrid/chains";

export enum TokenListLogoType {
  DEFAULT,
  CUSTOM,
  OTHER,
}

type Props =
  | {
      type: TokenListLogoType.CUSTOM | TokenListLogoType.DEFAULT;
      chainId: DexChainId;
    }
  | {
      type: TokenListLogoType.OTHER;
      url: string;
    };

export default function TokenListLogo(props: Props) {
  switch (props.type) {
    case TokenListLogoType.CUSTOM:
    case TokenListLogoType.DEFAULT:
      return (
        <div className="w-10 h-10 relative">
          <Image
            width={40}
            height={40}
            src={
              props.type === TokenListLogoType.CUSTOM
                ? "/custom-tokenlist.svg"
                : "/default-tokenlist.svg"
            }
            alt=""
          />
          <Image
            width={18}
            height={18}
            className="absolute -right-1 -bottom-0.5 border border-primary-bg rounded-full"
            src={networks.find((t) => t.chainId === props.chainId)?.logo || ""}
            alt=""
          />
        </div>
      );
    case TokenListLogoType.OTHER:
      return (
        <div className="w-10 h-10 relative">
          <Image width={40} height={40} src={props.url} alt="" />
        </div>
      );
  }
}
