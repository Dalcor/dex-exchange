import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import RadioButton from "@/components/buttons/RadioButton";

const meta = {
  title: "Buttons/Radio Button",
  component: RadioButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { onClick: fn() },
} satisfies Meta<typeof RadioButton>;

export default meta;
type Story = StoryObj<typeof RadioButton>;

export const Default: Story = {
  args: {
    isActive: true,
    children: "Button text",
  },
  render: function Render(args) {
    const [{ isActive }, updateArgs] = useArgs();

    function onChange() {
      updateArgs({ isActive: !isActive });
    }

    return <RadioButton {...args} onClick={onChange} isActive={isActive} />;
  },
};
