import type { Meta, StoryObj } from "@storybook/react";

import Svg from "@/components/atoms/Svg";

const meta = {
  title: "Atoms/Svg",
  component: Svg,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Svg>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Linear: Story = {
  args: {
    iconName: "add",
  },
};
