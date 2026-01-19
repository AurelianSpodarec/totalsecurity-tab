import { useEffect, useRef } from "react";

export type MoveRequest<TId> = {
  id: TId;
  windowId: number;
  index: number;
  immediate?: boolean;
};

export type MoveExecutor<TId> = (id: TId, windowId: number, index: number) => Promise<unknown>;

type UseMoveQueueOptions<TId> = {
  executeMove: MoveExecutor<TId>;
  throttleMs?: number;
  onError?: (err: unknown) => void;
};

/**
 * Generic throttled move queue for Chrome extension API calls.
 * Can be used for both tab moves and group moves.
 */
export function useMoveQueue<TId>({
  executeMove,
  throttleMs = 75,
  onError,
}: UseMoveQueueOptions<TId>) {
  const moveTimeout = useRef<number | null>(null);
  const moveInFlight = useRef(false);
  const moveId = useRef<TId | null>(null);
  const moveWindowId = useRef<number | null>(null);
  const pendingIndex = useRef<number | null>(null);
  const lastCommittedIndex = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (moveTimeout.current) clearTimeout(moveTimeout.current);
    };
  }, []);

  const flush = () => {
    if (moveInFlight.current) return;
    const id = moveId.current;
    const windowId = moveWindowId.current;
    const index = pendingIndex.current;
    if (id == null || windowId == null || index == null) return;

    pendingIndex.current = null;
    if (lastCommittedIndex.current === index) return;

    moveInFlight.current = true;
    executeMove(id, windowId, index)
      .then(() => {
        lastCommittedIndex.current = index;
      })
      .catch((err) => {
        onError?.(err);
      })
      .finally(() => {
        moveInFlight.current = false;
        if (pendingIndex.current != null) flush();
      });
  };

  const reset = () => {
    if (moveTimeout.current) clearTimeout(moveTimeout.current);
    moveTimeout.current = null;
    moveInFlight.current = false;
    moveId.current = null;
    moveWindowId.current = null;
    pendingIndex.current = null;
    lastCommittedIndex.current = null;
  };

  const requestMove = ({ id, windowId, index, immediate }: MoveRequest<TId>) => {
    moveId.current = id;
    moveWindowId.current = windowId;
    pendingIndex.current = index;

    if (immediate) {
      if (moveTimeout.current) clearTimeout(moveTimeout.current);
      moveTimeout.current = null;
      flush();
      return;
    }

    if (moveTimeout.current) return;
    moveTimeout.current = setTimeout(() => {
      moveTimeout.current = null;
      flush();
    }, throttleMs) as unknown as number;
  };

  return { requestMove, reset };
}
