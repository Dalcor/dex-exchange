import { FeeAmount } from "@/sdk_hybrid/constants";

export const FEE_TIERS = [FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];

export const FEE_AMOUNT_DETAIL: Record<
  FeeAmount,
  {
    label: string;
    description: string;
  }
> = {
  [FeeAmount.LOWEST]: {
    label: "0.01",
    description: "tier_100_description",
  },
  [FeeAmount.LOW]: {
    label: "0.05",
    description: "tier_500_description",
  },
  [FeeAmount.MEDIUM]: {
    label: "0.3",
    description: "tier_3000_description",
  },
  [FeeAmount.HIGH]: {
    label: "1",
    description: "tier_10000_description",
  },
};
