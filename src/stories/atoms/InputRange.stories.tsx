import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";
import { ChangeEvent } from "react";

import { InputRange } from "@/app/[locale]/add/[[...currency]]/components/DepositAmounts/TokenDepositCard";

const meta = {
  title: "Atoms/Input Range",
  component: InputRange,
  tags: ["autodocs"],
} satisfies Meta<typeof InputRange>;

export default meta;
type Story = StoryObj<typeof InputRange>;

export const Default: Story = {
  render: function Render(args) {
    const [{ value }, updateArgs] = useArgs();

    function onChange(value: 0 | 100) {
      updateArgs({ value });
    }

    return <InputRange value={value} onChange={(value) => onChange(value)} />;
  },
};
