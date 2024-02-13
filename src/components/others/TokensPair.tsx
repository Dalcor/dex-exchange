import Image from "next/image";

export default function TokensPair() {
  return <div className="flex items-center gap-2.5">
    <div className="flex items-center">
      <Image src="/tokens/ETH.svg" alt="Ethereum" width={32} height={32}/>
      <Image className="-ml-3.5" src="/tokens/ETH.svg" alt="Ethereum" width={32} height={32}/>
    </div>
    <span className="font-bold block">UNI / ETH</span>
  </div>
}
