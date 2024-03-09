import Svg from "@/components/atoms/Svg";

interface Props {
  checked: boolean;
  handleChange: any;
  id: string;
  label: string;
}

export default function Checkbox({ checked, handleChange, id, label }: Props) {
  return (
    <div className="flex">
      <input
        id={id}
        className="
        appearance-none peer shrink-0 w-6 h-6 border border-secondary-border bg-secondary-bg rounded-2
         hover:border-green hover:bg-primary-bg checked:hover:shadow-checkbox checked:bg-green checked:hover:bg-green checked:border-green checked:hover:border-green cursor-pointer relative duration-200"
        type="checkbox"
        onChange={handleChange}
        checked={checked}
      />
      <label className="pl-2 cursor-pointer" htmlFor={id}>
        {label}
      </label>
      <Svg
        iconName="check"
        className="duration-200 absolute opacity-0 peer-checked:opacity-100 text-secondary-bg pointer-events-none"
      />
    </div>
  );
}
