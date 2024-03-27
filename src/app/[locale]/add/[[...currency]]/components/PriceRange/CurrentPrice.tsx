export const CurrentPrice = ({
  price,
  description,
}: {
  price: number | string;
  description: string;
}) => {
  return (
    <div className="flex justify-between items-end">
      <div className="flex flex-col gap-1">
        <span className="text-12 text-secondary-text">Current price</span>
        <input
          className="font-medium text-16 bg-transparent border-0 outline-0"
          type="text"
          value={price}
        />
        <span className="text-12 text-secondary-text">{description}</span>
      </div>
    </div>
  );
};
