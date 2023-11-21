import Svg from "@/components/atoms/Svg";

interface Props {
  checked: boolean,
  handleChange: any,
  id: string,
  label: string
}

export default function Checkbox({ checked, handleChange, id, label }: Props) {
  return <div className="flex">
    <input
      id={id}
      className="
        appearance-none peer shrink-0 w-6 h-6 border border-primary-border bg-transparent rounded-1
         hover:border-green checked:bg-green checked:border-green cursor-pointer relative duration-200"
      type="checkbox"
    />
    <label className="pl-2 cursor-pointer" htmlFor={id}>{label}</label>
    <Svg iconName="check" className="duration-200 absolute opacity-0 peer-checked:opacity-100 pointer-events-none"/>
  </div>
}
