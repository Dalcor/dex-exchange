import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import SelectButton from "@/components/atoms/SelectButton";
import PickButton from "@/components/buttons/PickButton";

const meta = {
  title: "Buttons/Select Button",
  component: SelectButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },

  tags: ["autodocs"],

  args: { onClick: fn() },
} satisfies Meta<typeof SelectButton>;

export default meta;
type Story = StoryObj<typeof SelectButton>;

export const Default: Story = {
  args: {
    withArrow: true,
    isOpen: false,
    children: "Select button",
  },
  render: function Render(args) {
    const [{ isOpen }, updateArgs] = useArgs();

    function onChange() {
      updateArgs({ isOpen: !isOpen });
    }

    return <SelectButton {...args} onClick={onChange} isOpen={isOpen} />;
  },
};
