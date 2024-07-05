import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { SearchInput } from "@/components/atoms/Input";

const meta = {
  title: "Atoms/Search Input",
  component: SearchInput,
  parameters: {
    layout: "centered",
  },
  args: { onChange: fn() },
  tags: ["autodocs"],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "",
    placeholder: "Search",
  },
  render: function Render(args) {
    const [{ value }, updateArgs] = useArgs();

    return (
      <SearchInput
        {...args}
        value={value}
        onChange={(e) => updateArgs({ value: e.target.value })}
      />
    );
  },
};
