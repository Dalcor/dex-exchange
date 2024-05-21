import type { Meta, StoryObj } from "@storybook/react";

import { SelectedTokenInfoItem } from "@/components/common/SelectedTokensInfo";
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
