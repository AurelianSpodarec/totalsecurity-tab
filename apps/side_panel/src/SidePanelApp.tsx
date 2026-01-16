import { Html } from "@packages/utility";
import { Heading, WindowCard } from "@packages/components";
import { WindowsApi } from "@packages/ext-api";
import { useSession } from "@packages/hooks";
import { useEffect, useState } from "react";

export function SidePanelApp()
{
  const { session } = useSession();
  const [ currentWindowId, setCurrentWindowId ] = useState<number | null>(null);

  useEffect(() => {
    WindowsApi.getCurrent().then((window) => setCurrentWindowId(window.id!));
  }, []);

  const window = currentWindowId && session.windows[currentWindowId];
  if (!window) return null;

  return (
    <div
      // Container
      className={Html.joinClasses(
        // Base
        "flex flex-col gap-3",
        // Size
        "h-screen w-full",
        // Background
        "bg-white dark:bg-gray-800",
        // Spacing
        "pt-5"
      )}
    >
      <div
        // Header
        className={Html.joinClasses(
          // Base
          "flex flex-col gap-1",
          // Spacing
          "px-5"
        )}
      >
        <Heading>Total Tabs</Heading>
      </div>

      <div
        // Scrollable Content
        className={Html.joinClasses(
          // Base
          "grow flex flex-col gap-5 h-full w-full",
          // Scrollability
          "overflow-y-auto"
        )}
      >
        <WindowCard
          window={window}
          onClick={() => WindowsApi.update(window.id, { focused: true })}
        />
      </div>

    </div>
  )
}
