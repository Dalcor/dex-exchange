import type { Meta, StoryObj } from "@storybook/react";

import Badge, { BadgeVariant } from "@/components/badges/Badge";
import { Standard } from "@/components/common/TokenInput";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof Badge>;

export const ColoredDefault: Story = {
  args: {
    text: Standard.ERC223,
  },
};

export const Purple: Story = {
  args: {
    color: "purple",
    text: Standard.ERC20,
  },
};

export const Risky: Story = {
  args: {
    color: "red",
    text: "Risky",
  },
};

export const Percentage: Story = {
  args: {
    variant: BadgeVariant.PERCENTAGE,
    percentage: 22,
  },
};

export const DefaultGrey: Story = {
  args: {
    variant: BadgeVariant.DEFAULT,
    text: "2%",
  },
};

export const DefaultGreySmall: Story = {
  args: {
    variant: BadgeVariant.DEFAULT,
    text: "2%",
    size: "small",
  },
};
