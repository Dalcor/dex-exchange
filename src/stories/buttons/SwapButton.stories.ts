import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import SwapButton from "@/components/buttons/SwapButton";

const meta = {
  title: "Buttons/SwapButton",
  component: SwapButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },

  tags: ["autodocs"],

  args: { onClick: fn() },
} satisfies Meta<typeof SwapButton>;

export default meta;
type Story = StoryObj<typeof SwapButton>;

export const Default: Story = {
  args: {},
};
