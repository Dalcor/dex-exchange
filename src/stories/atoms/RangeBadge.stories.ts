import type { Meta, StoryObj } from "@storybook/react";

import RangeBadge, { PositionRangeStatus } from "@/components/badges/RangeBadge";
const meta = {
  title: "Atoms/Range Badge",
  component: RangeBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RangeBadge>;

export default meta;
type Story = StoryObj<typeof RangeBadge>;

export const InRange: Story = {
  args: {
    status: PositionRangeStatus.IN_RANGE,
  },
};

export const OutOfRange: Story = {
  args: {
    status: PositionRangeStatus.OUT_OF_RANGE,
  },
};

export const Closed: Story = {
  args: {
    status: PositionRangeStatus.CLOSED,
  },
};
