import { default as EventEmitter } from 'eventemitter3';
import {
  Account,
  getAddress,
  Transport,
  WalletClient as WalletClient_,
  Chain,
  Address,
  createWalletClient, http
} from 'viem';
import { privateKeyToAccount } from "viem/accounts";
import { callisto } from "@/config/chains/callisto";

export type WalletClient<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TAccount extends Account = Account,
> = WalletClient_<TTransport, TChain, TAccount>

export type KeystoreProviderOptions = {
  pk: Address
}

type Events = {
  accountsChanged(accounts: string[]): void
  chainChanged(chainId: number | string): void
  disconnect(): void
}
type Event = keyof Events

export class KeystoreProvider {
  #walletClient: WalletClient | undefined

  constructor(options: KeystoreProviderOptions) {
    const account = privateKeyToAccount(options.pk);

    this.#walletClient = createWalletClient({
      account,
      chain: callisto,
      transport: http(),
    });
  }

  async disconnect() {
    this.#walletClient = undefined
  }

  async getAccounts() {
    const address = this.#walletClient?.account.address
    if (!address) return []
    return [getAddress(address)]
  }

  getWalletClient(): WalletClient {
    const walletClient = this.#walletClient
    if (!walletClient) throw new Error('walletClient not found')
    return walletClient
  }


  async request({ method, params }: any): Promise<any> {
    return this.#walletClient?.transport.request({ method, params })
  }
}
