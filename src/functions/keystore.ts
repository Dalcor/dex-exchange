import Wallet, { thirdparty } from "ethereumjs-wallet";

const fromMyEtherWalletV2 = (json: any) => {
  if (json.privKey.length !== 64) {
    throw new Error("Invalid private key length");
  }
  const privKey = new Buffer(json.privKey, "hex");
  return new Wallet(privKey);
};

const getWalletFromPrivKeyFile = (jsonfile: any, password: string) => {
  if (jsonfile.encseed != null) return Wallet.fromEthSale(jsonfile, password);
  else if (jsonfile.Crypto != null || jsonfile.crypto != null)
    return Wallet.fromV3(jsonfile, password, true);
  else if (jsonfile.hash != null) return thirdparty.fromEtherWallet(jsonfile, password);
  else if (jsonfile.publisher == "MyEtherWallet") return fromMyEtherWalletV2(jsonfile);
  throw new Error("Invalid Wallet file");
};

export const unlockKeystore = async (file: { [key: string]: string } | null, password: string) => {
  const newFile: { [key: string]: string } = {};

  if (!file) {
    return;
  }
  // Small hack because non-strict wasn't working..
  Object.keys(file).forEach((key) => {
    newFile[key.toLowerCase()] = file[key];
  });

  return getWalletFromPrivKeyFile(newFile, password);
};
