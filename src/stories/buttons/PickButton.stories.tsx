import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Checkbox from "@/components/atoms/Checkbox";
import Svg from "@/components/atoms/Svg";
import PickButton from "@/components/buttons/PickButton";

const meta = {
  title: "Buttons/PickButton",
  component: PickButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },

  tags: ["autodocs"],

  args: { onClick: fn() },
} satisfies Meta<typeof PickButton>;

export default meta;
type Story = StoryObj<typeof PickButton>;

export const Default: Story = {
  args: {
    isActive: true,
    loading: false,
    label: "Button text",
    image: "/example.svg",
  },
  render: function Render(args) {
    const [{ isActive, loading }, updateArgs] = useArgs();

    function onChange() {
      updateArgs({ loading: true });
      setTimeout(() => {
        updateArgs({ isActive: !isActive, loading: false });
      }, 3000);
    }

    function reset() {
      updateArgs({ isActive: false });
    }

    return (
      <PickButton
        {...args}
        onClick={isActive ? reset : onChange}
        isActive={isActive}
        loading={loading}
      />
    );
  },
};
