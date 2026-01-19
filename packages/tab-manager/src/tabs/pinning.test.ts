import { getPinnedTabCount, clampTabIndexForPinned } from "./pinning";
import { SessionTab } from "../Data/TabManager/Type/SessionTab";

const createTab = (overrides: Partial<SessionTab> = {}): SessionTab => ({
  id: Math.floor(Math.random() * 10000),
  title: "Test Tab",
  url: "https://example.com",
  pinned: false,
  index: 0,
  active: false,
  groupId: -1,
  ...overrides,
});

describe("getPinnedTabCount", () => {
  it("returns 0 for empty array", () => {
    expect(getPinnedTabCount([])).toBe(0);
  });

  it("returns 0 when no tabs are pinned", () => {
    const tabs = [createTab(), createTab(), createTab()];
    expect(getPinnedTabCount(tabs)).toBe(0);
  });

  it("returns correct count when some tabs are pinned", () => {
    const tabs = [
      createTab({ pinned: true }),
      createTab({ pinned: true }),
      createTab({ pinned: false }),
    ];
    expect(getPinnedTabCount(tabs)).toBe(2);
  });

  it("returns correct count when all tabs are pinned", () => {
    const tabs = [
      createTab({ pinned: true }),
      createTab({ pinned: true }),
    ];
    expect(getPinnedTabCount(tabs)).toBe(2);
  });
});

describe("clampTabIndexForPinned", () => {
  describe("with pinned tab", () => {
    it("returns null if tab not found", () => {
      const tabs = [createTab({ id: 1 })];
      expect(clampTabIndexForPinned(tabs, 999, 0)).toBeNull();
    });

    it("clamps pinned tab to pinned region (0 to pinnedCount-1)", () => {
      const tabs = [
        createTab({ id: 1, pinned: true, index: 0 }),
        createTab({ id: 2, pinned: true, index: 1 }),
        createTab({ id: 3, pinned: false, index: 2 }),
        createTab({ id: 4, pinned: false, index: 3 }),
      ];

      // Pinned tab trying to move to index 0 - allowed
      expect(clampTabIndexForPinned(tabs, 1, 0)).toBe(0);

      // Pinned tab trying to move to index 1 - allowed (last pinned position)
      expect(clampTabIndexForPinned(tabs, 1, 1)).toBe(1);

      // Pinned tab trying to move past pinned region - clamped to 1
      expect(clampTabIndexForPinned(tabs, 1, 5)).toBe(1);

      // Negative index clamped to 0
      expect(clampTabIndexForPinned(tabs, 1, -1)).toBe(0);
    });

    it("handles single pinned tab", () => {
      const tabs = [
        createTab({ id: 1, pinned: true, index: 0 }),
        createTab({ id: 2, pinned: false, index: 1 }),
      ];

      // Single pinned tab can only be at index 0
      expect(clampTabIndexForPinned(tabs, 1, 0)).toBe(0);
      expect(clampTabIndexForPinned(tabs, 1, 5)).toBe(0);
    });
  });

  describe("with unpinned tab", () => {
    it("clamps unpinned tab to unpinned region (pinnedCount to end)", () => {
      const tabs = [
        createTab({ id: 1, pinned: true, index: 0 }),
        createTab({ id: 2, pinned: true, index: 1 }),
        createTab({ id: 3, pinned: false, index: 2 }),
        createTab({ id: 4, pinned: false, index: 3 }),
      ];

      // Unpinned tab trying to move to pinned region - clamped to pinnedCount
      expect(clampTabIndexForPinned(tabs, 3, 0)).toBe(2);
      expect(clampTabIndexForPinned(tabs, 3, 1)).toBe(2);

      // Unpinned tab moving within unpinned region - allowed
      expect(clampTabIndexForPinned(tabs, 3, 2)).toBe(2);
      expect(clampTabIndexForPinned(tabs, 3, 3)).toBe(3);

      // Unpinned tab moving past end - clamped to last index
      expect(clampTabIndexForPinned(tabs, 3, 10)).toBe(3);
    });

    it("handles all unpinned tabs", () => {
      const tabs = [
        createTab({ id: 1, pinned: false, index: 0 }),
        createTab({ id: 2, pinned: false, index: 1 }),
        createTab({ id: 3, pinned: false, index: 2 }),
      ];

      // Any position is valid when no pinned tabs
      expect(clampTabIndexForPinned(tabs, 1, 0)).toBe(0);
      expect(clampTabIndexForPinned(tabs, 1, 1)).toBe(1);
      expect(clampTabIndexForPinned(tabs, 1, 2)).toBe(2);
    });
  });

  describe("edge cases", () => {
    it("handles empty tabs array gracefully", () => {
      expect(clampTabIndexForPinned([], 1, 0)).toBeNull();
    });

    it("handles single tab array", () => {
      const tabs = [createTab({ id: 1, pinned: false, index: 0 })];
      expect(clampTabIndexForPinned(tabs, 1, 0)).toBe(0);
      expect(clampTabIndexForPinned(tabs, 1, 5)).toBe(0);
    });
  });
});
