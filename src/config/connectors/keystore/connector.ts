import { ConnectorNotConnectedError, createConnector } from '@wagmi/core'
import {
  Address,
  createWalletClient,
  fromHex,
  getAddress,
  http,
  numberToHex,
  SwitchChainError,
  WalletClient
} from "viem";
import { ChainNotConfiguredError, normalizeChainId } from "wagmi";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { callisto } from "@/config/chains/callisto";
import { AvailableChains } from "@/components/dialogs/stores/useConnectWalletStore";

export type KeystoreConnectorParameters = {
  chainId?: number,
  pk: Address
};

export function keystore({ pk, chainId = 1 }: KeystoreConnectorParameters) {
  let connected = false;
  let connectedChainId: number;
  let client: WalletClient | undefined;

  return createConnector<WalletClient>((config) => ({
    id: "keystore",
    name: "Keystore",
    type: "keystore",
    async setup() {
      connectedChainId = config.chains[0].id
    },
    async connect({ chainId }: {chainId: AvailableChains} ) {
      const provider: WalletClient = await this.getProvider({chainId})
      console.log("PROVIDER");
      console.log(provider);

      try {
        const accounts = await provider.getAddresses();
        console.log("ADF");
        let currentChainId = await provider.getChainId();

        connected = true;
        console.log("ACCOUNTS");
        console.log(accounts);
        return { accounts, chainId: currentChainId }
      } catch (e) {
        console.log(e);
        return {accounts: [], chainId: 1}
      }
    },
    async disconnect() {
      connected = false
    },
    async getAccounts() {
      if (!connected) throw new ConnectorNotConnectedError()
      const provider = await this.getProvider()
      const accounts = await provider.request({ method: 'eth_accounts' })
      return accounts.map((x: any) => getAddress(x))
    },
    async getChainId() {
      const provider = await this.getProvider()
      const hexChainId = await provider.request({ method: 'eth_chainId' })
      return fromHex(hexChainId, 'number')
    },
    async isAuthorized() {
      if (!connected) return false
      const accounts = await this.getAccounts()
      return !!accounts.length
    },
    async switchChain({ chainId }) {
      console.log("switchChain", chainId);
      try {
        const provider = await this.getProvider();
      } catch (e) {
        console.log(e);
      }
      const provider = await this.getProvider();
      console.log("Provider", provider);
      const chain = config.chains.find((x) => x.id === chainId)
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError())

      console.log("No");
      try {
        await provider.switchChain({id: chainId});
      } catch (e) {
        console.log(e);
      }

      console.log("SWIT?HDEC");

      return chain;
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect()
      else
        config.emitter.emit('change', {
          accounts: accounts.map((x) => getAddress(x)),
        })
    },
    onChainChanged(chain) {
      const chainId = normalizeChainId(chain)
      config.emitter.emit('change', { chainId })
    },
    async onDisconnect(_error) {
      config.emitter.emit('disconnect')
      connected = false
    },
    async getProvider({chainId}: {chainId?: number}) {
      console.log("GETTING");
      if(!client) {
        console.log("NO CLIENT< CREATING ONE");
        const account = privateKeyToAccount(pk);
        const chain = config.chains.find((x) => x.id === chainId)

        client = createWalletClient({
          account,
          chain: chain,
          transport: http(),
        });
      }

      return client;
    },
  }))
}


export type FooBarBazParameters = {}

keystore1.type = 'keystore' as const;
export function keystore1(parameters: FooBarBazParameters = {}) {
  return createConnector((config) => ({
    id: "keystore",
    name: "Keystore Connector",
    type: keystore1.type,

    async connect({ chainId } = {}) {
      return {accounts: [], chainId: chainId || 820}
    },
    async disconnect() {},
    async getAccounts() {},
    async getChainId() {},
    async getProvider() {},
    async isAuthorized() {},
    async setup() {},
    async switchChain() {},


    async onAccountsChanged() {},
    async onChainChanged() {},
    async onConnect() {},
    async onMessage() {},

    async onDisconnect(_error) {
      config.emitter.emit('disconnect');
    }


  }))
}
