import type { Meta, StoryObj } from "@storybook/react";

import { SelectedTokenInfoItem } from "@/components/others/SelectedTokensInfo";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Token } from "@/sdk_hybrid/entities/token";
import { exampleToken } from "@/stories/example-data";

const meta = {
  title: "Molecules/SelectedTokenInfoItem",
  component: SelectedTokenInfoItem,
  tags: ["autodocs"],
} satisfies Meta<typeof SelectedTokenInfoItem>;

export default meta;
type Story = StoryObj<typeof SelectedTokenInfoItem>;

export const Default: Story = {
  args: {
    token: exampleToken,
  },
};
