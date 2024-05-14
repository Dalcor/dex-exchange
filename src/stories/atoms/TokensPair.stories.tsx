import type { Meta, StoryObj } from "@storybook/react";

import TokensPair from "@/components/common/TokensPair";
import { exampleToken, exampleToken1 } from "@/stories/example-data";
const meta = {
  title: "Atoms/Tokens Pair",
  component: TokensPair,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TokensPair>;

export default meta;
type Story = StoryObj<typeof TokensPair>;

export const Default: Story = {
  args: {
    tokenA: exampleToken,
    tokenB: exampleToken1,
  },
};
