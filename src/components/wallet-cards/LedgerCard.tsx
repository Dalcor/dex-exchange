import PickButton from "@/components/atoms/PickButton";
import { wallets } from "@/config/wallets";
import { useConnect } from "wagmi";
import { LedgerConnector } from "@wagmi/connectors/ledger";

const { image, name } = wallets.ledger;
export default function LedgerCard() {
  const { connect } = useConnect({
    connector: new LedgerConnector({
      options: {
        projectId: "05737c557c154bdb3aea937d7214eae2"
      }
    })
  })

  return <PickButton onClick={connect} image={image} label={name}/>
}
