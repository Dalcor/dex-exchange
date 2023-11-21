import Container from "@/components/atoms/Container";
import { Locale } from "@/i18n-config";
import { getDictionary } from "@/get-dictionary";

export default async function Home({
                                     params: {locale},
                                   }: {
  params: { locale: Locale }
}) {


  const dictionary = await getDictionary(locale);

  console.log(dictionary);

  return (<>
      <Container>
        {dictionary['server-component'].welcome}
      </Container>
    </>
  )
}
