import { Address } from "viem";

import { ChainId, DexChainId, SUPPORTED_CHAINS, SupportedChainsType } from "./chains";

type AddressMap = { [chainId: number]: string };

type ChainAddresses = {
  v3CoreFactoryAddress: string;
  multicallAddress: string;
  quoterAddress: string;
  v3MigratorAddress?: string;
  nonfungiblePositionManagerAddress?: string;
  tickLensAddress?: string;
  swapRouter02Address?: string;
  v1MixedRouteQuoterAddress?: string;
};

const DEFAULT_NETWORKS = [ChainId.MAINNET, ChainId.GOERLI, ChainId.SEPOLIA];

function constructSameAddressMap(address: string, additionalNetworks: ChainId[] = []): AddressMap {
  return DEFAULT_NETWORKS.concat(additionalNetworks).reduce<AddressMap>((memo, chainId) => {
    memo[chainId] = address;
    return memo;
  }, {});
}

export const UNI_ADDRESSES: AddressMap = constructSameAddressMap(
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  [
    ChainId.OPTIMISM,
    ChainId.ARBITRUM_ONE,
    ChainId.POLYGON,
    ChainId.POLYGON_MUMBAI,
    ChainId.SEPOLIA,
  ],
);

// Networks that share most of the same addresses i.e. Mainnet, Goerli, Optimism, Arbitrum, Polygon
const DEFAULT_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  multicallAddress: "0x1F98415757620B543A52E61c46B32eB19261F984",
  quoterAddress: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  v3MigratorAddress: "0xA5644E29708357803b5A882D272c41cC0dF92B34",
  nonfungiblePositionManagerAddress: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
};
const MAINNET_ADDRESSES: ChainAddresses = {
  ...DEFAULT_ADDRESSES,
  v1MixedRouteQuoterAddress: "0x84E44095eeBfEC7793Cd7d5b57B7e401D7f1cA2E",
};
const GOERLI_ADDRESSES: ChainAddresses = {
  ...DEFAULT_ADDRESSES,
  v1MixedRouteQuoterAddress: "0xBa60b6e6fF25488308789E6e0A65D838be34194e",
};

const OPTIMISM_ADDRESSES: ChainAddresses = DEFAULT_ADDRESSES;
const ARBITRUM_ONE_ADDRESSES: ChainAddresses = {
  ...DEFAULT_ADDRESSES,
  multicallAddress: "0xadF885960B47eA2CD9B55E6DAc6B42b7Cb2806dB",
  tickLensAddress: "0xbfd8137f7d1516D3ea5cA83523914859ec47F573",
};
const POLYGON_ADDRESSES: ChainAddresses = DEFAULT_ADDRESSES;

// celo v3 addresses
const CELO_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0xAfE208a311B21f13EF87E33A90049fC17A7acDEc",
  multicallAddress: "0x633987602DE5C4F337e3DbF265303A1080324204",
  quoterAddress: "0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8",
  v3MigratorAddress: "0x3cFd4d48EDfDCC53D3f173F596f621064614C582",
  nonfungiblePositionManagerAddress: "0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A",
  tickLensAddress: "0x5f115D9113F88e0a0Db1b5033D90D4a9690AcD3D",
};

// BNB v3 addresses
const BNB_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7",
  multicallAddress: "0x963Df249eD09c358A4819E39d9Cd5736c3087184",
  quoterAddress: "0x78D78E420Da98ad378D7799bE8f4AF69033EB077",
  v3MigratorAddress: "0x32681814957e0C13117ddc0c2aba232b5c9e760f",
  nonfungiblePositionManagerAddress: "0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613",
  tickLensAddress: "0xD9270014D396281579760619CCf4c3af0501A47C",
  swapRouter02Address: "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2",
};

// optimism goerli addresses
const OPTIMISM_GOERLI_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0xB656dA17129e7EB733A557f4EBc57B76CFbB5d10",
  multicallAddress: "0x07F2D8a2a02251B62af965f22fC4744A5f96BCCd",
  quoterAddress: "0x9569CbA925c8ca2248772A9A4976A516743A246F",
  v3MigratorAddress: "0xf6c55fBe84B1C8c3283533c53F51bC32F5C7Aba8",
  nonfungiblePositionManagerAddress: "0x39Ca85Af2F383190cBf7d7c41ED9202D27426EF6",
  tickLensAddress: "0xe6140Bd164b63E8BfCfc40D5dF952f83e171758e",
};

// optimism sepolia addresses
const OPTIMISM_SEPOLIA_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0x8CE191193D15ea94e11d327b4c7ad8bbE520f6aF",
  multicallAddress: "0x80e4e06841bb76AA9735E0448cB8d003C0EF009a",
  quoterAddress: "0x0FBEa6cf957d95ee9313490050F6A0DA68039404",
  v3MigratorAddress: "0xE7EcbAAaA54D007A00dbb6c1d2f150066D69dA07",
  nonfungiblePositionManagerAddress: "0xdA75cEf1C93078e8b736FCA5D5a30adb97C8957d",
  tickLensAddress: "0xCb7f54747F58F8944973cea5b8f4ac2209BadDC5",
  swapRouter02Address: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
};

// arbitrum goerli v3 addresses
const ARBITRUM_GOERLI_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0x4893376342d5D7b3e31d4184c08b265e5aB2A3f6",
  multicallAddress: "0x8260CB40247290317a4c062F3542622367F206Ee",
  quoterAddress: "0x1dd92b83591781D0C6d98d07391eea4b9a6008FA",
  v3MigratorAddress: "0xA815919D2584Ac3F76ea9CB62E6Fd40a43BCe0C3",
  nonfungiblePositionManagerAddress: "0x622e4726a167799826d1E1D150b076A7725f5D81",
  tickLensAddress: "0xb52429333da969a0C79a60930a4Bf0020E5D1DE8",
};

// arbitrum sepolia v3 addresses
const ARBITRUM_SEPOLIA_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0x248AB79Bbb9bC29bB72f7Cd42F17e054Fc40188e",
  multicallAddress: "0x2B718b475e385eD29F56775a66aAB1F5cC6B2A0A",
  quoterAddress: "0x2779a0CC1c3e0E44D2542EC3e79e3864Ae93Ef0B",
  v3MigratorAddress: "0x398f43ef2c67B941147157DA1c5a868E906E043D",
  nonfungiblePositionManagerAddress: "0x6b2937Bde17889EDCf8fbD8dE31C3C2a70Bc4d65",
  tickLensAddress: "0x0fd18587734e5C2dcE2dccDcC7DD1EC89ba557d9",
  swapRouter02Address: "0x101F443B4d1b059569D643917553c771E1b9663E",
};

// sepolia v3 addresses
const SEPOLIA_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0x0227628f3F023bb0B980b67D528571c95c6DaC1c",
  multicallAddress: "0xD7F33bCdb21b359c8ee6F0251d30E94832baAd07",
  quoterAddress: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3",
  v3MigratorAddress: "0x729004182cF005CEC8Bd85df140094b6aCbe8b15",
  nonfungiblePositionManagerAddress: "0x1238536071E1c677A632429e3655c799b22cDA52",
  tickLensAddress: "0xd7f33bcdb21b359c8ee6f0251d30e94832baad07",
  swapRouter02Address: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
};

// Avalanche v3 addresses
const AVALANCHE_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD",
  multicallAddress: "0x0139141Cd4Ee88dF3Cdb65881D411bAE271Ef0C2",
  quoterAddress: "0xbe0F5544EC67e9B3b2D979aaA43f18Fd87E6257F",
  v3MigratorAddress: "0x44f5f1f5E452ea8d29C890E8F6e893fC0f1f0f97",
  nonfungiblePositionManagerAddress: "0x655C406EBFa14EE2006250925e54ec43AD184f8B",
  tickLensAddress: "0xEB9fFC8bf81b4fFd11fb6A63a6B0f098c6e21950",
  swapRouter02Address: "0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE",
};

const BASE_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
  multicallAddress: "0x091e99cb1C49331a94dD62755D168E941AbD0693",
  quoterAddress: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
  v3MigratorAddress: "0x23cF10b1ee3AdfCA73B0eF17C07F7577e7ACd2d7",
  nonfungiblePositionManagerAddress: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1",
  tickLensAddress: "0x0CdeE061c75D43c82520eD998C23ac2991c9ac6d",
  swapRouter02Address: "0x2626664c2603336E57B271c5C0b26F421741e481",
};

// Base Goerli v3 addresses
const BASE_GOERLI_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0x9323c1d6D800ed51Bd7C6B216cfBec678B7d0BC2",
  multicallAddress: "0xB206027a9E0E13F05eBEFa5D2402Bab3eA716439",
  quoterAddress: "0xedf539058e28E5937dAef3f69cEd0b25fbE66Ae9",
  v3MigratorAddress: "0x3efe5d02a04b7351D671Db7008ec6eBA9AD9e3aE",
  nonfungiblePositionManagerAddress: "0x3c61369ef0D1D2AFa70d8feC2F31C5D6Ce134F30",
  tickLensAddress: "0x1acB873Ee909D0c98adB18e4474943249F931b92",
  swapRouter02Address: "0x8357227D4eDc78991Db6FDB9bD6ADE250536dE1d",
};

const ZORA_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0x7145F8aeef1f6510E92164038E1B6F8cB2c42Cbb",
  multicallAddress: "0xA51c76bEE6746cB487a7e9312E43e2b8f4A37C15",
  quoterAddress: "0x11867e1b3348F3ce4FcC170BC5af3d23E07E64Df",
  v3MigratorAddress: "0x048352d8dCF13686982C799da63fA6426a9D0b60",
  nonfungiblePositionManagerAddress: "0xbC91e8DfA3fF18De43853372A3d7dfe585137D78",
  tickLensAddress: "0x209AAda09D74Ad3B8D0E92910Eaf85D2357e3044",
  swapRouter02Address: "0x7De04c96BE5159c3b5CeffC82aa176dc81281557",
};

const ZORA_SEPOLIA_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0x4324A677D74764f46f33ED447964252441aA8Db6",
  multicallAddress: "0xA1E7e3A69671C4494EC59Dbd442de930a93F911A",
  quoterAddress: "0xC195976fEF0985886E37036E2DF62bF371E12Df0",
  v3MigratorAddress: "0x65ef259b31bf1d977c37e9434658694267674897",
  nonfungiblePositionManagerAddress: "0xB8458EaAe43292e3c1F7994EFd016bd653d23c20",
  tickLensAddress: "0x23C0F71877a1Fc4e20A78018f9831365c85f3064",
};

const ROOTSTOCK_ADDRESSES: ChainAddresses = {
  v3CoreFactoryAddress: "0xaF37EC98A00FD63689CF3060BF3B6784E00caD82",
  multicallAddress: "0x996a9858cDfa45Ad68E47c9A30a7201E29c6a386",
  quoterAddress: "0xb51727c996C68E60F598A923a5006853cd2fEB31",
  v3MigratorAddress: "0x16678977CA4ec3DAD5efc7b15780295FE5f56162",
  nonfungiblePositionManagerAddress: "0x9d9386c042F194B460Ec424a1e57ACDE25f5C4b1",
  tickLensAddress: "0x55B9dF5bF68ADe972191a91980459f48ecA16afC",
  swapRouter02Address: "0x0B14ff67f0014046b4b99057Aec4509640b3947A",
};

export const CHAIN_TO_ADDRESSES_MAP: Record<SupportedChainsType, ChainAddresses> = {
  [ChainId.MAINNET]: MAINNET_ADDRESSES,
  [ChainId.OPTIMISM]: OPTIMISM_ADDRESSES,
  [ChainId.ARBITRUM_ONE]: ARBITRUM_ONE_ADDRESSES,
  [ChainId.POLYGON]: POLYGON_ADDRESSES,
  [ChainId.POLYGON_MUMBAI]: POLYGON_ADDRESSES,
  [ChainId.GOERLI]: GOERLI_ADDRESSES,
  [ChainId.CELO]: CELO_ADDRESSES,
  [ChainId.CELO_ALFAJORES]: CELO_ADDRESSES,
  [ChainId.BNB]: BNB_ADDRESSES,
  [ChainId.OPTIMISM_GOERLI]: OPTIMISM_GOERLI_ADDRESSES,
  [ChainId.OPTIMISM_SEPOLIA]: OPTIMISM_SEPOLIA_ADDRESSES,
  [ChainId.ARBITRUM_GOERLI]: ARBITRUM_GOERLI_ADDRESSES,
  [ChainId.ARBITRUM_SEPOLIA]: ARBITRUM_SEPOLIA_ADDRESSES,
  [ChainId.SEPOLIA]: SEPOLIA_ADDRESSES,
  [ChainId.AVALANCHE]: AVALANCHE_ADDRESSES,
  [ChainId.BASE]: BASE_ADDRESSES,
  [ChainId.BASE_GOERLI]: BASE_GOERLI_ADDRESSES,
  [ChainId.ZORA]: ZORA_ADDRESSES,
  [ChainId.ZORA_SEPOLIA]: ZORA_SEPOLIA_ADDRESSES,
  [ChainId.ROOTSTOCK]: ROOTSTOCK_ADDRESSES,
};

/* V3 Contract Addresses */
export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  ...SUPPORTED_CHAINS.reduce<AddressMap>((memo, chainId) => {
    memo[chainId] = CHAIN_TO_ADDRESSES_MAP[chainId].v3CoreFactoryAddress;
    return memo;
  }, {}),
};

export const QUOTER_ADDRESSES: AddressMap = {
  ...SUPPORTED_CHAINS.reduce<AddressMap>((memo, chainId) => {
    memo[chainId] = CHAIN_TO_ADDRESSES_MAP[chainId].quoterAddress;
    return memo;
  }, {}),
};

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  ...SUPPORTED_CHAINS.reduce<AddressMap>((memo, chainId) => {
    const nonfungiblePositionManagerAddress =
      CHAIN_TO_ADDRESSES_MAP[chainId].nonfungiblePositionManagerAddress;
    if (nonfungiblePositionManagerAddress) {
      memo[chainId] = nonfungiblePositionManagerAddress;
    }
    return memo;
  }, {}),
};

export const FACTORY_ADDRESS: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0xEAc1aF2e4472219b88e56dC009F4824547830AC0",
  [DexChainId.SEPOLIA]: "0x41368e68E2EB0A74CBa9d4f6B418B487b7df5e58",
};

export const ROUTER_ADDRESS: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0xd71B50caF51f39657BA358759c54777FA44357Fb",
  [DexChainId.SEPOLIA]: "0x7835f9f26e9b9Ec41671eCc0BCb508D067b3c5Ab",
};

export const QUOTER_ADDRESS: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0x004a3d620aBE9d91F7196006713c01C9E4146B41",
  [DexChainId.SEPOLIA]: "0x688b5919167faea22f9816e0461945ae316c8c14",
};

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0xeAAfD389039229BB850F8F3a9CA5e5E1d53f3BeE",
  [DexChainId.SEPOLIA]: "0xc70b2f2Db899B8d0E73EE53Dbc4b40a12d0E2be5",
};
