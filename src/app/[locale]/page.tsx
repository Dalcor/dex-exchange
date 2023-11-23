import Container from "@/components/atoms/Container";
import { useTranslations } from "next-intl";
import AwaitingLoader from "@/components/atoms/AwaitingLoader";


export default function Home() {
  const t = useTranslations('Trade');

  return (<>
      <Container>
        {t('trade')}
      </Container>
    </>
  )
}
