import { Html } from "@packages/utility";
import { TabList, SelectWindow } from "@packages/features";
import { WindowsApi } from "@packages/ext-api";
import { useWindows } from "@packages/hooks";
import { useState } from "react";
import { SettingsModal } from "../settings-modal";
import { Button } from "@packages/components";

export function SidePanelApp() {
  const {
    windows,
    currentWindowId,
    selectedWindowId,
    selectedWindow,
    setSelectedWindowId,
  } = useWindows();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div
      className={Html.joinClasses(
        "flex flex-col gap-3",
        "h-screen w-full",
        "tmit-app-bg",
        "pt-5"
      )}
    >
      <SettingsModal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <div
        className={Html.joinClasses(
          "flex flex-col gap-3",
          "px-3"
        )}
      >
        <div className={Html.joinClasses("flex items-center justify-between", "gap-3")}>

          <SelectWindow
            windows={windows}
            currentWindowId={currentWindowId}
            value={selectedWindowId}
            onChange={setSelectedWindowId}
          />
          <Button
            className={Html.joinClasses(
              "rounded",
              "px-3 py-2",
              "text-sm font-medium",
              "bg-gray-200 dark:bg-gray-700",
              "text-gray-900 dark:text-white",
              "hover:bg-gray-300 dark:hover:bg-gray-600",
              "transition-colors"
            )}
            onClick={() => setIsSettingsOpen(true)}
          >
            Settings
          </Button>
        </div>

      </div>

      <div
        className={Html.joinClasses(
          "grow flex flex-col gap-5 h-full w-full",
          "overflow-y-auto overflow-x-hidden"
        )}
      >
        {selectedWindow ? (
          <TabList
            window={selectedWindow}
            onClick={() => WindowsApi.update(selectedWindow.id, { focused: true })}
          />
        ) : null}
      </div>
    </div>
  );
}
