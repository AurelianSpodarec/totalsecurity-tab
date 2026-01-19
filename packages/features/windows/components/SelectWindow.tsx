import { Select } from "@packages/components";
import { SessionWindow } from "@packages/tab-manager";

type SelectWindowProps = {
  windows: Record<number, SessionWindow>;
  value: string;
  onChange: (value: string) => void;
};

export function SelectWindow({
  windows,
  value,
  onChange,
}: SelectWindowProps) {
  const windowIds = Object.keys(windows).map(Number).sort((a, b) => a - b);
  const options = windowIds.map((id, index) => ({
    value: String(id),
    label: `Window ${index + 1}`,
  }));

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select window..."
    />
  );
}
