import type { Meta, StoryObj } from "@storybook/react";
import { Address } from "viem";

import TokenAddressWithStandard from "@/components/atoms/TokenAddressWithStandard";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Standard } from "@/sdk_hybrid/standard";

const meta = {
  title: "Atoms/Token Address With Standard",
  component: TokenAddressWithStandard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TokenAddressWithStandard>;

const testTokenAddress: Address = "0x40769999A285730B1541DD501406168309DDa65c";
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tokenAddress: testTokenAddress,
    standard: Standard.ERC20,
    chainId: DexChainId.SEPOLIA,
  },
};
