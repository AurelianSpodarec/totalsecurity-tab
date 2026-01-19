import { useEffect, useState } from "react";
import { WindowsApi } from "@packages/ext-api";
import { useSession } from "./UseSession";

export function useWindows() {
  const { session } = useSession();
  const [currentWindowId, setCurrentWindowId] = useState<number | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string>("");

  useEffect(() => {
    WindowsApi.getCurrent().then((win) => {
      setCurrentWindowId(win.id!);
      setSelectedWindowId(String(win.id!));
    });

    const handleFocusChange = (windowId: number) => {
      setCurrentWindowId(windowId);
    };

    WindowsApi.onFocusChanged(handleFocusChange);

    return () => {
      WindowsApi.offFocusChanged(handleFocusChange);
    };
  }, []);

  const selectedWindow = selectedWindowId
    ? session.windows[Number(selectedWindowId)]
    : null;

  return {
    windows: session.windows,
    currentWindowId,
    selectedWindowId,
    selectedWindow,
    setSelectedWindowId,
  };
}
