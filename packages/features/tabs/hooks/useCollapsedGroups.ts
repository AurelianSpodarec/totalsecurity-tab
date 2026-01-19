import { useCallback, useState } from "react";

export function useCollapsedGroups(initial?: Iterable<string>) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(initial)
  );

  const toggleGroup = useCallback((groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  return { collapsedGroups, toggleGroup };
}
