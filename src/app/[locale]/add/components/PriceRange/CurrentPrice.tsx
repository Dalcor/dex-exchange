import { useTranslations } from "next-intl";

export const CurrentPrice = ({
  price,
  description,
}: {
  price: number | string;
  description: string;
}) => {
  const t = useTranslations("Liquidity");
  return (
    <div className="flex justify-between items-end">
      <div className="flex flex-col gap-1">
        <span className="text-12 text-secondary-text">{t("current_price")}</span>
        <span className="font-medium text-16 bg-transparent border-0 outline-0">{price}</span>
        <span className="text-12 text-secondary-text">{description}</span>
      </div>
    </div>
  );
};
