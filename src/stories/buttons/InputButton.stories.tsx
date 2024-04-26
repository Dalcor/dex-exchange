import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import InputButton from "@/components/buttons/InputButton";

const meta = {
  title: "Buttons/InputButton",
  component: InputButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },

  tags: ["autodocs"],

  args: { onClick: fn() },
} satisfies Meta<typeof InputButton>;

export default meta;
type Story = StoryObj<typeof InputButton>;

export const Default: Story = {
  args: {
    isActive: true,
    text: "Button text",
  },
  render: function Render(args) {
    const [{ isActive }, updateArgs] = useArgs();

    function onChange() {
      updateArgs({ isActive: !isActive });
    }

    return <InputButton {...args} onClick={onChange} isActive={isActive} />;
  },
};
