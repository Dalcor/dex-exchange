import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import SelectOption from "@/components/atoms/SelectOption";
const meta = {
  title: "Atoms/SelectOption",
  component: SelectOption,

  tags: ["autodocs"],

  args: { onClick: fn() },
} satisfies Meta<typeof SelectOption>;

export default meta;
type Story = StoryObj<typeof SelectOption>;

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

    return <SelectOption {...args} onClick={onChange} isActive={isActive} />;
  },
};
