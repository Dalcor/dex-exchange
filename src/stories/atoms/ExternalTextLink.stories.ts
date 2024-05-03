import type { Meta, StoryObj } from "@storybook/react";

import ExternalTextLink from "@/components/atoms/ExternalTextLink";

const meta = {
  title: "Atoms/External Text Link",
  component: ExternalTextLink,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ExternalTextLink>;

export default meta;
type Story = StoryObj<typeof ExternalTextLink>;

export const DefaultWhite: Story = {
  args: {
    text: "Link",
    href: "https://dex223.io/",
  },
};

export const Green: Story = {
  args: {
    text: "Link",
    href: "https://dex223.io/",
    color: "white",
  },
};
