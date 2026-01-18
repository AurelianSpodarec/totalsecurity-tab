import { Html } from "@packages/utility";
import { Heading, Select, WindowCard } from "@packages/components";
import { WindowsApi } from "@packages/ext-api";
import { useSession } from "@packages/hooks";
import { useEffect, useMemo, useState } from "react";

export function SidePanelApp() {
  const { session } = useSession();
  const [currentWindowId, setCurrentWindowId] = useState<number | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string>("");

  useEffect(() => {
    WindowsApi.getCurrent().then((win) => {
      setCurrentWindowId(win.id!);
      setSelectedWindowId(String(win.id!));
    });
  }, []);

  const windowOptions = useMemo(() => {
    const windowIds = Object.keys(session.windows).map(Number).sort((a, b) => a - b);
    return windowIds.map((id, index) => ({
      value: String(id),
      label: `Window ${index + 1}${id === currentWindowId ? " (current)" : ""}`,
    }));
  }, [session.windows, currentWindowId]);

  const selectedWindow = selectedWindowId ? session.windows[Number(selectedWindowId)] : null;
  if (!selectedWindow) return null;

  return (
    <div
      className={Html.joinClasses(
        "flex flex-col gap-3",
        "h-screen w-full",
        "bg-white dark:bg-gray-800",
        "pt-5"
      )}
    >
      <div
        className={Html.joinClasses(
          "flex flex-col gap-3",
          "px-5"
        )}
      >
        <Heading>Total Tabs</Heading>
        <Select
          value={selectedWindowId}
          onChange={setSelectedWindowId}
          options={windowOptions}
          placeholder="Select window..."
        />
      </div>

      <div
        className={Html.joinClasses(
          "grow flex flex-col gap-5 h-full w-full",
          "overflow-y-auto"
        )}
      >
        <WindowCard
          window={selectedWindow}
          onClick={() => WindowsApi.update(selectedWindow.id, { focused: true })}
        />
      </div>
    </div>
  );
}
