import Container from "@/components/atoms/Container";
import { useTranslations } from "next-intl";


export default function Home() {
  const t = useTranslations('Trade');

  return (<>
      <Container>
        {t('trade')}
      </Container>
    </>
  )
}
