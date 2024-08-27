import uniqby from "lodash.uniqby";
import { Address } from "viem";
import { create } from "zustand";

interface PortfolioStore {
  addresses: {
    address: Address;
    isActive: boolean;
  }[];
  activeAddresses: Address[];
  computed: {
    activeAddresses: Address[];
  };
  addAddress: (address: Address) => void;
  removeAddress: (address: Address) => void;
  setIsAddressActive: (address: Address, isActive: boolean) => void;
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  addresses: [
    { address: "0x222E674FB1a7910cCF228f8aECF760508426b482", isActive: true },
    { address: "0x1238536071E1c677A632429e3655c799b22cDA52", isActive: true },
    { address: "0x670B24610DF99b1685aEAC0dfD5307B92e0cF4d7", isActive: true },
    { address: "0x6983185c8ba61300c77Be8b31ed6E31B312d363E", isActive: true },
  ],
  activeAddresses: [],
  computed: {
    get activeAddresses() {
      return get()
        ?.addresses.filter((ad) => ad.isActive)
        .map((ad) => ad.address);
    },
  },

  addAddress: (address) =>
    set((state) => ({
      addresses: uniqby([...state.addresses, { address, isActive: true }], "address"),
    })),
  removeAddress: (address) =>
    set((state) => ({ addresses: state.addresses.filter((ad) => ad.address !== address) })),
  setIsAddressActive: (address, isActive) =>
    set((state) => ({
      addresses: uniqby([...state.addresses, { address, isActive: isActive }], "address"),
    })),
}));
