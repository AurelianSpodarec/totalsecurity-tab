import type { TabGroupColor } from "@packages/tab-manager";
import { Button } from "@packages/components";
import { Html } from "@packages/utility";

type ColorPickerProps = {
  colors: readonly TabGroupColor[];
  value: TabGroupColor;
  onChange: (color: TabGroupColor) => void;
  className?: string;
};

export function ColorPicker({ colors, value, onChange, className }: ColorPickerProps) {
  return (
    <div
      className={Html.joinClasses(
        "flex items-center gap-2 flex-wrap justify-between",
        className
      )}
    >
      {colors.map((color) => {
        const selected = color === value;

        return (
          <Button
            key={color}
            data-tab-group-color={color}
            className={Html.joinClasses(
              "size-5",
              "rounded-full",
              "border",
              selected ? "scale-110 border-white" : "scale-100 border-white/20",
              "transition-transform",
            )}
            style={{ backgroundColor: "var(--tab-group-color)" }}
            onClick={() => onChange(color)}
            aria-label={`Set group color to ${color}`}
          />
        );
      })}
    </div>
  );
}
