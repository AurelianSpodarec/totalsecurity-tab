import { Html } from "@packages/utility";
import { TabList, SelectWindow } from "@packages/features";
import { WindowsApi } from "@packages/ext-api";
import { useWindows } from "@packages/hooks";

export function SidePanelApp() {
  const {
    windows,
    currentWindowId,
    selectedWindowId,
    selectedWindow,
    setSelectedWindowId,
  } = useWindows();

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
        <h1
          className={Html.joinClasses(
            "text-2xl font-semibold",
            "text-gray-900 dark:text-white"
          )}
        >
          Total Tabs
        </h1>
        <SelectWindow
          windows={windows}
          currentWindowId={currentWindowId}
          value={selectedWindowId}
          onChange={setSelectedWindowId}
        />
      </div>

      <div
        className={Html.joinClasses(
          "grow flex flex-col gap-5 h-full w-full",
          "overflow-y-auto"
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
