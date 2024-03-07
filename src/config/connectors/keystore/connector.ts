import { ConnectorNotConnectedError, createConnector } from "@wagmi/core";
import { Address, createWalletClient, fromHex, getAddress, http, WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { AvailableChains } from "@/components/dialogs/stores/useConnectWalletStore";

export type KeystoreConnectorParameters = {
  pk: Address;
};

keystore.type = "keystore" as const;
export function keystore({ pk }: KeystoreConnectorParameters) {
  let connected = false;
  let connectedChainId: number;
  let client: WalletClient | undefined;

  return createConnector<WalletClient>((config) => ({
    id: "keystore",
    name: "Keystore",
    type: keystore.type,
    async setup() {
      connectedChainId = config.chains[0].id;
    },
    async connect({ chainId }: { chainId: AvailableChains }) {
      const provider: WalletClient = await this.getProvider({ chainId });

      try {
        const accounts = await provider.getAddresses();
        let currentChainId = await provider.getChainId();

        connected = true;
        return { accounts, chainId: currentChainId };
      } catch (e) {
        console.log(e);
        return { accounts: [], chainId: 1 };
      }
    },
    async disconnect() {
      connected = false;
    },
    async getAccounts() {
      if (!connected) throw new ConnectorNotConnectedError();
      const provider = await this.getProvider();
      const accounts = await provider.request({ method: "eth_accounts" });
      return accounts.map((x: any) => getAddress(x));
    },
    async getChainId() {
      const provider = await this.getProvider();
      const hexChainId = await provider.request({ method: "eth_chainId" });
      return fromHex(hexChainId, "number");
    },
    async isAuthorized() {
      if (!connected) return false;
      const accounts = await this.getAccounts();
      return !!accounts.length;
    },
    async switchChain({ chainId }) {
      config.emitter.emit("change", { chainId });
      const chain = config.chains.find((x) => x.id === chainId);

      return chain!;
    },
    onAccountsChanged(accounts) {},
    onChainChanged(chain) {},
    async onDisconnect(_error) {},
    async getProvider(params: { chainId?: number }) {
      if (!client) {
        const account = privateKeyToAccount(pk);
        const chain = config.chains.find((x) => x.id === params.chainId);

        client = createWalletClient({
          account,
          chain: chain,
          transport: http(),
        });
      }
      return client;
    },
  }));
}
