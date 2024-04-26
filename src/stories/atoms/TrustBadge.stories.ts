import type { Meta, StoryObj } from "@storybook/react";

import TrustBadge, { Check, OtherListCheck, TrustRateCheck } from "@/components/badges/TrustBadge";

const meta = {
  title: "Atoms/Trust Badge",
  component: TrustBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TrustBadge>;

export default meta;
type Story = StoryObj<typeof TrustBadge>;

export const HighTrust: Story = {
  args: {
    rate: {
      [Check.DEFAULT_LIST]: TrustRateCheck.TRUE,
      [Check.OTHER_LIST]: OtherListCheck.FOUND_IN_MORE_THAN_A_HALF,
      [Check.SAME_NAME_IN_DEFAULT_LIST]: TrustRateCheck.FALSE,
      [Check.SAME_NAME_IN_OTHER_LIST]: TrustRateCheck.FALSE,
      [Check.ERC223_VERSION_EXIST]: TrustRateCheck.FALSE,
    },
    logoURI: "/example.svg",
  },
};

export const MediumTrust: Story = {
  args: {
    rate: {
      [Check.DEFAULT_LIST]: TrustRateCheck.TRUE,
      [Check.OTHER_LIST]: OtherListCheck.NOT_FOUND,
      [Check.SAME_NAME_IN_DEFAULT_LIST]: TrustRateCheck.TRUE,
      [Check.SAME_NAME_IN_OTHER_LIST]: TrustRateCheck.TRUE,
      [Check.ERC223_VERSION_EXIST]: TrustRateCheck.TRUE,
    },
    logoURI: "/example.svg",
  },
};

export const LowTrust: Story = {
  args: {
    rate: {
      [Check.DEFAULT_LIST]: TrustRateCheck.FALSE,
      [Check.OTHER_LIST]: OtherListCheck.NOT_FOUND,
      [Check.SAME_NAME_IN_DEFAULT_LIST]: TrustRateCheck.TRUE,
      [Check.SAME_NAME_IN_OTHER_LIST]: TrustRateCheck.TRUE,
      [Check.ERC223_VERSION_EXIST]: TrustRateCheck.TRUE,
    },
    logoURI: "/example.svg",
  },
};
