import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from "@radix-ui/react-icons";
import { Html } from "@packages/utility";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Array<SelectOption>;
  displayValue?: string;
  placeholder?: string;
  className?: string;
};

export function Select({
  value,
  onChange,
  options,
  displayValue,
  placeholder = "Select...",
  className,
}: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger
        className={Html.joinClasses(
          "flex items-center justify-between gap-2",
          "px-3 py-2",
          "bg-gray-700 dark:bg-gray-700",
          "text-gray-900 dark:text-white",
          "rounded",
          "text-base",
          "outline-none",
          "cursor-pointer",
          "hover:bg-gray-600 dark:hover:bg-gray-600",
          "transition-colors duration-150",
          className
        )}
      >
        {displayValue ? (
          <span>{displayValue}</span>
        ) : (
          <SelectPrimitive.Value placeholder={placeholder} />
        )}
        <SelectPrimitive.Icon>
          <ChevronDownIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={Html.joinClasses(
            "bg-gray-700 dark:bg-gray-700",
            "rounded",
            "shadow-lg",
            "overflow-hidden",
            "z-50"
          )}
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.ScrollUpButton
            className={Html.joinClasses(
              "flex items-center justify-center",
              "h-6",
              "bg-gray-700 dark:bg-gray-700",
              "text-white",
              "cursor-default"
            )}
          >
            <ChevronUpIcon />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={Html.joinClasses(
                  "flex items-center gap-2",
                  "px-3 py-2",
                  "text-base text-gray-900 dark:text-white",
                  "rounded",
                  "outline-none",
                  "cursor-pointer",
                  "data-[highlighted]:bg-gray-600 dark:data-[highlighted]:bg-gray-600"
                )}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="ml-auto">
                  (current)
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton
            className={Html.joinClasses(
              "flex items-center justify-center",
              "h-6",
              "bg-gray-700 dark:bg-gray-700",
              "text-white",
              "cursor-default"
            )}
          >
            <ChevronDownIcon />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
