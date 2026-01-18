import { useEffect, useRef } from "react";
import { TabsApi } from "@packages/ext-api";

type RequestMoveArgs = {
  tabId: number;
  windowId: number;
  index: number;
  immediate?: boolean;
};

type UseChromeTabMoveQueueArgs = {
  throttleMs?: number;
  onError?: (error: unknown) => void;
};

/**
 * Throttles and serializes chrome.tabs.move calls so the tab strip updates live during drag,
 * without spamming the API or applying moves out of order.
 */
export function useTabMoveQueue({
  throttleMs = 75,
  onError,
}: UseChromeTabMoveQueueArgs = {}) {
  const moveTimeout = useRef<number | null>(null);

  const moveInFlight = useRef(false);
  const moveTabId = useRef<number | null>(null);
  const moveWindowId = useRef<number | null>(null);

  const pendingIndex = useRef<number | null>(null);
  const lastCommittedIndex = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (moveTimeout.current) {
        clearTimeout(moveTimeout.current);
        moveTimeout.current = null;
      }
    };
  }, []);

  const reset = () => {
    if (moveTimeout.current) {
      clearTimeout(moveTimeout.current);
      moveTimeout.current = null;
    }

    moveInFlight.current = false;
    moveTabId.current = null;
    moveWindowId.current = null;
    pendingIndex.current = null;
    lastCommittedIndex.current = null;
  };

  const flush = () => {
    if (moveInFlight.current) return;

    const tabId = moveTabId.current;
    const windowId = moveWindowId.current;
    const index = pendingIndex.current;

    if (!tabId || !windowId || index == null) return;

    pendingIndex.current = null;

    if (lastCommittedIndex.current === index) return;

    moveInFlight.current = true;

    TabsApi.move(tabId, { index, windowId })
      .then(() => {
        lastCommittedIndex.current = index;
      })
      .catch((err) => {
        onError?.(err);
      })
      .finally(() => {
        moveInFlight.current = false;
        if (pendingIndex.current != null) {
          flush();
        }
      });
  };

  const requestMove = ({ tabId, windowId, index, immediate }: RequestMoveArgs) => {
    moveTabId.current = tabId;
    moveWindowId.current = windowId;
    pendingIndex.current = index;

    if (immediate) {
      if (moveTimeout.current) {
        clearTimeout(moveTimeout.current);
        moveTimeout.current = null;
      }
      flush();
      return;
    }

    if (moveTimeout.current) return;
    moveTimeout.current = setTimeout(() => {
      moveTimeout.current = null;
      flush();
    }, throttleMs) as unknown as number;
  };

  return {
    requestMove,
    reset,
  };
}
